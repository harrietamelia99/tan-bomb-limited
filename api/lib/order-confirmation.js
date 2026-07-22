const { Resend } = require('resend');
const Stripe = require('stripe');

const FROM_EMAIL = process.env.RESEND_FROM || 'Tan Bomb <info@tan-bomb.com>';
const NOTIFY_EMAIL = process.env.ORDER_NOTIFY_EMAIL || process.env.CONTACT_TO_EMAIL || 'info@tan-bomb.com';

function resolveStripeSecretKey() {
  const mode = String(process.env.STRIPE_MODE || 'live').toLowerCase();
  const testKey = process.env.STRIPE_SECRET_KEY_TEST;
  const liveKey = process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;

  if (mode === 'test') {
    return { mode: 'test', secretKey: testKey || process.env.STRIPE_SECRET_KEY || null };
  }

  return { mode: 'live', secretKey: liveKey || null };
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMoney(amount, currency) {
  const value = (Number(amount) || 0) / 100;
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: (currency || 'gbp').toUpperCase()
    }).format(value);
  } catch (err) {
    return `£${value.toFixed(2)}`;
  }
}

function formatAddress(shippingDetails) {
  if (!shippingDetails || !shippingDetails.address) return '';
  const a = shippingDetails.address;
  const lines = [
    shippingDetails.name,
    a.line1,
    a.line2,
    [a.city, a.postal_code].filter(Boolean).join(', '),
    a.country
  ].filter(Boolean);
  return lines.join('\n');
}

function buildCustomerEmail({ orderRef, quantity, totalLabel, shippingLabel, addressText }) {
  const safeRef = escapeHtml(orderRef);
  const safeQty = escapeHtml(String(quantity));
  const safeTotal = escapeHtml(totalLabel);
  const safeShipping = escapeHtml(shippingLabel);
  const addressHtml = addressText
    ? `<p style="margin: 16px 0 0;"><strong>Ship to</strong><br>${escapeHtml(addressText).replace(/\n/g, '<br>')}</p>`
    : '';

  return {
    subject: `Order confirmed — Tan Bomb (${orderRef})`,
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #292624;">
        <p style="letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px; color: #8a8178;">Tan Bomb</p>
        <h1 style="font-size: 28px; color: #AD2234; margin: 0 0 12px;">You're all set 🍒</h1>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6;">
          Thanks for your order. We've received your payment and will be in touch about shipping.
        </p>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f2ee; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px;"><strong>Order</strong> ${safeRef}</p>
          <p style="margin: 0 0 8px;"><strong>Item</strong> Cherry Whip × ${safeQty}</p>
          <p style="margin: 0 0 8px;"><strong>Shipping</strong> ${safeShipping}</p>
          <p style="margin: 0;"><strong>Total paid</strong> ${safeTotal}</p>
          ${addressHtml}
        </div>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #5c5650;">
          Stripe will also email your payment receipt separately.
        </p>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #8a8178;">
          Questions? Reply to this email or write to info@tan-bomb.com
        </p>
      </div>
    `,
    text: [
      'Tan Bomb — Order confirmed',
      '',
      "You're all set.",
      `Order: ${orderRef}`,
      `Item: Cherry Whip × ${quantity}`,
      `Shipping: ${shippingLabel}`,
      `Total paid: ${totalLabel}`,
      addressText ? `\nShip to:\n${addressText}` : '',
      '',
      'Stripe will also email your payment receipt separately.',
      'Questions? info@tan-bomb.com'
    ]
      .filter(Boolean)
      .join('\n')
  };
}

/**
 * Sends branded Resend confirmation for a paid Checkout Session.
 * Idempotent via session metadata + Resend idempotency key.
 */
async function sendOrderConfirmationForSession(sessionId) {
  const { mode, secretKey } = resolveStripeSecretKey();
  if (!secretKey) {
    throw new Error(
      mode === 'live'
        ? 'Stripe live key missing.'
        : 'Stripe test key missing.'
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    throw new Error('RESEND_API_KEY missing.');
  }

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items']
  });

  if (session.payment_status !== 'paid') {
    return { ok: false, reason: 'not_paid', payment_status: session.payment_status };
  }

  if (session.metadata && session.metadata.order_email_sent === 'true') {
    return { ok: true, skipped: true, reason: 'already_sent', orderRef: session.metadata.order_ref };
  }

  const customerEmail =
    (session.customer_details && session.customer_details.email) ||
    session.customer_email ||
    null;

  if (!customerEmail) {
    return { ok: false, reason: 'no_customer_email' };
  }

  const quantity =
    (session.line_items &&
      session.line_items.data &&
      session.line_items.data[0] &&
      session.line_items.data[0].quantity) ||
    1;

  const orderRef =
    (session.metadata && session.metadata.order_ref) ||
    `TB-${String(session.id).replace(/^cs_(test|live)_/, '').slice(-8).toUpperCase()}`;

  const totalLabel = formatMoney(session.amount_total, session.currency);
  const shippingAmount =
    session.shipping_cost && typeof session.shipping_cost.amount_total === 'number'
      ? session.shipping_cost.amount_total
      : 0;
  const shippingLabel =
    shippingAmount === 0 ? 'Free (UK & Ireland)' : formatMoney(shippingAmount, session.currency);

  const addressText = formatAddress(session.shipping_details);
  const email = buildCustomerEmail({
    orderRef,
    quantity,
    totalLabel,
    shippingLabel,
    addressText
  });

  const resend = new Resend(resendKey);
  const { data, error } = await resend.emails.send(
    {
      from: FROM_EMAIL,
      to: [customerEmail],
      replyTo: NOTIFY_EMAIL,
      subject: email.subject,
      html: email.html,
      text: email.text
    },
    { idempotencyKey: `order-confirm/${session.id}` }
  );

  if (error) {
    throw new Error(error.message || 'Unable to send order confirmation.');
  }

  // Merchant copy (best-effort)
  try {
    await resend.emails.send(
      {
        from: FROM_EMAIL,
        to: [NOTIFY_EMAIL],
        replyTo: customerEmail,
        subject: `[Order] ${orderRef} — Cherry Whip × ${quantity}`,
        text: [
          'New paid order',
          '',
          `Order: ${orderRef}`,
          `Customer: ${customerEmail}`,
          `Item: Cherry Whip × ${quantity}`,
          `Total: ${totalLabel}`,
          `Shipping: ${shippingLabel}`,
          addressText ? `\nShip to:\n${addressText}` : '',
          '',
          `Stripe session: ${session.id}`
        ]
          .filter(Boolean)
          .join('\n')
      },
      { idempotencyKey: `order-notify/${session.id}` }
    );
  } catch (notifyErr) {
    console.error('Order notify email failed:', notifyErr.message || notifyErr);
  }

  try {
    await stripe.checkout.sessions.update(session.id, {
      metadata: Object.assign({}, session.metadata || {}, {
        order_email_sent: 'true',
        order_ref: orderRef
      })
    });
  } catch (metaErr) {
    console.error('Could not mark session email sent:', metaErr.message || metaErr);
  }

  return {
    ok: true,
    skipped: false,
    id: data && data.id,
    orderRef,
    to: customerEmail
  };
}

module.exports = {
  resolveStripeSecretKey,
  sendOrderConfirmationForSession
};
