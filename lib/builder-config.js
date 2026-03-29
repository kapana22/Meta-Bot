import {
  getDefaultConversationSettings,
  normalizeConversationSettings
} from './conversation-rules';

const DEFAULT_WORKSPACE_PROFILE = {
  businessName: 'Yumade',
  industry: 'მარკეტინგული სააგენტო',
  language: 'ქართული',
  city: 'თბილისი',
  workingHours: 'ორშ-პარ 10:00-19:00',
  tone: 'პროფესიონალური და თბილი',
  responseLength: 'მოკლე',
  businessSummary:
    'ქართული სააგენტო, რომელიც კლიენტებს ეხმარება რეკლამაში, კონტენტში და ციფრულ კომუნიკაციაში.',
  nextStepCta:
    'თუ კლიენტს სჭირდება ზუსტი ფასი, ინდივიდუალური შეთავაზება ან კონსულტაცია, გადაამისამართე ოპერატორზე.'
};

const DEFAULT_KNOWLEDGE_SECTIONS = {
  services: 'Meta რეკლამა\nFacebook და Instagram კამპანიები\nGoogle რეკლამა\nსოციალური მედიის მართვა',
  pricingPolicy:
    'ფასი დამოკიდებულია მიზანზე, მომსახურების ტიპზე და მოცულობაზე. თუ ზუსტი პაკეტი მითითებული არ არის, არ გამოიგონო.',
  deliveryPolicy:
    'ვადები, მიწოდება და შესრულების პირობები უთხარი მხოლოდ მაშინ, როცა ეს ინფორმაცია ზუსტადაა მოცემული.',
  escalationNotes:
    'ოპერატორზე გადადი როცა საუბარი ეხება ფასს, ბიუჯეტს, პორტფოლიოს, ქეისს, ზარს, შეხვედრას ან ინდივიდუალურ შეთავაზებას.',
  restrictions:
    'არ დაჰპირდე ROI-ს, გარანტიას, კონკრეტულ შედეგს, შეხვედრის ჩანიშვნას ან დაუზუსტებელ ფასს.'
};

const DEFAULT_FAQ_ITEMS = [
  {
    question: 'რას აკეთებთ?',
    answer:
      'ვმუშაობთ რეკლამის, სოციალური მედიის, კონტენტის და ბრენდინგის მიმართულებით. თუ გინდა, მომწერე რომელი სერვისი გაინტერესებს.'
  },
  {
    question: 'ფასი რა არის?',
    answer:
      'ფასი დამოკიდებულია მომსახურების ტიპსა და მოცულობაზე. ზუსტ დეტალს ოპერატორი დაგიზუსტებთ.'
  }
];

const DEFAULT_TEST_SCENARIOS = [
  {
    label: 'სერვისები',
    customerMessage: 'რას აკეთებთ?',
    expectedOutcome: 'მოკლედ აუხსენით სერვისები და ჰკითხეთ რომელი მიმართულება აინტერესებს.'
  },
  {
    label: 'ფასი',
    customerMessage: 'ფასი რა არის?',
    expectedOutcome: 'არ გამოიგონოს ფასი და გადაამისამართოს ზუსტ დეტალზე ოპერატორთან.'
  },
  {
    label: 'ოპერატორი',
    customerMessage: 'ოპერატორთან მინდა საუბარი',
    expectedOutcome: 'მოკლე handoff პასუხი და სტატუსის გადაცემა ოპერატორზე.'
  }
];

export const WORKING_DAY_OPTIONS = [
  { key: 'mon', label: 'ორშ' },
  { key: 'tue', label: 'სამ' },
  { key: 'wed', label: 'ოთხ' },
  { key: 'thu', label: 'ხუთ' },
  { key: 'fri', label: 'პარ' },
  { key: 'sat', label: 'შაბ' },
  { key: 'sun', label: 'კვი' }
];

