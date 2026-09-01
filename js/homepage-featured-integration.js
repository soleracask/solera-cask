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

    // ── Carousel: build a card slide element ─────────────────────────────────
    buildStoryCard(post) {
        const slug  = this.createPostSlug(post);
        const slide = document.createElement('a');
        slide.className = 'story-card-slide';
        slide.href = `/post/${slug}`;

        const raw     = (post.excerpt || '').trim();
        const excerpt = raw.length > 110 ? raw.substring(0, 110) + '…' : raw;

        slide.innerHTML = `
            <div class="story-card-inner">
                <div class="story-card-img-wrap">
                    ${post.featuredImage
                        ? `<img src="${post.featuredImage}" alt="${post.title}" loading="lazy">`
                        : `<div style="height:220px;background:var(--warm-white);"></div>`}
                </div>
                <div class="story-card-label">${post.type || 'Story'}</div>
                <div class="story-card-title">${post.title}</div>
                ${excerpt ? `<p class="story-card-excerpt">${excerpt}</p>` : ''}
            </div>
        `;
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

        if (posts.length === 0) {
            [moreNav, rightFade, hoverZone].forEach(el => {
                if (el) el.classList.add('sc-hidden');
            });
            // Restore featured slide to full width — no cards to peek
            const featuredSlide = track.querySelector('.story-slide--featured');
            if (featuredSlide) featuredSlide.style.flex = '0 0 100%';
            return;
        }

        let currentIndex = 0;

        // Back nav
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

        // Left fade
        const leftFade = document.createElement('div');
        leftFade.className = 'story-left-fade';
        section.appendChild(leftFade);

        const scrollTo = (index) => {
            const slides = track.querySelectorAll('.story-slide--featured, .story-card-slide');
            if (index < 0 || index >= slides.length) return;
            currentIndex = index;

            let offset = 0;
            for (let i = 0; i < index; i++) offset += slides[i].offsetWidth;
            track.style.transform = `translateX(-${offset}px)`;

            const isFirst = index === 0;
            const isLast  = index >= slides.length - 1;

            if (moreNav)   moreNav.classList.toggle('sc-hidden', isLast);
            if (rightFade) rightFade.classList.toggle('sc-hidden', isLast);
            if (hoverZone) hoverZone.style.pointerEvents = isLast ? 'none' : 'auto';
            backNav.classList.toggle('sc-visible', !isFirst);
            leftFade.classList.toggle('sc-visible', !isFirst);
        };

        if (moreNav) {
            moreNav.addEventListener('click',   () => scrollTo(currentIndex + 1));
            moreNav.addEventListener('keydown', e => e.key === 'Enter' && scrollTo(currentIndex + 1));
        }
        backNav.addEventListener('click',   () => scrollTo(currentIndex - 1));
        backNav.addEventListener('keydown', e => e.key === 'Enter' && scrollTo(currentIndex - 1));

        let hoverTimer = null;
        if (hoverZone) {
            hoverZone.addEventListener('mouseenter', () => {
                hoverTimer = setTimeout(() => scrollTo(currentIndex + 1), 480);
            });
            hoverZone.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
        }
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