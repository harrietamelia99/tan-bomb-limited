/**
 * Shared SEO helpers for static Tan Bomb pages (branded search).
 */
(function (root) {
  var SITE = 'https://www.tan-bomb.com';
  var BRAND = 'Tan Bomb';
  var DEFAULT_DESC =
    'Official Tan Bomb site. UK-made luxury tanning accelerators for home and salon – Cherry Whip, Vanilla Crème and limited editions. Free UK delivery.';
  var DEFAULT_IMAGE = SITE + '/assets/logo.png';

  function upsertMeta(attr, key, content) {
    if (!content) return;
    var sel = 'meta[' + attr + '="' + key + '"]';
    var el = document.querySelector(sel);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function upsertLink(rel, href) {
    var el = document.querySelector('link[rel="' + rel + '"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  function upsertJsonLd(id, data) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  function absoluteUrl(path) {
    if (!path) return SITE + '/';
    if (path.indexOf('http') === 0) return path;
    return SITE + (path.charAt(0) === '/' ? path : '/' + path);
  }

  function apply(options) {
    options = options || {};
    var title = options.title || BRAND + ' | Official Site – Luxury Tanning Accelerators';
    var description = options.description || DEFAULT_DESC;
    var url = absoluteUrl(options.path || '/');
    var image = absoluteUrl(options.image || '/assets/logo.png');
    var type = options.type || 'website';

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'author', BRAND);
    upsertMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    upsertLink('canonical', url);

    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', BRAND);
    upsertMeta('property', 'og:locale', 'en_GB');
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:image', image);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);

    var graph = [
      {
        '@type': 'Organization',
        '@id': SITE + '/#organization',
        name: BRAND,
        alternateName: ['TanBomb', 'tan bomb'],
        url: SITE,
        logo: {
          '@type': 'ImageObject',
          url: DEFAULT_IMAGE
        },
        email: 'info@tan-bomb.com',
        description: 'Tan Bomb makes UK luxury tanning accelerators for home and salon use.'
      },
      {
        '@type': 'WebSite',
        '@id': SITE + '/#website',
        name: BRAND,
        url: SITE,
        publisher: { '@id': SITE + '/#organization' }
      }
    ];

    if (options.product) {
      var p = options.product;
      graph.push({
        '@type': 'Product',
        name: p.name + ' | ' + BRAND,
        description: p.seoDescription || p.description,
        image: absoluteUrl(!p.comingSoon && p.image ? p.image : '/assets/logo.png'),
        brand: { '@type': 'Brand', name: BRAND },
        sku: p.id,
        url: absoluteUrl(p.url),
        offers: {
          '@type': 'Offer',
          url: absoluteUrl(p.url),
          priceCurrency: (p.currency || 'gbp').toUpperCase(),
          price: ((p.priceFrom || 0) / 100).toFixed(2),
          availability: p.soldOut
            ? 'https://schema.org/OutOfStock'
            : p.comingSoon || !p.available
              ? 'https://schema.org/PreOrder'
              : 'https://schema.org/InStock',
          seller: { '@id': SITE + '/#organization' }
        }
      });
    }

    upsertJsonLd('tan-bomb-seo-jsonld', {
      '@context': 'https://schema.org',
      '@graph': graph
    });
  }

  root.TanBombSEO = {
    SITE: SITE,
    BRAND: BRAND,
    apply: apply,
    absoluteUrl: absoluteUrl
  };
})(window);
