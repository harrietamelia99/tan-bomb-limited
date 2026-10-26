const { Resend } = require('resend');

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'info@tan-bomb.com';
const FROM_EMAIL = process.env.RESEND_FROM || 'Tan Bomb <info@tan-bomb.com>';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'VIP signup is not configured. Add RESEND_API_KEY in Vercel.'
    });
  }

  const body = parseBody(req);
  if (!body) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  if (body.company) {
    return res.status(200).json({ ok: true });
  }

  const email = String(body.email || '').trim();
  const name = String(body.name || '').trim();

  if (!email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (name.length > 120) {
    return res.status(400).json({ error: 'Name is too long.' });
  }

  const resend = new Resend(apiKey);
  const safeEmail = escapeHtml(email);
  const safeName = escapeHtml(name || '-');

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email,
      subject: 'VIP Club signup - Tan Bomb',
      html: `
        <h2>New VIP Club signup</h2>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Name:</strong> ${safeName}</p>
      `
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('VIP signup email error:', err.message);
    return res.status(500).json({ error: 'Unable to join right now. Please try again.' });
  }
};
