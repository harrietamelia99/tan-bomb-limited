const Stripe = require('stripe');
const {
  resolveStripeSecretKey,
  sendOrderConfirmationForSession
} = require('./lib/order-confirmation');

function getRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  if (req.rawBody) {
    return Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(String(req.rawBody));
  }
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { secretKey } = resolveStripeSecretKey();
  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe key missing' });
  }

  const stripe = new Stripe(secretKey);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    const rawBody = getRawBody(req);
    if (webhookSecret && sig && rawBody) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else if (req.body && typeof req.body === 'object' && req.body.type) {
      // Parsed body fallback: we only act after retrieving the session from Stripe.
      event = req.body;
    } else if (typeof req.body === 'string') {
      event = JSON.parse(req.body);
    } else {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }
  } catch (err) {
    console.error('Webhook signature/parse error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data && event.data.object;
    const sessionId = session && session.id;
    if (sessionId) {
      try {
        const result = await sendOrderConfirmationForSession(sessionId);
        console.log('Order confirmation result:', result);
      } catch (err) {
        console.error('Order confirmation from webhook failed:', err.message || err);
        return res.status(500).json({ error: 'Failed to send confirmation' });
      }
    }
  }

  return res.status(200).json({ received: true });
};
