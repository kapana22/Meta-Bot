const MESSAGE_TTL_MS = 10 * 60 * 1000;
const TEXT_TTL_MS = 45 * 1000;
const seenMessages = new Map();
const seenTexts = new Map();

function cleanupSeenMessages() {
  const now = Date.now();

  for (const [key, expiresAt] of seenMessages.entries()) {
    if (expiresAt <= now) {
      seenMessages.delete(key);
    }
  }

  for (const [key, expiresAt] of seenTexts.entries()) {
    if (expiresAt <= now) {
      seenTexts.delete(key);
    }
  }
}

function buildMessageKey(event, senderId) {
  const message = event?.message || {};

  if (message.mid) {
    return `mid:${message.mid}`;
  }

  if (event?.timestamp && message.text) {
    return `fallback:${senderId}:${event.timestamp}:${message.text}`;
  }

  return null;
}

function buildTextKey(messageText, senderId) {
  if (!messageText || !senderId) {
    return null;
  }

  const normalizedText = String(messageText).trim().toLowerCase();

  if (!normalizedText) {
    return null;
  }

  return `text:${senderId}:${normalizedText}`;
}

export function isDuplicateMessage(event, senderId) {
  cleanupSeenMessages();

  const key = buildMessageKey(event, senderId);
  const textKey = buildTextKey(event?.message?.text, senderId);

  if (key && seenMessages.has(key)) {
    return true;
  }

  if (textKey && seenTexts.has(textKey)) {
    return true;
  }

  if (key) {
    seenMessages.set(key, Date.now() + MESSAGE_TTL_MS);
  }

  if (textKey) {
    seenTexts.set(textKey, Date.now() + TEXT_TTL_MS);
  }

  return false;
}
