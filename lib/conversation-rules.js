const DEFAULT_CONVERSATION_SETTINGS = {
  handoffKeywords: ['ოპერატორი', 'ადამიანი', 'კონსულტანტი', 'მენეჯერი', 'კონსულტაცია', 'ზარი', 'შეხვედრა', 'support', 'agent', 'human'],
  closingKeywords: ['მადლობა', 'გმადლობ', 'ნახვამდის', 'დროებით', 'bye', 'thanks'],
  reopenKeywords: ['გამარჯობა', 'hello', 'hi', 'მოგესალმებით'],
  handoffMessage: 'გასაგებია. თქვენს შეტყობინებას ოპერატორს გადავცემ და მალე მოგწერთ.',
  farewellMessage: 'გმადლობთ მოწერისთვის. თუ ახალი კითხვა გექნებათ, ისევ მოგვწერეთ.',
  maxAutoReplies: 4
};

function normalizeKeywordList(value, fallback) {
  const source = Array.isArray(value) ? value : fallback;

  return source
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 25);
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesKeyword(text, keywords) {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return false;
  }

  return keywords.some((keyword) => normalizedText.includes(normalizeText(keyword)));
}

function normalizeMaxAutoReplies(value) {
  const parsed = Number.parseInt(String(value || ''), 10);

  if (Number.isNaN(parsed)) {
    return DEFAULT_CONVERSATION_SETTINGS.maxAutoReplies;
  }

  return Math.min(Math.max(parsed, 1), 12);
}

export function normalizeConversationSettings(settings = {}) {
  return {
    handoffKeywords: normalizeKeywordList(
      settings.handoffKeywords,
      DEFAULT_CONVERSATION_SETTINGS.handoffKeywords
    ),
    closingKeywords: normalizeKeywordList(
      settings.closingKeywords,
      DEFAULT_CONVERSATION_SETTINGS.closingKeywords
    ),
    reopenKeywords: normalizeKeywordList(
      settings.reopenKeywords,
      DEFAULT_CONVERSATION_SETTINGS.reopenKeywords
    ),
    handoffMessage:
      typeof settings.handoffMessage === 'string' && settings.handoffMessage.trim()
        ? settings.handoffMessage.trim()
        : DEFAULT_CONVERSATION_SETTINGS.handoffMessage,
    farewellMessage:
      typeof settings.farewellMessage === 'string' && settings.farewellMessage.trim()
        ? settings.farewellMessage.trim()
        : DEFAULT_CONVERSATION_SETTINGS.farewellMessage,
    maxAutoReplies: normalizeMaxAutoReplies(settings.maxAutoReplies)
  };
}

export function evaluateConversationTurn({ text, conversation, settings }) {
  const safeSettings = normalizeConversationSettings(settings);
  const currentStatus = conversation?.status || 'open';
  const botReplyCount = Number(conversation?.botReplyCount || 0);

  if (matchesKeyword(text, safeSettings.handoffKeywords)) {
    return {
      type: 'handoff',
      nextStatus: 'needs_human',
      stopAutoReply: true,
      reply: safeSettings.handoffMessage
    };
  }

  if (matchesKeyword(text, safeSettings.closingKeywords)) {
    return {
      type: 'close',
      nextStatus: 'closed',
      stopAutoReply: true,
      reply: safeSettings.farewellMessage
    };
  }

  if (currentStatus === 'needs_human') {
    return {
      type: 'waiting_human',
      nextStatus: 'needs_human',
      stopAutoReply: true,
      reply: ''
    };
  }

  if (currentStatus === 'closed') {
    return {
      type: matchesKeyword(text, safeSettings.reopenKeywords) ? 'reopen' : 'continue_after_close',
      nextStatus: 'open',
      stopAutoReply: false,
      reply: ''
    };
  }

  if (botReplyCount >= safeSettings.maxAutoReplies) {
    return {
      type: 'auto_limit',
      nextStatus: 'needs_human',
      stopAutoReply: true,
      reply: safeSettings.handoffMessage
    };
  }

  return {
    type: 'continue',
    nextStatus: 'open',
    stopAutoReply: false,
    reply: ''
  };
}

export function getDefaultConversationSettings() {
  return normalizeConversationSettings(DEFAULT_CONVERSATION_SETTINGS);
}
