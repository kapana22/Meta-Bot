import {
  containsGeorgian,
  extractStoreName,
  findBestFaqMatch,
  getQuickReply,
  isLowQualityReply,
  sanitizeReply,
  validateIncomingMessage
} from './reply-rules';
import { prepareBotConfigForRuntime } from './builder-config';

const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/generate';
const OLLAMA_TAGS_URL = 'http://127.0.0.1:11434/api/tags';
const OLLAMA_VERSION_URL = 'http://127.0.0.1:11434/api/version';
const OLLAMA_MODEL = 'llama3.2:1b';
const OLLAMA_TIMEOUT_MS = 12000;

const BASE_SYSTEM_PROMPT = `You are a Facebook Messenger assistant for a Georgian online store.
Hard rules:
- Reply only in natural Georgian.
- Keep every reply short and clear.
- Use at most 2 short sentences.
- Do not use markdown, bullet lists, headings, or emojis.
- Do not invent prices, stock, delivery times, phone numbers, email addresses, websites, or policies.
- If exact information is missing, say: "ზუსტ დეტალს ოპერატორი გადაამოწმებს."
- If the customer only greets you, greet them briefly and ask how you can help.
- Never repeat the same answer many times.
- Never output nonsense text or another language.`;

async function fetchOllamaModels() {
  const response = await fetch(OLLAMA_TAGS_URL);

  if (!response.ok) {
    throw new Error('Could not read Ollama models');
  }

  const data = await response.json().catch(() => ({}));
  return Array.isArray(data.models) ? data.models : [];
}

async function resolveOllamaModel() {
  const models = await fetchOllamaModels();

  if (models.length === 0) {
    throw new Error('No Ollama model found. Finish the download first.');
  }

  const preferredModel = models.find((item) => item.name === OLLAMA_MODEL || item.model === OLLAMA_MODEL);

  if (preferredModel) {
    return preferredModel.name || preferredModel.model || OLLAMA_MODEL;
  }

  const firstAvailableModel = models[0];
  return firstAvailableModel.name || firstAvailableModel.model || OLLAMA_MODEL;
}

