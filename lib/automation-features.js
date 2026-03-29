import { sanitizeReply } from './reply-rules';

const DEFAULT_INTENT_KEYWORDS = {
  greeting: ['გამარჯობა', 'გაუმარჯოს', 'hello', 'hi'],
  price: ['ფასი', 'ღირებულება', 'ბიუჯეტი', 'პაკეტი', 'ტარიფი', 'quote'],
  services: ['სერვისი', 'მომსახურება', 'რას აკეთებთ', 'რას მთავაზობთ', 'service'],
  delivery: ['მიწოდება', 'კურიერი', 'მიტანა', 'delivery'],
  order: ['შეკვეთა', 'order', 'შევუკვეთო', 'ყიდვა', 'consultation', 'კონსულტაცია'],
  complaint: ['პრობლემა', 'უკმაყოფილო', 'გაბრაზებული', 'საჩივარი', 'ვერ მუშაობს', 'დაგვიანდა']
};

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesAny(text, keywords = []) {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return false;
  }

  return keywords.some((keyword) => normalizedText.includes(normalizeText(keyword)));
}

function parseTimeToMinutes(value) {
  const match = String(value || '').trim().match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function getZonedDateParts(date, timezone) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || 'Asia/Tbilisi',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    });

    const parts = formatter.formatToParts(date);
    const weekday = parts.find((item) => item.type === 'weekday')?.value || 'Mon';
    const hour = parts.find((item) => item.type === 'hour')?.value || '00';
    const minute = parts.find((item) => item.type === 'minute')?.value || '00';
    const weekdayKey = WEEKDAY_KEYS[
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday)
    ];

    return {
      weekdayKey: weekdayKey || 'mon',
      currentMinutes: Number.parseInt(hour, 10) * 60 + Number.parseInt(minute, 10)
    };
  } catch (error) {
    return {
      weekdayKey: WEEKDAY_KEYS[date.getDay()] || 'mon',
      currentMinutes: date.getHours() * 60 + date.getMinutes()
    };
  }
}

function isReplyUncertain(reply) {
  const normalized = normalizeText(reply);

  if (!normalized) {
    return true;
  }

  return [
    'ზუსტ დეტალს ოპერატორი',
    'ოპერატორი დაგიზუსტებთ',
    'ოპერატორი გადაამოწმებს',
    'არ მინდა შეცდომაში',
    'მოგვწერეთ მოკლედ',
    'მოგწერთ მალე'
  ].some((phrase) => normalized.includes(phrase));
}

function appendQualificationQuestion(reply, extraQuestion) {
  const baseReply = sanitizeReply(reply);
  const question = sanitizeReply(extraQuestion);

  if (!question || baseReply.includes('?')) {
    return baseReply;
  }

  const combined = `${baseReply} ${question}`.trim();
  return combined.length <= 320 ? combined : baseReply;
}

export function detectAutomationIntent(text, config = {}) {
  const automationSettings = config.automationSettings || {};
  const conversationSettings = config.conversationSettings || {};

  if (matchesAny(text, automationSettings.sentimentHandoff?.angryKeywords || DEFAULT_INTENT_KEYWORDS.complaint)) {
    return 'complaint';
  }

  if (matchesAny(text, conversationSettings.handoffKeywords || [])) {
    return 'operator';
  }

  if (matchesAny(text, DEFAULT_INTENT_KEYWORDS.price)) {
    return 'price';
  }

  if (matchesAny(text, DEFAULT_INTENT_KEYWORDS.order)) {
    return 'order';
  }

  if (matchesAny(text, DEFAULT_INTENT_KEYWORDS.delivery)) {
    return 'delivery';
  }

  if (matchesAny(text, DEFAULT_INTENT_KEYWORDS.services)) {
    return 'services';
  }

  if (matchesAny(text, DEFAULT_INTENT_KEYWORDS.greeting)) {
    return 'greeting';
  }

  return 'unknown';
}

export function getBusinessHoursState(settings = {}, now = new Date()) {
  if (!settings?.enabled) {
    return {
      enabled: false,
      isOpen: true
    };
  }

  const startMinutes = parseTimeToMinutes(settings.startTime);
  const endMinutes = parseTimeToMinutes(settings.endTime);
  const workingDays = Array.isArray(settings.workingDays) ? settings.workingDays : [];

  if (startMinutes === null || endMinutes === null || !workingDays.length) {
    return {
      enabled: true,
      isOpen: true
    };
  }

  const zoned = getZonedDateParts(now, settings.timezone);
  const isWorkingDay = workingDays.includes(zoned.weekdayKey);

  if (!isWorkingDay) {
    return {
      enabled: true,
      isOpen: false,
      weekdayKey: zoned.weekdayKey
    };
  }

  const currentMinutes = zoned.currentMinutes;
  const isOpen =
    startMinutes <= endMinutes
      ? currentMinutes >= startMinutes && currentMinutes <= endMinutes
      : currentMinutes >= startMinutes || currentMinutes <= endMinutes;

  return {
    enabled: true,
    isOpen,
    weekdayKey: zoned.weekdayKey
  };
}

