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
        
        const featuredPost = await this.getFeaturedPost();
        
        if (!featuredPost) {
            console.log('No featured post found, keeping default content');
            return;
        }

        console.log('Featured post found:', featuredPost.title);

        // Find the featured story section
        const storySection = document.querySelector('#story');
        if (!storySection) {
            console.error('Featured story section (#story) not found');
            return;
        }

        // Create post URL
        const postSlug = this.createPostSlug(featuredPost);
        const postUrl = `/post/${postSlug}`;
        
        console.log('Generated post URL:', postUrl, 'for post:', featuredPost.title);

        // Get existing elements
        const storyImage = storySection.querySelector('.story-image img');
        const sectionLabel = storySection.querySelector('.section-label');
        const title = storySection.querySelector('h2');
        const subtitle = storySection.querySelector('.story-subtitle');
        const paragraphs = storySection.querySelectorAll('p:not(.story-subtitle)');
        const ctaButton = storySection.querySelector('.btn-outline');

        // Update image
        if (storyImage && featuredPost.featuredImage) {
            storyImage.src = featuredPost.featuredImage;
            storyImage.alt = `${featuredPost.title} - Featured Story`;
            console.log('Updated featured image');
        }

        // Update section label
        if (sectionLabel) {
            sectionLabel.textContent = `Featured ${featuredPost.type}`;
            console.log('Updated section label');
        }

        // Update title
        if (title) {
            title.textContent = featuredPost.title;
            console.log('Updated title');
        }

        // Update subtitle
        if (subtitle) {
            subtitle.textContent = this.extractSubtitle(featuredPost);
            console.log('Updated subtitle');
        }

        // Update content paragraphs
        if (paragraphs.length >= 2) {
            const contentPreview = this.formatContentPreview(featuredPost);
            paragraphs[0].textContent = contentPreview.first;
            paragraphs[1].textContent = contentPreview.second;
            console.log('Updated content paragraphs');
        }

        // Update CTA button
        if (ctaButton) {
            ctaButton.href = postUrl;
            ctaButton.textContent = 'Read Full Story';
            
            // Remove any existing event listeners that might interfere
            ctaButton.removeAttribute('onclick');
            
            // Clone the button to remove all existing event listeners
            const newButton = ctaButton.cloneNode(true);
            ctaButton.parentNode.replaceChild(newButton, ctaButton);
            
            // Add fresh click handler
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Button clicked, navigating to:', postUrl);
                window.location.href = postUrl;
            });
            
            console.log('Updated CTA button with URL:', postUrl);
        }

        console.log('Featured story section updated successfully!');
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