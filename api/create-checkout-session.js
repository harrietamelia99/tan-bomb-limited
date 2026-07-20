const Stripe = require('stripe');

const PRODUCT = {
  name: 'Cherry Whip',
  description: 'Cherry-infused tanning accelerator. 200 ml.',
  unitAmount: 3000, // £30.00 in pence
  currency: 'gbp',
  image: 'https://tan-bomb-limited.vercel.app/assets/instagram-2.png'
};

function getOrigin(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (host) return `${proto}://${host}`;
  return process.env.SITE_URL || 'https://tan-bomb-limited.vercel.app';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({
      error: 'Stripe is not configured. Add STRIPE_SECRET_KEY in Vercel environment variables.'
    });
  }

  let quantity = 1;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    quantity = Math.max(1, Math.min(20, parseInt(body.quantity, 10) || 1));
  } catch (err) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const origin = getOrigin(req);
  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: quantity,
          price_data: {
            currency: PRODUCT.currency,
            unit_amount: PRODUCT.unitAmount,
            product_data: {
              name: PRODUCT.name,
              description: PRODUCT.description,
              images: [PRODUCT.image]
            }
          }
        }
      ],
      shipping_address_collection: {
        allowed_countries: ['GB', 'IE']
      },
      phone_number_collection: {
        enabled: true
      },
      success_url: `${origin}/preview/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#shop`,
      metadata: {
        product: 'cherry-whip'
      }
    });

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return res.status(500).json({ error: err.message || 'Unable to create checkout session' });
  }
};