function buildFaqBlock(faqItems) {
  if (!Array.isArray(faqItems) || faqItems.length === 0) {
    return '';
  }

  const lines = faqItems
    .filter(
      (item) =>
        item &&
        typeof item.question === 'string' &&
        item.question.trim() &&
        typeof item.answer === 'string' &&
        item.answer.trim()
    )
    .slice(0, 20)
    .map((item) => `Q: ${item.question.trim()}\nA: ${item.answer.trim()}`)
    .join('\n\n');

  return lines ? `Use these FAQ answers first when they match the customer's question:\n\n${lines}` : '';
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findFaqReply(userMessage, faqItems) {
  if (!Array.isArray(faqItems)) {
    return '';
  }

  const match = findBestFaqMatch(userMessage, faqItems);

  return match && typeof match.answer === 'string' ? sanitizeReply(match.answer) : '';
}

function buildModelFallbackReply(userMessage, botConfig = {}) {
  const storeName = extractStoreName(botConfig);
  const normalizedMessage = normalizeText(userMessage);

  if (!normalizedMessage) {
    return 'გთხოვთ, მოგვწერეთ მოკლე ტექსტური შეტყობინება.';
  }

  if (normalizedMessage.includes('ფასი')) {
    return 'ფასი მომსახურების ტიპსა და მოცულობაზეა დამოკიდებული. ზუსტ დეტალს ოპერატორი დაგიზუსტებთ.';
  }

  if (
    normalizedMessage.includes('მომსახურება') ||
    normalizedMessage.includes('სერვისი') ||
    normalizedMessage.includes('რას აკეთებთ')
  ) {
    return `${storeName} მუშაობს რეკლამის, კონტენტის და სოციალური მედიის მიმართულებით. თუ გინდათ, მოგვწერეთ რომელი სერვისი გაინტერესებთ.`;
  }

  if (
    normalizedMessage.includes('მიწოდება') ||
    normalizedMessage.includes('მიტანა') ||
    normalizedMessage.includes('კურიერ')
  ) {
    return 'კი, მიწოდების ზუსტ დროს და პირობებს ოპერატორი დაგიზუსტებთ.';
  }

  if (
    normalizedMessage.includes('შეკვეთა') ||
    normalizedMessage.includes('შეკვეთ') ||
    normalizedMessage.includes('როგორ შევუკვეთო')
  ) {
    return 'დასაწყებად მოგვწერეთ რომელი სერვისი გჭირდებათ და რა მიზანი გაქვთ. შემდეგ ოპერატორი დაგეხმარებათ.';
  }

  if (
    normalizedMessage.includes('რეკლამა') ||
    normalizedMessage.includes('meta') ||
    normalizedMessage.includes('facebook') ||
    normalizedMessage.includes('instagram') ||
    normalizedMessage.includes('google')
  ) {
    return 'რეკლამის მიმართულებით დაგეხმარებით. მოგვწერეთ რა ბიზნესზე ან რა მიზანზე გინდათ მუშაობა და ოპერატორი დაგიზუსტებთ დეტალებს.';
  }

  if (
    normalizedMessage.includes('პორტფოლიო') ||
    normalizedMessage.includes('ნამუშევარი') ||
    normalizedMessage.includes('ქეისი') ||
    normalizedMessage.includes('მაგალითი')
  ) {
    return 'პორტფოლიოსა და მაგალითებს ოპერატორი დაგიზუსტებთ. თუ გინდათ, მოგვწერეთ რა მიმართულება გაინტერესებთ.';
  }

  if (
    normalizedMessage.includes('კონსულტაცია') ||
    normalizedMessage.includes('შეხვედრა') ||
    normalizedMessage.includes('ზარი') ||
    normalizedMessage.includes('მენეჯერი')
  ) {
    return 'კონსულტაციისთვის მოგვწერეთ მოკლედ რა გჭირდებათ და ოპერატორი დაგიკავშირდებათ.';
  }

  if (
    normalizedMessage.includes('არის') ||
    normalizedMessage.includes('ნაშთ') ||
    normalizedMessage.includes('მარაგ') ||
    normalizedMessage.includes('ხელმისაწვდომ')
  ) {
    return 'ხელმისაწვდომობას ოპერატორი გადაამოწმებს. თუ გინდათ, მოგვწერეთ პროდუქტის ზუსტი სახელი.';
  }

  return `${storeName}-ს შესახებ ზუსტ დეტალს ოპერატორი გადაამოწმებს. თუ გინდათ, მომწერეთ კითხვა მოკლედ.`;
}

function buildPrompt(userMessage, knowledgeBase, faqItems, conversationHistory) {
  const cleanKnowledge = typeof knowledgeBase === 'string' ? knowledgeBase.trim() : '';
  const faqBlock = buildFaqBlock(faqItems);
  const historyLines = Array.isArray(conversationHistory)
    ? conversationHistory
        .filter((item) => item && typeof item.text === 'string' && item.text.trim())
        .slice(-8)
        .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'Customer'}: ${item.text.trim()}`)
        .join('\n')
    : '';

  const infoBlocks = [cleanKnowledge, faqBlock].filter(Boolean).join('\n\n');
  const infoSection = infoBlocks
    ? `Use this business information when it is relevant:\n\n${infoBlocks}\n\n`
    : '';
  const historyBlock = historyLines ? `Recent conversation:\n${historyLines}\n\n` : '';

  return `${infoSection}${historyBlock}Customer message:\n${userMessage}`;
}

export async function generateOpenAIReplyDetails(userMessage, botConfig = {}) {
  let response;
  let model;
  let timeoutId;
  const messageCheck = validateIncomingMessage(userMessage);
  const runtimeConfig = prepareBotConfigForRuntime(botConfig);

  if (!messageCheck.ok) {
    return {
      reply: messageCheck.reply,
      source: 'validation'
    };
  }

  const quickReply = getQuickReply(messageCheck.text, runtimeConfig);

  if (quickReply) {
    return {
      reply: quickReply,
      source: 'quick'
    };
  }

  const faqReply = findFaqReply(messageCheck.text, runtimeConfig.faqItems);

  if (faqReply) {
    return {
      reply: faqReply,
      source: 'faq'
    };
  }

  try {
    model = await resolveOllamaModel();
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

    response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        system:
          typeof runtimeConfig.systemPrompt === 'string' && runtimeConfig.systemPrompt.trim()
            ? `${BASE_SYSTEM_PROMPT}\n\nBusiness instructions:\n${runtimeConfig.systemPrompt.trim()}`
            : BASE_SYSTEM_PROMPT,
        prompt: buildPrompt(
          messageCheck.text,
          runtimeConfig.knowledgeBase,
          runtimeConfig.faqItems,
          runtimeConfig.conversationHistory
        ),
        options: {
          temperature: 0.2,
          num_predict: 120,
          num_ctx: 1024
        },
        stream: false
      })
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        reply: buildModelFallbackReply(messageCheck.text, runtimeConfig),
        source: 'model_fallback'
      };
    }

    throw new Error(error.message || 'Ollama is not running. Start Ollama first.');
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('Ollama API error:', data);
    if (data.error) {
      return buildModelFallbackReply(messageCheck.text, runtimeConfig);
    }

    throw new Error('Ollama request failed');
  }

  const reply = data.response && data.response.trim();

  if (!reply) {
    return {
      reply: buildModelFallbackReply(messageCheck.text, runtimeConfig),
      source: 'empty_fallback'
    };
  }

  const cleanReply = sanitizeReply(reply);

  if (
    isLowQualityReply(cleanReply) ||
    (containsGeorgian(messageCheck.text) && !containsGeorgian(cleanReply))
  ) {
    return {
      reply: buildModelFallbackReply(messageCheck.text, runtimeConfig),
      source: 'quality_fallback'
    };
  }

  return {
    reply: cleanReply,
    source: 'model',
    model
  };
}

export async function generateOpenAIReply(userMessage, botConfig = {}) {
  const result = await generateOpenAIReplyDetails(userMessage, botConfig);
  return result.reply;
}

export async function getOllamaStatus() {
  try {
    const versionResponse = await fetch(OLLAMA_VERSION_URL);

    if (!versionResponse.ok) {
      return {
        running: false,
        modelReady: false,
        model: null,
        preferredModel: OLLAMA_MODEL,
        message: 'Ollama is installed but not ready yet'
      };
    }

    const versionData = await versionResponse.json().catch(() => ({}));
    const models = await fetchOllamaModels().catch(() => []);
    const modelReady = models.length > 0;
    const preferredReady = models.some((item) => item.name === OLLAMA_MODEL || item.model === OLLAMA_MODEL);
    const currentModel = modelReady ? models[0].name || models[0].model || null : null;

    return {
      running: true,
      modelReady,
      preferredReady,
      model: currentModel,
      preferredModel: OLLAMA_MODEL,
      version: versionData.version || null,
      message: modelReady ? 'Ollama is ready' : 'Ollama is running but model is still missing'
    };
  } catch (error) {
    return {
      running: false,
      modelReady: false,
      preferredReady: false,
      model: null,
      preferredModel: OLLAMA_MODEL,
      message: 'Ollama is not running yet'
    };
  }
}
