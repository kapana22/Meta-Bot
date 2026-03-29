import fs from 'fs/promises';
import path from 'path';

const INBOX_PATH = path.join(process.cwd(), 'data', 'inbox.json');

const DEFAULT_STORE = {
  conversations: []
};

function buildFallbackTitle(senderId) {
  const normalizedId = String(senderId);
  const shortId =
    normalizedId.length <= 8
      ? normalizedId
      : normalizedId.replace(/[^a-zA-Z0-9]/g, '').slice(-6) || normalizedId.slice(-6);

  return `Facebook user ${shortId}`;
}

function applyProfile(conversation, profile = null) {
  if (!profile) {
    conversation.firstName = conversation.firstName || '';
    conversation.lastName = conversation.lastName || '';
    conversation.fullName = conversation.fullName || '';
    conversation.profilePic = conversation.profilePic || '';
    conversation.title = conversation.fullName || conversation.title || buildFallbackTitle(conversation.senderId);
    return;
  }

  conversation.firstName = String(profile.firstName || '').trim();
  conversation.lastName = String(profile.lastName || '').trim();
  conversation.fullName = String(profile.fullName || '').trim();
  conversation.profilePic = String(profile.profilePic || '').trim();
  conversation.title = conversation.fullName || conversation.title || buildFallbackTitle(conversation.senderId);
}

function createConversation(senderId, profile = null) {
  const now = new Date().toISOString();
  const normalizedId = String(senderId);
  const conversation = {
    id: normalizedId,
    senderId: normalizedId,
    title: buildFallbackTitle(normalizedId),
    status: 'open',
    unreadCount: 0,
    lastMessageText: '',
    lastMessageAt: now,
    botReplyCount: 0,
    createdAt: now,
    updatedAt: now,
    messages: []
  };

  applyProfile(conversation, profile);
  return conversation;
}

function sanitizeText(text) {
  return String(text || '').trim().slice(0, 4000);
}

async function loadStore() {
  try {
    const fileContent = await fs.readFile(INBOX_PATH, 'utf8');
    const parsed = JSON.parse(fileContent);

    return {
      conversations: Array.isArray(parsed.conversations) ? parsed.conversations : []
    };
  } catch (error) {
    return DEFAULT_STORE;
  }
}

async function saveStore(store) {
  await fs.mkdir(path.dirname(INBOX_PATH), { recursive: true });
  await fs.writeFile(INBOX_PATH, JSON.stringify(store, null, 2), 'utf8');
}

function sortConversations(conversations) {
  return [...conversations].sort((a, b) => {
    const aTime = new Date(a.lastMessageAt || a.updatedAt || 0).getTime();
    const bTime = new Date(b.lastMessageAt || b.updatedAt || 0).getTime();
    return bTime - aTime;
  });
}

function getConversationIndex(conversations, senderId) {
  return conversations.findIndex((item) => item.id === String(senderId));
}

function pushMessage(conversation, message) {
  conversation.messages = Array.isArray(conversation.messages) ? conversation.messages : [];
  conversation.messages.push(message);
  conversation.messages = conversation.messages.slice(-200);
}

function createMessage({ direction, senderType, text, source = 'facebook', messageId = null }) {
  return {
    id: messageId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    direction,
    senderType,
    text: sanitizeText(text),
    source,
    createdAt: new Date().toISOString()
  };
}

function normalizeConversation(conversation) {
  const normalized = {
    ...conversation,
    id: String(conversation?.id || conversation?.senderId || ''),
    senderId: String(conversation?.senderId || conversation?.id || ''),
    title: typeof conversation?.title === 'string' ? conversation.title : '',
    firstName: typeof conversation?.firstName === 'string' ? conversation.firstName : '',
    lastName: typeof conversation?.lastName === 'string' ? conversation.lastName : '',
    fullName: typeof conversation?.fullName === 'string' ? conversation.fullName : '',
    profilePic: typeof conversation?.profilePic === 'string' ? conversation.profilePic : '',
    messages: Array.isArray(conversation?.messages) ? conversation.messages : []
  };

  applyProfile(normalized, normalized);
  return normalized;
}

