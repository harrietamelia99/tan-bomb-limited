/** Server-side product catalog for Stripe checkout. Keep in sync with assets/products.js */

const PRODUCTS = {
  'cherry-whip': {
    id: 'cherry-whip',
    name: 'Cherry Whip',
    description: 'Cherry-infused tanning accelerator. 200 ml.',
    unitAmount: 3000,
    currency: 'gbp',
    image: 'https://tan-bomb-limited.vercel.app/assets/cherry-whip-pack-v4.jpg',
    available: true,
    soldOut: false
  },
  'vanilla-creme': {
    id: 'vanilla-creme',
    name: 'Vanilla Crème',
    description: 'Vanilla-kissed tanning accelerator. 200 ml.',
    unitAmount: 3000,
    currency: 'gbp',
    image: 'https://tan-bomb-limited.vercel.app/assets/vanilla-creme-pack-v2.jpg',
    available: true,
    soldOut: false,
    comingSoon: false
  },
  'gingerbread-delight': {
    id: 'gingerbread-delight',
    name: 'Gingerbread Delight',
    description: 'Limited edition gingerbread tanning accelerator. 200 ml.',
    unitAmount: 3000,
    currency: 'gbp',
    image: 'https://tan-bomb-limited.vercel.app/assets/gingerbread-delight.jpg',
    available: true,
    soldOut: false,
    comingSoon: false
  }
};

// Timed sales. Keep in sync with assets/products.js.
// Black Friday 2026: Gingerbread Delight £15, Fri 27 Nov 00:00 to Sun 29 Nov 23:59 (UK time, GMT).
const SALES = {
  'gingerbread-delight': { unitAmount: 1500, start: '2026-11-27T00:00:00Z', end: '2026-11-30T00:00:00Z' }
};

function getProduct(id, now) {
  const base = PRODUCTS[id];
  if (!base) return null;
  const t = typeof now === 'number' ? now : Date.now();
  const sale = SALES[id];
  if (sale && t >= Date.parse(sale.start) && t < Date.parse(sale.end)) {
    return Object.assign({}, base, { unitAmount: sale.unitAmount, onSale: true });
  }
  return base;
}

module.exports = { PRODUCTS, SALES, getProduct };