export const AUTOMATION_INTENT_OPTIONS = [
  { key: 'price', label: 'ფასი' },
  { key: 'services', label: 'სერვისი' },
  { key: 'delivery', label: 'მიწოდება' },
  { key: 'order', label: 'შეკვეთა' },
  { key: 'complaint', label: 'საჩივარი' },
  { key: 'operator', label: 'ოპერატორი' }
];

const WORKING_DAY_KEYS = new Set(WORKING_DAY_OPTIONS.map((item) => item.key));
const AUTOMATION_INTENT_KEYS = new Set(AUTOMATION_INTENT_OPTIONS.map((item) => item.key));

const DEFAULT_AUTOMATION_SETTINGS = {
  businessHours: {
    enabled: false,
    timezone: 'Asia/Tbilisi',
    workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    startTime: '10:00',
    endTime: '19:00',
    afterHoursMessage:
      'მადლობა შეტყობინებისთვის. ამჟამად სამუშაო საათების გარეთ ვართ და ოპერატორი პირველივე სამუშაო პერიოდში მოგწერთ.',
    handoffOutsideHours: true
  },
  intentRouting: {
    enabled: false,
    routeToHumanIntents: ['price', 'complaint'],
    routeMessage:
      'გასაგებია. ამ საკითხზე ოპერატორი უფრო ზუსტ პასუხს მოგცემთ და მალევე დაგიკავშირდებათ.'
  },
  confidenceFallback: {
    enabled: true,
    fallbackMessage:
      'ზუსტი პასუხის ნაცვლად არ მინდა შეცდომაში შეგიყვანო. ოპერატორი მალევე დაგიზუსტებს დეტალებს.'
  },
  leadQualification: {
    enabled: false,
    triggerIntents: ['services', 'price', 'order'],
    qualificationMessage:
      'თუ გინდა, მომწერე რომელი სერვისი გაინტერესებს და რა ფორმით გინდა დაგიკავშირდეთ.'
  },
  knowledgeGapDetection: {
    enabled: true
  },
  sentimentHandoff: {
    enabled: false,
    angryKeywords: ['პრობლემა', 'უკმაყოფილო', 'გაბრაზებული', 'სასწრაფოდ', 'ვერ მუშაობს', 'საჩივარი'],
    replyMessage:
      'ვწუხვარ შექმნილი დისკომფორტისთვის. შენს შეტყობინებას ოპერატორს გადავცემ და პრიორიტეტულად დაგიბრუნდებით.'
  }
};

function normalizeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeLongText(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalizeListBlock(value) {
  return String(value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeOptionList(value, allowedValues, fallback = []) {
  const source = Array.isArray(value) ? value : fallback;

  return [...new Set(source.map((item) => String(item || '').trim()).filter((item) => allowedValues.has(item)))];
}

function normalizeKeywordArray(value, fallback = []) {
  const source = Array.isArray(value) ? value : fallback;

  return [...new Set(source.map((item) => normalizeText(item)).filter(Boolean))].slice(0, 20);
}

function normalizeTimeValue(value, fallback) {
  const normalized = String(value || '').trim();
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(normalized) ? normalized : fallback;
}

function buildBulletBlock(title, value) {
  const items = normalizeListBlock(value);

  if (!items.length) {
    return '';
  }

  return `${title}:\n${items.map((item) => `- ${item}`).join('\n')}`;
}

export function normalizeWorkspaceProfile(profile = {}) {
  return {
    businessName: normalizeText(profile.businessName, DEFAULT_WORKSPACE_PROFILE.businessName),
    industry: normalizeText(profile.industry, DEFAULT_WORKSPACE_PROFILE.industry),
    language: normalizeText(profile.language, DEFAULT_WORKSPACE_PROFILE.language),
    city: normalizeText(profile.city, DEFAULT_WORKSPACE_PROFILE.city),
    workingHours: normalizeText(profile.workingHours, DEFAULT_WORKSPACE_PROFILE.workingHours),
    tone: normalizeText(profile.tone, DEFAULT_WORKSPACE_PROFILE.tone),
    responseLength: normalizeText(
      profile.responseLength,
      DEFAULT_WORKSPACE_PROFILE.responseLength
    ),
    businessSummary: normalizeLongText(
      profile.businessSummary,
      DEFAULT_WORKSPACE_PROFILE.businessSummary
    ),
    nextStepCta: normalizeLongText(profile.nextStepCta, DEFAULT_WORKSPACE_PROFILE.nextStepCta)
  };
}

export function normalizeKnowledgeSections(sections = {}) {
  return {
    services: normalizeLongText(sections.services, DEFAULT_KNOWLEDGE_SECTIONS.services),
    pricingPolicy: normalizeLongText(
      sections.pricingPolicy,
      DEFAULT_KNOWLEDGE_SECTIONS.pricingPolicy
    ),
    deliveryPolicy: normalizeLongText(
      sections.deliveryPolicy,
      DEFAULT_KNOWLEDGE_SECTIONS.deliveryPolicy
    ),
    escalationNotes: normalizeLongText(
      sections.escalationNotes,
      DEFAULT_KNOWLEDGE_SECTIONS.escalationNotes
    ),
    restrictions: normalizeLongText(sections.restrictions, DEFAULT_KNOWLEDGE_SECTIONS.restrictions)
  };
}

export function normalizeFaqItems(items) {
  if (!Array.isArray(items)) {
    return DEFAULT_FAQ_ITEMS.map((item) => ({ ...item }));
  }

  return items
    .slice(0, 30)
    .map((item) => ({
      question: normalizeLongText(item?.question),
      answer: normalizeLongText(item?.answer)
    }))
    .filter((item) => item.question && item.answer);
}

export function normalizeTestScenarios(items) {
  if (!Array.isArray(items)) {
    return DEFAULT_TEST_SCENARIOS.map((item) => ({ ...item }));
  }

  return items
    .slice(0, 12)
    .map((item) => ({
      label: normalizeText(item?.label, 'სცენარი'),
      customerMessage: normalizeLongText(item?.customerMessage),
      expectedOutcome: normalizeLongText(item?.expectedOutcome)
    }))
    .filter((item) => item.customerMessage);
}

export function normalizeAutomationSettings(settings = {}) {
  return {
    businessHours: {
      enabled: normalizeBoolean(
        settings.businessHours?.enabled,
        DEFAULT_AUTOMATION_SETTINGS.businessHours.enabled
      ),
      timezone: normalizeText(
        settings.businessHours?.timezone,
        DEFAULT_AUTOMATION_SETTINGS.businessHours.timezone
      ),
      workingDays: normalizeOptionList(
        settings.businessHours?.workingDays,
        WORKING_DAY_KEYS,
        DEFAULT_AUTOMATION_SETTINGS.businessHours.workingDays
      ),
      startTime: normalizeTimeValue(
        settings.businessHours?.startTime,
        DEFAULT_AUTOMATION_SETTINGS.businessHours.startTime
      ),
      endTime: normalizeTimeValue(
        settings.businessHours?.endTime,
        DEFAULT_AUTOMATION_SETTINGS.businessHours.endTime
      ),
      afterHoursMessage: normalizeLongText(
        settings.businessHours?.afterHoursMessage,
        DEFAULT_AUTOMATION_SETTINGS.businessHours.afterHoursMessage
      ),
      handoffOutsideHours: normalizeBoolean(
        settings.businessHours?.handoffOutsideHours,
        DEFAULT_AUTOMATION_SETTINGS.businessHours.handoffOutsideHours
      )
    },
    intentRouting: {
      enabled: normalizeBoolean(
        settings.intentRouting?.enabled,
        DEFAULT_AUTOMATION_SETTINGS.intentRouting.enabled
      ),
      routeToHumanIntents: normalizeOptionList(
        settings.intentRouting?.routeToHumanIntents,
        AUTOMATION_INTENT_KEYS,
        DEFAULT_AUTOMATION_SETTINGS.intentRouting.routeToHumanIntents
      ),
      routeMessage: normalizeLongText(
        settings.intentRouting?.routeMessage,
        DEFAULT_AUTOMATION_SETTINGS.intentRouting.routeMessage
      )
    },
    confidenceFallback: {
      enabled: normalizeBoolean(
        settings.confidenceFallback?.enabled,
        DEFAULT_AUTOMATION_SETTINGS.confidenceFallback.enabled
      ),
      fallbackMessage: normalizeLongText(
        settings.confidenceFallback?.fallbackMessage,
        DEFAULT_AUTOMATION_SETTINGS.confidenceFallback.fallbackMessage
      )
    },
    leadQualification: {
      enabled: normalizeBoolean(
        settings.leadQualification?.enabled,
        DEFAULT_AUTOMATION_SETTINGS.leadQualification.enabled
      ),
      triggerIntents: normalizeOptionList(
        settings.leadQualification?.triggerIntents,
        AUTOMATION_INTENT_KEYS,
        DEFAULT_AUTOMATION_SETTINGS.leadQualification.triggerIntents
      ),
      qualificationMessage: normalizeLongText(
        settings.leadQualification?.qualificationMessage,
        DEFAULT_AUTOMATION_SETTINGS.leadQualification.qualificationMessage
      )
    },
    knowledgeGapDetection: {
      enabled: normalizeBoolean(
        settings.knowledgeGapDetection?.enabled,
        DEFAULT_AUTOMATION_SETTINGS.knowledgeGapDetection.enabled
      )
    },
    sentimentHandoff: {
      enabled: normalizeBoolean(
        settings.sentimentHandoff?.enabled,
        DEFAULT_AUTOMATION_SETTINGS.sentimentHandoff.enabled
      ),
      angryKeywords: normalizeKeywordArray(
        settings.sentimentHandoff?.angryKeywords,
        DEFAULT_AUTOMATION_SETTINGS.sentimentHandoff.angryKeywords
      ),
      replyMessage: normalizeLongText(
        settings.sentimentHandoff?.replyMessage,
        DEFAULT_AUTOMATION_SETTINGS.sentimentHandoff.replyMessage
      )
    }
  };
}

function buildLengthInstruction(responseLength) {
  const normalized = String(responseLength || '').toLowerCase();

  if (normalized.includes('დეტ')) {
    return 'პასუხი იყოს მოკლე, მაგრამ საჭიროებისას 3-4 წინადადებამდე შეიძლება აიწიოს.';
  }

  if (normalized.includes('საშ')) {
    return 'პასუხი იყოს 2-3 მოკლე წინადადება.';
  }

  return 'პასუხი იყოს ძალიან მოკლე: 1-2 წინადადება.';
}

export function buildGeneratedSystemPrompt(config = {}) {
  const workspaceProfile = normalizeWorkspaceProfile(config.workspaceProfile);
  const knowledgeSections = normalizeKnowledgeSections(config.knowledgeSections);

  return [
    `შენ ხარ ${workspaceProfile.businessName}-ის ავტოპასუხის ასისტენტი Facebook Messenger-ში.`,
    'მთავარი ამოცანა:',
    '- უპასუხე მხოლოდ ბუნებრივი ქართულით.',
    `- ტონი იყოს ${workspaceProfile.tone}.`,
    `- ${buildLengthInstruction(workspaceProfile.responseLength)}`,
    '- დაეხმარე კლიენტს გაიგოს რას სთავაზობს ბიზნესი და რა არის სწორი შემდეგი ნაბიჯი.',
    '- არ დაწერო markdown, ბულეტები, გრძელი აბზაცები ან ზედმეტი ემოჯები ჩათში.',
    '',
    'უსაფრთხოება და სიზუსტე:',
    '- არ გამოიგონო ფასი, ვადა, შედეგი, გარანტია, საკონტაქტო დეტალი ან პორტფოლიო.',
    '- თუ ზუსტი ინფორმაცია არ არის მოცემული, თქვი მხოლოდ: "ზუსტ დეტალს ოპერატორი დაგიზუსტებთ."',
    knowledgeSections.restrictions ? `- ${knowledgeSections.restrictions}` : '',
    '',
    'საუბრის პრინციპები:',
    '- თუ კლიენტი მხოლოდ მოგესალმა, მიესალმე და ჰკითხე რა მიმართულება აინტერესებს.',
    knowledgeSections.pricingPolicy ? `- ${knowledgeSections.pricingPolicy}` : '',
    knowledgeSections.escalationNotes ? `- ${knowledgeSections.escalationNotes}` : '',
    workspaceProfile.nextStepCta ? `- ${workspaceProfile.nextStepCta}` : '',
    '',
    'ბიზნესის კონტექსტი:',
    workspaceProfile.businessSummary
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildGeneratedKnowledgeBase(config = {}) {
  const workspaceProfile = normalizeWorkspaceProfile(config.workspaceProfile);
  const knowledgeSections = normalizeKnowledgeSections(config.knowledgeSections);

  return [
    `კომპანიის სახელი: ${workspaceProfile.businessName}`,
    `ინდუსტრია: ${workspaceProfile.industry}`,
    `ენა: ${workspaceProfile.language}`,
    `ქალაქი: ${workspaceProfile.city}`,
    `სამუშაო საათები: ${workspaceProfile.workingHours}`,
    '',
    `ბიზნესის მოკლე აღწერა:\n${workspaceProfile.businessSummary}`,
    buildBulletBlock('სერვისები', knowledgeSections.services),
    knowledgeSections.pricingPolicy
      ? `ფასების პოლიტიკა:\n${knowledgeSections.pricingPolicy}`
      : '',
    knowledgeSections.deliveryPolicy
      ? `მიწოდება და ვადები:\n${knowledgeSections.deliveryPolicy}`
      : '',
    knowledgeSections.escalationNotes
      ? `როდის გადავიდეს ოპერატორზე:\n${knowledgeSections.escalationNotes}`
      : '',
    knowledgeSections.restrictions
      ? `აკრძალული დაპირებები:\n${knowledgeSections.restrictions}`
      : ''
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function normalizeBuilderConfig(config = {}) {
  const workspaceProfile = normalizeWorkspaceProfile(config.workspaceProfile);
  const knowledgeSections = normalizeKnowledgeSections(config.knowledgeSections);
  const faqItems =
    config.faqItems === undefined ? normalizeFaqItems() : normalizeFaqItems(config.faqItems);
  const testScenarios =
    config.testScenarios === undefined
      ? normalizeTestScenarios()
      : normalizeTestScenarios(config.testScenarios);
  const conversationSettings = normalizeConversationSettings(config.conversationSettings);
  const automationSettings = normalizeAutomationSettings(config.automationSettings);

  const normalized = {
    ...config,
    workspaceProfile,
    knowledgeSections,
    faqItems,
    testScenarios,
    conversationSettings,
    automationSettings
  };

  return {
    ...normalized,
    systemPrompt: normalizeLongText(
      config.systemPrompt,
      buildGeneratedSystemPrompt(normalized)
    ),
    knowledgeBase: normalizeLongText(
      config.knowledgeBase,
      buildGeneratedKnowledgeBase(normalized)
    )
  };
}

export function prepareBotConfigForRuntime(config = {}) {
  const normalized = normalizeBuilderConfig(config);

  return {
    ...normalized,
    systemPrompt: buildGeneratedSystemPrompt(normalized),
    knowledgeBase: buildGeneratedKnowledgeBase(normalized)
  };
}

export function createDefaultBuilderConfig() {
  return prepareBotConfigForRuntime({
    workspaceProfile: DEFAULT_WORKSPACE_PROFILE,
    knowledgeSections: DEFAULT_KNOWLEDGE_SECTIONS,
    faqItems: DEFAULT_FAQ_ITEMS,
    testScenarios: DEFAULT_TEST_SCENARIOS,
    conversationSettings: getDefaultConversationSettings(),
    automationSettings: DEFAULT_AUTOMATION_SETTINGS
  });
}