export async function listConversations() {
  const store = await loadStore();

  return sortConversations(store.conversations).map((item) => {
    const conversation = normalizeConversation(item);
    return {
      id: conversation.id,
      senderId: conversation.senderId,
      title: conversation.title,
      firstName: conversation.firstName,
      lastName: conversation.lastName,
      fullName: conversation.fullName,
      profilePic: conversation.profilePic,
      status: conversation.status,
      unreadCount: conversation.unreadCount || 0,
      lastMessageText: conversation.lastMessageText || '',
      lastMessageAt: conversation.lastMessageAt || conversation.updatedAt || null,
      botReplyCount: conversation.botReplyCount || 0,
      updatedAt: conversation.updatedAt || null
    };
  });
}

export async function getConversation(senderId) {
  const store = await loadStore();
  const conversation = store.conversations.find((item) => item.id === String(senderId));
  return conversation ? normalizeConversation(conversation) : null;
}

export async function recordIncomingMessage({
  senderId,
  text,
  messageId,
  source = 'facebook',
  profile = null
}) {
  const store = await loadStore();
  const conversationId = String(senderId);
  const conversationIndex = getConversationIndex(store.conversations, conversationId);
  const conversation =
    conversationIndex >= 0
      ? normalizeConversation(store.conversations[conversationIndex])
      : createConversation(conversationId, profile);

  applyProfile(conversation, profile);

  const message = createMessage({
    direction: 'incoming',
    senderType: 'customer',
    text,
    source,
    messageId
  });

  pushMessage(conversation, message);
  conversation.lastMessageText = message.text;
  conversation.lastMessageAt = message.createdAt;
  conversation.updatedAt = message.createdAt;
  conversation.unreadCount = (conversation.unreadCount || 0) + 1;

  if (conversationIndex >= 0) {
    store.conversations[conversationIndex] = conversation;
  } else {
    store.conversations.push(conversation);
  }

  await saveStore(store);
  return conversation;
}

export async function recordOutgoingMessage({
  senderId,
  text,
  senderType = 'bot',
  source = 'facebook',
  messageId = null
}) {
  const store = await loadStore();
  const conversationId = String(senderId);
  const conversationIndex = getConversationIndex(store.conversations, conversationId);
  const conversation =
    conversationIndex >= 0
      ? normalizeConversation(store.conversations[conversationIndex])
      : createConversation(conversationId);

  const message = createMessage({
    direction: 'outgoing',
    senderType,
    text,
    source,
    messageId
  });

  pushMessage(conversation, message);
  conversation.lastMessageText = message.text;
  conversation.lastMessageAt = message.createdAt;
  conversation.updatedAt = message.createdAt;

  if (senderType === 'bot') {
    conversation.botReplyCount = (conversation.botReplyCount || 0) + 1;
  }

  if (conversationIndex >= 0) {
    store.conversations[conversationIndex] = conversation;
  } else {
    store.conversations.push(conversation);
  }

  await saveStore(store);
  return conversation;
}

export async function setConversationStatus(senderId, status) {
  const store = await loadStore();
  const conversationId = String(senderId);
  const conversationIndex = getConversationIndex(store.conversations, conversationId);
  const conversation =
    conversationIndex >= 0
      ? normalizeConversation(store.conversations[conversationIndex])
      : createConversation(conversationId);

  conversation.status = status;
  conversation.updatedAt = new Date().toISOString();

  if (status === 'open') {
    conversation.botReplyCount = 0;
  }

  if (conversationIndex >= 0) {
    store.conversations[conversationIndex] = conversation;
  } else {
    store.conversations.push(conversation);
  }

  await saveStore(store);
  return conversation;
}

export async function markConversationRead(senderId) {
  const store = await loadStore();
  const conversationIndex = getConversationIndex(store.conversations, senderId);

  if (conversationIndex < 0) {
    return null;
  }

  store.conversations[conversationIndex].unreadCount = 0;
  store.conversations[conversationIndex].updatedAt = new Date().toISOString();
  await saveStore(store);
  return normalizeConversation(store.conversations[conversationIndex]);
}
