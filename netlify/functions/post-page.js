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
  const author = post.author || 'Solera Cask';
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
                ${author !== 'Solera Cask' ? `<div class="post-author">By ${author}</div>` : ''}
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
                <div class="footer-section footer-brand">
                    <h3>Solera Cask</h3>
                    <p class="brand-motto">Jerez de la Frontera, Spain</p>
                </div>
                <div class="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="/#heritage">About Solera Cask</a></li>
                        <li><a href="/blog.html">Blog</a></li>
                        <li><a href="/#contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-section footer-contact">
                    <h3>Contact Us</h3>
                    <ul>
                        <li><a href="mailto:info@soleracask.com">info@soleracask.com</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Solera Cask. Premium Sherry Barrels from Jerez de la Frontera, Spain.</p>
            </div>
        </div>
    </footer>

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