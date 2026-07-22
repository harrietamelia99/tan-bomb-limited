const { Resend } = require('resend');

// Temporary test-only endpoint — remove after use.
const ALLOWED_TO = 'harriet@collectivstudio.uk';
const FROM_EMAIL = process.env.RESEND_FROM || 'Tan Bomb <info@tan-bomb.com>';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY missing' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }
  body = body || {};

  const to = String(body.to || ALLOWED_TO).trim().toLowerCase();
  if (to !== ALLOWED_TO) {
    return res.status(403).json({ error: 'Only the approved test recipient is allowed.' });
  }

  const orderRef = 'TB-TEST-' + Date.now().toString().slice(-6);
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ALLOWED_TO],
      subject: `Order confirmed — Tan Bomb (${orderRef}) [TEST]`,
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #292624;">
          <p style="letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px; color: #8a8178;">Tan Bomb</p>
          <h1 style="font-size: 28px; color: #AD2234; margin: 0 0 12px;">You're all set 🍒</h1>
          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6;">
            Thanks for your order. This is a <strong>test</strong> order confirmation email.
          </p>
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f2ee; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px;"><strong>Order</strong> ${orderRef}</p>
            <p style="margin: 0 0 8px;"><strong>Item</strong> Cherry Whip × 1</p>
            <p style="margin: 0 0 8px;"><strong>Subtotal</strong> £30.00</p>
            <p style="margin: 0 0 8px;"><strong>Shipping</strong> Free (UK &amp; Ireland)</p>
            <p style="margin: 0;"><strong>Total</strong> £30.00</p>
          </div>
          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #5c5650;">
            In a real order, Stripe also sends your payment receipt. We'll be in touch about shipping.
          </p>
          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #8a8178;">
            Questions? Reply to this email or write to info@tan-bomb.com
          </p>
        </div>
      `,
      text: [
        'Tan Bomb — Order confirmed [TEST]',
        '',
        "You're all set.",
        `Order: ${orderRef}`,
        'Item: Cherry Whip × 1',
        'Subtotal: £30.00',
        'Shipping: Free (UK & Ireland)',
        'Total: £30.00',
        '',
        'This is a test order confirmation email.',
        'Questions? info@tan-bomb.com'
      ].join('\n')
    });

    if (error) {
      return res.status(500).json({ error: error.message || 'Send failed' });
    }

    return res.status(200).json({ ok: true, id: data && data.id, orderRef });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Send failed' });
  }
};
