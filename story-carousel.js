// =====================================================
// Story Carousel — add these methods to the
// SoleraHomepageIntegration class in
// homepage-featured-integration.js
//
// STEP 1: Paste the three methods below inside the class
//         (before the closing brace of the class body).
//
// STEP 2: In updateFeaturedStorySection(), replace the
//         two early-return points with the versions shown
//         at the bottom of this file.
// =====================================================


// ── METHOD 1: fetch posts for the carousel ──────────
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


// ── METHOD 2: build a card slide element ────────────
buildStoryCard(post) {
    const slug  = this.createPostSlug(post);
    const slide = document.createElement('a');
    slide.className = 'story-card-slide';
    slide.href = `/post/${slug}`;

    const raw   = (post.excerpt || '').trim();
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


// ── METHOD 3: wire up the carousel ──────────────────
async setupCarousel(featuredTitle = '') {
    const track = document.getElementById('storyTrack');
    if (!track) return;

    // Fetch and inject card slides
    const posts = await this.getOtherPosts(featuredTitle);
    posts.forEach(post => track.appendChild(this.buildStoryCard(post)));

    // ── DOM refs ──
    const section   = document.querySelector('.featured-story');
    const moreNav   = document.getElementById('storyMoreNav');
    const rightFade = document.getElementById('storyRightFade');
    const hoverZone = document.getElementById('storyHoverZone');

    if (!section) return;

    // No other posts → hide nav elements, nothing more to do
    if (posts.length === 0) {
        [moreNav, rightFade, hoverZone].forEach(el => {
            if (el) el.classList.add('sc-hidden');
        });
        return;
    }

    let currentIndex = 0;

    // Inject back nav into the section
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

    // Inject left fade into the section
    const leftFade = document.createElement('div');
    leftFade.className = 'story-left-fade';
    section.appendChild(leftFade);

    // ── Core scroll function ──
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

    // ── Click / keyboard handlers ──
    if (moreNav) {
        moreNav.addEventListener('click',   () => scrollTo(currentIndex + 1));
        moreNav.addEventListener('keydown', e => e.key === 'Enter' && scrollTo(currentIndex + 1));
    }
    backNav.addEventListener('click',   () => scrollTo(currentIndex - 1));
    backNav.addEventListener('keydown', e => e.key === 'Enter' && scrollTo(currentIndex - 1));

    // ── Hover zone: advance after a short pause ──
    let hoverTimer = null;
    if (hoverZone) {
        hoverZone.addEventListener('mouseenter', () => {
            hoverTimer = setTimeout(() => scrollTo(currentIndex + 1), 480);
        });
        hoverZone.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
    }
}


// =====================================================
// STEP 2 — changes to updateFeaturedStorySection()
//
// Find this block (around line 43):
//
//   if (!featuredPost) {
//       console.log('No featured post found, keeping default content');
//       revealImage(storyImage);
//       return;
//   }
//
// Replace it with:
//
//   if (!featuredPost) {
//       console.log('No featured post found, keeping default content');
//       revealImage(storyImage);
//       this.setupCarousel('');   // <-- ADD THIS LINE
//       return;
//   }
//
// ─────────────────────────────────────────────────────
//
// Then find the very last line of the method:
//
//   console.log('Featured story section updated successfully!');
//
// Add one line directly after it:
//
//   this.setupCarousel(featuredPost.title);  // <-- ADD THIS LINE
//
// =====================================================
