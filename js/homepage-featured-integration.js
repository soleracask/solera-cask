// Homepage Featured Story Integration
class SoleraHomepageIntegration {
    constructor() {
        this.API_BASE = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
            ? '/api' // Local development
            : '/.netlify/functions'; // Netlify production
    }

    // Fetch featured post from API
    async getFeaturedPost() {
        try {
            const response = await fetch(`${this.API_BASE}/featured-post`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('No featured post found, using default content');
                    return null;
                }
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching featured post:', error);
            return null;
        }
    }

    // Create post slug for URL
    createPostSlug(post) {
        return post.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    // Update the featured story section
    async updateFeaturedStorySection() {
        console.log('Starting featured post update...');
    
        // Grab the image reference early — before the async fetch
        const storySection = document.querySelector('#story');
        if (!storySection) {
            console.error('Featured story section (#story) not found');
            return;
        }
        const storyImage = storySection.querySelector('.story-image img');
    
        // Helper: reveal the image once it's ready (handles cached & uncached)
        const revealImage = (img) => {
            if (!img) return;
            const show = () => { img.style.opacity = '1'; };
            if (img.complete) {
                show();
            } else {
                img.addEventListener('load', show, { once: true });
                img.addEventListener('error', show, { once: true }); // show even on broken image
            }
        };
    
        const featuredPost = await this.getFeaturedPost();
    
        if (!featuredPost) {
            console.log('No featured post found, keeping default content');
            revealImage(storyImage); // reveal the hardcoded default
            this.setupCarousel('');
            return;
        }
    
        console.log('Featured post found:', featuredPost.title);
    
        // Create post URL
        const postSlug = this.createPostSlug(featuredPost);
        const postUrl = `/post/${postSlug}`;
    
        console.log('Generated post URL:', postUrl, 'for post:', featuredPost.title);
    
        // Get existing elements
        const sectionLabel = storySection.querySelector('.section-label');
        const title = storySection.querySelector('h2');
        const subtitle = storySection.querySelector('.story-subtitle');
        const paragraphs = storySection.querySelectorAll('p:not(.story-subtitle)');
        const ctaButton = storySection.querySelector('.btn-outline');
    
        // Update image
        if (storyImage && featuredPost.featuredImage) {
            storyImage.src = featuredPost.featuredImage;
            storyImage.alt = `${featuredPost.title} - Featured Story`;
            storyImage.style.cursor = 'pointer';
            storyImage.addEventListener('click', function() {
                window.location.href = postUrl;
            });
            console.log('Updated featured image');
        }
        revealImage(storyImage); // reveal after src is set (or if no featuredImage, reveal default)
    
        // Update section label
        if (sectionLabel) {
            sectionLabel.textContent = `Featured ${featuredPost.type}`;
        }
    
        // Update title
        if (title) {
            title.textContent = featuredPost.title;
        }
    
        // Update subtitle
        if (subtitle) {
            subtitle.textContent = this.extractSubtitle(featuredPost);
        }
    
        // Update content paragraphs
        if (paragraphs.length >= 2) {
            const contentPreview = this.formatContentPreview(featuredPost);
            paragraphs[0].textContent = contentPreview.first;
            paragraphs[1].textContent = contentPreview.second;
        }
    
        // Update CTA button
        if (ctaButton) {
            ctaButton.href = postUrl;
            ctaButton.textContent = 'Read Full Story';
            ctaButton.removeAttribute('onclick');
            const newButton = ctaButton.cloneNode(true);
            ctaButton.parentNode.replaceChild(newButton, ctaButton);
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = postUrl;
            });
        }
    
