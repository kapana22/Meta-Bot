import fs from 'fs/promises';
import path from 'path';

const KNOWLEDGE_GAPS_PATH = path.join(process.cwd(), 'data', 'knowledge-gaps.json');
const MAX_GAPS = 120;

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function readKnowledgeGapStore() {
  try {
    const content = await fs.readFile(KNOWLEDGE_GAPS_PATH, 'utf8');
    const parsed = JSON.parse(content);

    return {
      items: Array.isArray(parsed.items) ? parsed.items : []
    };
  } catch (error) {
    return {
      items: []
    };
  }
}

async function writeKnowledgeGapStore(store) {
  await fs.mkdir(path.dirname(KNOWLEDGE_GAPS_PATH), { recursive: true });
  await fs.writeFile(KNOWLEDGE_GAPS_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export async function recordKnowledgeGap({ text, senderId, intent = 'unknown', reason = 'unknown' }) {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return null;
  }

  const store = await readKnowledgeGapStore();
  const now = new Date().toISOString();
  const existingIndex = store.items.findIndex((item) => item.normalizedText === normalizedText);

  if (existingIndex >= 0) {
    const current = store.items[existingIndex];
    store.items[existingIndex] = {
      ...current,
      count: Number(current.count || 0) + 1,
      lastSeenAt: now,
      lastIntent: intent,
      lastReason: reason,
      lastSenderId: senderId || current.lastSenderId || null,
      exampleText: String(text || '').trim().slice(0, 280) || current.exampleText
    };
  } else {
    store.items.unshift({
      id: `gap_${Date.now()}`,
      normalizedText,
      exampleText: String(text || '').trim().slice(0, 280),
      count: 1,
      firstSeenAt: now,
      lastSeenAt: now,
      lastIntent: intent,
      lastReason: reason,
      lastSenderId: senderId || null
    });
  }

  store.items = store.items
    .sort((a, b) => new Date(b.lastSeenAt || 0).getTime() - new Date(a.lastSeenAt || 0).getTime())
    .slice(0, MAX_GAPS);

  await writeKnowledgeGapStore(store);
  return store.items[0] || null;
}
