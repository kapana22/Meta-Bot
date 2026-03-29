function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function splitWords(text) {
  return normalizeText(text)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function extractStoreName(botConfig = {}) {
  if (typeof botConfig?.workspaceProfile?.businessName === 'string' && botConfig.workspaceProfile.businessName.trim()) {
    return botConfig.workspaceProfile.businessName.trim();
  }

  const source = `${botConfig.systemPrompt || ''}\n${botConfig.knowledgeBase || ''}`;
  const patterns = [
    /კომპანიის სახელი:\s*([^\n]+)/i,
    /სააგენტოს სახელი:\s*([^\n]+)/i,
    /მაღაზიის სახელი:\s*([^\n]+)/i,
    /business name:\s*([^\n]+)/i,
    /store name:\s*([^\n]+)/i,
    /agency name:\s*([^\n]+)/i
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);

    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return 'ჩვენს გუნდს';
}

export function containsGeorgian(text) {
  return /[\u10A0-\u10FF]/.test(String(text || ''));
}

export function validateIncomingMessage(userMessage) {
  const cleanText = String(userMessage || '').trim();

  if (!cleanText) {
    return {
      ok: false,
      reply: 'გთხოვთ, მომწერეთ ტექსტური შეტყობინება.'
    };
  }

  if (cleanText.length > 500) {
    return {
      ok: false,
      reply: 'გთხოვთ, მოკლედ მოგვწერეთ, რომ უკეთ დაგეხმაროთ.'
    };
  }

  return {
    ok: true,
    text: cleanText
  };
}

export function getQuickReply(userMessage, botConfig = {}) {
  const text = normalizeText(userMessage);
  const storeName = extractStoreName(botConfig);

  const greetingOnly = [
    'გამარჯობა',
    'გაუმარჯოს',
    'ჰაი',
    'hello',
    'hi'
  ];

  const asksWho = [
    'ვის ვწერ',
    'ვის გწერთ',
    'რომელი მაღაზიაა',
    'ვინ ხართ',
    'რა გვერდია'
  ];

  if (greetingOnly.includes(text)) {
    return `გამარჯობა. თქვენ მოგვწერეთ ${storeName}-ს. რით დაგეხმაროთ?`;
  }

  if (asksWho.some((item) => text.includes(item))) {
    return `თქვენ მოგვწერეთ ${storeName}-ს. სიამოვნებით დაგეხმარებით პროდუქტის ან შეკვეთის შესახებ.`;
  }

  if (text.includes('ფასი')) {
    return 'ფასი მომსახურების ტიპსა და მოცულობაზეა დამოკიდებული. თუ გინდა, მომწერე რომელი სერვისი გაინტერესებს და ოპერატორი დეტალს დაგიზუსტებს.';
  }

  if (
    text.includes('რას აკეთებთ') ||
    text.includes('რას სთავაზობთ') ||
    text.includes('მომსახურება') ||
    text.includes('სერვისი')
  ) {
    return `${storeName} გეხმარება რეკლამაში, კონტენტში და სოციალური მედიის მართვაში. თუ გინდა, მომწერე ზუსტად რა სერვისი გაინტერესებს.`;
  }

  if (
    text.includes('რეკლამა') ||
    text.includes('meta ads') ||
    text.includes('facebook ads') ||
    text.includes('instagram ads') ||
    text.includes('google ads')
  ) {
    return 'კი, სარეკლამო კამპანიების დაგეგმვასა და მართვაში დაგეხმარებით. მომწერე რა ბიზნესზე ან მიზანზე გინდა მუშაობა.';
  }

  if (
    text.includes('სოციალური მედია') ||
    text.includes('სოც ქსელი') ||
    text.includes('ინსტაგრამ') ||
    text.includes('ფეისბუქ გვერდი') ||
    text.includes('გვერდის მართვა')
  ) {
    return 'კი, სოციალური მედიის მართვაშიც დაგეხმარებით. თუ გინდა, მომწერე რომელი პლატფორმა და რა ტიპის დახმარება გჭირდება.';
  }

  if (
    text.includes('კონტენტი') ||
    text.includes('დიზაინი') ||
    text.includes('ვიდეო') ||
    text.includes('ბრენდინგი') ||
    text.includes('ლოგო')
  ) {
    return 'კი, კონტენტის, დიზაინისა და ბრენდინგის მიმართულებითაც დაგეხმარებით. მომწერე რა ტიპის მასალა ან სერვისი გჭირდება.';
  }

  if (
    text.includes('პორტფოლიო') ||
    text.includes('ნამუშევარი') ||
    text.includes('ქეისი') ||
    text.includes('მაგალითი')
  ) {
    return 'პორტფოლიოსა და მაგალითებს ოპერატორი დაგიზუსტებთ. თუ გინდა, მომწერე რა სფეროს ნამუშევარი გაინტერესებს.';
  }

  if (
    text.includes('ბიუჯეტი') ||
    text.includes('ღირებულება') ||
    text.includes('ფასები') ||
    text.includes('პაკეტი')
  ) {
    return 'ფასი სერვისის მოცულობასა და მიზანზეა დამოკიდებული. ზუსტ დეტალს ოპერატორი დაგიზუსტებთ, თუ მოგვწერ რა გჭირდება.';
  }

  if (
    text.includes('კონსულტაცია') ||
    text.includes('შეხვედრა') ||
    text.includes('ზარი') ||
    text.includes('მენეჯერი')
  ) {
    return 'კი, შეგვიძლია კონსულტაციაც. მომწერე მოკლედ რა მიმართულება გაინტერესებს და ოპერატორი დაგიკავშირდება.';
  }

  if (text.includes('მიწოდება') || text.includes('მიტანა') || text.includes('delivery')) {
    return 'კი, მიწოდების ზუსტ დროს და პირობებს ოპერატორი დაგიზუსტებთ.';
  }

  if (
    text.includes('შეკვეთა') ||
    text.includes('შეკვეთ') ||
    text.includes('როგორ შევუკვეთო') ||
    text.includes('order')
  ) {
    return 'დასაწყებად მოგვწერეთ რომელი სერვისი გჭირდებათ და რა მიზანი გაქვთ. შემდეგ ოპერატორი დაგეხმარებათ დეტალებში.';
  }

  if (
    text.includes('არის') ||
    text.includes('ნაშთ') ||
    text.includes('მარაგ') ||
    text.includes('ხელმისაწვდომ')
  ) {
    return 'თუ გინდა, მომწერე რომელი მომსახურება გაინტერესებს და დაგიზუსტებთ რა ფორმატში შეგვიძლია დახმარება.';
  }

  return null;
}

export function sanitizeReply(reply) {
  const cleanReply = String(reply || '')
    .replace(/[*#`_]/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanReply) {
    return 'გთხოვთ, მოგვწერეთ დეტალურად და დაგეხმარებით.';
  }

  if (cleanReply.length <= 320) {
    return cleanReply;
  }

  const shortened = cleanReply.slice(0, 320);
  const lastSentenceBreak = Math.max(
    shortened.lastIndexOf('.'),
    shortened.lastIndexOf('?'),
    shortened.lastIndexOf('!')
  );

  if (lastSentenceBreak > 80) {
    return shortened.slice(0, lastSentenceBreak + 1).trim();
  }

  return `${shortened.trim()}...`;
}

export function findBestFaqMatch(userMessage, faqItems = []) {
  const normalizedMessage = normalizeText(userMessage);

  if (!normalizedMessage || !Array.isArray(faqItems) || faqItems.length === 0) {
    return null;
  }

  const messageWords = splitWords(normalizedMessage);
  let bestMatch = null;

  for (const item of faqItems) {
    const normalizedQuestion = normalizeText(item?.question);

    if (!normalizedQuestion) {
      continue;
    }

    if (
      normalizedMessage === normalizedQuestion ||
      normalizedMessage.includes(normalizedQuestion) ||
      normalizedQuestion.includes(normalizedMessage)
    ) {
      return item;
    }

    const questionWords = splitWords(normalizedQuestion);
    const sharedWords = questionWords.filter((word) => messageWords.includes(word));

    if (sharedWords.length >= 2) {
      bestMatch = item;
    }
  }

  return bestMatch;
}

export function isLowQualityReply(reply) {
  const text = String(reply || '').trim();

  if (!text) {
    return true;
  }

  const questionMarks = (text.match(/\?/g) || []).length;
  const georgianLetters = (text.match(/[\u10A0-\u10FF]/g) || []).length;
  const latinLetters = (text.match(/[A-Za-z]/g) || []).length;

  if (questionMarks >= 4) {
    return true;
  }

  if (!georgianLetters && latinLetters > 0) {
    return true;
  }

  if (latinLetters > georgianLetters * 2 && georgianLetters < 20) {
    return true;
  }

  if (georgianLetters > 0 && questionMarks >= 2 && georgianLetters < 8) {
    return true;
  }

  return false;
}
