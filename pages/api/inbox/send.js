import { sendFacebookMessage } from '../../../lib/facebook';
import { recordOutgoingMessage, setConversationStatus } from '../../../lib/inbox';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { conversationId, text } = req.body || {};

    if (!conversationId || typeof conversationId !== 'string') {
      return res.status(400).json({ error: 'conversationId is required' });
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    if (text.trim().length > 1500) {
      return res.status(400).json({ error: 'text is too long' });
    }

    const sendResult = await sendFacebookMessage(conversationId, text.trim());
    await recordOutgoingMessage({
      senderId: conversationId,
      text: text.trim(),
      senderType: 'agent',
      source: 'facebook',
      messageId: sendResult.message_id || null
    });
    await setConversationStatus(conversationId, 'needs_human');

    return res.status(200).json({
      ok: true
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Inbox send failed' });
  }
}
