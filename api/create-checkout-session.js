const Stripe = require('stripe');
const { getProduct } = require('./lib/products');

function getOrigin(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (host) return `${proto}://${host}`;
  return process.env.SITE_URL || 'https://tan-bomb-limited.vercel.app';
}

function resolveStripeSecretKey() {
  const mode = String(process.env.STRIPE_MODE || 'live').toLowerCase();
  const testKey = process.env.STRIPE_SECRET_KEY_TEST;
  const liveKey = process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;

  if (mode === 'test') {
    return { mode: 'test', secretKey: testKey || process.env.STRIPE_SECRET_KEY || null };
  }

  return { mode: 'live', secretKey: liveKey || null };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let quantity = 1;
  let productId = 'cherry-whip';
  let items = null;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    quantity = Math.max(1, Math.min(20, parseInt(body.quantity, 10) || 1));
    productId = String(body.productId || body.product || 'cherry-whip').trim();
    if (Array.isArray(body.items) && body.items.length) {
      items = body.items;
    }
  } catch (err) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const lineSpecs = items
    ? items.map(function (item) {
        return {
          productId: String(item.productId || item.id || '').trim(),
          quantity: Math.max(1, Math.min(20, parseInt(item.quantity, 10) || 1))
        };
      })
    : [{ productId: productId, quantity: quantity }];

  for (let i = 0; i < lineSpecs.length; i += 1) {
    const product = getProduct(lineSpecs[i].productId);
    if (!product) {
      return res.status(400).json({ error: 'Unknown product.' });
    }
    if (product.soldOut) {
      return res.status(409).json({
        error: product.name + ' is currently sold out. Please check back soon or contact us for restock updates.'
      });
    }
    if (product.comingSoon || product.available === false) {
      return res.status(409).json({
        error: product.name + ' is not available for purchase yet.'
      });
    }
  }

  const { mode, secretKey } = resolveStripeSecretKey();
  if (!secretKey) {
    return res.status(500).json({
      error:
        mode === 'live'
          ? 'Stripe live key missing. Add STRIPE_SECRET_KEY_LIVE (or STRIPE_SECRET_KEY) in Vercel.'
          : 'Stripe test key missing. Add STRIPE_SECRET_KEY_TEST in Vercel.'
    });
  }

  const origin = getOrigin(req);
  const stripe = new Stripe(secretKey);
  const primary = getProduct(lineSpecs[0].productId);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_creation: 'always',
      line_items: lineSpecs.map(function (spec) {
        const product = getProduct(spec.productId);
        return {
          quantity: spec.quantity,
          price_data: {
            currency: product.currency,
            unit_amount: product.unitAmount,
            product_data: {
              name: product.name,
              description: product.description,
              images: [product.image]
            }
          }
        };
      }),
      shipping_address_collection: {
        allowed_countries: ['GB']
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'gbp'
            },
            display_name: 'Free shipping'
          }
        }
      ],
      phone_number_collection: {
        enabled: true
      },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: 'Tan Bomb - ' + primary.name + ' order',
          footer:
            'Thanks for ordering from Tan Bomb. Free UK shipping. Questions? info@tan-bomb.com',
          metadata: {
            product: primary.id
          }
        }
      },
      success_url: `${origin}/preview/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop`,
      metadata: {
        product: primary.id,
        stripe_mode: mode
      }
    });

    return res.status(200).json({ url: session.url, id: session.id, mode: mode });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return res.status(500).json({ error: err.message || 'Unable to create checkout session' });
  }
};
