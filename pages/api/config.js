import {
  getConfigState,
  publishDraftConfig,
  rollbackPublishedConfig,
  saveDraftConfig
} from '../../lib/config';

function isText(value) {
  return value === undefined || typeof value === 'string';
}

function isValidFaqItems(faqItems) {
  if (faqItems === undefined) {
    return true;
  }

  if (!Array.isArray(faqItems)) {
    return false;
  }

  return faqItems.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      isText(item.question) &&
      isText(item.answer)
  );
}

function isValidConversationSettings(settings) {
  if (settings === undefined) {
    return true;
  }

  if (!settings || typeof settings !== 'object') {
    return false;
  }

  return (
    Array.isArray(settings.handoffKeywords) &&
    Array.isArray(settings.closingKeywords) &&
    Array.isArray(settings.reopenKeywords) &&
    isText(settings.handoffMessage) &&
    isText(settings.farewellMessage) &&
    typeof settings.maxAutoReplies === 'number'
  );
}

function isPlainObject(value) {
  return value === undefined || (!!value && typeof value === 'object' && !Array.isArray(value));
}

function isValidTestScenarios(value) {
  if (value === undefined) {
    return true;
  }

  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      isText(item.label) &&
      isText(item.customerMessage) &&
      isText(item.expectedOutcome)
  );
}

function isValidDraftPayload(nextConfig) {
  return (
    isText(nextConfig.systemPrompt) &&
    isText(nextConfig.knowledgeBase) &&
    isValidFaqItems(nextConfig.faqItems) &&
    isValidConversationSettings(nextConfig.conversationSettings) &&
    isPlainObject(nextConfig.automationSettings) &&
    isPlainObject(nextConfig.workspaceProfile) &&
    isPlainObject(nextConfig.knowledgeSections) &&
    isValidTestScenarios(nextConfig.testScenarios)
  );
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const state = await getConfigState();
      return res.status(200).json({
        ok: true,
        state
      });
    }

    if (req.method === 'POST') {
      const nextConfig = req.body || {};

      if (!isValidDraftPayload(nextConfig)) {
        return res.status(400).json({ error: 'Config payload is not valid' });
      }

      await saveDraftConfig(nextConfig);
      const state = await getConfigState();

      return res.status(200).json({
        ok: true,
        state
      });
    }

    if (req.method === 'PATCH') {
      const action = req.body?.action;

      if (action === 'publish') {
        await publishDraftConfig();
        const state = await getConfigState();
        return res.status(200).json({ ok: true, state });
      }

      if (action === 'rollback') {
        await rollbackPublishedConfig(req.body?.versionId);
        const state = await getConfigState();
        return res.status(200).json({ ok: true, state });
      }

      return res.status(400).json({ error: 'Unknown config action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Config request failed' });
  }
}
