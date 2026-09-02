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
                .slice(0, 4);
        } catch (e) {
            console.error('Carousel: could not fetch posts', e);
            return [];
        }
    }

    // ── Carousel: resolve an image URL from any available field ──────────────
    resolvePostImage(post) {
        let imgSrc = post.featuredImage || post.seoImage || '';
        if (!imgSrc && post.contentHtml) {
            const m = post.contentHtml.match(/<img[^>]+src=(?:["']|&quot;)([^"'&\s>]+)/i);
            if (m) imgSrc = m[1];
        }
        if (!imgSrc && post.content) {
            const md = post.content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
            if (md) imgSrc = md[1];
        }
        if (!imgSrc) {
            const allText = [post.contentHtml, post.content, post.metaDescription, post.description].filter(Boolean).join(' ');
            const m = allText.match(/https?:\/\/res\.cloudinary\.com\/[^\s"'<>)]+/);
            if (m) imgSrc = m[0].replace(/&amp;/g, '&');
        }
        return imgSrc;
    }

    // ── Carousel: build the 2×2 grid slide ───────────────────────────────────
    buildStoryGridSlide(posts) {
        const slide = document.createElement('div');
        slide.className = 'story-grid-slide';

        const grid = document.createElement('div');
        grid.className = 'story-cards-grid';

        posts.slice(0, 3).forEach(post => {
            const slug   = this.createPostSlug(post);
            const card   = document.createElement('a');
            card.className = 'story-card';
            card.href    = `/post/${slug}`;

            const raw    = (post.excerpt || '').trim();
            const excerpt = raw.length > 90 ? raw.substring(0, 90) + '...' : raw;
            const imgSrc = this.resolvePostImage(post);

            card.innerHTML = `
                <div class="story-card-img">
                    ${imgSrc ? `<img src="${imgSrc}" alt="${post.title}" style="opacity:0;transition:opacity 0.4s ease;">` : ''}
                </div>
                <div class="story-card-body">
                    <div class="section-label">${post.type || 'Story'}</div>
                    <h3>${post.title}</h3>
                    ${excerpt ? `<p class="story-card-excerpt">${excerpt}</p>` : ''}
                </div>
            `;

            if (imgSrc) {
                const img = card.querySelector('img');
                if (img) {
                    const show = () => { img.style.opacity = '1'; };
                    if (img.complete) show();
                    else {
                        img.addEventListener('load',  show, { once: true });
                        img.addEventListener('error', show, { once: true });
                    }
                }
            }

            grid.appendChild(card);
        });

        slide.appendChild(grid);
        return slide;
    }

    // ── Carousel: wire up 2-state navigation (featured ↔ grid) ───────────────
    async setupCarousel(featuredTitle = '') {
        const track = document.getElementById('storyTrack');
        if (!track) return;

        const posts     = await this.getOtherPosts(featuredTitle);
        const section   = document.querySelector('.featured-story');
        const moreNav   = document.getElementById('storyMoreNav');
        const rightFade = document.getElementById('storyRightFade');
        const hoverZone = document.getElementById('storyHoverZone');

        if (!section) return;

        // No other posts — expand featured to full width, hide UI
        if (posts.length === 0) {
            [moreNav, rightFade, hoverZone].forEach(el => {
                if (el) el.classList.add('sc-hidden');
            });
            const featuredSlide = track.querySelector('.story-slide--featured');
            if (featuredSlide) featuredSlide.style.flex = '0 0 100%';
            return;
        }

        // Append the single 2×2 grid slide
        track.appendChild(this.buildStoryGridSlide(posts));

        // Inject back nav
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

        // Inject left fade
        const leftFade = document.createElement('div');
        leftFade.className = 'story-left-fade';
        section.appendChild(leftFade);

        // ── 2-state navigation ────────────────────────────────────────────────
        const goToGrid = () => {
            const featuredSlide = track.querySelector('.story-slide--featured');
            const scrollX = featuredSlide ? featuredSlide.offsetWidth : section.offsetWidth;
            track.style.transform = `translateX(-${scrollX}px)`;
            if (moreNav)   moreNav.classList.add('sc-hidden');
            if (rightFade) rightFade.classList.add('sc-hidden');
            backNav.classList.add('sc-visible');
            leftFade.classList.add('sc-visible');
        };

        const goToFeatured = () => {
            track.style.transform = 'translateX(0)';
            if (moreNav)   moreNav.classList.remove('sc-hidden');
            if (rightFade) rightFade.classList.remove('sc-hidden');
            backNav.classList.remove('sc-visible');
            leftFade.classList.remove('sc-visible');
        };

        if (moreNav) {
            moreNav.addEventListener('click',   goToGrid);
            moreNav.addEventListener('keydown', e => e.key === 'Enter' && goToGrid());
        }
        backNav.addEventListener('click',   goToFeatured);
        backNav.addEventListener('keydown', e => e.key === 'Enter' && goToFeatured());

        if (hoverZone) hoverZone.classList.add('sc-hidden');
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