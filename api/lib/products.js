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
  'limited-edition': {
    id: 'limited-edition',
    name: 'Limited Edition',
    description: 'Limited edition tanning accelerator. 200 ml.',
    unitAmount: 3200,
    currency: 'gbp',
    image: 'https://tan-bomb-limited.vercel.app/assets/logo.png',
    available: false,
    soldOut: false,
    comingSoon: true
  }
};

function getProduct(id) {
  return PRODUCTS[id] || null;
}

module.exports = { PRODUCTS, getProduct };
