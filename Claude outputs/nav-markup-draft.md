# Static nav — draft markup

Nothing has been changed in your repo. This is for review.

Order follows your priority: Whisky, Rum, Tequila, Vodka, Beer.

**Nav:** Casks ▾ · Stories · FAQ · [Get Quote] · EN | ES

---

## 1. English header

Replaces everything from `<header>` to `</header>`. Identical on every English page except the two marked lines.

```html
<header>
    <nav class="container">
        <a href="/" class="logo">
            <img src="/images/logos/Solera-Cask-Logo.png" alt="Solera Cask" class="logo-image logo-large">
            <img src="/images/logos/SC-Logo.png" alt="Solera Cask" class="logo-image logo-small">
        </a>

        <!-- Desktop Menu -->
        <ul class="nav-menu">
            <li class="has-dropdown">
                <a href="/sherry-barrels" aria-haspopup="true">Casks</a>
                <ul class="dropdown-menu">
                    <li><a href="/sherry-barrels">All Sherry Casks</a></li>
                    <li><a href="/whisky-sherry-barrels">Whisky</a></li>
                    <li><a href="/rum-sherry-barrels">Rum</a></li>
                    <li><a href="/tequila-sherry-barrels">Tequila</a></li>
                    <li><a href="/vodka-sherry-barrels">Vodka</a></li>
                    <li><a href="/beer-sherry-barrels">Beer</a></li>
                </ul>
            </li>
            <li><a href="/blog">Stories</a></li>
            <li><a href="/sherry-barrels-faq">FAQ</a></li>
        </ul>

        <!-- Right Side Navigation Items -->
        <div class="nav-right">
            <a href="/#contact" class="nav-cta">Get Quote</a>

            <!-- Language Switcher — see the mapping table below -->
            <div class="language-switcher">
                <a href="/" class="language-option active">English</a>
                <span class="language-separator">|</span>
                <a href="/es/" class="language-option">Español</a>
            </div>
        </div>

        <!-- Mobile Hamburger Menu -->
        <div class="mobile-menu-toggle" id="mobileMenuToggle">
            <span></span><span></span><span></span>
        </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay" id="mobileMenuOverlay">
        <div class="mobile-menu-content">
            <a href="/sherry-barrels" class="mobile-menu-item">All Sherry Casks</a>
            <a href="/whisky-sherry-barrels" class="mobile-menu-item mobile-submenu-item">Whisky</a>
            <a href="/rum-sherry-barrels" class="mobile-menu-item mobile-submenu-item">Rum</a>
            <a href="/tequila-sherry-barrels" class="mobile-menu-item mobile-submenu-item">Tequila</a>
            <a href="/vodka-sherry-barrels" class="mobile-menu-item mobile-submenu-item">Vodka</a>
            <a href="/beer-sherry-barrels" class="mobile-menu-item mobile-submenu-item">Beer</a>
            <a href="/blog" class="mobile-menu-item">Stories</a>
            <a href="/sherry-barrels-faq" class="mobile-menu-item">FAQ</a>
            <a href="/#contact" class="mobile-menu-item mobile-cta">Get Quote</a>

            <div class="mobile-language-switcher">
                <a href="/" class="mobile-language-option active">English</a>
                <a href="/es/" class="mobile-language-option">Español</a>
            </div>
        </div>
    </div>
</header>
```

**Two lines change per page:**

1. The `active` class on the language switcher
2. The `Español` href — point it at that page's Spanish twin:

| English page | Español href |
|---|---|
| `/` | `/es/` |
| `/sherry-barrels` | `/es/barricas-jerez-sherry` |
| `/sherry-barrels-faq` | `/es/faq-barricas-jerez` |
| `/whisky-sherry-barrels` | `/es/barricas-jerez-whisky` |
| `/rum-sherry-barrels` | `/es/barricas-jerez-ron` |
| `/tequila-sherry-barrels` | `/es/barricas-jerez-tequila` |
| `/vodka-sherry-barrels` | `/es/barricas-jerez-vodka` |
| `/beer-sherry-barrels` | `/es/barricas-jerez-cerveza` |
| `/blog`, `/post/*` | no Spanish twin — point at `/es/` |

