// ═══════════════════════════════════════════════════════════════════════════
// story-section.js  —  replaces homepage-featured-integration.js entirely.
// Keep the same filename; this file is a drop-in replacement.
//
// What's new vs the original:
//   • Fetches all public posts alongside the featured post (parallel)
//   • Injects additional story cards into the horizontal track
//   • IntersectionObserver uses the scroll track as root (correct for
//     horizontal scroll — fires as cards enter the track's visible area)
//   • translateX start value is smaller on mobile (32px vs 72px)
//   • Dot indicator: generated, updated on scroll, clickable
// ═══════════════════════════════════════════════════════════════════════════

class SoleraHomepageIntegration {
    constructor() {
        this.API_BASE = (
            window.location.hostname.includes('localhost') ||
            window.location.hostname.includes('127.0.0.1')
        )
            ? '/api'                  // local dev
            : '/.netlify/functions'; // production
    }

    // ── API ───────────────────────────────────────────────────────────────

    async getFeaturedPost() {
        try {
            const r = await fetch(`${this.API_BASE}/featured-post`);
            if (!r.ok) return null;
            return r.json();
        } catch {
            return null;
        }
    }

    async getPublicPosts(limit = 6) {
        try {
            const r = await fetch(`${this.API_BASE}/posts-public?limit=${limit}`);
            if (!r.ok) return [];
            const data = await r.json();
            // Handle both a plain array and a { posts: [] } envelope
            return Array.isArray(data) ? data : (data.posts ?? []);
        } catch {
            return [];
        }
    }

    // ── Slug / URL ────────────────────────────────────────────────────────