export function evaluateAutomationBeforeAi({ text, config, detectedIntent, now = new Date() }) {
  const automationSettings = config.automationSettings || {};
  const conversationSettings = config.conversationSettings || {};
  const usedFeatures = [];

  const businessHoursState = getBusinessHoursState(automationSettings.businessHours, now);

  if (automationSettings.businessHours?.enabled && !businessHoursState.isOpen) {
    usedFeatures.push('business_hours');

    return {
      handled: true,
      reply:
        automationSettings.businessHours.afterHoursMessage || conversationSettings.handoffMessage,
      nextStatus: automationSettings.businessHours.handoffOutsideHours ? 'needs_human' : 'open',
      type: 'after_hours',
      detectedIntent,
      usedFeatures
    };
  }

  if (automationSettings.sentimentHandoff?.enabled && detectedIntent === 'complaint') {
    usedFeatures.push('sentiment_handoff');

    return {
      handled: true,
      reply:
        automationSettings.sentimentHandoff.replyMessage || conversationSettings.handoffMessage,
      nextStatus: 'needs_human',
      type: 'sentiment_handoff',
      detectedIntent,
      usedFeatures
    };
  }

  if (
    automationSettings.intentRouting?.enabled &&
    Array.isArray(automationSettings.intentRouting.routeToHumanIntents) &&
    automationSettings.intentRouting.routeToHumanIntents.includes(detectedIntent)
  ) {
    usedFeatures.push('intent_routing');

    return {
      handled: true,
      reply:
        automationSettings.intentRouting.routeMessage || conversationSettings.handoffMessage,
      nextStatus: 'needs_human',
      type: 'intent_route',
      detectedIntent,
      usedFeatures
    };
  }

  return {
    handled: false,
    detectedIntent,
    usedFeatures
  };
}

export function finalizeAutomationReply({
  userText,
  aiReply,
  aiSource,
  config,
  conversation,
  detectedIntent
}) {
  const automationSettings = config.automationSettings || {};
  let reply = sanitizeReply(aiReply);
  let nextStatus = 'open';
  const usedFeatures = [];
  let shouldLogKnowledgeGap = false;
  let knowledgeGapReason = '';

  const fallbackSource = typeof aiSource === 'string' && aiSource.includes('fallback');
  const uncertainReply = fallbackSource || isReplyUncertain(reply);

  if (
    automationSettings.confidenceFallback?.enabled &&
    uncertainReply &&
    detectedIntent !== 'greeting' &&
    detectedIntent !== 'operator'
  ) {
    reply = sanitizeReply(
      automationSettings.confidenceFallback.fallbackMessage ||
        config.conversationSettings?.handoffMessage
    );
    nextStatus = 'needs_human';
    usedFeatures.push('confidence_fallback');
    shouldLogKnowledgeGap = true;
    knowledgeGapReason = aiSource || 'confidence_fallback';
  }

  if (
    automationSettings.leadQualification?.enabled &&
    nextStatus !== 'needs_human' &&
    Array.isArray(automationSettings.leadQualification.triggerIntents) &&
    automationSettings.leadQualification.triggerIntents.includes(detectedIntent) &&
    Number(conversation?.botReplyCount || 0) < 2
  ) {
    const qualifiedReply = appendQualificationQuestion(
      reply,
      automationSettings.leadQualification.qualificationMessage
    );

    if (qualifiedReply !== reply) {
      reply = qualifiedReply;
      usedFeatures.push('lead_qualification');
    }
  }

  if (
    automationSettings.knowledgeGapDetection?.enabled &&
    !shouldLogKnowledgeGap &&
    (detectedIntent === 'unknown' || fallbackSource)
  ) {
    shouldLogKnowledgeGap = true;
    knowledgeGapReason = fallbackSource ? aiSource || 'fallback' : 'unknown_intent';
  }

  return {
    reply,
    nextStatus,
    detectedIntent,
    usedFeatures,
    shouldLogKnowledgeGap,
    knowledgeGapReason,
    source: aiSource,
    originalMessage: userText
  };
}