This mirrors the `hreflang` tags you already have, which are correct.

---

## 2. Spanish header

Same structure. No Spanish blog exists, so Stories is omitted.

```html
<ul class="nav-menu">
    <li class="has-dropdown">
        <a href="/es/barricas-jerez-sherry" aria-haspopup="true">Barricas</a>
        <ul class="dropdown-menu">
            <li><a href="/es/barricas-jerez-sherry">Todas las Barricas</a></li>
            <li><a href="/es/barricas-jerez-whisky">Whisky</a></li>
            <li><a href="/es/barricas-jerez-ron">Ron</a></li>
            <li><a href="/es/barricas-jerez-tequila">Tequila</a></li>
            <li><a href="/es/barricas-jerez-vodka">Vodka</a></li>
            <li><a href="/es/barricas-jerez-cerveza">Cerveza</a></li>
        </ul>
    </li>
    <li><a href="/es/faq-barricas-jerez">Preguntas Frecuentes</a></li>
</ul>
```

CTA: `<a href="/es/#contact" class="nav-cta">Solicitar Presupuesto</a>`

Your Spanish, your call on the labels — "Preguntas Frecuentes" is long for a nav item, and "Info" (what you use now) or "FAQ" may sit better.

---

## 3. CSS the dropdown needs

Your `.dropdown-menu` rules exist but the menu has never been used, and it won't work as written. Three problems:

- **`padding: 0, 0;`** on line 341 of `styles.css` — the comma makes it invalid, so the browser drops it. Dropdown links currently have no padding at all.
- **No background, border, shadow, `z-index` or `min-width`** — the menu would render as transparent text over the page content beneath it.
- **`:hover` only** — no keyboard or touch access.

Add this after your existing `.dropdown-menu` block (and delete the broken `padding: 0, 0;` line):

```css
.has-dropdown { position: relative; }

.dropdown-menu {
    min-width: 200px;
    background: var(--warm-white);
    border: 1px solid var(--border-light);
    border-radius: 2px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    padding: 8px 0;
    z-index: 100;
}

/* Bridges the gap so the menu doesn't close as the cursor travels down */
.has-dropdown::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    height: 0.5rem;
}

.dropdown-menu a {
    padding: 10px 18px;
    white-space: nowrap;
}

.dropdown-menu a:hover,
.dropdown-menu a:focus {
    background: var(--border-light);
}

/* Keyboard and touch, not just hover */
.has-dropdown:hover .dropdown-menu,
.has-dropdown:focus-within .dropdown-menu {
    opacity: 1;
    visibility: visible;
}

/* Mobile: indent the spirit types under the group heading */
.mobile-submenu-item {
    padding-left: 1.5rem;
    font-size: 0.95em;
    opacity: 0.85;
}
```

---

## 4. Three bugs this fixes along the way

**Invalid markup in the current nav.** `<a href="#faq">FAQ</a>` sits directly inside the `<ul>` without an `<li>` wrapper. Invalid HTML; browsers paper over it.

**`.html` links everywhere.** Every nav and footer link uses `/sherry-barrels.html` rather than `/sherry-barrels`. Both URLs serve the page, but the `.html` one is the non-canonical duplicate — which is what Search Console is reporting under "Alternate page with proper canonical tag". Linking to the canonical version internally is free and correct.

**Lowercase logo paths.** `index.html` uses `images/logos/solera-cask-logo.png`; the files are `Solera-Cask-Logo.png`. Netlify serves both, so nothing is broken — but it's a landmine if you ever move host. The markup above uses the real filenames with a leading slash.

---

## 5. What this does and doesn't fix

It puts all five product pages, the blog and the FAQ into the raw HTML of every page on the site. Google's first-pass crawl sees them instead of finding them only in the sitemap, which is the specific condition producing "Discovered – currently not indexed".

It doesn't create crawl demand. A young domain with few inbound links gets crawled slowly regardless. This removes the self-inflicted half of the problem; the rest comes from people linking to you.

Expect weeks, not days. After deploying, use Search Console's URL Inspection to request indexing on the five product pages directly rather than waiting.
