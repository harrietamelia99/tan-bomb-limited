/**
 * Tan Bomb Ltd - Theme JavaScript
 */

(function () {
  'use strict';

  var HEADER_OFFSET = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-offset'),
    10
  ) || 100;
  var config = window.TanBomb || {};
  var routes = config.routes || {
    root: '/',
    cart: '/cart',
    cartAdd: '/cart/add.js',
    cartChange: '/cart/change.js',
    cartUpdate: '/cart/update.js',
    cartJs: '/cart.js'
  };

  /* --- Money formatting -------------------------------------------------- */

  function formatMoney(cents) {
    var format = config.moneyFormat || '£{{amount}}';
    var amount = (cents / 100).toFixed(2);

    return format
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/, Math.round(cents / 100))
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, amount.replace('.', ','))
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/, String(Math.round(cents / 100)).replace('.', ','))
      .replace(/\{\{\s*amount\s*\}\}/, amount)
      .replace(/\{\{\s*amount_with_apostrophe_separator\s*\}\}/, amount.replace('.', "'"));
  }

  /* --- Intersection Observer: fade-in sections --------------------------- */

  function initFadeIn() {
    var sections = document.querySelectorAll('.fade-in');

    if (!sections.length) return;

    if (!('IntersectionObserver' in window)) {
      sections.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* --- Smooth scroll for anchor links ------------------------------------ */

  function initSmoothScroll() {
    var links = document.querySelectorAll('[data-scroll-link]');

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');

        if (!href || href.charAt(0) !== '#') return;

        var target = document.querySelector(href);

        if (!target) return;

        e.preventDefault();

        closeNav();
        closeCartDrawer();

        var top = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;

        window.scrollTo({
          top: top,
          behavior: 'smooth'
        });

        if (history.pushState) {
          history.pushState(null, '', href);
        }
      });
    });
  }

  /* --- Navigation -------------------------------------------------------- */

  var navToggle = document.getElementById('nav-toggle');
  var siteNav = document.getElementById('site-nav');

  function closeNav() {
    if (!navToggle || !siteNav) return;

    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    siteNav.classList.remove('is-open');
    siteNav.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
  }

  function openNav() {
    if (!navToggle || !siteNav) return;

    closeCartDrawer();

    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    siteNav.classList.add('is-open');
    siteNav.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
  }

  function initMobileNav() {
    if (!navToggle || !siteNav) return;

    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    siteNav.querySelectorAll('[data-nav-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        closeNav();
      });
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeNav();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeNav();
      }
    });
  }

  /* --- Cart -------------------------------------------------------------- */

  var cartDrawer = document.querySelector('[data-cart-drawer]');
  var cartCountEls = document.querySelectorAll('[data-cart-count]');
  var cartSubtotalEls = document.querySelectorAll('[data-cart-subtotal]');
  var lastFocusedEl = null;

  function fetchCart() {
    return fetch(routes.cartJs, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    }).then(function (res) {
      if (!res.ok) throw new Error('Cart fetch failed');
      return res.json();
    });
  }

  function updateCartCount(count) {
    cartCountEls.forEach(function (el) {
      el.textContent = count;

      if (count > 0) {
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', '');
      }
    });
  }

  function updateSubtotals(cents) {
    var formatted = formatMoney(cents);
    cartSubtotalEls.forEach(function (el) {
      el.textContent = formatted;
    });
  }

  function buildCartLineHtml(item) {
    var variantHtml = item.variant_title && item.variant_title !== 'Default Title'
      ? '<p class="cart-line__variant">' + escapeHtml(item.variant_title) + '</p>'
      : '';

    var imageHtml = item.image
      ? '<img src="' + item.image + '" alt="" width="80" height="80" loading="lazy">'
      : '';

    return (
      '<li class="cart-line" data-cart-line data-line-key="' + escapeHtml(item.key) + '">' +
        '<a href="' + escapeHtml(item.url) + '" class="cart-line__media">' + imageHtml + '</a>' +
        '<div class="cart-line__details">' +
          '<a href="' + escapeHtml(item.url) + '" class="cart-line__title">' + escapeHtml(item.product_title) + '</a>' +
          variantHtml +
          '<p class="cart-line__price">' + formatMoney(item.final_line_price) + '</p>' +
          '<div class="cart-line__actions">' +
            '<div class="quantity-input quantity-input--compact">' +
              '<button type="button" class="quantity-input__btn" data-cart-qty-minus aria-label="Decrease quantity">−</button>' +
              '<input type="number" class="quantity-input__field" value="' + item.quantity + '" min="0" data-cart-qty aria-label="Quantity">' +
              '<button type="button" class="quantity-input__btn" data-cart-qty-plus aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<button type="button" class="cart-line__remove" data-cart-remove>Remove</button>' +
          '</div>' +
        '</div>' +
      '</li>'
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shopNowLinkHtml() {
    var isIndex = document.body.getAttribute('data-is-index') === 'true';
    var homeUrl = document.body.getAttribute('data-home-url') || '';
    var href = isIndex ? '#shop' : homeUrl + '#shop';
    var scroll = isIndex ? ' data-scroll-link' : '';
    return '<a href="' + href + '" class="btn btn--primary"' + scroll + ' data-cart-close>Shop now</a>';
  }

  function renderCartDrawer(cart) {
    if (!cartDrawer) return;

    var body = cartDrawer.querySelector('[data-cart-drawer-body]');
    var footer = cartDrawer.querySelector('[data-cart-footer]');

    if (!body) return;

    updateCartCount(cart.item_count);
    updateSubtotals(cart.total_price);

    if (cart.item_count === 0) {
      body.innerHTML =
        '<div class="cart-drawer__empty" data-cart-empty>' +
          '<p>Your bag is empty.</p>' +
          shopNowLinkHtml() +
        '</div>';

      if (footer) footer.setAttribute('hidden', '');
      return;
    }

    var itemsHtml = '<ul class="cart-drawer__items" data-cart-items>';
    cart.items.forEach(function (item) {
      itemsHtml += buildCartLineHtml(item);
    });
    itemsHtml += '</ul>';

    body.innerHTML = itemsHtml;

    if (footer) footer.removeAttribute('hidden');
  }

  function changeLineQuantity(lineKey, quantity) {
    return fetch(routes.cartChange, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ id: lineKey, quantity: quantity })
    }).then(function (res) {
      if (!res.ok) throw new Error('Cart update failed');
      return res.json();
    });
  }

  function refreshCartUI(cart) {
    renderCartDrawer(cart);
    syncCartPage(cart);
  }

  function syncCartPage(cart) {
    var pageItems = document.querySelector('[data-cart-page-items]');
    if (!pageItems) return;

    if (cart.item_count === 0) {
      window.location.reload();
      return;
    }

    updateCartCount(cart.item_count);
    updateSubtotals(cart.total_price);

    pageItems.querySelectorAll('[data-cart-line]').forEach(function (line) {
      var key = line.getAttribute('data-line-key');
      var item = cart.items.find(function (i) { return i.key === key; });

      if (!item) {
        line.remove();
        return;
      }

      var qtyInput = line.querySelector('[data-cart-qty]');
      var priceEl = line.querySelector('.cart-line__price');

      if (qtyInput) qtyInput.value = item.quantity;
      if (priceEl) priceEl.textContent = formatMoney(item.final_line_price);
    });
  }

  function openCartDrawer() {
    if (!cartDrawer) return;

    closeNav();

    lastFocusedEl = document.activeElement;
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open');

    var panel = cartDrawer.querySelector('.cart-drawer__panel');
    if (panel) panel.focus();
  }

  function closeCartDrawer() {
    if (!cartDrawer || !cartDrawer.classList.contains('is-open')) return;

    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-open');

    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function spawnCherry(container, options) {
    if (!container) return null;

    options = options || {};
    var cherry = document.createElement('span');
    cherry.className = 'cherry-rain__item';
    cherry.textContent = '🍒';
    cherry.setAttribute('aria-hidden', 'true');
    cherry.style.left = (Math.random() * 100) + '%';
    cherry.style.animationDelay = (options.delay != null ? options.delay : Math.random() * 0.9) + 's';
    cherry.style.animationDuration = (options.duration != null ? options.duration : (1.1 + Math.random() * 1.5)) + 's';
    cherry.style.setProperty('--cherry-size', (options.size != null ? options.size : (0.9 + Math.random() * 1.4)) + 'rem');
    cherry.style.setProperty('--cherry-drift', ((Math.random() * 140) - 70) + 'px');
    cherry.style.setProperty('--cherry-spin', ((Math.random() * 720) - 360) + 'deg');
    cherry.style.setProperty('--cherry-speed', String(Math.random()));
    container.appendChild(cherry);

    if (options.removeOnEnd !== false) {
      cherry.addEventListener('animationend', function () {
        cherry.remove();
      });
    }

    return cherry;
  }

  function startCherryRainLoop(container) {
    if (!container || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      return function () {};
    }

    var spawnCount = window.matchMedia && window.matchMedia('(max-width: 767px)').matches ? 4 : 7;

    function spawnWave() {
      var i;
      for (i = 0; i < spawnCount; i += 1) {
        spawnCherry(container, {
          delay: Math.random() * 0.4,
          duration: 2 + Math.random() * 2.5,
          size: 1 + Math.random() * 1.8
        });
      }
    }

    spawnWave();
    var timer = window.setInterval(spawnWave, 320);

    return function () {
      window.clearInterval(timer);
    };
  }

  function whenSplashDone(callback) {
    var splash = document.getElementById('site-splash');

    if (!splash) {
      callback();
      return;
    }

    var done = false;

    function finish() {
      if (done) return;
      done = true;
      callback();
    }

    var observer = new MutationObserver(function () {
      if (!document.getElementById('site-splash')) {
        observer.disconnect();
        window.setTimeout(finish, 420);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(function () {
      observer.disconnect();
      finish();
    }, 4200);
  }

  function cherryRain() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var count = 32;
    var duration = 2400;
    var container = document.createElement('div');
    container.className = 'cherry-rain';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);

    var i;
    for (i = 0; i < count; i += 1) {
      spawnCherry(container, { delay: Math.random() * 0.9 });
    }

    window.setTimeout(function () {
      container.remove();
    }, duration + 600);
  }

  function initSplashScreen() {
    var splash = document.getElementById('site-splash');
    if (!splash) return;

    if (window.sessionStorage && window.sessionStorage.getItem('tanbombSplashSeen') === '1') {
      splash.remove();
      return;
    }

    var rainRoot = splash.querySelector('[data-splash-rain]');
    var logoImg = splash.querySelector('.site-logo__img--splash');
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var stopRainLoop = null;
    var dismissed = false;
    var displayTime = reducedMotion ? 1400 : 2800;

    function dismissSplash() {
      if (dismissed) return;
      dismissed = true;

      if (stopRainLoop) {
        stopRainLoop();
      }

      splash.classList.add('is-hiding');
      splash.setAttribute('aria-hidden', 'true');

      if (window.sessionStorage) {
        window.sessionStorage.setItem('tanbombSplashSeen', '1');
      }

      window.setTimeout(function () {
        splash.remove();
        document.body.classList.remove('splash-active');
      }, 720);
    }

    function beginSplash() {
      splash.classList.add('is-ready');
      document.body.classList.add('splash-active');

      if (!reducedMotion && rainRoot) {
        stopRainLoop = startCherryRainLoop(rainRoot);
      }

      window.setTimeout(dismissSplash, displayTime);
    }

    if (logoImg && typeof logoImg.decode === 'function') {
      logoImg.decode().then(beginSplash).catch(beginSplash);
      return;
    }

    if (logoImg && !logoImg.complete) {
      logoImg.addEventListener('load', beginSplash, { once: true });
      logoImg.addEventListener('error', beginSplash, { once: true });
      return;
    }

    beginSplash();
  }

  function initCherryWhipPopup() {
    var popup = document.getElementById('cherry-whip-popup');
    if (!popup) return;

    if (window.sessionStorage && window.sessionStorage.getItem('tanbombCherryPopupSeen') === '1') {
      popup.remove();
      return;
    }

    var dialog = popup.querySelector('.cherry-popup__dialog');
    var rainRoot = popup.querySelector('[data-cherry-popup-rain]');
    var stopRainLoop = null;
    var lastFocusedEl = null;
    var isOpen = false;

    function openPopup() {
      if (isOpen) return;
      isOpen = true;
      lastFocusedEl = document.activeElement;
      popup.removeAttribute('hidden');
      popup.setAttribute('aria-hidden', 'false');
      document.body.classList.add('cherry-popup-open');
      stopRainLoop = startCherryRainLoop(rainRoot);

      window.setTimeout(function () {
        if (dialog) dialog.focus();
      }, 50);
    }

    function closePopup() {
      if (!isOpen) return;
      isOpen = false;

      if (stopRainLoop) {
        stopRainLoop();
        stopRainLoop = null;
      }

      popup.classList.add('is-hiding');
      popup.setAttribute('aria-hidden', 'true');

      if (window.sessionStorage) {
        window.sessionStorage.setItem('tanbombCherryPopupSeen', '1');
      }

      window.setTimeout(function () {
        popup.setAttribute('hidden', '');
        popup.classList.remove('is-hiding');
        document.body.classList.remove('cherry-popup-open');

        if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
          lastFocusedEl.focus();
        }
      }, 520);
    }

    popup.querySelectorAll('[data-cherry-popup-close]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        closePopup();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen || e.key !== 'Escape') return;
      closePopup();
    });

    whenSplashDone(function () {
      window.setTimeout(openPopup, 500);
    });
  }

  config.cherryRain = cherryRain;
  window.TanBomb = config;

  function handleAddToCart(form, button) {
    var formData = new FormData(form);
    var originalText = button.textContent;

    button.disabled = true;
    button.textContent = 'Adding…';

    fetch(routes.cartAdd, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      body: formData
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw data;
          return data;
        });
      })
      .then(function () {
        return fetchCart();
      })
      .then(function (cart) {
        refreshCartUI(cart);
        cherryRain();
        openCartDrawer();
        button.textContent = 'Added';
        window.setTimeout(function () {
          button.textContent = originalText;
          button.disabled = false;
        }, 1200);
      })
      .catch(function (err) {
        button.disabled = false;
        button.textContent = originalText;
        var message = (err && err.description) ? err.description : 'Could not add to bag. Please try again.';
        window.alert(message);
      });
  }

  function initQuantityButtons(root) {
    root.querySelectorAll('[data-qty-minus]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = btn.parentElement.querySelector('.quantity-input__field');
        if (!input) return;
        var val = parseInt(input.value, 10) || 1;
        input.value = Math.max(1, val - 1);
      });
    });

    root.querySelectorAll('[data-qty-plus]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = btn.parentElement.querySelector('.quantity-input__field');
        if (!input) return;
        var val = parseInt(input.value, 10) || 1;
        input.value = val + 1;
      });
    });
  }

  function initCartLineActions(root) {
    root.querySelectorAll('[data-cart-qty-minus]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var line = btn.closest('[data-cart-line]');
        var input = line && line.querySelector('[data-cart-qty]');
        if (!input || !line) return;

        var val = parseInt(input.value, 10) || 0;
        var next = Math.max(0, val - 1);
        input.value = next;
        updateLine(line.getAttribute('data-line-key'), next);
      });
    });

    root.querySelectorAll('[data-cart-qty-plus]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var line = btn.closest('[data-cart-line]');
        var input = line && line.querySelector('[data-cart-qty]');
        if (!input || !line) return;

        var val = parseInt(input.value, 10) || 0;
        var next = val + 1;
        input.value = next;
        updateLine(line.getAttribute('data-line-key'), next);
      });
    });

    root.querySelectorAll('[data-cart-qty]').forEach(function (input) {
      input.addEventListener('change', function () {
        var line = input.closest('[data-cart-line]');
        if (!line) return;
        var qty = parseInt(input.value, 10);
        if (isNaN(qty) || qty < 0) qty = 0;
        updateLine(line.getAttribute('data-line-key'), qty);
      });
    });

    root.querySelectorAll('[data-cart-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var line = btn.closest('[data-cart-line]');
        if (!line) return;
        updateLine(line.getAttribute('data-line-key'), 0);
      });
    });
  }

  function updateLine(lineKey, quantity) {
    changeLineQuantity(lineKey, quantity)
      .then(refreshCartUI)
      .catch(function () {
        window.alert('Could not update your bag. Please try again.');
        return fetchCart().then(refreshCartUI);
      });
  }

  function initCart() {
    if (!cartDrawer) return;

    document.querySelectorAll('[data-cart-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        fetchCart()
          .then(refreshCartUI)
          .then(openCartDrawer)
          .catch(function () {
            openCartDrawer();
          });
      });
    });

    cartDrawer.querySelectorAll('[data-cart-close]').forEach(function (el) {
      el.addEventListener('click', closeCartDrawer);
    });

    cartDrawer.addEventListener('click', function (e) {
      if (e.target.matches('[data-cart-close]')) closeCartDrawer();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeCartDrawer();
    });

    document.addEventListener('submit', function (e) {
      var form = e.target.closest('[data-product-form]');
      if (!form) return;

      e.preventDefault();
      var button = form.querySelector('[data-add-to-cart]');
      if (!button) return;
      handleAddToCart(form, button);
    });

    var checkoutBtn = cartDrawer.querySelector('[data-cart-checkout]');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function () {
        var btn = checkoutBtn;
        var qty = 1;
        var countEl = document.querySelector('[data-cart-count]');
        if (countEl && countEl.textContent) {
          qty = Math.max(1, parseInt(countEl.textContent, 10) || 1);
        }

        btn.disabled = true;
        var originalLabel = btn.textContent;
        btn.textContent = 'Redirecting…';

        fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: qty })
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
            alert(err.message || 'Unable to start checkout. Please try again.');
            btn.disabled = false;
            btn.textContent = originalLabel;
          });
      });
    }

    initQuantityButtons(document);
    initCartLineActions(document);

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-cart-qty-minus], [data-cart-qty-plus], [data-cart-remove], [data-cart-qty]')) {
        var line = e.target.closest('[data-cart-line]');
        if (line && !cartDrawer.contains(line)) {
          return;
        }
      }
    });

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          initCartLineActions(node);
          initQuantityButtons(node);

          node.querySelectorAll && node.querySelectorAll('[data-cart-close]').forEach(function (el) {
            el.addEventListener('click', closeCartDrawer);
          });
        });
      });
    });

    if (cartDrawer) {
      observer.observe(cartDrawer, { childList: true, subtree: true });
    }

    initCartLineActions(document.querySelector('[data-cart-page-items]') || document.createElement('div'));
  }

  function initHeaderScroll() {
    var header = document.getElementById('site-header');
    if (!header) return;

    function updateHeader() {
      if (window.scrollY > 32) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  function initHeroParallax() {
    var hero = document.getElementById('hero');
    if (!hero || !hero.querySelector('.section--hero__media--immersive')) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ticking = false;

    function getParallaxFactor() {
      return window.matchMedia('(max-width: 767px)').matches ? 0.28 : 0.45;
    }

    function update() {
      ticking = false;
      var rect = hero.getBoundingClientRect();
      var scrolled = Math.max(0, -rect.top);
      hero.style.setProperty('--hero-parallax', String(scrolled * getParallaxFactor()));
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* --- Stockist locator -------------------------------------------------- */

  var UK_BOUNDS = {
    minLat: 49.8,
    maxLat: 58.8,
    minLng: -8.2,
    maxLng: 1.9
  };

  var LOCATION_LOOKUP = [
    { keys: ['manchester', 'm1', 'm2', 'm3', 'm4', 'm20', 'm21'], lat: 53.4808, lng: -2.2426, label: 'Manchester' },
    { keys: ['leeds', 'ls1', 'ls2', 'ls6', 'ls11'], lat: 53.7997, lng: -1.5492, label: 'Leeds' },
    { keys: ['birmingham', 'b1', 'b2', 'b5', 'b15'], lat: 52.4862, lng: -1.8904, label: 'Birmingham' },
    { keys: ['bristol', 'bs1', 'bs2', 'bs8'], lat: 51.4545, lng: -2.5879, label: 'Bristol' },
    { keys: ['london', 'sw1', 'sw3', 'w1', 'ec1', 'n1', 'e1'], lat: 51.5074, lng: -0.1278, label: 'London' },
    { keys: ['edinburgh', 'eh1', 'eh2', 'eh3'], lat: 55.9533, lng: -3.1883, label: 'Edinburgh' },
    { keys: ['cardiff', 'cf10', 'cf11'], lat: 51.4816, lng: -3.1791, label: 'Cardiff' },
    { keys: ['glasgow', 'g1', 'g2', 'g3'], lat: 55.8642, lng: -4.2518, label: 'Glasgow' },
    { keys: ['liverpool', 'l1', 'l2', 'l3'], lat: 53.4084, lng: -2.9916, label: 'Liverpool' },
    { keys: ['sheffield', 's1', 's10', 's11'], lat: 53.3811, lng: -1.4701, label: 'Sheffield' },
    { keys: ['nottingham', 'ng1', 'ng2'], lat: 52.9548, lng: -1.1581, label: 'Nottingham' },
    { keys: ['newcastle', 'ne1', 'ne2'], lat: 54.9783, lng: -1.6178, label: 'Newcastle' }
  ];

  function toRadians(value) {
    return (value * Math.PI) / 180;
  }

  function getDistanceMiles(lat1, lng1, lat2, lng2) {
    var earthRadiusMiles = 3958.8;
    var dLat = toRadians(lat2 - lat1);
    var dLng = toRadians(lng2 - lng1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusMiles * c;
  }

  function normalizeQuery(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .trim();
  }

  function resolveLocation(query) {
    var normalized = normalizeQuery(query);

    if (!normalized) {
      return {
        lat: 53.5,
        lng: -2.2,
        label: 'the UK'
      };
    }

    var i;
    var entry;
    var key;

    for (i = 0; i < LOCATION_LOOKUP.length; i += 1) {
      entry = LOCATION_LOOKUP[i];
      for (key = 0; key < entry.keys.length; key += 1) {
        if (normalized.indexOf(entry.keys[key]) === 0 || normalized === entry.keys[key]) {
          return {
            lat: entry.lat,
            lng: entry.lng,
            label: entry.label
          };
        }
      }
    }

    for (i = 0; i < LOCATION_LOOKUP.length; i += 1) {
      entry = LOCATION_LOOKUP[i];
      for (key = 0; key < entry.keys.length; key += 1) {
        if (normalized.indexOf(entry.keys[key]) !== -1) {
          return {
            lat: entry.lat,
            lng: entry.lng,
            label: entry.label
          };
        }
      }
    }

    return null;
  }

  function latLngToPinPercent(lat, lng) {
    var x = ((lng - UK_BOUNDS.minLng) / (UK_BOUNDS.maxLng - UK_BOUNDS.minLng)) * 100;
    var y = ((UK_BOUNDS.maxLat - lat) / (UK_BOUNDS.maxLat - UK_BOUNDS.minLat)) * 100;

    return {
      x: Math.min(98, Math.max(2, x)),
      y: Math.min(98, Math.max(2, y))
    };
  }

  function formatDistance(miles) {
    if (miles < 1) {
      return '< 1 mile';
    }

    if (miles < 10) {
      return miles.toFixed(1) + ' miles';
    }

    return Math.round(miles) + ' miles';
  }

  function initStockistLocator() {
    var root = document.querySelector('[data-stockist-locator]');
    if (!root) return;

    var form = root.querySelector('[data-stockist-search]');
    var queryInput = root.querySelector('[data-stockist-query]');
    var radiusSelect = root.querySelector('[data-stockist-radius]');
    var statusEl = root.querySelector('[data-stockist-status]');
    var emptyEl = root.querySelector('[data-stockist-empty]');
    var userPin = root.querySelector('[data-stockist-user-pin]');
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-stockist-item]'));
    var pins = Array.prototype.slice.call(root.querySelectorAll('[data-stockist-pin]'));

    if (!items.length) return;

    var defaultRadius = parseInt(root.getAttribute('data-default-radius'), 10) || 25;

    if (radiusSelect) {
      radiusSelect.value = String(defaultRadius);
    }

    function getStockists() {
      return items.map(function (item) {
        return {
          id: item.getAttribute('data-stockist-id'),
          lat: parseFloat(item.getAttribute('data-lat')),
          lng: parseFloat(item.getAttribute('data-lng')),
          item: item,
          pin: pins.find(function (pin) {
            return pin.getAttribute('data-stockist-id') === item.getAttribute('data-stockist-id');
          })
        };
      }).filter(function (stockist) {
        return !isNaN(stockist.lat) && !isNaN(stockist.lng);
      });
    }

    function setActive(stockistId) {
      items.forEach(function (item) {
        item.classList.toggle('is-active', item.getAttribute('data-stockist-id') === stockistId);
      });

      pins.forEach(function (pin) {
        pin.classList.toggle('is-active', pin.getAttribute('data-stockist-id') === stockistId);
      });
    }

    function positionPins(stockists) {
      stockists.forEach(function (stockist) {
        if (!stockist.pin) return;

        var point = latLngToPinPercent(stockist.lat, stockist.lng);
        stockist.pin.style.setProperty('--pin-x', point.x + '%');
        stockist.pin.style.setProperty('--pin-y', point.y + '%');
      });
    }

    function renderResults(origin, radiusMiles, filterByRadius) {
      var stockists = getStockists();
      var visible = [];
      var i;
      var stockist;
      var distance;

      positionPins(stockists);

      for (i = 0; i < stockists.length; i += 1) {
        stockist = stockists[i];
        distance = getDistanceMiles(origin.lat, origin.lng, stockist.lat, stockist.lng);
        stockist.distance = distance;

        var distanceEl = stockist.item.querySelector('[data-stockist-distance]');
        if (distanceEl) {
          distanceEl.textContent = formatDistance(distance);
        }

        if (!filterByRadius || distance <= radiusMiles) {
          visible.push(stockist);
          stockist.item.classList.remove('is-hidden');
          if (stockist.pin) {
            stockist.pin.classList.remove('is-hidden');
          }
        } else {
          stockist.item.classList.add('is-hidden');
          if (stockist.pin) {
            stockist.pin.classList.add('is-hidden');
          }
        }
      }

      visible.sort(function (a, b) {
        return a.distance - b.distance;
      });

      var list = root.querySelector('.stockist-locator__list');
      if (list) {
        visible.forEach(function (entry) {
          list.appendChild(entry.item);
        });
      }

      if (emptyEl) {
        emptyEl.hidden = visible.length > 0;
      }

      if (statusEl) {
        if (visible.length === 0) {
          statusEl.textContent = 'No stockists within ' + radiusMiles + ' miles of ' + origin.label;
        } else if (!filterByRadius) {
          statusEl.textContent = visible.length === 1
            ? '1 stockist across the UK'
            : visible.length + ' stockists across the UK';
        } else if (visible.length === 1) {
          statusEl.textContent = '1 stockist near ' + origin.label;
        } else {
          statusEl.textContent = visible.length + ' stockists near ' + origin.label;
        }
      }

      if (visible.length) {
        setActive(visible[0].id);
      }

      if (userPin) {
        var userPoint = latLngToPinPercent(origin.lat, origin.lng);
        userPin.style.setProperty('--user-x', userPoint.x + '%');
        userPin.style.setProperty('--user-y', userPoint.y + '%');
        userPin.hidden = !filterByRadius;
        userPin.setAttribute('aria-hidden', filterByRadius ? 'false' : 'true');
      }
    }

    function runSearch() {
      var query = queryInput ? queryInput.value : '';
      var radiusMiles = radiusSelect ? parseInt(radiusSelect.value, 10) : defaultRadius;
      var origin = resolveLocation(query);
      var filterByRadius = Boolean(query && query.trim());

      if (query && !origin) {
        if (statusEl) {
          statusEl.textContent = 'Try a UK postcode or town name, e.g. Manchester or M1';
        }
        if (emptyEl) {
          emptyEl.hidden = false;
        }
        items.forEach(function (item) {
          item.classList.add('is-hidden');
        });
        pins.forEach(function (pin) {
          pin.classList.add('is-hidden');
        });
        if (userPin) {
          userPin.hidden = true;
        }
        return;
      }

      if (!origin) {
        origin = {
          lat: 54,
          lng: -2.5,
          label: 'the UK'
        };
      }

      renderResults(origin, radiusMiles || defaultRadius, filterByRadius);
    }

    items.forEach(function (item) {
      var selectBtn = item.querySelector('[data-stockist-select]');
      if (!selectBtn) return;

      selectBtn.addEventListener('click', function () {
        setActive(item.getAttribute('data-stockist-id'));
      });
    });

    pins.forEach(function (pin) {
      pin.addEventListener('click', function () {
        setActive(pin.getAttribute('data-stockist-id'));
        var target = root.querySelector('[data-stockist-item][data-stockist-id="' + pin.getAttribute('data-stockist-id') + '"]');
        if (target && typeof target.scrollIntoView === 'function') {
          target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        runSearch();
      });
    }

    if (radiusSelect) {
      radiusSelect.addEventListener('change', runSearch);
    }

    runSearch();
  }

  /* --- Init -------------------------------------------------------------- */

  function init() {
    initSplashScreen();
    initCherryWhipPopup();
    initFadeIn();
    initSmoothScroll();
    initMobileNav();
    initHeaderScroll();
    initHeroParallax();
    initCart();
    initStockistLocator();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
