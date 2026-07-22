const { Resend } = require('resend');

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'info@tan-bomb.com';
const FROM_EMAIL = process.env.RESEND_FROM || 'Tan Bomb <info@tan-bomb.com>';
const ALLOWED_TYPES = new Set(['Customer', 'Salon owner', 'Distributor', 'Other']);

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
      error: 'Contact form is not configured. Add RESEND_API_KEY in Vercel.'
    });
  }

  const body = parseBody(req);
  if (!body) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // Honeypot — bots fill this; humans leave it empty
  if (body.company) {
    return res.status(200).json({ ok: true });
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const type = String(body.type || 'Customer').trim();
  const message = String(body.message || '').trim();

  if (!name || name.length > 120) {
    return res.status(400).json({ error: 'Please enter your name.' });
  }
  if (!email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!message || message.length > 5000) {
    return res.status(400).json({ error: 'Please enter a message.' });
  }
  if (phone.length > 40) {
    return res.status(400).json({ error: 'Phone number is too long.' });
  }
  if (!ALLOWED_TYPES.has(type)) {
    return res.status(400).json({ error: 'Please select a valid enquiry type.' });
  }

  const resend = new Resend(apiKey);
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || '—');
  const safeType = escapeHtml(type);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email,
      subject: `Tan Bomb enquiry from ${name} (${type})`,
      html: `
        <h2>New website enquiry</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>I am a…:</strong> ${safeType}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
      text: [
        'New website enquiry',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || '—'}`,
        `I am a…: ${type}`,
        '',
        'Message:',
        message
      ].join('\n')
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message || 'Unable to send enquiry.' });
    }

    return res.status(200).json({ ok: true, id: data && data.id });
  } catch (err) {
    console.error('Contact form error:', err.message);
    return res.status(500).json({ error: err.message || 'Unable to send enquiry.' });
  }
};
