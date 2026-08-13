(function () {
    'use strict';
  
    // ── CONFIG ─────────────────────────────────────────────────────────────────
    var BOOKING_URL = 'https://cal.com/imaldomar/30min';
    var LABEL        = 'Book a Call';
    var LABEL_ES     = 'Reservar Llamada';
    // ───────────────────────────────────────────────────────────────────────────
  
    var isSpanish = window.location.pathname.startsWith('/es');
    var label     = isSpanish ? LABEL_ES : LABEL;
  
    // ---------------------------------------------------------------------------
    // STYLES
    // ---------------------------------------------------------------------------
    var styleEl = document.createElement('style');
    styleEl.textContent = [
  
      /* --- Nav button --- */
      '.nav-book-call {',
      '  color: var(--text-primary);',
      '  text-decoration: none;',
      '  font-size: 14px;',
      '  font-weight: 500;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.05em;',
      '  padding: 10px 20px;',
      '  border: 1px solid var(--border);',
      '  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;',
      '  white-space: nowrap;',
      '}',
      '.nav-book-call:hover {',
      '  background: var(--text-primary);',
      '  color: var(--warm-white);',
      '  border-color: var(--text-primary);',
      '}',
  
      /* Transparent nav — hero pages */
      'header:not(.scrolled) .nav-book-call {',
      '  color: rgba(255,255,255,0.88);',
      '  border-color: rgba(255,255,255,0.4);',
      '}',
      'header:not(.scrolled) .nav-book-call:hover {',
      '  background: rgba(255,255,255,0.15);',
      '  color: #ffffff;',
      '  border-color: rgba(255,255,255,0.65);',
      '}',
  
      /* Non-hero pages — restore normal colours */
      'body:not(:has(.hero)) header:not(.scrolled) .nav-book-call {',
      '  color: var(--text-primary);',
      '  border-color: var(--border);',
      '}',
      'body:not(:has(.hero)) header:not(.scrolled) .nav-book-call:hover {',
      '  background: var(--text-primary);',
      '  color: var(--warm-white);',
      '  border-color: var(--text-primary);',
      '}',
  
      /* Mobile menu item (reuses existing .mobile-menu-item styling) */
      '.mobile-book-call {',
      '  font-size: 18px;',
      '  font-family: "Playfair Display", serif;',
      '  color: var(--text-primary);',
      '  text-decoration: none;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.05em;',
      '  padding: 6px 24px;',
      '  text-align: center;',
      '  transition: color 0.3s ease, transform 0.3s ease;',
      '}',
      '.mobile-book-call:hover {',
      '  color: var(--primary);',
      '  transform: translateY(-2px);',
      '}'
  
    ].join('\n');
    document.head.appendChild(styleEl);
  
    // ---------------------------------------------------------------------------
    // INJECT — Desktop nav
    // Insert before the language switcher inside .nav-right
    // ---------------------------------------------------------------------------
    var navRight = document.querySelector('.nav-right');
    if (navRight) {
      var navLink = document.createElement('a');
      navLink.href      = 'BOOKING_URL';
      navLink.target    = '_blank';
      navLink.rel       = 'noopener noreferrer';
      navLink.className = 'nav-book-call';
      navLink.textContent = label;
  
      var langSwitcher = navRight.querySelector('.language-switcher');
      navRight.insertBefore(navLink, langSwitcher || null);
    }
  
    // ---------------------------------------------------------------------------
    // INJECT — Mobile menu
    // Insert before the "Get Quote" mobile CTA
    // ---------------------------------------------------------------------------
    var mobileContent = document.querySelector('.mobile-menu-content');
    if (mobileContent) {
      var mobileLink = document.createElement('a');
      mobileLink.href      = 'BOOKING_URL';
      mobileLink.target    = '_blank';
      mobileLink.rel       = 'noopener noreferrer';
      mobileLink.className = 'mobile-book-call';
      mobileLink.textContent = label;
  
      var mobileCta = mobileContent.querySelector('.mobile-cta');
      mobileContent.insertBefore(mobileLink, mobileCta || null);
    }
  
  })();