        console.log('Featured story section updated successfully!');
        this.setupCarousel(featuredPost.title);
    }

    // Extract subtitle from post data
    extractSubtitle(post) {
        if (post.excerpt && post.excerpt.length > 0) {
            return post.excerpt.length > 80 
                ? post.excerpt.substring(0, 80) + '...'
                : post.excerpt;
        }
        
        switch (post.type) {
            case 'Partnership':
                return 'Family, Tradition, and a dedication to Craft';
            case 'Education':
                return 'Mastering the Art of Sherry Barrel Aging';
            case 'Tasting Notes':
                return 'Exceptional Flavors from Historic Solera Systems';
            case 'Stories':
                return 'Heritage Stories from Jerez de la Frontera';
            default:
                return 'Premium Sherry Barrels from Spain';
        }
    }

    // Format content preview for homepage
    formatContentPreview(post) {
        let content = post.content || post.contentHtml || '';
        
        // Remove HTML tags if present
        content = content.replace(/<[^>]*>/g, '');
        
        // Remove markdown formatting
        content = content.replace(/[#*`]/g, '');
        
        // Split into sentences
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
        
        const first = sentences[0] 
            ? sentences[0].trim() + '.'
            : 'Discover exceptional sherry barrels from our historic solera systems in Jerez de la Frontera.';
            
        const second = sentences[1] 
            ? sentences[1].trim() + '.'
            : 'This collaboration showcases the transformative power of authentic Spanish cooperage, where centuries-old traditions meet modern craft excellence.';

        return { first, second };
    }

    // ── Carousel: fetch other posts ──────────────────────────────────────────
    async getOtherPosts(excludeTitle = '') {
        try {
            const response = await fetch(`${this.API_BASE}/posts-public`);
            if (!response.ok) return [];
            const data = await response.json();
            const posts = Array.isArray(data) ? data : (data.posts || []);
            return posts
                .filter(p => p.title !== excludeTitle && p.published !== false)
                .slice(0, 5);
        } catch (e) {
            console.error('Carousel: could not fetch posts', e);
            return [];
        }
    }

    // ── Carousel: build a card slide — same layout as the featured story ──────
    buildStoryCard(post) {
        const slug  = this.createPostSlug(post);
        const slide = document.createElement('a');
        slide.className = 'story-card-slide';
        slide.href = `/post/${slug}`;

        const raw     = (post.excerpt || '').trim();
        const excerpt = raw.length > 80 ? raw.substring(0, 80) + '...' : raw;

        // Try featuredImage → seoImage → first img in contentHtml → any Cloudinary URL in content
        let imgSrc = post.featuredImage || post.seoImage || '';
        if (!imgSrc && post.contentHtml) {
            // Match <img src="..."> or <img src='...'> or HTML entities &quot;
            const m = post.contentHtml.match(/<img[^>]+src=(?:["']|&quot;)([^"'&\s>]+)/i);
            if (m) imgSrc = m[1];
        }
        if (!imgSrc && post.content) {
            // Try markdown image syntax first
            const md = post.content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
            if (md) imgSrc = md[1];
        }
        if (!imgSrc) {
            // Last resort: any Cloudinary URL in any text field
            const allText = [post.contentHtml, post.content, post.metaDescription, post.description].filter(Boolean).join(' ');
            const m = allText.match(/https?:\/\/res\.cloudinary\.com\/[^\s"'<>)]+/);
            if (m) imgSrc = m[0].replace(/&amp;/g, '&');
        }
        console.log(`Carousel [${post.title}] — featuredImage: "${post.featuredImage}" | seoImage: "${post.seoImage}" | resolved: "${imgSrc}"`);



        // No .container wrapper — padding is on the slide element itself (see CSS)
        slide.innerHTML = `
            <div style="width:100%;">
                <div class="story-grid">
                    <div class="story-image ${imgSrc ? 'has-image' : ''}">
                        ${imgSrc
                            ? `<img src="${imgSrc}" alt="${post.title}" class="story-bg-image" style="opacity:0;transition:opacity 0.4s ease;">`
                            : ''}
                    </div>
                    <div class="story-content">
                        <div class="section-label">${post.type || 'Story'}</div>
                        <h2>${post.title}</h2>
                        ${excerpt ? `<p class="story-subtitle">${excerpt}</p>` : ''}
                        <span class="btn-outline" style="display:inline-block;">Read Full Story</span>
                    </div>
                </div>
            </div>
        `;

        // Fade the image in once loaded (same pattern as featured story)
        if (imgSrc) {
            const img = slide.querySelector('.story-bg-image');
            if (img) {
                const show = () => { img.style.opacity = '1'; };
                if (img.complete) show();
                else {
                    img.addEventListener('load',  show, { once: true });
                    img.addEventListener('error', show, { once: true });
                }
            }
        }

        return slide;
    }

    // ── Carousel: inject cards + wire up interactions ─────────────────────────
    async setupCarousel(featuredTitle = '') {
        const track = document.getElementById('storyTrack');
        if (!track) return;

        const posts = await this.getOtherPosts(featuredTitle);
        posts.forEach(post => track.appendChild(this.buildStoryCard(post)));

        const section   = document.querySelector('.featured-story');
        const moreNav   = document.getElementById('storyMoreNav');
        const rightFade = document.getElementById('storyRightFade');
        const hoverZone = document.getElementById('storyHoverZone');

        if (!section) return;

        // No other posts — restore full width and hide UI
        if (posts.length === 0) {
            [moreNav, rightFade, hoverZone].forEach(el => {
                if (el) el.classList.add('sc-hidden');
            });
            const featuredSlide = track.querySelector('.story-slide--featured');
            if (featuredSlide) featuredSlide.style.flex = '0 0 100%';
            return;
        }

        // ── Inject back nav ───────────────────────────────────────────────────
        const backNav = document.createElement('div');
        backNav.className = 'story-back-nav';
        backNav.setAttribute('role', 'button');
        backNav.setAttribute('tabindex', '0');
        backNav.setAttribute('aria-label', 'Back to featured story');
        backNav.innerHTML = `
            <svg class="story-back-arrow" viewBox="0 0 52 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="50" y1="10" x2="6" y2="10" stroke="currentColor" stroke-width="1"/>
                <polyline points="15,2 4,10 15,18" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>
            </svg>
            <span class="story-back-label">Back</span>
        `;
        section.appendChild(backNav);

        // ── Inject left fade ──────────────────────────────────────────────────
        const leftFade = document.createElement('div');
        leftFade.className = 'story-left-fade';
        section.appendChild(leftFade);

        // ── Scroll state ──────────────────────────────────────────────────────
        let scrollX  = 0;
        let speed    = 0;
        let rafId    = null;

        const getMaxScroll = () => {
            const slides = track.querySelectorAll('.story-slide--featured, .story-card-slide');
            const total  = Array.from(slides).reduce((sum, s) => sum + s.offsetWidth, 0);
            return Math.max(0, total - section.offsetWidth);
        };

        const updateNav = () => {
            const maxScroll = getMaxScroll();
            const atStart   = scrollX <= 0;
            const atEnd     = scrollX >= maxScroll - 1;

            if (moreNav)   moreNav.classList.toggle('sc-hidden', atEnd);
            if (rightFade) rightFade.classList.toggle('sc-hidden', atEnd);
            backNav.classList.toggle('sc-visible',  !atStart);
            leftFade.classList.toggle('sc-visible', !atStart);
        };

        // ── rAF scroll loop ───────────────────────────────────────────────────
        const tick = () => {
            if (speed !== 0) {
                const maxScroll = getMaxScroll();
                scrollX = Math.max(0, Math.min(maxScroll, scrollX + speed));
                track.style.transform = `translateX(-${scrollX}px)`;
                updateNav();
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        // ── Mouse-position–based speed ────────────────────────────────────────
        // Right 28% of section → scroll right (faster toward edge)
        // Left  12% of section → scroll left  (faster toward edge)
        const MAX_SPEED = 20; // px per frame at cursor edge (~900px/s at 60fps)

        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            const x    = e.clientX - rect.left;
            const w    = rect.width;

            const rightStart = w * 0.72;
            const leftEnd    = w * 0.12;

            if (x > rightStart) {
                const t = (x - rightStart) / (w - rightStart); // 0→1
                speed = t * MAX_SPEED;
            } else if (x < leftEnd && scrollX > 0) {
                const t = (leftEnd - x) / leftEnd; // 0→1
                speed = -t * MAX_SPEED;
            } else {
                speed = 0;
            }
        });

        section.addEventListener('mouseleave', () => { speed = 0; });

        // ── Click nav arrows: snap to nearest slide boundary ─────────────────
        const snapTo = (direction) => {
            const slides = Array.from(track.querySelectorAll('.story-slide--featured, .story-card-slide'));
            let offset = 0;
            for (const slide of slides) {
                const next = offset + slide.offsetWidth;
                if (direction > 0 && next > scrollX + 10) {
                    scrollX = Math.min(getMaxScroll(), next);
                    break;
                }
                if (direction < 0 && offset < scrollX - 10) {
                    // keep going to find the previous boundary
                }
                offset = next;
            }
            if (direction < 0) {
                // Find the slide boundary just before current scrollX
                let prev = 0;
                offset = 0;
                for (const slide of slides) {
                    if (offset + slide.offsetWidth >= scrollX - 10) break;
                    prev = offset;
                    offset += slide.offsetWidth;
                }
                scrollX = prev;
            }
            track.style.transform = `translateX(-${scrollX}px)`;
            updateNav();
        };

        if (moreNav) {
            moreNav.addEventListener('click',   () => snapTo(1));
            moreNav.addEventListener('keydown', e => e.key === 'Enter' && snapTo(1));
        }
        backNav.addEventListener('click',   () => snapTo(-1));
        backNav.addEventListener('keydown', e => e.key === 'Enter' && snapTo(-1));

        // Hide the now-redundant hover zone element
        if (hoverZone) hoverZone.classList.add('sc-hidden');

        updateNav();
    }

    // Initialize the integration
    async init() {
        console.log('Initializing homepage featured post integration...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('DOM loaded, updating featured story...');
                this.updateFeaturedStorySection();
            });
        } else {
            console.log('DOM already ready, updating featured story...');
            await this.updateFeaturedStorySection();
        }
    }
}

// Initialize homepage integration
console.log('Creating homepage integration instance...');
const soleraHomepage = new SoleraHomepageIntegration();
soleraHomepage.init();

// Export for use in other scripts
window.SoleraHomepageIntegration = SoleraHomepageIntegration;