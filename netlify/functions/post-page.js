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

        <div class="mobile-menu-overlay" id="mobileMenuOverlay">
            <div class="mobile-menu-content">
                <a href="/#heritage" class="mobile-menu-item">Heritage</a>
                <a href="/#products" class="mobile-menu-item">Casks</a>
                <a href="/#product-finder" class="mobile-menu-item">Sherry Barrel Butler</a>
                <a href="/blog" class="mobile-menu-item">Stories</a>
                <a href="/#contact" class="mobile-menu-item mobile-cta">Get Quote</a>
            </div>
        </div>
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
    <script src="/js/script.js"></script>   
    <script src="js/solera-accessibility.js"></script>
    <script>
        // Minimal JavaScript for mobile menu only
        document.getElementById('mobileMenuToggle')?.addEventListener('click', function() {
            // Add mobile menu functionality if needed
        });
    </script>
</body>
</html>`;
}

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