    makeSlug(post) {
        if (post.slug) return post.slug;
        return (post.title || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    makeUrl(post) {
        return `/post/${this.makeSlug(post)}`;
    }

    // ── Text helpers ──────────────────────────────────────────────────────

    extractSubtitle(post) {
        if (post.excerpt?.length > 0) {
            return post.excerpt.length > 90
                ? post.excerpt.slice(0, 90) + '…'
                : post.excerpt;
        }
        const map = {
            Partnership:    'Family, Tradition, and a dedication to Craft',
            Education:      'Mastering the Art of Sherry Barrel Aging',
            'Tasting Notes':'Exceptional Flavours from Historic Solera Systems',
            Stories:        'Heritage Stories from Jerez de la Frontera',
        };
        return map[post.type] || 'Premium Sherry Barrels from Spain';
    }

    formatContentPreview(post) {
        const raw = (post.content || post.contentHtml || '')
            .replace(/<[^>]*>/g, '')
            .replace(/[#*`]/g, '');
        const sentences = raw.split(/[.!?]+/).filter(s => s.trim().length > 20);
        return {
            first:  sentences[0] ? sentences[0].trim() + '.' : 'Discover exceptional sherry barrels from our historic solera systems in Jerez de la Frontera.',
            second: sentences[1] ? sentences[1].trim() + '.' : 'Centuries-old traditions meet modern craft distilling excellence.',
        };
    }

    // ── Image reveal ──────────────────────────────────────────────────────

    revealImage(img) {
        if (!img) return;
        const show = () => { img.style.opacity = '1'; };
        img.complete ? show() : img.addEventListener('load', show, { once: true });
        img.addEventListener('error', show, { once: true });
    }

    // ── Update the first (featured) card ──────────────────────────────────

    updateFeaturedCard(post) {
        const el = id => document.getElementById(id);
        const img = el('featuredStoryImg');

        if (!post) {
            this.revealImage(img);
            return;
        }

        const url     = this.makeUrl(post);
        const preview = this.formatContentPreview(post);

        if (img && post.featuredImage) {
            img.src = post.featuredImage;
            img.alt = post.title;
        }
        this.revealImage(img);

        const set = (id, text) => { const e = el(id); if (e) e.textContent = text; };
        set('featuredStoryLabel',    `Featured ${post.type || 'Story'}`);
        set('featuredStoryTitle',    post.title);
        set('featuredStorySubtitle', this.extractSubtitle(post));
        set('featuredStoryP1',       preview.first);
        set('featuredStoryP2',       preview.second);

        const cta = el('featuredStoryCta');
        if (cta) { cta.href = url; cta.textContent = 'Read Full Story'; }
    }

    // ── Build card HTML string ─────────────────────────────────────────────

    buildCardHTML(post) {
        const url      = this.makeUrl(post);
        const preview  = this.formatContentPreview(post);
        const subtitle = this.extractSubtitle(post);
        const imgSrc   = post.featuredImage || '';
        const imgAlt   = post.title || '';

        return `
            <div class="story-card-image">
                <img src="${imgSrc}"
                     alt="${imgAlt}"
                     style="opacity: 0; transition: opacity 0.5s ease;">
            </div>
            <div class="story-card-content">
                <div class="section-label">Featured ${post.type || 'Story'}</div>
                <h2>${post.title || ''}</h2>
                <p class="story-subtitle">${subtitle}</p>
                <p>${preview.first}</p>
                <p>${preview.second}</p>
                <a href="${url}" class="btn-outline">Read Full Story</a>
            </div>`;
    }

    // ── Inject additional story cards ──────────────────────────────────────

    injectAdditionalStories(posts, featuredId) {
        const track = document.getElementById('storiesTrack');
        if (!track || !posts.length) return;

        // Exclude the featured post to avoid duplication
        const others = posts.filter(p =>
            p._id !== featuredId && p.id !== featuredId
        );
        if (others.length === 0) return;

        // Show "scroll for more" hint on desktop
        const hint = document.getElementById('storyScrollHint');
        if (hint) requestAnimationFrame(() => hint.classList.add('visible'));

        others.forEach((post, i) => {
            // Vertical divider
            const divider = document.createElement('div');
            divider.className = 'story-divider';
            track.appendChild(divider);
            requestAnimationFrame(() => divider.classList.add('visible'));

            // Story card — starts off-screen-right
            const card = document.createElement('div');
            card.className = 'story-card story-incoming';
            // Staggered transition delay (only affects the reveal speed, not when it fires)
            card.style.transitionDelay = `${i * 120}ms`;
            card.innerHTML = this.buildCardHTML(post);
            track.appendChild(card);

            // Reveal image
            this.revealImage(card.querySelector('img'));

            // Observe with the track as root (correct for horizontal scroll)
            this.observeCardInTrack(card, track);
        });
    }

    // ── IntersectionObserver: fires relative to the scroll track ──────────

    observeCardInTrack(card, track) {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Small pause so the user registers the "incoming" position
                        setTimeout(() => card.classList.add('revealed'), 60);
                        obs.unobserve(card);
                    }
                });
            },
            {
                // Using the track as root means the observer fires the moment the
                // card's left edge enters the track's scrollable viewport — correct
                // for horizontal scroll (vs the page viewport which ignores x-axis)
                root: track,
                // Fire when 10% of the card is visible inside the track
                threshold: 0.10,
                // Small negative right margin so the animation starts just before
                // the card is fully in view, giving a natural overlap
                rootMargin: '0px -40px 0px 0px',
            }
        );
        obs.observe(card);
    }

    // ── Dot indicator ──────────────────────────────────────────────────────

    buildDots(totalCards) {
        const dotsContainer = document.getElementById('storyDots');
        const track         = document.getElementById('storiesTrack');
        if (!dotsContainer || !track || totalCards < 2) return;

        // Generate one dot per card
        for (let i = 0; i < totalCards; i++) {
            const dot = document.createElement('button');
            dot.className = 'story-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Story ${i + 1}`);

            // Click: scroll the track to that card's position
            dot.addEventListener('click', () => {
                const cards = track.querySelectorAll('.story-card');
                if (cards[i]) {
                    cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
                }
            });

            dotsContainer.appendChild(dot);
        }

        // Update active dot as the user scrolls
        track.addEventListener('scroll', () => {
            this.updateActiveDot(track, dotsContainer);
        }, { passive: true });
    }

    updateActiveDot(track, dotsContainer) {
        const cards = Array.from(track.querySelectorAll('.story-card'));
        const dots  = Array.from(dotsContainer.querySelectorAll('.story-dot'));
        if (!cards.length || !dots.length) return;

        // Find the card whose left edge is closest to the track's scroll position
        const scrollLeft = track.scrollLeft;
        let closestIndex = 0;
        let closestDist  = Infinity;

        cards.forEach((card, i) => {
            const dist = Math.abs(card.offsetLeft - scrollLeft);
            if (dist < closestDist) { closestDist = dist; closestIndex = i; }
        });

        dots.forEach((dot, i) => dot.classList.toggle('active', i === closestIndex));
    }

    // ── Entry point ────────────────────────────────────────────────────────

    async init() {
        const run = async () => {
            // Fetch featured post + all public posts in parallel
            const [featured, allPosts] = await Promise.all([
                this.getFeaturedPost(),
                this.getPublicPosts(6),
            ]);

            // 1. Update the hardcoded first card with live API data
            this.updateFeaturedCard(featured);

            // 2. Inject additional posts as sliding cards
            this.injectAdditionalStories(allPosts, featured?._id ?? featured?.id);

            // 3. Build dot indicator (counts all cards now in the DOM)
            const totalCards = document.querySelectorAll('#storiesTrack .story-card').length;
            this.buildDots(totalCards);
        };

        document.readyState === 'loading'
            ? document.addEventListener('DOMContentLoaded', run)
            : run();
    }
}

// Boot
const soleraHomepage = new SoleraHomepageIntegration();
soleraHomepage.init();

// Keep the same export surface as the original file
window.SoleraHomepageIntegration = SoleraHomepageIntegration;