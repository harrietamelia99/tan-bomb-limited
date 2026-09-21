/**
 * Shared product page bootstrapping for /products/*/index.html
 * Expects body[data-product-id] and window.TanBombProducts.
 * Pages are server-rendered; this enhances SEO, related products, and cart hooks.
 */
(function () {
  var catalog = window.TanBombProducts;
  var productId = document.body.getAttribute('data-product-id');
  var product = catalog && catalog.get(productId);

  if (!product) {
    return;
  }

  document.body.setAttribute('data-product-theme', product.id);

  function assetUrl(path) {
    if (!path) return '';
    if (path.indexOf('http') === 0 || path.indexOf('/') === 0) return path;
    return path;
  }

  function set(sel, text) {
    var el = document.querySelector(sel);
    if (el) el.textContent = text;
  }

  function fillList(sel, items) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.innerHTML = '';
    (items || []).forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item;
      el.appendChild(li);
    });
  }

  function stars(rating) {
    var full = Math.round(rating || 0);
    var out = '';
    for (var i = 0; i < 5; i++) out += i < full ? '★' : '☆';
    return out;
  }

  function badgeClass(badge) {
    if (!badge) return '';
    var b = badge.toLowerCase();
    if (b.indexOf('new') !== -1) return 'shop-card__badge--new';
    if (b.indexOf('limited') !== -1) return 'shop-card__badge--limited';
    if (b.indexOf('sold') !== -1) return 'shop-card__badge--soldout';
    return '';
  }

  function fillRelated() {
    var root = document.querySelector('[data-related-grid]');
    if (!root || !catalog) return;
    var others = catalog.list(catalog.GRID_ORDER).filter(function (p) {
      return p.id !== product.id;
    });
    var html = '';
    others.forEach(function (p) {
      html += '<a class="shop-card reveal-up is-visible" href="' + p.url + '">';
      html += '<div class="shop-card__media">';
      if (p.badge) html += '<span class="shop-card__badge ' + badgeClass(p.badge) + '">' + p.badge + '</span>';
      html += '<img src="' + assetUrl(p.image) + '" alt="' + p.imageAlt + '" width="800" height="1000" loading="lazy">';
      html += '</div><div class="shop-card__body">';
      html += '<h3 class="shop-card__title">' + p.name + '</h3>';
      html += '<p class="shop-card__tagline">' + (p.tagline || '') + '</p>';
      html += '<p class="shop-card__price">from ' + catalog.formatMoney(p.priceFrom) + '</p>';
      html += '<div class="shop-card__cta"><span class="btn btn--primary btn--full">' + (p.soldOut ? 'Sold out' : p.comingSoon ? 'Coming soon' : 'View') + '</span></div>';
      html += '</div></a>';
    });
    root.innerHTML = html;
  }

  function fill() {
    var img = document.querySelector('[data-product-image]');
    if (img) {
      img.src = assetUrl(product.image);
      img.alt = product.imageAlt;
    }

    var lifestyle = document.querySelector('[data-product-lifestyle]');
    if (lifestyle) {
      lifestyle.src = assetUrl(product.lifestyle);
      lifestyle.alt = product.lifestyleAlt;
    }

    set('[data-product-name]', product.name);
    set('[data-product-tagline]', product.tagline);
    set('[data-product-description]', product.description);
    set('[data-product-price]', 'from ' + catalog.formatMoney(product.priceFrom));
    set('[data-product-size]', product.size);
    fillList('[data-product-benefits]', product.benefits);
    fillList('[data-product-ingredients]', product.ingredients);

    if (product.reviewCount > 0) {
      set('[data-product-rating]', stars(product.rating) + ' ' + product.rating.toFixed(1) + ' (' + product.reviewCount + ')');
    } else {
      set('[data-product-rating]', 'Be the first to review');
    }

    var badge = document.querySelector('[data-product-badge]');
    if (badge) {
      if (product.badge) {
        badge.textContent = product.badge;
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    }

    var btn = document.querySelector('[data-product-add]');
    var note = document.querySelector('[data-product-note]');
    if (btn) {
      if (product.soldOut) {
        btn.disabled = true;
        btn.textContent = 'Sold out';
        if (note) note.textContent = 'Currently sold out. Join the VIP club for restock alerts.';
      } else if (product.comingSoon || !product.available) {
        btn.disabled = true;
        btn.textContent = 'Coming soon';
        if (note) note.textContent = 'Limited edition. Join the VIP club for first access.';
      } else {
        btn.disabled = false;
        btn.textContent = 'Add to bag';
        if (note) note.textContent = 'Free UK & Ireland shipping. Secure checkout powered by Stripe.';
      }

      if (!btn.getAttribute('data-bound')) {
        btn.setAttribute('data-bound', '1');
        btn.addEventListener('click', function () {
          if (btn.disabled) return;
          if (window.TanBombPreviewCart && typeof window.TanBombPreviewCart.add === 'function') {
            window.TanBombPreviewCart.add(product, 1);
            return;
          }
          if (window.TanBomb && typeof window.TanBomb.themeRain === 'function') {
            window.TanBomb.themeRain(product.id);
          }
          fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id, quantity: 1 })
          })
            .then(function (res) {
              return res.json().then(function (data) {
                return { ok: res.ok, data: data };
              });
            })
            .then(function (result) {
              if (!result.ok || !result.data.url) {
                throw new Error(result.data.error || 'Checkout failed');
              }
              window.location.href = result.data.url;
            })
            .catch(function (err) {
              alert(err.message || 'Unable to checkout right now.');
            });
        });
      }
    }

    fillRelated();
  }

  // Fill content first so SEO failures never blank the page
  try {
    fill();
  } catch (err) {
    console.error('Tan Bomb PDP fill failed', err);
  }

  try {
    var pageTitle = product.name + ' | Tan Bomb';
    var pageDesc = product.seoDescription || product.description;
    document.title = pageTitle;
    if (window.TanBombSEO && typeof window.TanBombSEO.apply === 'function') {
      window.TanBombSEO.apply({
        title: pageTitle,
        description: pageDesc,
        path: product.url,
        image: product.image,
        type: 'product',
        product: product
      });
    } else {
      var desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', pageDesc);
    }
  } catch (err) {
    console.error('Tan Bomb PDP SEO failed', err);
  }
})();
