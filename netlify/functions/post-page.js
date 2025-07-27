const mongoose = require('mongoose');

// Cache connection
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;
  
  await mongoose.connect(process.env.MONGO_URI);
  
  cachedDb = mongoose.connection;
  return cachedDb;
}

const PostSchema = new mongoose.Schema({
  id: String,
  title: String,
  type: String,
  date: String,
  excerpt: String,
  content: String,
  contentHtml: String,
  link: String,
  tags: [String],
  status: String,
  featured: { type: Boolean, default: false },
  featuredImage: String,
  author: String,
  seoTitle: String,
  seoDescription: String,
  seoKeywords: String,
  seoImage: String,
  canonicalUrl: String,
  noIndex: { type: Boolean, default: false },
  autoGenerateSEO: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

function createPostSlug(post) {
  return post.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown date';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function formatContent(content) {
  if (!content) return '';
  
  // Convert markdown images to HTML
  let formatted = content.replace(/!\[(.*?)\]\((.*?)\)/g, 
    '<figure><img src="$2" alt="$1" loading="lazy"><figcaption>$1</figcaption></figure>'
  );
  
  // Convert markdown links
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  
  // Split into paragraphs and format
  const paragraphs = formatted.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map(paragraph => {
    const trimmed = paragraph.trim();
    if (!trimmed) return '';
    
    // Format markdown-style elements
    let text = trimmed
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
    
    // Handle headers
    if (text.startsWith('### ')) {
      return `<h3>${text.substring(4)}</h3>`;
    } else if (text.startsWith('## ')) {
      return `<h2>${text.substring(3)}</h2>`;
    } else if (text.startsWith('# ')) {
      return `<h3>${text.substring(2)}</h3>`;
    }
    
    // Handle blockquotes
    if (text.startsWith('> ')) {
      return `<blockquote>${text.substring(2)}</blockquote>`;
    }
    
    return `<p>${text}</p>`;
  }).join('');
}

function generatePostHTML(post) {
  const baseUrl = 'https://soleracask.netlify.app';
  const currentUrl = `${baseUrl}/post/${createPostSlug(post)}`;
  
  // Generate SEO data with fallbacks
  const seoTitle = post.seoTitle || `${post.title} - Solera Cask`;
  const seoDescription = post.seoDescription || post.excerpt || 
    (post.content ? post.content.substring(0, 160).replace(/[#*`_\[\]()]/g, '').trim() + '...' : 
     'Premium sherry barrels from Jerez de la Frontera, Spain');
  const seoKeywords = post.seoKeywords || (post.tags ? post.tags.join(', ') : 'sherry barrels, whisky aging, rum finishing, Jerez, Spain');
  const featuredImage = post.seoImage || post.featuredImage || '/images/logos/Solera-Cask-Logo.png';
  const fullImageUrl = featuredImage.startsWith('http') ? featuredImage : baseUrl + featuredImage;
  const author = post.author || 'admin';
  const publishedTime = new Date(post.date || post.createdAt).toISOString();
  const robotsContent = post.noIndex ? 'noindex, nofollow' : 'index, follow';
  
  // Calculate reading time
  const readingTime = post.content ? Math.ceil(post.content.split(' ').length / 200) : 1;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags - Server-side rendered -->
    <title>${seoTitle}</title>
    <meta name="description" content="${seoDescription}">
    <meta name="keywords" content="${seoKeywords}">
    <meta name="author" content="${author}">
    <meta name="robots" content="${robotsContent}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Solera Cask">
    <meta property="og:title" content="${seoTitle}">
    <meta property="og:description" content="${seoDescription}">
    <meta property="og:url" content="${currentUrl}">
    <meta property="og:image" content="${fullImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@soleracask">
    <meta name="twitter:title" content="${seoTitle}">
    <meta name="twitter:description" content="${seoDescription}">
    <meta name="twitter:image" content="${fullImageUrl}">
    
    <!-- Article Meta Tags -->
    <meta property="article:author" content="${author}">
    <meta property="article:published_time" content="${publishedTime}">
    <meta property="article:section" content="${post.type}">
    ${post.tags ? `<meta property="article:tag" content="${post.tags.join(', ')}">` : ''}
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${post.canonicalUrl || currentUrl}">
    
    <!-- Additional SEO Tags -->
    <meta name="theme-color" content="#8B4513">
    <meta name="msapplication-TileColor" content="#8B4513">
    <meta name="application-name" content="Solera Cask">
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${post.title}",
        "description": "${seoDescription}",
        "author": {
            "@type": "Organization",
            "name": "${author}",
            "url": "${baseUrl}"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Solera Cask",
            "url": "${baseUrl}",
            "logo": {
                "@type": "ImageObject",
                "url": "${baseUrl}/images/logos/Solera-Cask-Logo.png"
            }
        },
        "datePublished": "${publishedTime}",
        "mainEntityOfPage": "${currentUrl}",
        "image": "${fullImageUrl}",
        "keywords": "${seoKeywords}",
        "articleSection": "${post.type}",
        "inLanguage": "en-US"
    }
    </script>
    
    <link rel="stylesheet" href="/css/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    
    <style>
        /* Post page specific styles */
        .post-page {
            padding-top: 120px;
            min-height: 100vh;
            background: var(--warm-white);
        }

        .post-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 0 40px 80px;
        }

        ${post.contentHtml ? `
        .post-container.html-content {
            max-width: 1200px;
        }
        ` : ''}

        .post-header {
            text-align: center;
            margin-bottom: 60px;
            padding-bottom: 40px;
            border-bottom: 1px solid var(--border-light);
        }

        .post-meta {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-bottom: 32px;
            flex-wrap: wrap;
        }

        .post-type {
            background: var(--primary);
            color: var(--text-white);
            padding: 6px 16px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: 600;
        }

        .post-date, .reading-time {
            font-size: 14px;
            color: var(--text-light);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .post-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(32px, 5vw, 48px);
            font-weight: 400;
            color: var(--text-primary);
            margin: 0;
            line-height: 1.2;
        }

        .post-author {
            font-size: 14px;
            color: var(--text-light);
            font-style: italic;
            margin-bottom: 8px;
        }

        .featured-image {
            width: 100%;
            max-width: 1200px;
            height: 400px;
            object-fit: cover;
            border-radius: 8px;
            margin: 0 auto 40px;
            display: block;
            box-shadow: var(--shadow-medium);
        }

        .post-content {
            font-size: 18px;
            line-height: 1.7;
            color: var(--text-secondary);
            margin-bottom: 60px;
        }

        .post-content h2 {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-weight: 400;
            color: var(--text-primary);
            margin: 40px 0 24px;
        }

        .post-content h3 {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            font-weight: 400;
            color: var(--text-primary);
            margin: 32px 0 16px;
        }

        .post-content p {
            margin-bottom: 24px;
        }

        .post-content img {
            max-width: 100%;
            height: auto;
            margin: 32px 0;
            border-radius: 4px;
            box-shadow: var(--shadow-medium);
        }

        .external-link {
            background: var(--cream);
            border-left: 4px solid var(--primary);
            padding: 24px;
            margin: 40px 0;
        }

        .external-link a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .post-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 60px;
            padding-top: 40px;
            border-top: 1px solid var(--border-light);
        }

        .post-tag {
            background: var(--light-beige);
            color: var(--text-secondary);
            padding: 8px 16px;
            font-size: 12px;
            border: 1px solid var(--border-light);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-decoration: none;
        }

        .back-to-blog {
            text-align: center;
            margin-bottom: 40px;
        }

        .back-to-blog a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 12px 24px;
            border: 1px solid var(--primary);
            transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
            .post-container {
                padding: 0 20px 60px;
            }
            .post-meta {
                flex-direction: column;
                gap: 12px;
            }
            .featured-image {
                height: 250px;
            }
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <a href="/" class="logo">
                <img src="/images/logos/Solera-Cask-Logo.png" alt="Solera Cask" class="logo-image logo-large">
                <img src="/images/logos/SC-Logo.png" alt="Solera Cask" class="logo-image logo-small">
            </a>
            
            <ul class="nav-menu">
                <li><a href="/#heritage">Heritage</a></li>
                <li><a href="/#products">Casks</a></li>
                <li><a href="/#product-finder">Sherry Barrel Butler</a></li>
                <li><a href="/blog" class="active">Stories</a></li>
                <li><a href="/#faq">FAQ</a></li>
                <li><a href="/#contact" class="nav-cta">Get Quote</a></li>
            </ul>

            <div class="mobile-menu-toggle" id="mobileMenuToggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </header>

    <div class="post-page">
        <div class="post-container${post.contentHtml ? ' html-content' : ''}">
            <div class="post-header">
                <div class="post-meta">
                    <span class="post-type">${post.type}</span>
                    <span class="post-date">${formatDate(post.date)}</span>
                    <span class="reading-time">${readingTime} min read</span>
                    ${post.featured ? '<span class="featured-indicator">FEATURED</span>' : ''}
                </div>
                <h1 class="post-title">${post.title}</h1>
                ${author && author !== 'admin' ? `<div class="post-author">By ${author}</div>` : ''}
            </div>

            ${featuredImage !== '/images/logos/Solera-Cask-Logo.png' ? `
            <img src="${featuredImage}" alt="${post.title}" class="featured-image" loading="lazy">
            ` : ''}

            <div class="post-content">
                ${post.contentHtml || formatContent(post.content)}
            </div>

            ${post.link ? `
            <div class="external-link">
                <a href="${post.link}" target="_blank" rel="noopener noreferrer">
                    Read Original Source →
                </a>
            </div>
            ` : ''}

            ${post.tags && post.tags.length > 0 ? `
            <div class="post-tags">
                ${post.tags.map(tag => `<a href="/blog?search=${encodeURIComponent(tag)}" class="post-tag">#${tag}</a>`).join('')}
            </div>
            ` : ''}

            <div class="back-to-blog">
                <a href="/blog">← Back to All Stories</a>
            </div>
        </div>
    </div>

     <footer>
        <div class="container">
            <div class="footer-grid">
                <!-- Brand Section - Far Left -->
                <div class="footer-section footer-brand">
                    <h3>Solera Cask</h3>
                    <p class="brand-motto">Jerez de la Frontera, Spain</p>
                    <div class="social-links">
                        <a href="https://instagram.com/soleracask" target="_blank" rel="noopener noreferrer" class="social-link">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                    </div>
                </div>
    
                <div class="footer-section">
                    <h3>Casks</h3>
                    <ul>
                        <li><a href="/whisky-sherry-barrels.html">Sherry Barrels for Whisky</a></li>
                        <li><a href="/rum-sherry-barrels.html">Sherry Barrels for Rum</a></li>
                        <li><a href="/tequila-sherry-barrels.html">Sherry Barrels for Tequila</a></li>
                        <li><a href="/vodka-sherry-barrels.html">Sherry Barrels for Vodka</a></li>
                        <li><a href="/beer-sherry-barrels.html">Sherry Barrels for Beer</a></li>
                        <li><a href="/sherry-barrels.html">Jerez Sherry Barrels</a></li>
                    </ul>
                </div>
    
                <div class="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="/#heritage">About Solera Cask</a></li>
                        <li><a href="/blog.html">Stories</a></li>
                        <li><a href="/sherry-barrels-faq.html">FAQ</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>
    
                <!-- Contact Section - Far Right -->
                <div class="footer-section footer-contact">
                    <h3>Contact Us</h3>
                    <ul>
                        <li>
                            <a href="mailto:info@soleracask.com" class="contact-link-with-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="contact-icon">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                </svg>
                                info@soleracask.com
                            </a>
                        </li>
                        <li>
                            <a href="https://www.soleracask.com" target="_blank" rel="noopener noreferrer" class="contact-link-with-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="contact-icon">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                </svg>
                                www.soleracask.com
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2025 Solera Cask. Premium Sherry Barrels from Jerez de la Frontera, Spain. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // Minimal JavaScript for mobile menu only
        document.getElementById('mobileMenuToggle')?.addEventListener('click', function() {
            // Add mobile menu functionality if needed
        });
    </script>
    <script src="/js/script.js"></script>
</body>
</html>`;
}

// Solera Cask Accessibility Toolbar
// Elegant accessibility features matching Solera's sophisticated design

class SoleraAccessibilityToolbar {
    constructor() {
        this.settings = {
            textSize: 'normal',
            grayscale: false,
            highContrast: false,
            negativeContrast: false,
            lightBackground: false,
            linksUnderline: false,
            readableFont: false
        };

        this.isOpen = false;
        this.isInitialized = false;
        this.eventListenersAttached = false;

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        this.loadSettings();
        this.addStyles();
        this.createToggleButton();
        this.createToolbar();
        this.setupPersistentEventListeners();
        this.applySettings();
        this.updateUI();
        this.ensureToolbarVisibility();

        this.isInitialized = true;
        console.log('Solera Accessibility Toolbar initialized');
    }

    loadSettings() {
        Object.keys(this.settings).forEach(key => {
            const stored = localStorage.getItem(`solera-a11y-${key}`);
            if (stored !== null) {
                this.settings[key] = stored === 'true' ? true : stored === 'false' ? false : stored;
            }
        });
    }

    createToggleButton() {
        let button = document.getElementById('soleraAccessibilityToggle');
        if (!button) {
            button = document.createElement('button');
            button.id = 'soleraAccessibilityToggle';
            button.className = 'solera-accessibility-toggle-btn';
            button.setAttribute('data-solera-a11y-toggle', 'true');
            button.setAttribute('aria-label', 'Open accessibility options');
            button.innerHTML = `
                <span class="solera-accessibility-icon" aria-hidden="true">♿︎</span>
            `;
            document.body.appendChild(button);
            console.log('Solera accessibility toggle button created');
        }
    }

    createToolbar() {
        let toolbar = document.getElementById('solera-accessibility-toolbar');
        if (!toolbar) {
            toolbar = document.createElement('div');
            toolbar.id = 'solera-accessibility-toolbar';
            toolbar.className = 'solera-accessibility-toolbar';
            toolbar.setAttribute('data-solera-a11y-toolbar', 'true');
            toolbar.innerHTML = `
                <div class="solera-a11y-header">
                    <div class="solera-a11y-title">
                        <span class="solera-a11y-icon">♿︎</span>
                        <span>Accessibility Options</span>
                    </div>
                    <button class="solera-a11y-close" data-solera-a11y-close="true" aria-label="Close accessibility options">
                        <span>✕</span>
                    </button>
                </div>
                <div class="solera-a11y-content" data-solera-a11y-content="true">
                    <div class="solera-a11y-section">
                        <h3>Text Size</h3>
                        <div class="solera-a11y-button-group">
                            <button class="solera-a11y-option" data-solera-a11y-action="decreaseText">
                                <span class="solera-a11y-option-icon">A−</span>
                                <span class="solera-a11y-option-text">Smaller</span>
                            </button>
                            <div class="solera-text-size-indicator" id="soleraTextSizeDisplay">${this.getTextSizeLabel()}</div>
                            <button class="solera-a11y-option" data-solera-a11y-action="increaseText">
                                <span class="solera-a11y-option-icon">A+</span>
                                <span class="solera-a11y-option-text">Larger</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="solera-a11y-section">
                        <h3>Visual Adjustments</h3>
                        <button class="solera-a11y-option solera-a11y-toggle" data-solera-a11y-action="highContrast">
                            <span class="solera-a11y-option-icon">◐</span>
                            <span class="solera-a11y-option-text">High Contrast</span>
                        </button>
                        <button class="solera-a11y-option solera-a11y-toggle" data-solera-a11y-action="grayscale">
                            <span class="solera-a11y-option-icon">⚫</span>
                            <span class="solera-a11y-option-text">Grayscale</span>
                        </button>
                        <button class="solera-a11y-option solera-a11y-toggle" data-solera-a11y-action="negativeContrast">
                            <span class="solera-a11y-option-icon">◑</span>
                            <span class="solera-a11y-option-text">Negative Contrast</span>
                        </button>
                        <button class="solera-a11y-option solera-a11y-toggle" data-solera-a11y-action="lightBackground">
                            <span class="solera-a11y-option-icon">☀</span>
                            <span class="solera-a11y-option-text">Light Background</span>
                        </button>
                    </div>
                    
                    <div class="solera-a11y-section">
                        <h3>Reading & Navigation</h3>
                        <button class="solera-a11y-option solera-a11y-toggle" data-solera-a11y-action="linksUnderline">
                            <span class="solera-a11y-option-icon">_</span>
                            <span class="solera-a11y-option-text">Underline Links</span>
                        </button>
                        <button class="solera-a11y-option solera-a11y-toggle" data-solera-a11y-action="readableFont">
                            <span class="solera-a11y-option-icon">Aa</span>
                            <span class="solera-a11y-option-text">Readable Font</span>
                        </button>
                    </div>
                    
                    <div class="solera-a11y-section">
                        <button class="solera-a11y-reset" data-solera-a11y-action="reset">
                            <span class="solera-a11y-option-icon">↺</span>
                            <span class="solera-a11y-option-text">Reset All Settings</span>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(toolbar);
            console.log('Solera accessibility toolbar created');
        }
    }

    addStyles() {
        let styles = document.getElementById('solera-accessibility-toolbar-styles');
        if (!styles) {
            styles = document.createElement('style');
            styles.id = 'solera-accessibility-toolbar-styles';
            document.head.appendChild(styles);
        }

        styles.textContent = `
            /* Solera Accessibility Toggle Button */
            .solera-accessibility-toggle-btn {
                position: fixed !important;
                top: 50% !important;
                right: 20px !important;
                transform: translateY(-50%) !important;
                background: var(--primary) !important;
                border: 1px solid var(--border) !important;
                color: var(--text-white) !important;
                font-family: 'Inter', sans-serif !important;
                font-size: 20px !important;
                padding: 12px !important;
                cursor: pointer !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 48px !important;
                height: 48px !important;
                box-shadow: var(--shadow-medium) !important;
                z-index: 9998 !important;
                filter: none !important;
                -webkit-filter: none !important;
                isolation: isolate !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }

            .solera-accessibility-toggle-btn:hover {
                background: var(--accent-gold) !important;
                color: var(--text-primary) !important;
                transform: translateY(-50%) scale(1.05) !important;
                box-shadow: var(--shadow-strong) !important;
            }

            .solera-accessibility-icon {
                color: inherit !important;
                font-size: 20px !important;
                filter: none !important;
                -webkit-filter: none !important;
                line-height: 1 !important;
            }

            /* Solera Accessibility Toolbar */
            .solera-accessibility-toolbar {
                position: fixed !important;
                top: 50% !important;
                right: -420px !important;
                transform: translateY(-50%) !important;
                width: 380px !important;
                max-height: 80vh !important;
                background: var(--warm-white) !important;
                border: 1px solid var(--border) !important;
                border-radius: 0 !important;
                box-shadow: var(--shadow-strong) !important;
                z-index: 9999 !important;
                transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                font-family: 'Inter', sans-serif !important;
                filter: none !important;
                -webkit-filter: none !important;
                isolation: isolate !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
                overflow: hidden !important;
            }

            .solera-accessibility-toolbar.open {
                right: 20px !important;
            }

            /* Elegant Header */
            .solera-a11y-header {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 24px !important;
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%) !important;
                color: var(--text-white) !important;
                position: relative !important;
            }

            .solera-a11y-title {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                font-family: 'Playfair Display', serif !important;
                font-weight: 400 !important;
                font-size: 18px !important;
                color: var(--text-white) !important;
            }

            .solera-a11y-icon {
                font-size: 24px !important;
                color: var(--accent-gold) !important;
                filter: none !important;
                -webkit-filter: none !important;
            }

            .solera-a11y-close {
                background: transparent !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                color: var(--text-white) !important;
                cursor: pointer !important;
                padding: 8px !important;
                border-radius: 4px !important;
                font-size: 14px !important;
                font-family: 'Inter', sans-serif !important;
                transition: all 0.3s ease !important;
                width: 32px !important;
                height: 32px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                filter: none !important;
                -webkit-filter: none !important;
            }

            .solera-a11y-close:hover {
                background: rgba(255, 255, 255, 0.1) !important;
                border-color: rgba(255, 255, 255, 0.5) !important;
                transform: scale(1.05) !important;
            }

            /* Content Area */
            .solera-a11y-content {
                padding: 24px !important;
                background: var(--warm-white) !important;
                color: var(--text-primary) !important;
                max-height: calc(80vh - 96px) !important;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch !important;
            }

            /* Custom scrollbar for webkit browsers */
            .solera-a11y-content::-webkit-scrollbar {
                width: 6px !important;
            }

            .solera-a11y-content::-webkit-scrollbar-track {
                background: var(--light-beige) !important;
            }

            .solera-a11y-content::-webkit-scrollbar-thumb {
                background: var(--accent-gold) !important;
                border-radius: 3px !important;
            }

            .solera-a11y-content::-webkit-scrollbar-thumb:hover {
                background: var(--primary-dark) !important;
            }

            /* Sections */
            .solera-a11y-section {
                margin-bottom: 32px !important;
            }

            .solera-a11y-section:last-child {
                margin-bottom: 0 !important;
            }

            .solera-a11y-section h3 {
                font-family: 'Playfair Display', serif !important;
                font-weight: 400 !important;
                font-size: 16px !important;
                color: var(--text-primary) !important;
                margin-bottom: 16px !important;
                padding-bottom: 8px !important;
                border-bottom: 1px solid var(--border-light) !important;
            }

            /* Button Groups */
            .solera-a11y-button-group {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                margin-bottom: 16px !important;
            }

            /* Option Buttons */
            .solera-a11y-option {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                padding: 12px 16px !important;
                background: var(--cream) !important;
                border: 1px solid var(--border) !important;
                text-align: left !important;
                cursor: pointer !important;
                border-radius: 4px !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                color: var(--text-primary) !important;
                font-family: 'Inter', sans-serif !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                width: 100% !important;
                margin-bottom: 8px !important;
                position: relative !important;
                overflow: hidden !important;
                filter: none !important;
                -webkit-filter: none !important;
            }

            .solera-a11y-button-group .solera-a11y-option {
                flex: 1 !important;
                width: auto !important;
                margin-bottom: 0 !important;
                justify-content: center !important;
                text-align: center !important;
            }

            .solera-a11y-option::before {
                content: '' !important;
                position: absolute !important;
                top: 0 !important;
                left: -100% !important;
                width: 100% !important;
                height: 100% !important;
                background: var(--accent-gold) !important;
                transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                z-index: -1 !important;
            }

            .solera-a11y-option:hover::before {
                left: 0 !important;
            }

            .solera-a11y-option:hover {
                border-color: var(--accent-gold) !important;
                transform: translateY(-1px) !important;
                box-shadow: var(--shadow-subtle) !important;
                color: var(--text-primary) !important;
            }

            .solera-a11y-option.active {
                background: var(--primary) !important;
                border-color: var(--primary) !important;
                color: var(--text-white) !important;
            }

            .solera-a11y-option.active::before {
                background: var(--primary-dark) !important;
                left: 0 !important;
            }

            .solera-a11y-option.active:hover {
                background: var(--primary-dark) !important;
                border-color: var(--primary-dark) !important;
                color: var(--text-white) !important;
            }

            .solera-a11y-option-icon {
                font-size: 16px !important;
                min-width: 20px !important;
                filter: none !important;
                -webkit-filter: none !important;
                font-weight: 600 !important;
            }

            .solera-a11y-option-text {
                flex: 1 !important;
                color: inherit !important;
            }

            /* Text Size Indicator */
            .solera-text-size-indicator {
                font-family: 'Playfair Display', serif !important;
                font-size: 14px !important;
                font-weight: 600 !important;
                background: var(--primary) !important;
                color: var(--text-white) !important;
                padding: 8px 12px !important;
                border: 1px solid var(--primary) !important;
                border-radius: 4px !important;
                min-width: 40px !important;
                text-align: center !important;
                flex-shrink: 0 !important;
            }

            /* Reset Button */
            .solera-a11y-reset {
                background: var(--light-beige) !important;
                border: 1px solid var(--rich-brown) !important;
                color: var(--rich-brown) !important;
                font-weight: 600 !important;
            }

            .solera-a11y-reset::before {
                background: var(--rich-brown) !important;
            }

            .solera-a11y-reset:hover {
                border-color: var(--rich-brown) !important;
                color: var(--text-white) !important;
            }

            .solera-a11y-reset.active {
                background: var(--rich-brown) !important;
                border-color: var(--rich-brown) !important;
                color: var(--text-white) !important;
            }

            /* Accessibility Features - Text Size (Adjusted scaling + H1 fix) */
            html.solera-a11y-increased-text,
            html.solera-a11y-increased-text body,
            html.solera-a11y-increased-text * { 
                font-size: 103% !important; 
                line-height: 1.6 !important;
            }
            
            html.solera-a11y-extra-large-text,
            html.solera-a11y-extra-large-text body,
            html.solera-a11y-extra-large-text * { 
                font-size: 105% !important; 
                line-height: 1.6 !important;
            }
            
            html.solera-a11y-decreased-text,
            html.solera-a11y-decreased-text body,
            html.solera-a11y-decreased-text * { 
                font-size: 95% !important; 
                line-height: 1.6 !important;
            }
            
            html.solera-a11y-extra-small-text,
            html.solera-a11y-extra-small-text body,
            html.solera-a11y-extra-small-text * { 
                font-size: 88% !important; 
                line-height: 1.6 !important;
            }

            /* Fix H1, H2, H3, etc. to scale properly with increased text - VERY SPECIFIC SELECTORS */
            html.solera-a11y-increased-text h1,
            html.solera-a11y-increased-text .hero h1,
            html.solera-a11y-increased-text .heritage-content h2,
            html.solera-a11y-increased-text .story-content h2,
            html.solera-a11y-increased-text .contact-info h2,
            html.solera-a11y-increased-text .section-title,
            html.solera-a11y-increased-text .hero-title,
            html.solera-a11y-increased-text .page-title,
            html.solera-a11y-increased-text h2,
            html.solera-a11y-increased-text h3,
            html.solera-a11y-increased-text h4,
            html.solera-a11y-increased-text h5,
            html.solera-a11y-increased-text h6,
            html.solera-a11y-increased-text .sherry-intro h2,
            html.solera-a11y-increased-text .blog-hero h1,
            html.solera-a11y-increased-text [class*="title"],
            html.solera-a11y-increased-text [class*="heading"] {
                font-size: calc(1em * 1.03) !important;
                transform: scale(1.03) !important;
                transform-origin: center !important;
            }

            html.solera-a11y-extra-large-text h1,
            html.solera-a11y-extra-large-text .hero h1,
            html.solera-a11y-extra-large-text .heritage-content h2,
            html.solera-a11y-extra-large-text .story-content h2,
            html.solera-a11y-extra-large-text .contact-info h2,
            html.solera-a11y-extra-large-text .section-title,
            html.solera-a11y-extra-large-text .hero-title,
            html.solera-a11y-extra-large-text .page-title,
            html.solera-a11y-extra-large-text h2,
            html.solera-a11y-extra-large-text h3,
            html.solera-a11y-extra-large-text h4,
            html.solera-a11y-extra-large-text h5,
            html.solera-a11y-extra-large-text h6,
            html.solera-a11y-extra-large-text .sherry-intro h2,
            html.solera-a11y-extra-large-text .blog-hero h1,
            html.solera-a11y-extra-large-text [class*="title"],
            html.solera-a11y-extra-large-text [class*="heading"] {
                font-size: calc(1em * 1.05) !important;
                transform: scale(1.05) !important;
                transform-origin: center !important;
            }

            /* Override specific clamp() functions that are resisting scaling */
            html.solera-a11y-increased-text .hero h1 {
                font-size: clamp(36px * 1.03, 6vw * 1.03, 64px * 1.03) !important;
            }

            html.solera-a11y-extra-large-text .hero h1 {
                font-size: clamp(36px * 1.05, 6vw * 1.05, 64px * 1.05) !important;
            }

            html.solera-a11y-increased-text .heritage-content h2,
            html.solera-a11y-increased-text .story-content h2,
            html.solera-a11y-increased-text .contact-info h2 {
                font-size: clamp(36px * 1.03, 5vw * 1.03, 56px * 1.03) !important;
            }

            html.solera-a11y-extra-large-text .heritage-content h2,
            html.solera-a11y-extra-large-text .story-content h2,
            html.solera-a11y-extra-large-text .contact-info h2 {
                font-size: clamp(36px * 1.05, 5vw * 1.05, 56px * 1.05) !important;
            }

            html.solera-a11y-increased-text .sherry-intro h2 {
                font-size: clamp(36px * 1.03, 5vw * 1.03, 56px * 1.03) !important;
            }

            html.solera-a11y-extra-large-text .sherry-intro h2 {
                font-size: clamp(36px * 1.05, 5vw * 1.05, 56px * 1.05) !important;
            }

            /* Smart Navigation Adjustments for Larger Text Sizes */
            html.solera-a11y-increased-text nav {
                padding: 12px 0 !important;
            }

            html.solera-a11y-extra-large-text nav {
                padding: 8px 0 !important;
            }

            html.solera-a11y-increased-text .nav-links {
                gap: 20px !important;
            }

            html.solera-a11y-extra-large-text .nav-links {
                gap: 16px !important;
            }

            html.solera-a11y-increased-text .nav-links a {
                font-size: 14px !important;
                padding: 8px 14px !important;
                white-space: nowrap !important;
            }

            html.solera-a11y-extra-large-text .nav-links a {
                font-size: 13px !important;
                padding: 6px 12px !important;
                white-space: nowrap !important;
            }

            /* Keep logo at reasonable size */
            html.solera-a11y-increased-text .logo,
            html.solera-a11y-extra-large-text .logo {
                font-size: 24px !important;
            }

            /* Adjust GET QUOTE button */
            html.solera-a11y-increased-text .btn-primary {
                font-size: 12px !important;
                padding: 14px 24px !important;
            }

            html.solera-a11y-extra-large-text .btn-primary {
                font-size: 11px !important;
                padding: 12px 20px !important;
            }

            /* Mobile menu adjustments for larger text */
            @media (max-width: 1200px) {
                html.solera-a11y-extra-large-text .nav-links {
                    display: none !important;
                }
                
                html.solera-a11y-extra-large-text .mobile-menu-toggle {
                    display: block !important;
                }
            }

            @media (max-width: 1400px) {
                html.solera-a11y-increased-text .nav-links {
                    display: none !important;
                }
                
                html.solera-a11y-increased-text .mobile-menu-toggle {
                    display: block !important;
                }
            }

            /* Ensure container doesn't overflow */
            html.solera-a11y-increased-text .container,
            html.solera-a11y-extra-large-text .container {
                padding: 0 30px !important;
            }

            /* Header height adjustments */
            html.solera-a11y-increased-text header,
            html.solera-a11y-extra-large-text header {
                min-height: auto !important;
            }

            /* Reset font-size for toolbar elements to prevent scaling */
            html.solera-a11y-increased-text .solera-accessibility-toolbar,
            html.solera-a11y-increased-text .solera-accessibility-toolbar *,
            html.solera-a11y-increased-text .solera-accessibility-toggle-btn,
            html.solera-a11y-increased-text .solera-accessibility-toggle-btn *,
            html.solera-a11y-extra-large-text .solera-accessibility-toolbar,
            html.solera-a11y-extra-large-text .solera-accessibility-toolbar *,
            html.solera-a11y-extra-large-text .solera-accessibility-toggle-btn,
            html.solera-a11y-extra-large-text .solera-accessibility-toggle-btn *,
            html.solera-a11y-decreased-text .solera-accessibility-toolbar,
            html.solera-a11y-decreased-text .solera-accessibility-toolbar *,
            html.solera-a11y-decreased-text .solera-accessibility-toggle-btn,
            html.solera-a11y-decreased-text .solera-accessibility-toggle-btn *,
            html.solera-a11y-extra-small-text .solera-accessibility-toolbar,
            html.solera-a11y-extra-small-text .solera-accessibility-toolbar *,
            html.solera-a11y-extra-small-text .solera-accessibility-toggle-btn,
            html.solera-a11y-extra-small-text .solera-accessibility-toggle-btn * {
                font-size: revert !important;
            }

            /* Specific toolbar font sizes to ensure they stay consistent */
            .solera-accessibility-toggle-btn {
                font-size: 20px !important;
            }
            
            .solera-a11y-title {
                font-size: 18px !important;
            }
            
            .solera-a11y-close {
                font-size: 14px !important;
            }
            
            .solera-a11y-section h3 {
                font-size: 16px !important;
            }
            
            .solera-a11y-option {
                font-size: 14px !important;
            }
            
            .solera-text-size-indicator {
                font-size: 14px !important;
            }
            html.solera-a11y-grayscale { filter: grayscale(100%) !important; }
            html.solera-a11y-high-contrast { filter: contrast(150%) brightness(1.2) !important; }
            html.solera-a11y-negative-contrast { filter: invert(1) hue-rotate(180deg) !important; }
            html.solera-a11y-light-background {
                background: #ffffff !important;
                color: #000000 !important;
            }
            html.solera-a11y-light-background * {
                background: inherit !important;
                color: inherit !important;
            }
            html.solera-a11y-links-underline a { text-decoration: underline !important; }
            html.solera-a11y-readable-font * { 
                font-family: 'Times New Roman', 'Times', serif !important; 
            }

            /* Exclude toolbar from accessibility effects */
            .solera-accessibility-toolbar, .solera-accessibility-toolbar *,
            .solera-accessibility-toggle-btn, .solera-accessibility-toggle-btn * {
                filter: none !important;
                -webkit-filter: none !important;
                isolation: isolate !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }

            /* Mobile Responsive Design */
            @media (max-width: 768px) {
                .solera-accessibility-toggle-btn {
                    right: 15px !important;
                    width: 44px !important;
                    height: 44px !important;
                    font-size: 18px !important;
                }

                .solera-accessibility-toolbar {
                    width: calc(100vw - 30px) !important;
                    right: -100vw !important;
                    top: 20px !important;
                    transform: none !important;
                    max-height: calc(100vh - 40px) !important;
                }
                
                .solera-accessibility-toolbar.open {
                    right: 15px !important;
                }
                
                .solera-a11y-header {
                    padding: 20px !important;
                }
                
                .solera-a11y-title {
                    font-size: 16px !important;
                    gap: 10px !important;
                }
                
                .solera-a11y-icon {
                    font-size: 20px !important;
                }
                
                .solera-a11y-content {
                    padding: 20px !important;
                    max-height: calc(100vh - 136px) !important;
                }
                
                .solera-a11y-section {
                    margin-bottom: 24px !important;
                }
                
                .solera-a11y-option {
                    padding: 14px 16px !important;
                    font-size: 15px !important;
                }
                
                .solera-a11y-button-group {
                    flex-direction: column !important;
                    gap: 8px !important;
                }
                
                .solera-a11y-button-group .solera-a11y-option {
                    width: 100% !important;
                    justify-content: flex-start !important;
                    text-align: left !important;
                }
                
                .solera-text-size-indicator {
                    align-self: center !important;
                    margin: 8px 0 !important;
                }
            }

            /* Extra small mobile screens */
            @media (max-width: 480px) {
                .solera-accessibility-toolbar {
                    width: calc(100vw - 20px) !important;
                }
                
                .solera-accessibility-toolbar.open {
                    right: 10px !important;
                }
                
                .solera-a11y-header {
                    padding: 16px !important;
                }
                
                .solera-a11y-title {
                    font-size: 15px !important;
                }
                
                .solera-a11y-content {
                    padding: 16px !important;
                }
                
                .solera-a11y-option {
                    padding: 12px 14px !important;
                    font-size: 14px !important;
                }
            }
        `;
    }

    setupPersistentEventListeners() {
        if (this.eventListenersAttached) return;

        const globalClickHandler = (e) => {
            if (!e.target) return;

            const toggleButton = e.target.closest('[data-solera-a11y-toggle]');
            if (toggleButton) {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
                return;
            }

            const closeButton = e.target.closest('[data-solera-a11y-close]');
            if (closeButton) {
                e.preventDefault();
                e.stopPropagation();
                this.close();
                return;
            }

            const actionButton = e.target.closest('[data-solera-a11y-action]');
            if (actionButton) {
                e.preventDefault();
                const action = actionButton.getAttribute('data-solera-a11y-action');
                this.handleAction(action);
                return;
            }

            const toolbar = document.querySelector('[data-solera-a11y-toolbar]');
            const mainToggleButton = document.querySelector('[data-solera-a11y-toggle]');
            if (this.isOpen && toolbar && mainToggleButton && 
                !toolbar.contains(e.target) && !mainToggleButton.contains(e.target)) {
                this.close();
            }
        };

        const globalKeyHandler = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };

        document.addEventListener('click', globalClickHandler, true);
        document.addEventListener('keydown', globalKeyHandler, true);

        const observer = new MutationObserver(() => {
            if (!document.querySelector('#soleraAccessibilityToggle')) {
                this.createToggleButton();
            }
            if (!document.querySelector('#solera-accessibility-toolbar')) {
                this.createToolbar();
            }
            this.ensureToolbarVisibility();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        window.addEventListener('resize', () => this.handleResize());

        this.globalClickHandler = globalClickHandler;
        this.globalKeyHandler = globalKeyHandler;
        this.mutationObserver = observer;
        this.eventListenersAttached = true;
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        const toolbar = document.getElementById('solera-accessibility-toolbar');
        if (!toolbar) {
            this.createToolbar();
            return this.open();
        }

        this.isOpen = true;
        toolbar.classList.add('open');
        this.ensureToolbarVisibility();
    }

    close() {
        const toolbar = document.getElementById('solera-accessibility-toolbar');
        if (!toolbar) return;

        this.isOpen = false;
        toolbar.classList.remove('open');
    }

    handleAction(action) {
        switch (action) {
            case 'increaseText':
                if (this.settings.textSize === 'normal') this.settings.textSize = 'large';
                else if (this.settings.textSize === 'large') this.settings.textSize = 'extra-large';
                else if (this.settings.textSize === 'small') this.settings.textSize = 'normal';
                else if (this.settings.textSize === 'extra-small') this.settings.textSize = 'small';
                break;
            case 'decreaseText':
                if (this.settings.textSize === 'normal') this.settings.textSize = 'small';
                else if (this.settings.textSize === 'small') this.settings.textSize = 'extra-small';
                else if (this.settings.textSize === 'large') this.settings.textSize = 'normal';
                else if (this.settings.textSize === 'extra-large') this.settings.textSize = 'large';
                break;
            case 'grayscale':
                this.settings.grayscale = !this.settings.grayscale;
                break;
            case 'highContrast':
                this.settings.highContrast = !this.settings.highContrast;
                break;
            case 'negativeContrast':
                this.settings.negativeContrast = !this.settings.negativeContrast;
                break;
            case 'lightBackground':
                this.settings.lightBackground = !this.settings.lightBackground;
                break;
            case 'linksUnderline':
                this.settings.linksUnderline = !this.settings.linksUnderline;
                break;
            case 'readableFont':
                this.settings.readableFont = !this.settings.readableFont;
                break;
            case 'reset':
                this.resetAll();
                break;
        }

        this.saveSettings();
        this.applySettings();
        this.updateUI();
        this.ensureToolbarVisibility();
    }

    applySettings() {
        this.applyTextSize();
        this.applyGrayscale();
        this.applyHighContrast();
        this.applyNegativeContrast();
        this.applyLightBackground();
        this.applyLinksUnderline();
        this.applyReadableFont();
        this.ensureToolbarVisibility();
    }

    applyTextSize() {
        const html = document.documentElement;
        
        // Remove all text size classes first
        html.classList.remove(
            'solera-a11y-increased-text',
            'solera-a11y-decreased-text',
            'solera-a11y-extra-large-text',
            'solera-a11y-extra-small-text'
        );

        // Apply the appropriate class based on current setting
        if (this.settings.textSize === 'large') {
            html.classList.add('solera-a11y-increased-text');
            console.log('Applied large text size');
        } else if (this.settings.textSize === 'extra-large') {
            html.classList.add('solera-a11y-extra-large-text');
            console.log('Applied extra-large text size');
        } else if (this.settings.textSize === 'small') {
            html.classList.add('solera-a11y-decreased-text');
            console.log('Applied small text size');
        } else if (this.settings.textSize === 'extra-small') {
            html.classList.add('solera-a11y-extra-small-text');
            console.log('Applied extra-small text size');
        } else {
            console.log('Applied normal text size (no class)');
        }

        // Update the indicator
        const indicator = document.getElementById('soleraTextSizeDisplay');
        if (indicator) {
            indicator.textContent = this.getTextSizeLabel();
        }

        // Force a style recalculation
        document.body.offsetHeight;
    }

    applyGrayscale() {
        document.documentElement.classList.toggle('solera-a11y-grayscale', this.settings.grayscale);
        this.ensureToolbarVisibility();
    }

    applyHighContrast() {
        document.documentElement.classList.toggle('solera-a11y-high-contrast', this.settings.highContrast);
        this.ensureToolbarVisibility();
    }

    applyNegativeContrast() {
        document.documentElement.classList.toggle('solera-a11y-negative-contrast', this.settings.negativeContrast);
        this.ensureToolbarVisibility();
    }

    applyLightBackground() {
        document.documentElement.classList.toggle('solera-a11y-light-background', this.settings.lightBackground);
        this.ensureToolbarVisibility();
    }

    applyLinksUnderline() {
        document.documentElement.classList.toggle('solera-a11y-links-underline', this.settings.linksUnderline);
    }

    applyReadableFont() {
        document.documentElement.classList.toggle('solera-a11y-readable-font', this.settings.readableFont);
    }

    ensureToolbarVisibility() {
        setTimeout(() => {
            const toolbar = document.getElementById('solera-accessibility-toolbar');
            const toggleBtn = document.getElementById('soleraAccessibilityToggle');

            if (toolbar) {
                toolbar.style.cssText += ' filter: none !important; -webkit-filter: none !important; isolation: isolate !important; visibility: visible !important; opacity: 1 !important; pointer-events: auto !important;';
            }

            if (toggleBtn) {
                toggleBtn.style.cssText += ' filter: none !important; -webkit-filter: none !important; isolation: isolate !important; visibility: visible !important; opacity: 1 !important; pointer-events: auto !important;';
            }
        }, 50);
    }

    getTextSizeLabel() {
        switch (this.settings.textSize) {
            case 'extra-small': return 'XS';
            case 'small': return 'S';
            case 'normal': return 'M';
            case 'large': return 'L';
            case 'extra-large': return 'XL';
            default: return 'M';
        }
    }

    updateUI() {
        const options = document.querySelectorAll('.solera-a11y-option');
        options.forEach(option => {
            const action = option.getAttribute('data-solera-a11y-action');
            let isActive = false;

            switch (action) {
                case 'increaseText':
                    isActive = this.settings.textSize === 'large' || this.settings.textSize === 'extra-large';
                    break;
                case 'decreaseText':
                    isActive = this.settings.textSize === 'small' || this.settings.textSize === 'extra-small';
                    break;
                case 'grayscale':
                    isActive = this.settings.grayscale;
                    break;
                case 'highContrast':
                    isActive = this.settings.highContrast;
                    break;
                case 'negativeContrast':
                    isActive = this.settings.negativeContrast;
                    break;
                case 'lightBackground':
                    isActive = this.settings.lightBackground;
                    break;
                case 'linksUnderline':
                    isActive = this.settings.linksUnderline;
                    break;
                case 'readableFont':
                    isActive = this.settings.readableFont;
                    break;
            }

            option.classList.toggle('active', isActive);
        });

        const textSizeDisplay = document.getElementById('soleraTextSizeDisplay');
        if (textSizeDisplay) {
            textSizeDisplay.textContent = this.getTextSizeLabel();
        }
    }

    saveSettings() {
        Object.keys(this.settings).forEach(key => {
            localStorage.setItem(`solera-a11y-${key}`, this.settings[key]);
        });
    }

    resetAll() {
        this.settings = {
            textSize: 'normal',
            grayscale: false,
            highContrast: false,
            negativeContrast: false,
            lightBackground: false,
            linksUnderline: false,
            readableFont: false
        };

        Object.keys(this.settings).forEach(key => {
            localStorage.removeItem(`solera-a11y-${key}`);
        });

        const html = document.documentElement;
        html.classList.remove(
            'solera-a11y-increased-text',
            'solera-a11y-decreased-text',
            'solera-a11y-extra-large-text',
            'solera-a11y-extra-small-text',
            'solera-a11y-grayscale',
            'solera-a11y-high-contrast',
            'solera-a11y-negative-contrast',
            'solera-a11y-light-background',
            'solera-a11y-links-underline',
            'solera-a11y-readable-font'
        );

        this.applySettings();
        this.updateUI();
    }

    handleResize() {
        // Handle any resize-specific logic if needed
        this.ensureToolbarVisibility();
    }

    destroy() {
        if (this.globalClickHandler) {
            document.removeEventListener('click', this.globalClickHandler, true);
        }
        if (this.globalKeyHandler) {
            document.removeEventListener('keydown', this.globalKeyHandler, true);
        }
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }

        const toolbar = document.getElementById('solera-accessibility-toolbar');
        if (toolbar) toolbar.remove();

        const toggleButton = document.getElementById('soleraAccessibilityToggle');
        if (toggleButton) toggleButton.remove();

        const styles = document.getElementById('solera-accessibility-toolbar-styles');
        if (styles) styles.remove();

        this.eventListenersAttached = false;
        this.isInitialized = false;
    }
}

// Initialize the Solera accessibility toolbar
window.soleraAccessibilityToolbar = new SoleraAccessibilityToolbar();

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  console.log('🚀 Function called');
  console.log('📝 Path:', event.path);
  
  try {
    await connectDB();
    
    // ✅ FIXED: Extract slug from path instead of query parameters
    // Path will be: /post/welcome-to-solera-cask-stories
    const pathParts = event.path.split('/');
    const slug = pathParts[2]; // /post/SLUG -> pathParts[2]
    
    console.log('🔍 Looking for slug:', slug);
    
    if (!slug) {
      console.log('❌ No slug provided');
      return { 
        statusCode: 404, 
        headers: { 'Content-Type': 'text/html' },
        body: '<h1>Post not found</h1><p>No slug provided</p><p><a href="/blog">← Back to Blog</a></p>' 
      };
    }
    
    // Get all posts and log them
    const posts = await Post.find({ status: 'published' });
    console.log('📊 Found', posts.length, 'published posts');
    
    if (posts.length === 0) {
      console.log('⚠️ No published posts found in database');
      return { 
        statusCode: 404, 
        headers: { 'Content-Type': 'text/html' },
        body: '<h1>Post not found</h1><p>No published posts in database</p><p><a href="/blog">← Back to Blog</a></p>' 
      };
    }
    
    // Log all available slugs for debugging
    const availablePosts = posts.map(p => ({
      id: p.id,
      title: p.title,
      slug: createPostSlug(p),
      status: p.status
    }));
    
    console.log('📋 Available posts and slugs:');
    availablePosts.forEach(p => {
      console.log(`  - "${p.title}" -> slug: "${p.slug}" (id: ${p.id}, status: ${p.status})`);
    });
    
    const post = posts.find(p => createPostSlug(p) === slug);
    
    if (!post) {
      console.log('❌ Post not found for slug:', slug);
      return { 
        statusCode: 404, 
        headers: { 'Content-Type': 'text/html' },
        body: `<h1>Post not found</h1>
               <p>Looking for slug: <strong>${slug}</strong></p>
               <p>Available slugs:</p>
               <ul>${availablePosts.map(p => `<li><strong>${p.slug}</strong> - ${p.title}</li>`).join('')}</ul>
               <p><a href="/blog">← Back to Blog</a></p>` 
      };
    }
    
    console.log('✅ Found post:', post.title);
    
    // Generate the complete HTML with proper meta tags
    const html = generatePostHTML(post);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*'
      },
      body: html
    };
    
  } catch (error) {
    console.error('💥 Function error:', error);
    return { 
      statusCode: 500, 
      headers: { 'Content-Type': 'text/html' },
      body: `<h1>Internal Server Error</h1>
             <p>Error: ${error.message}</p>
             <p>Stack: ${error.stack}</p>
             <p><a href="/blog">← Back to Blog</a></p>` 
    };
  }
};