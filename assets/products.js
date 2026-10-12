/**
 * Tan Bomb product catalog + per-product theming.
 * Add a new product here (palette, assets, particle) - no site-wide redesign needed.
 */
(function (root) {
  var ASSET = function (path) {
    return path;
  };

  var COMING_SOON_LABEL = 'Coming Soon';

  // Homepage hero. Both states use the two-product background; heroShowVanilla switches the subheading.
  var HERO = {
    heroShowVanilla: false,
    withVanilla: {
      desktop: '/assets/hero-dual-bg-desktop.png?v=5',
      mobile: '/assets/hero-dual-bg-mobile.png?v=5',
      subheading: 'Official Tan Bomb range – meet Cherry Whip and Vanilla Crème.'
    },
    cherryOnly: {
      desktop: '/assets/hero-dual-bg-desktop.png?v=5',
      mobile: '/assets/hero-dual-bg-mobile.png?v=5',
      subheading: 'Official Tan Bomb range - meet Cherry Whip. New scents coming soon.'
    }
  };

  // Public copy for the upcoming limited drop - edit here only.
  var LIMITED_EDITION_COPY = {
    name: 'Limited Edition',
    tagline: 'Limited Edition - Coming Soon',
    description:
      'A limited edition drop from Tan Bomb is on its way. The same explosive tan, a brand-new scent. Join the VIP club for first access.',
    imageAlt: 'Tan Bomb Limited Edition - coming soon',
    benefits: [
      'Limited edition scent',
      'Same explosive Tan Bomb colour',
      'Collectible packaging',
      'VIP first-access release'
    ],
    seoDescription:
      'Tan Bomb Limited Edition - coming soon. A new limited drop from the official Tan Bomb range of luxury tanning accelerators.'
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
      // Set to false to launch: restores the product image, NEW badge and add to bag.
      comingSoon: true,
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
    'limited-edition': {
      id: 'limited-edition',
      name: LIMITED_EDITION_COPY.name,
      shortName: LIMITED_EDITION_COPY.name,
      tagline: LIMITED_EDITION_COPY.tagline,
      description: LIMITED_EDITION_COPY.description,
      size: '200 ml',
      priceFrom: 3200,
      currency: 'gbp',
      available: false,
      soldOut: false,
      comingSoon: true,
      badge: 'Limited edition',
      rating: 5.0,
      reviewCount: 0,
      url: '/products/limited-edition',
      image: null,
      imageAlt: LIMITED_EDITION_COPY.imageAlt,
      lifestyle: null,
      lifestyleAlt: '',
      benefits: LIMITED_EDITION_COPY.benefits,
      ingredients: SHARED_INGREDIENTS.slice(),
      particle: '💥',
      particleAsset: ASSET('/assets/particle-logo.svg'),
      theme: {
        primary: '#2d5a40',
        secondary: '#0f2419',
        accent: '#D4B04A',
        bg: '#0c0b0a',
        text: '#f7f2e8',
        gradient:
          'linear-gradient(165deg, #2d5a40 0%, #1a3a2a 35%, #0f2419 55%, #1a3a2a 75%, #3d6b4f 100%)'
      },
      seoDescription: LIMITED_EDITION_COPY.seoDescription
    }
  };

  Object.keys(PRODUCTS).forEach(function (id) {
    var p = PRODUCTS[id];
    if (p.comingSoon) {
      p.available = false;
      p.badge = COMING_SOON_LABEL;
    }
  });

  var HOMEPAGE_FEATURED = ['cherry-whip', 'vanilla-creme'];
  var GRID_ORDER = ['vanilla-creme', 'cherry-whip', 'limited-edition'];

  function escapeAttr(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  /**
   * Product media markup. Products without a photo get the branded placeholder tile,
   * as do coming-soon products outside of cards (opts.card). `attrs` is appended to the root element.
   */
  function mediaHtml(p, opts) {
    opts = opts || {};
    var attrs = opts.attrs ? ' ' + opts.attrs : '';
    if (!p.image || (p.comingSoon && !opts.card)) {
      return (
        '<div class="coming-soon-tile"' + attrs + ' role="img" aria-label="' + escapeAttr(p.name + ' - ' + COMING_SOON_LABEL) + '">' +
        '<img class="coming-soon-tile__logo" src="/assets/logo.png" alt="" width="160" height="160" loading="lazy">' +
        '<span class="coming-soon-tile__label">' + COMING_SOON_LABEL + '</span>' +
        '</div>'
      );
    }
    return (
      '<img' + attrs + ' src="' + escapeAttr(p.image) + '" alt="' + escapeAttr(p.imageAlt) + '" width="' + (opts.width || 800) +
      '" height="' + (opts.height || 1000) + '" loading="' + (opts.loading || 'lazy') + '">'
    );
  }

  function ctaLabel(p, fallback) {
    if (p.soldOut) return 'Sold out';
    if (p.comingSoon) return COMING_SOON_LABEL;
    return fallback;
  }

  /** Card button. Unavailable products get a muted, non-actionable look; the card link still works. */
  function ctaHtml(p, fallback) {
    var unavailable = p.soldOut || p.comingSoon;
    return (
      '<div class="shop-card__cta"><span class="btn btn--primary btn--full' +
      (unavailable ? ' btn--unavailable" aria-disabled="true"' : '"') +
      '>' + ctaLabel(p, fallback) + '</span></div>'
    );
  }

  /** Reviews stay in the data but are hidden until a coming-soon product launches. */
  function showReviews(p) {
    return !p.comingSoon && p.reviewCount > 0;
  }

  function stars(rating) {
    var full = Math.round(rating || 0);
    var out = '';
    for (var i = 0; i < 5; i += 1) out += i < full ? '★' : '☆';
    return out;
  }

  function ratingHtml(p) {
    if (!showReviews(p)) return '<p class="shop-card__rating"><span>Be the first to review</span></p>';
    return (
      '<p class="shop-card__rating"><span class="shop-card__stars" aria-hidden="true">' + stars(p.rating) +
      '</span><span>' + p.rating.toFixed(1) + ' (' + p.reviewCount + ')</span></p>'
    );
  }

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
    mediaHtml: mediaHtml,
    ctaLabel: ctaLabel,
    ctaHtml: ctaHtml,
    ratingHtml: ratingHtml,
    showReviews: showReviews,
    HERO: HERO,
    COMING_SOON_LABEL: COMING_SOON_LABEL,
    defaultParticle: '💥',
    defaultParticleAsset: ASSET('/assets/particle-logo.svg')
  };
})(typeof window !== 'undefined' ? window : globalThis);
