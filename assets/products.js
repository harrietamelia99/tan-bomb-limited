/**
 * Tan Bomb product catalog + per-product theming.
 * Add a new product here (palette, assets, particle) - no site-wide redesign needed.
 */
(function (root) {
  var ASSET = function (path) {
    return path;
  };

  var SHARED_INGREDIENTS = [
    'L-Tyrosine',
    'Hyaluronic Acid',
    'Aloe Vera',
    'Vitamin E',
    'Marine Algae Extract'
  ];

  var PRODUCTS = {
    'cherry-whip': {
      id: 'cherry-whip',
      name: 'Cherry Whip',
      shortName: 'Cherry Whip',
      tagline: 'Cherry-infused tanning accelerator',
      description:
        'Cherry-infused tanning accelerator with L-Tyrosine, Hyaluronic Acid, Aloe Vera, Vitamin E and Marine Algae Extract. For sunbed and outdoor tanning, at home or in salon.',
      size: '200 ml',
      priceFrom: 3000,
      currency: 'gbp',
      available: false,
      soldOut: true,
      badge: 'Sold out',
      rating: 4.9,
      reviewCount: 48,
      url: '/products/cherry-whip',
      image: ASSET('/assets/cherry-whip-pack.png'),
      imageAlt: 'Tan Bomb Cherry Whip tanning accelerator tube and box',
      lifestyle: ASSET('/assets/lifestyle-arm-cream.jpg'),
      lifestyleAlt: 'Applying Tan Bomb Cherry Whip on glowing skin',
      benefits: [
        'Cherry-kissed scent with luminous colour',
        'Skin-loving hydration built in',
        'Salon-created fast results formula',
        'Works on sunbed and outdoors'
      ],
      ingredients: SHARED_INGREDIENTS.slice(),
      particle: '🍒',
      particleAsset: ASSET('/assets/particle-cherry.svg'),
      theme: {
        primary: '#AD2234',
        secondary: '#721925',
        accent: '#D4B04A',
        bg: '#0c0b0a',
        text: '#f7f2e8',
        gradient:
          'linear-gradient(165deg, #e86878 0%, #d43a4e 22%, #AD2234 48%, #8f1c2a 68%, #b82d40 88%, #d64a5c 100%)'
      },
      seoDescription:
        'Tan Bomb Cherry Whip – cherry-infused luxury tanning accelerator made in the UK. Shop the official Tan Bomb formula for sunbed and outdoor tanning.'
    },
    'vanilla-creme': {
      id: 'vanilla-creme',
      name: 'Vanilla Crème',
      shortName: 'Vanilla Crème',
      tagline: 'Vanilla-kissed tanning accelerator',
      description:
        'A silky vanilla-scented tanning accelerator from Tan Bomb. Same salon-created formula family - luminous colour, nourished skin, irresistible scent.',
      size: '200 ml',
      priceFrom: 3000,
      currency: 'gbp',
      available: true,
      soldOut: false,
      badge: 'NEW',
      rating: 5.0,
      reviewCount: 12,
      url: '/products/vanilla-creme',
      image: ASSET('/assets/vanilla-creme-pack.png'),
      imageAlt: 'Tan Bomb Vanilla Crème tanning accelerator tube and box',
      lifestyle: ASSET('/assets/lifestyle-shoulders-lotion.jpg'),
      lifestyleAlt: 'Applying Tan Bomb Vanilla Crème lotion',
      benefits: [
        'Warm vanilla crème scent',
        'Deep colour, smooth finish',
        'Hydrating fast results formula',
        'Retail-ready for home and salon'
      ],
      ingredients: SHARED_INGREDIENTS.slice(),
      particle: '🍦',
      particleAsset: ASSET('/assets/particle-vanilla.svg'),
      theme: {
        primary: '#C4A574',
        secondary: '#8B7355',
        accent: '#D4B04A',
        bg: '#0c0b0a',
        text: '#f7f2e8',
        gradient:
          'linear-gradient(165deg, #f5e6c8 0%, #e8d4a8 22%, #C4A574 48%, #a8895e 68%, #8B7355 88%, #d4b896 100%)'
      },
      seoDescription:
        'Tan Bomb Vanilla Crème – vanilla-kissed luxury tanning accelerator from the official Tan Bomb range. Free UK delivery.'
    },
    'christmas-special': {
      id: 'christmas-special',
      name: 'Christmas Special',
      shortName: 'Christmas Special',
      tagline: 'Limited edition festive accelerator',
      description:
        'A limited-edition festive drop from Tan Bomb. Seasonal scent, the same explosive tan. Available while stocks last. Join the VIP club for first access.',
      size: '200 ml',
      priceFrom: 3200,
      currency: 'gbp',
      available: false,
      soldOut: false,
      comingSoon: true,
      badge: 'Limited edition',
      rating: 5.0,
      reviewCount: 0,
      url: '/products/christmas-special',
      image: ASSET('/assets/christmas-special-product.png'),
      imageAlt: 'Tan Bomb Christmas Special festive tanning accelerator',
      lifestyle: ASSET('/assets/christmas-special-product.png'),
      lifestyleAlt: 'Tan Bomb Christmas Special with silk and holly',
      benefits: [
        'Limited festive scent drop',
        'Same explosive Tan Bomb colour',
        'Collectible seasonal packaging',
        'VIP first-access releases'
      ],
      ingredients: SHARED_INGREDIENTS.slice(),
      particle: '🎄',
      particleAsset: ASSET('/assets/particle-christmas.svg'),
      theme: {
        primary: '#2d5a40',
        secondary: '#0f2419',
        accent: '#D4B04A',
        bg: '#0c0b0a',
        text: '#f7f2e8',
        gradient:
          'linear-gradient(165deg, #2d5a40 0%, #1a3a2a 35%, #0f2419 55%, #1a3a2a 75%, #3d6b4f 100%)'
      },
      seoDescription:
        'Tan Bomb Christmas Special – limited edition festive tanning accelerator from the official Tan Bomb collection.'
    }
  };

  var HOMEPAGE_FEATURED = ['cherry-whip', 'vanilla-creme'];
  var GRID_ORDER = ['vanilla-creme', 'cherry-whip', 'christmas-special'];

  function formatMoney(cents) {
    return '£' + (Number(cents || 0) / 100).toFixed(2);
  }

  function getProduct(id) {
    return PRODUCTS[id] || null;
  }

  function listProducts(ids) {
    return (ids || GRID_ORDER).map(getProduct).filter(Boolean);
  }

  root.TanBombProducts = {
    PRODUCTS: PRODUCTS,
    HOMEPAGE_FEATURED: HOMEPAGE_FEATURED,
    GRID_ORDER: GRID_ORDER,
    get: getProduct,
    list: listProducts,
    formatMoney: formatMoney,
    defaultParticle: '💥',
    defaultParticleAsset: ASSET('/assets/particle-logo.svg')
  };
})(typeof window !== 'undefined' ? window : globalThis);
