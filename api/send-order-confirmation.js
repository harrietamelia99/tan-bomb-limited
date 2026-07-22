const { sendOrderConfirmationForSession } = require('./lib/order-confirmation');

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch (err) {
      return null;
    }
  }
  return req.body;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = parseBody(req);
  if (!body) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const sessionId = String(body.session_id || body.sessionId || '').trim();
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return res.status(400).json({ error: 'Missing or invalid session_id' });
  }

  try {
    const result = await sendOrderConfirmationForSession(sessionId);
    if (!result.ok) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error('send-order-confirmation error:', err.message || err);
    return res.status(500).json({ error: err.message || 'Unable to send confirmation' });
  }
};
