import {
  getConversation,
  listConversations,
  markConversationRead,
  setConversationStatus
} from '../../lib/inbox';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const conversationId = req.query.conversationId;

      if (conversationId) {
        const conversation = await getConversation(conversationId);

        if (!conversation) {
          return res.status(404).json({ error: 'Conversation not found' });
        }

        return res.status(200).json({
          ok: true,
          conversation
        });
      }

      const conversations = await listConversations();
      return res.status(200).json({
        ok: true,
        conversations
      });
    }

    if (req.method === 'PATCH') {
      const { conversationId, action } = req.body || {};

      if (!conversationId || typeof conversationId !== 'string') {
        return res.status(400).json({ error: 'conversationId is required' });
      }

      if (action === 'read') {
        const conversation = await markConversationRead(conversationId);

        if (!conversation) {
          return res.status(404).json({ error: 'Conversation not found' });
        }

        return res.status(200).json({
          ok: true,
          conversation
        });
      }

      const statusMap = {
        open: 'open',
        close: 'closed',
        closed: 'closed',
        human: 'needs_human',
        needs_human: 'needs_human'
      };

      const nextStatus = statusMap[action];

      if (!nextStatus) {
        return res.status(400).json({ error: 'Unsupported inbox action' });
      }

      const conversation = await setConversationStatus(conversationId, nextStatus);
      return res.status(200).json({
        ok: true,
        conversation
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Inbox request failed' });
  }
}
