import { getOllamaStatus } from '../../lib/openai';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const status = await getOllamaStatus();
    return res.status(200).json(status);
  } catch (error) {
    return res.status(500).json({
      running: false,
      modelReady: false,
      message: error.message || 'Failed to check Ollama status'
    });
  }
}
