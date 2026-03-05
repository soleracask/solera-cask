// =================================
// MOBILE MENU FUNCTIONALITY - FIXED
// =================================
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');

    function closeMobileMenu() {
        if (mobileMenuToggle && mobileMenuOverlay) {
            mobileMenuToggle.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    function toggleMobileMenu() {
        if (mobileMenuToggle && mobileMenuOverlay) {
            mobileMenuToggle.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
            
            if (mobileMenuOverlay.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        }
    }

    if (mobileMenuToggle && mobileMenuOverlay) {
        // Toggle menu on hamburger click
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        });

        // Close menu when clicking menu items
        mobileMenuItems.forEach(item => {
            item.addEventListener('click', function() {
                closeMobileMenu();
            });
        });

        // Close menu when clicking overlay background
        mobileMenuOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeMobileMenu();
            }
        });
        
        // Close menu with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenuOverlay.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mobileMenuOverlay.classList.contains('active') && 
                !mobileMenuOverlay.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close menu on window resize to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && mobileMenuOverlay.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    // =================================
    // HEADER SCROLL EFFECT
    // =================================
    const header = document.querySelector('header');
    if (header) {
        let ticking = false;

        function updateHeader() {
            const scrollY = window.scrollY;
            
            // Add scrolled class for styling changes
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick, { passive: true });
        updateHeader(); // Initialize header state
    }


// =================================
// HEADER OFFSET FIX FOR NAVIGATION - SIMPLE VERSION
// =================================
function handleHeaderOffset() {
    // Fixed height for scrolled header (logo height 50px + padding 12px*2 = ~74px)
    const scrolledHeaderHeight = 90; // Adjust this value based on your CSS
    const extraOffset = 40;
    
    // Handle all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const targetPosition = targetElement.offsetTop - scrolledHeaderHeight - extraOffset;
                
                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Handle direct URL with hash
    function handleHashOnLoad() {
        if (window.location.hash) {
            setTimeout(() => {
                const targetElement = document.querySelector(window.location.hash);
                if (targetElement) {
                    const targetPosition = targetElement.offsetTop - scrolledHeaderHeight - extraOffset;
                    
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }
            }, 500);
        }
    }
    
    // Handle hash changes
    window.addEventListener('hashchange', function() {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            const targetPosition = targetElement.offsetTop - scrolledHeaderHeight - extraOffset;
            
            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: 'smooth'
            });
        }
    });
    
    handleHashOnLoad();
}

// Initialize the header offset handler
handleHeaderOffset();

// Initialize the header offset handler
handleHeaderOffset();

    // =================================
    // FAQ FUNCTIONALITY
    // =================================
    const faqQuestions = document.querySelectorAll('.faq-question');
    const categoryCards = document.querySelectorAll('.faq-category-card');
    
    // FAQ Accordion
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const faqAnswer = faqItem.querySelector('.faq-answer');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Close all other FAQ items in the same category
            const categorySection = this.closest('.faq-category-section');
            if (categorySection) {
                const categoryQuestions = categorySection.querySelectorAll('.faq-question');
                categoryQuestions.forEach(otherQuestion => {
                    if (otherQuestion !== this) {
                        otherQuestion.setAttribute('aria-expanded', 'false');
                        const otherAnswer = otherQuestion.parentElement.querySelector('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.classList.remove('active');
                        }
                    }
                });
            }
            
            // Toggle current FAQ item
            if (isExpanded) {
                this.setAttribute('aria-expanded', 'false');
                if (faqAnswer) {
                    faqAnswer.classList.remove('active');
                }
            } else {
                this.setAttribute('aria-expanded', 'true');
                if (faqAnswer) {
                    faqAnswer.classList.add('active');
                }
            }
        });
    });
    
    // Category navigation
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            const targetSection = document.getElementById(category);
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Highlight the section briefly
                targetSection.style.background = 'var(--light-beige)';
                setTimeout(() => {
                    targetSection.style.background = '';
                }, 2000);
            }
        });
    });
    
    // Keyboard navigation for FAQ
    faqQuestions.forEach(question => {
        question.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // =================================
    // FAQ SEARCH FUNCTIONALITY
    // =================================
    const searchContainer = document.querySelector('.faq-nav-intro');
    if (searchContainer) {
        // Create search input
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search FAQs...';
        searchInput.className = 'faq-search';
        searchContainer.appendChild(searchInput);
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const faqItems = document.querySelectorAll('.faq-item');
            const categoryHeaders = document.querySelectorAll('.category-header');
            let hasVisibleItems = false;
            
            // If search is empty, show all items
            if (!searchTerm) {
                faqItems.forEach(item => {
                    item.style.display = '';
                });
                categoryHeaders.forEach(header => {
                    header.style.display = '';
                });
                // Remove no results message
                const noResultsMsg = document.querySelector('.no-results-message');
                if (noResultsMsg) {
                    noResultsMsg.remove();
                }
                return;
            }
            
            // Track which categories have visible items
            const categoriesWithResults = new Set();
            
            faqItems.forEach(item => {
                const questionElement = item.querySelector('.faq-question span');
                const answerElement = item.querySelector('.faq-content p');
                
                if (questionElement && answerElement) {
                    const questionText = questionElement.textContent.toLowerCase();
                    const answerText = answerElement.textContent.toLowerCase();
                    
                    if (questionText.includes(searchTerm) || answerText.includes(searchTerm)) {
                        item.style.display = '';
                        hasVisibleItems = true;
                        
                        // Track which category this item belongs to
                        const categorySection = item.closest('.faq-category-section');
                        if (categorySection) {
                            categoriesWithResults.add(categorySection.id);
                        }
                        
                        // Highlight search terms in question
                        highlightSearchTerm(questionElement, searchTerm);
                        
                        // Expand the question to show matching content
                        const question = item.querySelector('.faq-question');
                        const answer = item.querySelector('.faq-answer');
                        if (answerText.includes(searchTerm)) {
                            question.setAttribute('aria-expanded', 'true');
                            answer.classList.add('active');
                            // Highlight search terms in answer
                            highlightSearchTerm(answerElement, searchTerm);
                        }
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
            
            // Show/hide category headers based on whether they have visible items
            categoryHeaders.forEach(header => {
                const categorySection = header.closest('.faq-category-section');
                if (categorySection && categoriesWithResults.has(categorySection.id)) {
                    header.style.display = '';
                } else {
                    header.style.display = 'none';
                }
            });
            
            // Show "no results" message if nothing found
            showNoResultsMessage(!hasVisibleItems);
        });
        
        // Clear search functionality
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                this.dispatchEvent(new Event('input'));
                this.blur();
            }
        });
    }
    
    // =================================
    // SEARCH HELPER FUNCTIONS
    // =================================
    function highlightSearchTerm(element, searchTerm) {
        if (!element || !searchTerm) return;
        
        // Remove existing highlights
        element.innerHTML = element.textContent;
        
        const text = element.textContent;
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        const highlightedText = text.replace(regex, '<mark>$1</mark>');
        element.innerHTML = highlightedText;
    }
    
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    function showNoResultsMessage(show) {
        let noResultsMsg = document.querySelector('.no-results-message');
        
        if (show && !noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                    <h3 style="font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 16px; color: var(--text-primary);">No Results Found</h3>
                    <p style="font-size: 16px; margin-bottom: 24px;">We couldn't find any FAQs matching your search. Try different keywords or browse our categories above.</p>
                    <a href="index.html#contact" class="btn-outline">Contact Our Experts</a>
                </div>
            `;
            const faqContentSection = document.querySelector('.faq-content-section .container');
            if (faqContentSection) {
                faqContentSection.appendChild(noResultsMsg);
            }
        } else if (!show && noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    // =================================
    // FADE-IN ANIMATIONS
    // =================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });


    // =================================
    // NOTIFICATION SYSTEM
    // =================================
    function showNotification(title, type = 'info', message = '') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const backgroundColor = type === 'success' ? 'var(--warm-white)' : 
                               type === 'error' ? '#ffebee' : 'var(--warm-white)';
        const borderColor = type === 'success' ? 'var(--primary)' : 
                           type === 'error' ? '#ff4444' : 'var(--border)';
        const titleColor = type === 'success' ? 'var(--primary)' : 
                          type === 'error' ? '#d32f2f' : 'var(--text-primary)';
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${backgroundColor};
            border: 2px solid ${borderColor};
            box-shadow: 0 12px 48px rgba(160, 82, 45, 0.15);
            padding: 40px;
            border-radius: 0;
            z-index: 10001;
            text-align: center;
            max-width: 500px;
            font-family: 'Playfair Display', serif;
        `;
        
        notification.innerHTML = `
            <h3 style="font-size: 24px; margin-bottom: 16px; color: ${titleColor};">${title}</h3>
            ${message ? `<p style="color: var(--text-secondary); margin-bottom: 24px; line-height: 1.6;">${message}</p>` : ''}
            <button onclick="this.parentElement.remove()" style="background: var(--primary); color: var(--text-white); border: none; padding: 12px 24px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: background 0.3s ease;">Continue</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds if it's not a success message
        if (type !== 'success') {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    // =================================
    // ENHANCED INTERACTIONS
    // =================================
    
    // Enhanced card hover effects
    document.querySelectorAll('.sherry-card, .product-card, .faq-category-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = 'var(--shadow-strong)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'var(--shadow-subtle)';
        });
    });

    // Input focus effects
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderBottomColor = 'var(--primary)';
            this.style.borderBottomWidth = '2px';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderBottomColor = 'var(--border)';
            this.style.borderBottomWidth = '1px';
        });
    });

    // Logo hover enhancement
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        logo.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }

    console.log('Solera Cask website JavaScript loaded successfully');
    console.log('Mobile menu elements:', {
        toggle: !!mobileMenuToggle,
        overlay: !!mobileMenuOverlay,
        items: mobileMenuItems.length
    });
});

// =================================
// PRODUCT FINDER FUNCTIONALITY - WITH SELECTABLE BARRELS
// =================================

function getCurrentProduct() {
    const pathname = window.location.pathname.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    
    // 1. First check for product finder selection (highest priority)
    const finderProduct = sessionStorage.getItem('currentProductFinderSelection');
    if (finderProduct) {
        console.log('Product from finder:', finderProduct);
        return finderProduct.toLowerCase();
    }
    
    // 2. Check URL pathname for product-specific pages
    if (pathname.includes('tequila')) return 'tequila';
    if (pathname.includes('whisky') || pathname.includes('whiskey')) return 'whisky';
    if (pathname.includes('rum')) return 'rum';
    if (pathname.includes('vodka')) return 'vodka';
    if (pathname.includes('beer')) return 'beer';
    if (pathname.includes('gin')) return 'gin';
    if (pathname.includes('brandy')) return 'brandy';
    
    // 3. Check URL parameters
    const productParam = urlParams.get('product');
    if (productParam) return productParam.toLowerCase();
    
    // 4. Check sessionStorage for other selections
    const storedProduct = sessionStorage.getItem('selectedProduct');
    if (storedProduct) return storedProduct.toLowerCase();
    
    return null;
}

function detectProductFromInput(userInput) {
    const input = userInput.toLowerCase().trim();
    
    // Product detection patterns
    const productPatterns = {
        'tequila': ['tequila', 'añejo', 'reposado', 'blanco', 'agave'],
        'whisky': ['whisky', 'whiskey', 'scotch', 'bourbon', 'rye', 'single malt', 'blended'],
        'rum': ['rum', 'rhum', 'cachaça', 'aged rum', 'spiced rum', 'dark rum'],
        'vodka': ['vodka', 'potato vodka', 'grain vodka'],
        'beer': ['beer', 'ale', 'lager', 'stout', 'porter', 'ipa', 'wheat beer', 'pilsner', 'barleywine', 'saison', 'imperial stout'],
        'gin': ['gin', 'london dry', 'botanical gin'],
        'brandy': ['brandy', 'cognac', 'armagnac', 'calvados']
    };
    
    // Check for exact or partial matches
    for (const [product, patterns] of Object.entries(productPatterns)) {
        for (const pattern of patterns) {
            if (input.includes(pattern)) {
                console.log(`Detected product: ${product} from input: ${userInput}`);
                return product;
            }
        }
    }
    
    return null;
}

// MOVED OUTSIDE to make it globally accessible
let processSearch; // Declare globally

document.addEventListener('DOMContentLoaded', function() {
    
    // Product database with recommendations
    const productDatabase = {
        // Whisky
        'single malt whisky': {
            category: 'Whisky',
            page: '/whisky-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Oloroso',
                    badge: 'Top Choice',
                    description: 'Rich walnut, chocolate, and dried fruit complexity perfect for single malt maturation.',
                    flavors: 'Walnut • Dark Chocolate • Dried Figs'
                },
                {
                    type: 'Amontillado',
                    badge: 'Balanced',
                    description: 'Nutty elegance with toasted almond notes that complement malt character beautifully.',
                    flavors: 'Hazelnut • Toasted Almond • Caramel'
                },
                {
                    type: 'Pedro Ximénez',
                    badge: 'Premium',
                    description: 'Luxurious sweetness creating dessert-like expressions for special releases.',
                    flavors: 'Raisin • Dark Honey • Molasses'
                }
            ]
        },
        'blended whisky': {
            category: 'Whisky',
            page: '/whisky-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Amontillado',
                    badge: 'Versatile',
                    description: 'Balanced complexity that enhances without overpowering blended whisky character.',
                    flavors: 'Hazelnut • Light Caramel • Herbs'
                },
                {
                    type: 'Oloroso',
                    badge: 'Rich',
                    description: 'Adds depth and richness to create premium blended expressions.',
                    flavors: 'Walnut • Chocolate • Leather'
                }
            ]
        },
        'bourbon': {
            category: 'Whisky',
            page: '/whisky-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Oloroso',
                    badge: 'Finishing',
                    description: 'Perfect for finishing bourbon, adding Spanish complexity to American character.',
                    flavors: 'Dark Chocolate • Dried Fruit • Spice'
                },
                {
                    type: 'Pedro Ximénez',
                    badge: 'Sweet',
                    description: 'Creates indulgent bourbon expressions with rich sweetness.',
                    flavors: 'Dark Honey • Raisin • Toffee'
                }
            ]
        },
        'rye whiskey': {
            category: 'Whisky',
            page: '/whisky-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Amontillado',
                    badge: 'Spicy',
                    description: 'Complements rye spice with nutty complexity and balanced sweetness.',
                    flavors: 'Toasted Nuts • Spice • Caramel'
                },
                {
                    type: 'Oloroso',
                    badge: 'Bold',
                    description: 'Robust aging that matches rye\'s intensity with deep, rich flavors.',
                    flavors: 'Walnut • Leather • Dark Fruit'
                }
            ]
        },

        // Rum
        'aged rum': {
            category: 'Rum',
            page: '/rum-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Oloroso',
                    badge: 'Classic',
                    description: 'Traditional choice for aged rum, enhancing natural molasses richness.',
                    flavors: 'Dark Chocolate • Dried Fig • Leather'
                },
                {
                    type: 'Pedro Ximénez',
                    badge: 'Luxurious',
                    description: 'Creates ultra-premium rum expressions with intense sweetness and complexity.',
                    flavors: 'Raisin • Dark Honey • Molasses'
                },
                {
                    type: 'Amontillado',
                    badge: 'Elegant',
                    description: 'Balanced aging that adds sophistication without overwhelming rum character.',
                    flavors: 'Hazelnut • Light Caramel • Herbs'
                }
            ]
        },
        'white rum': {
            category: 'Rum',
            page: '/rum-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Fino',
                    badge: 'Subtle',
                    description: 'Gentle finishing that adds complexity while preserving clean rum character.',
                    flavors: 'Mineral • Green Almond • Saline'
                },
                {
                    type: 'Amontillado',
                    badge: 'Transitional',
                    description: 'Perfect for creating aged expressions from white rum base.',
                    flavors: 'Toasted Almond • Light Caramel • Herbs'
                }
            ]
        },
        'spiced rum': {
            category: 'Rum',
            page: '/rum-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Oloroso',
                    badge: 'Complementary',
                    description: 'Rich flavors that enhance spice complexity without competition.',
                    flavors: 'Walnut • Dark Chocolate • Warm Spice'
                },
                {
                    type: 'Pedro Ximénez',
                    badge: 'Indulgent',
                    description: 'Creates dessert-like spiced rum with incredible depth and sweetness.',
                    flavors: 'Dark Honey • Raisin • Molasses'
                }
            ]
        },

        // Tequila
        'añejo tequila': {
            category: 'Tequila',
            page: '/tequila-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Oloroso',
                    badge: 'Premium',
                    description: 'Perfect for añejo expressions, adding Spanish complexity to agave character.',
                    flavors: 'Walnut • Dark Chocolate • Leather'
                },
                {
                    type: 'Pedro Ximénez',
                    badge: 'Ultra-Premium',
                    description: 'Creates luxury tequila expressions with rich, dessert-like profiles.',
                    flavors: 'Raisin • Dark Honey • Molasses'
                },
                {
                    type: 'Amontillado',
                    badge: 'Balanced',
                    description: 'Sophisticated aging that enhances agave while adding nutty complexity.',
                    flavors: 'Hazelnut • Caramel • Herbs'
                }
            ]
        },
        'extra añejo tequila': {
            category: 'Tequila',
            page: '/tequila-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Oloroso',
                    badge: 'Extended Aging',
                    description: 'Ideal for long-term aging, developing incredible depth over years.',
                    flavors: 'Walnut • Dried Fig • Leather'
                },
                {
                    type: 'Palo Cortado',
                    badge: 'Rare',
                    description: 'Creates unique, complex tequila expressions with unmatched sophistication.',
                    flavors: 'Citrus Peel • Balsamic • Toffee'
                }
            ]
        },
        'reposado tequila': {
            category: 'Tequila',
            page: '/tequila-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Amontillado',
                    badge: 'Gentle',
                    description: 'Perfect for reposado aging, adding complexity without overpowering agave.',
                    flavors: 'Light Caramel • Toasted Almond • Herbs'
                },
                {
                    type: 'Fino',
                    badge: 'Delicate',
                    description: 'Subtle influence that preserves agave character while adding refinement.',
                    flavors: 'Mineral • Green Almond • Saline'
                }
            ]
        },

        // Vodka
        'vodka': {
            category: 'Vodka',
            page: '/vodka-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Fino',
                    badge: 'Gentle',
                    description: 'Minimal intervention aging that preserves vodka character while adding refinement.',
                    flavors: 'Mineral • Clean • Subtle'
                },
                {
                    type: 'Amontillado',
                    badge: 'Premium',
                    description: 'Short-term aging creates sophisticated premium vodka expressions.',
                    flavors: 'Light Caramel • Smooth • Elegant'
                }
            ]
        },
        'premium vodka': {
            category: 'Vodka',
            page: '/vodka-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Fino',
                    badge: 'Subtle',
                    description: 'Ultra-gentle finishing that adds sophistication without compromising purity.',
                    flavors: 'Mineral • Delicate Almond • Clean'
                },
                {
                    type: 'Amontillado',
                    badge: 'Complex',
                    description: 'Creates unique aged vodka expressions with remarkable smoothness.',
                    flavors: 'Light Caramel • Soft Nuts • Silk'
                }
            ]
        },

        // Gin
        'aged gin': {
            category: 'Gin',
            page: '/gin-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Fino',
                    badge: 'Botanical',
                    description: 'Preserves delicate botanical balance while adding Spanish sophistication.',
                    flavors: 'Mineral • Herbal • Clean'
                },
                {
                    type: 'Amontillado',
                    badge: 'Complex',
                    description: 'Creates sophisticated aged gin with beautiful botanical integration.',
                    flavors: 'Toasted Almond • Herbs • Caramel'
                }
            ]
        },
        'navy strength gin': {
            category: 'Gin',
            page: '/gin-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Oloroso',
                    badge: 'Bold',
                    description: 'Robust aging that matches navy strength intensity with rich complexity.',
                    flavors: 'Walnut • Spice • Dark Fruit'
                },
                {
                    type: 'Amontillado',
                    badge: 'Balanced',
                    description: 'Adds sophistication to high-proof gin without overwhelming botanicals.',
                    flavors: 'Nuts • Caramel • Herbs'
                }
            ]
        },

        // Beer Styles
        'beer': {
            category: 'Beer',
            page: '/beer-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Oloroso',
                    badge: 'Versatile',
                    description: 'Excellent for dark beer styles like stouts and porters, adding rich complexity.',
                    flavors: 'Dark Chocolate • Leather • Dried Fig'
                },
                {
                    type: 'Amontillado',
                    badge: 'Balanced',
                    description: 'Perfect for brown ales and Belgian styles, providing balanced nutty complexity.',
                    flavors: 'Hazelnut • Caramel • Spice'
                },
                {
                    type: 'Fino',
                    badge: 'Light',
                    description: 'Ideal for lighter beer styles, adding mineral notes while preserving character.',
                    flavors: 'Mineral • Herbal • Saline'
                }
            ]
        },
        'imperial stout': {
            category: 'Beer',
            page: '/beer-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Oloroso',
                    badge: 'Perfect Match',
                    description: 'Classic pairing - rich, robust flavors that complement stout intensity perfectly.',
                    flavors: 'Dark Chocolate • Leather • Dried Fig'
                },
                {
                    type: 'Pedro Ximénez',
                    badge: 'Dessert Style',
                    description: 'Creates indulgent pastry stout expressions with incredible sweetness.',
                    flavors: 'Raisin • Dark Honey • Molasses'
                },
                {
                    type: 'Amontillado',
                    badge: 'Elegant',
                    description: 'Adds complexity while maintaining drinkability in imperial stouts.',
                    flavors: 'Hazelnut • Caramel • Warmth'
                }
            ]
        },
        'barleywine': {
            category: 'Beer',
            page: '/beer-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Oloroso',
                    badge: 'Traditional',
                    description: 'Classic choice for barleywine aging, enhancing malt complexity beautifully.',
                    flavors: 'Walnut • Dark Fruit • Warmth'
                },
                {
                    type: 'Pedro Ximénez',
                    badge: 'Sweet',
                    description: 'Creates dessert-like barleywine with incredible richness and depth.',
                    flavors: 'Dark Honey • Raisin • Toffee'
                }
            ]
        },
        'saison': {
            category: 'Beer',
            page: '/beer-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Fino',
                    badge: 'Delicate',
                    description: 'Preserves saison character while adding Spanish minerality and complexity.',
                    flavors: 'Mineral • Herbal • Saline'
                },
                {
                    type: 'Manzanilla',
                    badge: 'Coastal',
                    description: 'Adds delicate brine and almond notes that enhance farmhouse character.',
                    flavors: 'Sea Salt • Green Almond • Herbs'
                }
            ]
        },
        'farmhouse ale': {
            category: 'Beer',
            page: '/beer-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Fino',
                    badge: 'Rustic',
                    description: 'Enhances farmhouse character with delicate minerality and herbal complexity.',
                    flavors: 'Mineral • Chamomile • Herbs'
                },
                {
                    type: 'Amontillado',
                    badge: 'Complex',
                    description: 'Adds sophisticated depth while preserving rustic farmhouse appeal.',
                    flavors: 'Toasted Almond • Light Caramel • Herbs'
                }
            ]
        },
        'belgian strong ale': {
            category: 'Beer',
            page: '/beer-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Amontillado',
                    badge: 'Balanced',
                    description: 'Perfect match for Belgian strong ales, adding nutty complexity and depth.',
                    flavors: 'Hazelnut • Caramel • Spice'
                },
                {
                    type: 'Oloroso',
                    badge: 'Rich',
                    description: 'Creates premium aged Belgian expressions with incredible complexity.',
                    flavors: 'Walnut • Dark Fruit • Leather'
                }
            ]
        },
        'brown ale': {
            category: 'Beer',
            page: '/beer-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Amontillado',
                    badge: 'Harmonious',
                    description: 'Complements brown ale maltiness with perfect nutty and caramel integration.',
                    flavors: 'Hazelnut • Caramel • Warmth'
                },
                {
                    type: 'Oloroso',
                    badge: 'Deep',
                    description: 'Adds rich complexity to create premium aged brown ale expressions.',
                    flavors: 'Walnut • Chocolate • Dried Fruit'
                }
            ]
        },
        'berliner weisse': {
            category: 'Beer',
            page: '/beer-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Fino',
                    badge: 'Light Touch',
                    description: 'Preserves tart character while adding Spanish minerality and elegance.',
                    flavors: 'Mineral • Green Almond • Clean'
                },
                {
                    type: 'Manzanilla',
                    badge: 'Coastal',
                    description: 'Enhances acidity with delicate saline notes and herbal complexity.',
                    flavors: 'Sea Salt • Herbs • Bright'
                }
            ]
        },
        'wild ale': {
            category: 'Beer',
            page: '/beer-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Palo Cortado',
                    badge: 'Rare',
                    description: 'Creates unique wild ale expressions with unmatched complexity and elegance.',
                    flavors: 'Citrus Peel • Balsamic • Toffee'
                },
                {
                    type: 'Amontillado',
                    badge: 'Complex',
                    description: 'Adds sophisticated depth to wild fermentation flavors.',
                    flavors: 'Nuts • Herbs • Oxidative'
                }
            ]
        },
        'sour beer': {
            category: 'Beer',
            page: '/beer-sherry-barrels.html',
            recommendations: [
                {
                    type: 'Palo Cortado',
                    badge: 'Sophisticated',
                    description: 'Exceptional complexity that complements sour beer character beautifully.',
                    flavors: 'Balsamic • Citrus • Complex'
                },
                {
                    type: 'Amontillado',
                    badge: 'Balanced',
                    description: 'Adds depth while respecting delicate sour beer balance.',
                    flavors: 'Toasted Nuts • Herbs • Bright'
                }
            ]
        }
    };

    // Get DOM elements
    const productInput = document.getElementById('productInput');
    const finderSubmit = document.getElementById('finderSubmit');
    const finderSuggestions = document.getElementById('finderSuggestions');
    const finderResults = document.getElementById('finderResults');
    const finderLoading = document.getElementById('finderLoading');
    const finderNoResults = document.getElementById('finderNoResults');
    const popularTags = document.querySelectorAll('.popular-tag');

    // Only run if product finder elements exist
    if (!productInput) return;

    // Hide all states initially
    function hideAllStates() {
        if (finderSuggestions) finderSuggestions.classList.remove('show');
        if (finderResults) finderResults.classList.remove('show');
        if (finderLoading) finderLoading.classList.remove('show');
        if (finderNoResults) finderNoResults.classList.remove('show');
    }

    // Search function
    function searchProduct(query) {
        if (!query.trim()) return [];
        
        const lowerQuery = query.toLowerCase();
        const matches = [];
        
        // Direct matches
        Object.keys(productDatabase).forEach(product => {
            if (product.includes(lowerQuery)) {
                matches.push({
                    product: product,
                    data: productDatabase[product],
                    relevance: product === lowerQuery ? 100 : 80
                });
            }
        });
        
        // Partial matches and synonyms
        const synonyms = {
            'whiskey': ['single malt whisky'],
            'scotch': ['single malt whisky'],
            'stout': ['imperial stout'],
            'rum': ['aged rum'],
            'tequila': ['añejo tequila']
        };
        
        // Check synonyms
        Object.keys(synonyms).forEach(synonym => {
            if (lowerQuery.includes(synonym)) {
                synonyms[synonym].forEach(actual => {
                    if (productDatabase[actual] && !matches.find(m => m.product === actual)) {
                        matches.push({
                            product: actual,
                            data: productDatabase[actual],
                            relevance: 60
                        });
                    }
                });
            }
        });
        
        // Sort by relevance
        return matches.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
    }

    // Process search and show results - MAKE GLOBALLY ACCESSIBLE
    processSearch = function(query) {
        hideAllStates();
        
        if (!query.trim()) return;
        // Detect and store the product from user input
const detectedProduct = detectProductFromInput(query);
if (detectedProduct) {
    sessionStorage.setItem('currentProductFinderSelection', detectedProduct);
    console.log('Stored product finder selection:', detectedProduct);
}
        
        // Show loading
        if (finderLoading) finderLoading.classList.add('show');
        
        setTimeout(() => {
            const matches = searchProduct(query.toLowerCase());
            if (finderLoading) finderLoading.classList.remove('show');
            
            if (matches.length === 0) {
                if (finderNoResults) finderNoResults.classList.add('show');
                return;
            }
            
            const bestMatch = matches[0];
            showResults(bestMatch.product, bestMatch.data);
        }, 1500);
    };

    // Show results with correct buttons - UPDATED WITH SELECTABLE FUNCTIONALITY
    function showResults(product, data) {
        if (!finderResults) return;
        
        const productTitle = capitalizeWords(product);
        const sectionIntro = document.querySelector('.product-finder .section-intro');
        
        // Generate the specific page link text and URL
        const pageButtonText = `See All Sherry Barrels for ${data.category}`;
        const pageButtonLink = data.page;
        
        finderResults.innerHTML = `
        <div class="result-header">
        <h3 class="result-title">Perfect Sherry Casks for ${productTitle}</h3>
        <p class="result-subtitle">Here are our top recommendations:</p>
         </div>
    
         <div class="result-recommendations">
        ${data.recommendations.map(rec => `
            <div class="recommendation-card" data-sherry-type="${rec.type.toLowerCase().replace(' ', '-').replace('ñ', 'n')}">
                <div class="recommendation-badge">${rec.badge}</div>
                <h4 class="recommendation-title">${rec.type} Sherry Casks</h4>
                <p class="recommendation-description">${rec.description}</p>
                <div class="recommendation-flavors">${rec.flavors}</div>
            </div>
        `).join('')}
        </div>
    
         <div class="result-cta">
        <p>Ready to transform your ${productTitle.toLowerCase()} with sherry barrels straight from Spain?</p>
        <div class="result-buttons">
            <a href="#contact" class="btn-outline">Get Quote</a>
            <a href="${pageButtonLink}" class="btn-primary">${pageButtonText}</a>
        </div>
    </div>
    `;
        
        // Add class to product finder to indicate results are shown
        const productFinder = document.querySelector('.product-finder');
        if (productFinder) {
            productFinder.classList.add('has-results');
        }
        
        finderResults.classList.add('show');
        
        // CRITICAL FIX: Ensure section intro stays visible
        if (sectionIntro) {
            sectionIntro.style.display = 'block';
            sectionIntro.style.visibility = 'visible';
            sectionIntro.style.opacity = '1';
            sectionIntro.style.position = 'relative';
            sectionIntro.style.zIndex = '2';
        }
        
        // Gentle scroll that maintains the section positioning
        setTimeout(() => {
            const productFinderSection = document.getElementById('product-finder');
            if (productFinderSection) {
                const rect = productFinderSection.getBoundingClientRect();
                const currentScroll = window.pageYOffset;
                const sectionTop = rect.top + currentScroll;
                
                // Only scroll if we're not already viewing the section properly
                if (rect.top < -100 || rect.top > window.innerHeight - 200) {
                    window.scrollTo({
                        top: sectionTop - 100, // Small offset for header
                        behavior: 'smooth'
                    });
                }
            }
        }, 100);

        // IMPORTANT: Initialize selectable functionality after results are shown
        setTimeout(() => {
            initializeSelectableBarrelFinder();
        }, 200);
    }

    // Capitalize words helper function
    function capitalizeWords(str) {
        return str.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    // Event listeners for search functionality
    if (finderSubmit) {
        finderSubmit.addEventListener('click', function() {
            const query = productInput.value.trim();
            if (query) {
                processSearch(query);
            }
        });
    }

    if (productInput) {
        productInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = productInput.value.trim();
                if (query) {
                    processSearch(query);
                }
            }
        });
    }

    // Popular tags functionality
    popularTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const product = this.dataset.product;
            if (product) {
                productInput.value = product;
                processSearch(product);
            }
        });
    });

}); // End of main DOMContentLoaded

// =================================
// SELECTABLE BARREL FINDER FUNCTIONALITY
// =================================

// Track selected barrel types
let selectedBarrelTypes = new Set();

/**
 * Toggle selection state of a recommendation card
 * @param {Element} card - The recommendation card element
 */
function toggleSelection(card) {
    const sherryType = card.dataset.sherryType;
    
    if (card.classList.contains('selected')) {
        card.classList.remove('selected');
        selectedBarrelTypes.delete(sherryType);
    } else {
        card.classList.add('selected');
        selectedBarrelTypes.add(sherryType);
    }
    
    updateSelectionSummary();
    updateGetQuoteButton();
}

/**
 * Update the selection summary display
 */
function updateSelectionSummary() {
    const summary = document.getElementById('selectionSummary');
    const count = document.getElementById('selectionCount');
    const types = document.getElementById('selectedTypes');
    
    if (selectedBarrelTypes.size > 0) {
        summary.classList.add('visible');
        count.textContent = `${selectedBarrelTypes.size} barrel type${selectedBarrelTypes.size > 1 ? 's' : ''} selected`;
        
        const typeNames = Array.from(selectedBarrelTypes).map(type => {
            return formatSherryTypeName(type);
        });
        types.textContent = `Selected: ${typeNames.join(', ')}`;
    } else {
        summary.classList.remove('visible');
    }
}

/**
 * Format sherry type names for display
 * @param {string} type - The sherry type key
 * @returns {string} - Formatted display name
 */
function formatSherryTypeName(type) {
    const nameMap = {
        'oloroso': 'Oloroso',
        'pedro-ximenez': 'Pedro Ximénez',
        'amontillado': 'Amontillado',
        'palo-cortado': 'Palo Cortado',
        'fino': 'Fino',
        'manzanilla': 'Manzanilla'
    };
    return nameMap[type] || type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
}

/**
 * Update the Get Quote button text and styling
 */
function updateGetQuoteButton() {
    const btn = document.querySelector('.result-buttons .btn-outline[href*="contact"]');
    
    if (btn) {
        if (selectedBarrelTypes.size > 0) {
            btn.textContent = `Get Quote (${selectedBarrelTypes.size} selected)`;
            btn.classList.add('has-selections');
        } else {
            btn.textContent = 'Get Quote';
            btn.classList.remove('has-selections');
        }
    }
}

/**
 * Clear all selections
 */
function clearAllSelections() {
    selectedBarrelTypes.clear();
    
    // Remove selected class from all cards
    document.querySelectorAll('.recommendation-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    
    updateSelectionSummary();
    updateGetQuoteButton();
}

/**
 * Scroll to quote form and pre-select sherry types
 */
function scrollToQuoteForm() {
    // Check if we're on the main page with the contact form
    const currentPage = window.location.pathname;
    const isMainPage = currentPage === '/' || currentPage === '/index.html' || currentPage.endsWith('index.html');
    
    // Store selected types in sessionStorage for cross-page transfer
    if (selectedBarrelTypes.size > 0) {
        sessionStorage.setItem('selectedBarrelTypes', JSON.stringify(Array.from(selectedBarrelTypes)));
    }

    // Make sure the product selection is preserved
const currentProduct = getCurrentProduct();
if (currentProduct) {
    sessionStorage.setItem('currentProductFinderSelection', currentProduct);
    console.log('Preserving product selection for quote form:', currentProduct);
}
    
    if (isMainPage) {
        // We're on the main page - scroll to contact form
        const quoteForm = document.getElementById('contact');
        if (quoteForm) {
            quoteForm.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Pre-select the sherry types after scrolling
            setTimeout(() => {
                preselectSherryTypes();
            }, 1500);
        }
    } else {
        // We're on a category page - navigate to main page with hash
        window.location.href = '/#contact';
    }
}

// =================================
// FIXED PRESELECTION FUNCTIONALITY - COMPLETE VERSION
// =================================

/**
 * Function to read URL parameters
 */
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function getCurrentProduct() {
    const pathname = window.location.pathname.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    
    // 1. First check for product finder selection (highest priority)
    const finderProduct = sessionStorage.getItem('currentProductFinderSelection');
    if (finderProduct) {
        console.log('Product from finder:', finderProduct);
        return finderProduct.toLowerCase();
    }
    
    // 2. Check URL pathname for product-specific pages
    if (pathname.includes('tequila')) return 'tequila';
    if (pathname.includes('whisky') || pathname.includes('whiskey')) return 'whisky';
    if (pathname.includes('rum')) return 'rum';
    if (pathname.includes('vodka')) return 'vodka';
    if (pathname.includes('beer')) return 'beer';
    if (pathname.includes('gin')) return 'gin';
    if (pathname.includes('brandy')) return 'brandy';
    
    // 3. Check URL parameters
    const productParam = urlParams.get('product');
    if (productParam) return productParam.toLowerCase();
    
    // 4. Check sessionStorage for other selections
    const storedProduct = sessionStorage.getItem('selectedProduct');
    if (storedProduct) return storedProduct.toLowerCase();
    
    return null;
}

function detectProductFromInput(userInput) {
    const input = userInput.toLowerCase().trim();
    
    // Product detection patterns
    const productPatterns = {
        'tequila': ['tequila', 'añejo', 'reposado', 'blanco', 'agave'],
        'whisky': ['whisky', 'whiskey', 'scotch', 'bourbon', 'rye', 'single malt', 'blended'],
        'rum': ['rum', 'rhum', 'cachaça', 'aged rum', 'spiced rum', 'dark rum'],
        'vodka': ['vodka', 'potato vodka', 'grain vodka'],
        'beer': ['beer', 'ale', 'lager', 'stout', 'porter', 'ipa', 'wheat beer', 'pilsner', 'barleywine', 'saison', 'imperial stout'],
        'gin': ['gin', 'london dry', 'botanical gin'],
        'brandy': ['brandy', 'cognac', 'armagnac', 'calvados']
    };
    
    // Check for exact or partial matches
    for (const [product, patterns] of Object.entries(productPatterns)) {
        for (const pattern of patterns) {
            if (input.includes(pattern)) {
                console.log(`Detected product: ${product} from input: ${userInput}`);
                return product;
            }
        }
    }
    
    return null;
}

/**
 * Pre-select sherry type buttons - FIXED VERSION THAT WORKS WITH NEW EVENT HANDLERS
 */
function preselectSherryTypes() {
    console.log('preselectSherryTypes called'); // Debug line
    
    // Get types to select from multiple sources
    let typesToSelect = [];
    
    // 1. From product finder selections
    if (typeof selectedBarrelTypes !== 'undefined' && selectedBarrelTypes.size > 0) {
        typesToSelect = Array.from(selectedBarrelTypes);
    }
    
    // 2. From sessionStorage (cross-page transfer)
    if (typesToSelect.length === 0) {
        const stored = sessionStorage.getItem('selectedBarrelTypes');
        if (stored) {
            try {
                typesToSelect = JSON.parse(stored);
            } catch (e) {
                console.log('Error parsing stored barrel types:', e);
            }
        }
    }
    
    // 3. From URL parameters
    if (typesToSelect.length === 0) {
        const urlParam = getURLParameter('preselect');
        if (urlParam) {
            typesToSelect = urlParam.split(',').map(type => type.trim());
        }
    }
    
    // 4. Auto-detect based on current page
    if (typesToSelect.length === 0) {
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('whisky-sherry-barrels')) {
            typesToSelect = ['oloroso', 'amontillado', 'fino'];
        } else if (currentPage.includes('rum-sherry-barrels')) {
            typesToSelect = ['oloroso', 'pedro-ximenez'];
        } else if (currentPage.includes('tequila-sherry-barrels')) {
            typesToSelect = ['oloroso', 'amontillado'];
        } else if (currentPage.includes('vodka-sherry-barrels')) {
            typesToSelect = ['fino', 'manzanilla'];
        } else if (currentPage.includes('beer-sherry-barrels')) {
            typesToSelect = ['oloroso', 'amontillado', 'pedro-ximenez'];
        }
    }
    
    console.log('Types to select:', typesToSelect); // Debug line
    
    if (typesToSelect.length === 0) {
        console.log('No types to select, returning');
        return;
    }
    
    // Create and show the preselection message
    showPreselectionMessage(typesToSelect);
    
    // Map display names to actual button selectors
    const sherryTypeMapping = {
        'oloroso': 'oloroso',
        'amontillado': 'amontillado', 
        'fino': 'fino',
        'manzanilla': 'manzanilla',
        'palo-cortado': 'palo-cortado',
        'pedro-ximenez': 'pedro-ximenez',
        'pedro-ximénez': 'pedro-ximenez' // Handle accent
    };
    
    // Wait longer to ensure buttons are fully set up
    setTimeout(() => {
        // Find and select buttons for each type
        typesToSelect.forEach(type => {
            const normalizedType = type.toLowerCase().replace(' ', '-').replace('ñ', 'n');
            const buttonValue = sherryTypeMapping[normalizedType] || normalizedType;
            
            console.log('Looking for button with value:', buttonValue); // Debug line
            
            // Find the button using the exact structure from your HTML
            let button = document.querySelector(`button.preference-button[data-preference="${buttonValue}"]`);
            
            console.log('Found button:', button); // Debug line
            
            if (button) {
                // Force the button into selected state
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
                
                // Add visual feedback animation
                button.classList.add('pre-selected');
                
                // Remove animation class after delay
                setTimeout(() => {
                    if (button.classList.contains('pre-selected')) {
                        button.classList.remove('pre-selected');
                    }
                }, 2000);
                
                console.log('Preference button selected:', button);
            } else {
                console.log('No preference button found for type:', type);
            }
        });
    }, 800); // Longer delay to ensure DOM is ready
    
    // Clear sessionStorage after use
    setTimeout(() => {
        sessionStorage.removeItem('selectedBarrelTypes');
    }, 3000);
}

/**
 * Show preselection message to user - ENHANCED VERSION
 */
function showPreselectionMessage(selectedTypes) {
    // Remove any existing message
    const existingMessage = document.getElementById('preselection-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Get current product context
    const currentProduct = getCurrentProduct();
    
    // Find the best location to insert the message - UPDATED FOR YOUR FORM
    let insertLocation = null;
    
    // Try to find the preference buttons section from your HTML
    const possibleLocations = [
        // Look for the specific label in your form
        Array.from(document.querySelectorAll('label')).find(label => 
            label.textContent.includes('Preference of Sherry Seasoning')
        ),
        // Look for the preference buttons container
        document.querySelector('.preference-buttons'),
        // Look for the form group containing preference buttons
        document.querySelector('.form-group:has(.preference-buttons)'),
        // Look for any preference button and get its container
        document.querySelector('.preference-button')?.closest('.form-group'),
        // Fallback to the contact form itself
        document.querySelector('#contactForm'),
        document.querySelector('.quote-form'),
        document.querySelector('#contact')
    ];
    
    // Find the first valid location
    for (const location of possibleLocations) {
        if (location) {
            insertLocation = location;
            break;
        }
    }
    
    if (!insertLocation) {
        console.log('Could not find suitable location for preselection message');
        return;
    }
    
    console.log('Found insertion location:', insertLocation);
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.id = 'preselection-message';
    messageDiv.className = 'preselection-message';
    
    const typeNames = selectedTypes.map(type => formatSherryTypeName(type.replace('-', ' ')));
    const pathname = window.location.pathname.toLowerCase();
    
    // Create dynamic message based on product context
      // Resolve product from pathname first — sessionStorage is fallback only
      let productContext;
      if (pathname.includes('tequila')) productContext = 'tequila';
      else if (pathname.includes('whisky') || pathname.includes('whiskey')) productContext = 'whisky';
      else if (pathname.includes('rum')) productContext = 'rum';
      else if (pathname.includes('vodka')) productContext = 'vodka';
      else if (pathname.includes('beer')) productContext = 'beer';
      else if (pathname.includes('gin')) productContext = 'gin';
      else if (pathname.includes('brandy')) productContext = 'brandy';
      else productContext = getCurrentProduct(); // fallback for pages without product in URL
  
      let message;
      if (productContext === 'tequila') {
          message = `Perfect for Tequila! We've pre-selected ${typeNames.join(', ')} sherry cask seasoning that works excellently for Tequila aging and finishing.`;
      } else if (productContext === 'whisky') {
          message = `Ideal for Whisky maturation! We've pre-selected ${typeNames.join(', ')} sherry cask seasoning that enhances Whisky complexity beautifully.`;
      } else if (productContext === 'rum') {
          message = `Excellent for Rum! We've pre-selected ${typeNames.join(', ')} sherry cask seasoning that complements Rum aging perfectly.`;
      } else if (productContext === 'beer') {
          message = `Great for Beer aging! We've pre-selected ${typeNames.join(', ')} sherry cask seasoning that adds wonderful depth to beer styles.`;
      } else if (productContext === 'vodka') {
          message = `Perfect for Vodka finishing! We've pre-selected ${typeNames.join(', ')} sherry cask seasoning that adds refinement to your Vodka expressions.`;
      } else if (productContext === 'gin') {
          message = `Ideal for aged Gin expressions! We've pre-selected ${typeNames.join(', ')} sherry cask seasoning that enhances botanical complexity beautifully.`;
      } else if (productContext) {
          message = `We've pre-selected ${typeNames.join(', ')} sherry cask seasoning that works excellently for ${productContext.charAt(0).toUpperCase() + productContext.slice(1)} aging and finishing.`;
      } else {
          message = `Based on your spirit/beer, we've pre-selected ${typeNames.join(', ')} sherry cask seasoning that works excellently for your product.`;
      }
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <span class="message-icon">✔</span>
            <span class="message-text">${message}</span>
        </div>
    `;
    
    // Insert the message in the best position
    if (insertLocation.tagName === 'LABEL') {
        insertLocation.insertAdjacentElement('afterend', messageDiv);
    } else if (insertLocation.classList.contains('preference-buttons')) {
        insertLocation.insertAdjacentElement('beforebegin', messageDiv);
    } else {
        // Insert after the label but before the buttons
        const label = insertLocation.querySelector('label');
        if (label) {
            label.insertAdjacentElement('afterend', messageDiv);
        } else {
            insertLocation.insertAdjacentElement('afterbegin', messageDiv);
        }
    }
    
    // Show with animation
    setTimeout(() => {
        messageDiv.classList.add('visible');
    }, 100);
    
    console.log('Dynamic preselection message shown for product:', currentProduct || 'generic');
}

/**
 * Handle product card clicks (for navigation with preselection from category pages)
 */
function handleProductCardClick(sherryTypes) {
    // Store the sherry types for preselection
    sessionStorage.setItem('selectedBarrelTypes', JSON.stringify(sherryTypes));
    
    // Navigate to contact section
    const contactURL = `#contact?preselect=${encodeURIComponent(sherryTypes.join(','))}`;
    
    // Smooth scroll to contact section
    setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
            // Wait for scroll, then apply preselection
            setTimeout(() => {
                preselectSherryTypes();
            }, 800);
        }
    }, 100);
}

/**
 * Initialize preselection on page load - ENHANCED VERSION
 */
document.addEventListener('DOMContentLoaded', function() {
    // Multiple initialization triggers
    
    // 1. Check if we're on a page with the quote form
    const quoteForm = document.querySelector('#contactForm, .quote-form, #contact');
    if (quoteForm) {
        console.log('Quote form found, setting up preselection...');
        
        // 2. Check for hash navigation (from cross-page links)
        if (window.location.hash === '#contact') {
            setTimeout(() => {
                preselectSherryTypes();
            }, 800);
        }
        
        // 3. Check for URL parameters
        const preselectParam = getURLParameter('preselect');
        if (preselectParam) {
            setTimeout(() => {
                preselectSherryTypes();
            }, 500);
        }
        
        // 4. Check sessionStorage for cross-page transfers
        const storedTypes = sessionStorage.getItem('selectedBarrelTypes');
        if (storedTypes) {
            setTimeout(() => {
                preselectSherryTypes();
            }, 600);
        }
        
        // 5. Auto-detect based on page (for direct page visits)
        const currentPage = window.location.pathname;
        if (currentPage.includes('sherry-barrels') && currentPage !== '/') {
            setTimeout(() => {
                preselectSherryTypes();
            }, 700);
        }
        
        // 6. Listen for custom events (in case other scripts trigger preselection)
        document.addEventListener('preselectSherryTypes', () => {
            preselectSherryTypes();
        });
    }
});

/**
 * Initialize the selectable barrel finder
 */
function initializeSelectableBarrelFinder() {
    // Add click handlers to existing recommendation cards
    document.querySelectorAll('.recommendation-card').forEach(card => {
        if (!card.hasAttribute('data-selectable-initialized')) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => toggleSelection(card));
            card.setAttribute('data-selectable-initialized', 'true');
        }
    });
    
    // Add selection instructions if they don't exist
    const resultsContainer = document.querySelector('.finder-results');
    if (resultsContainer && !document.querySelector('.selection-instructions')) {
        const instructions = document.createElement('div');
        instructions.className = 'selection-instructions';
        instructions.innerHTML = '💡 Click on the barrel types you\'re interested in, then click "Get Quote" to pre-fill the form below';
        
        const resultHeader = resultsContainer.querySelector('.result-header');
        if (resultHeader) {
            resultHeader.insertAdjacentElement('afterend', instructions);
        }
    }
    
    // Add selection summary if it doesn't exist
    if (resultsContainer && !document.querySelector('.selection-summary')) {
        const summary = document.createElement('div');
        summary.className = 'selection-summary';
        summary.id = 'selectionSummary';
        summary.innerHTML = `
            <div class="selection-count" id="selectionCount">0 barrel types selected</div>
            <div class="selected-types" id="selectedTypes"></div>
            <button class="clear-selection" onclick="clearAllSelections()">Clear Selection</button>
        `;
        
        const recommendations = resultsContainer.querySelector('.result-recommendations');
        if (recommendations) {
            recommendations.insertAdjacentElement('beforebegin', summary);
        }
    }
    
    // Update Get Quote button functionality - Target the btn-outline in result-buttons
    const getQuoteBtn = document.querySelector('.result-buttons .btn-outline[href*="contact"]');
    if (getQuoteBtn && !getQuoteBtn.hasAttribute('data-quote-initialized')) {
        getQuoteBtn.onclick = (e) => {
            e.preventDefault();
            scrollToQuoteForm();
        };
        getQuoteBtn.setAttribute('data-quote-initialized', 'true');
    }
    
    updateSelectionSummary();
    updateGetQuoteButton();
}

// =================================
// HERO SEARCH FUNCTIONALITY - FIXED
// =================================
document.addEventListener('DOMContentLoaded', function() {
    
    // Get hero search elements
    const heroSearchInput = document.getElementById('heroSearchInput');
    const heroSearchButton = document.getElementById('heroSearchButton');
    const heroSuggestionTags = document.querySelectorAll('.hero-suggestion-tag');
    const heroSearchContainer = document.querySelector('.hero-search-container');

    // Only run if hero search elements exist
    if (!heroSearchInput) return;

    // Function to navigate to product finder with pre-populated search - FIXED
    function navigateToProductFinder(searchTerm) {
        // Add searching animation
        if (heroSearchContainer) {
            heroSearchContainer.classList.add('searching');
            setTimeout(() => {
                heroSearchContainer.classList.remove('searching');
            }, 600);
        }

        // Small delay for visual feedback
        setTimeout(() => {
            // Find the main product finder input
            const mainProductInput = document.getElementById('productInput');
            
            if (mainProductInput) {
                // Populate the main product finder with the search term
                mainProductInput.value = searchTerm;
                
                // Scroll to the product finder section
                const productFinderSection = document.getElementById('product-finder');
                if (productFinderSection) {
                    // Smooth scroll to product finder
                    productFinderSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    
                    // After scroll, trigger the search in the main product finder
                    setTimeout(() => {
                        // Focus the input for better UX
                        mainProductInput.focus();
                        
                        // FIXED: Use the globally available processSearch function
                        if (typeof processSearch === 'function') {
                            processSearch(searchTerm);
                        } else {
                            console.log('processSearch function not available');
                        }
                    }, 800); // Wait for scroll to complete
                }
            } else {
                // Fallback: just scroll to product finder section
                const productFinderSection = document.getElementById('product-finder');
                if (productFinderSection) {
                    productFinderSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }
        }, 300);
    }

    // Event listeners for hero search
    if (heroSearchButton) {
        heroSearchButton.addEventListener('click', function() {
            const searchTerm = heroSearchInput.value.trim();
            if (searchTerm) {
                navigateToProductFinder(searchTerm);
            }
        });
    }

    if (heroSearchInput) {
        heroSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = heroSearchInput.value.trim();
                if (searchTerm) {
                    navigateToProductFinder(searchTerm);
                }
            }
        });
    }

    // Hero suggestion tags
    heroSuggestionTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const searchTerm = this.textContent.trim();
            if (searchTerm) {
                heroSearchInput.value = searchTerm;
                navigateToProductFinder(searchTerm);
            }
        });
    });

});


// =================================
// ADD EVENT LISTENERS FOR PRODUCT CARD NAVIGATION - ENHANCED
// =================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up product card navigation...');
    
    // Enhanced selectors to catch all possible product card links
    const productCardSelectors = [
        'a[href*="whisky-sherry-barrels"]',
        'a[href*="rum-sherry-barrels"]', 
        'a[href*="tequila-sherry-barrels"]',
        'a[href*="vodka-sherry-barrels"]',
        'a[href*="beer-sherry-barrels"]',
        '.product-card a[href*="#contact"]',
        '.product-card-link[href*="#contact"]'
    ];
    
    productCardSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(card => {
            console.log('Found product card:', card);
            
            // Determine sherry types based on URL
            let sherryTypes = [];
            const href = card.href.toLowerCase();
            
            if (href.includes('whisky')) {
                sherryTypes = ['oloroso', 'amontillado', 'fino'];
            } else if (href.includes('rum')) {
                sherryTypes = ['oloroso', 'pedro-ximenez'];
            } else if (href.includes('tequila')) {
                sherryTypes = ['oloroso', 'amontillado'];
            } else if (href.includes('vodka')) {
                sherryTypes = ['fino', 'manzanilla'];
            } else if (href.includes('beer')) {
                sherryTypes = ['oloroso', 'amontillado', 'pedro-ximenez'];
            }
            
            // Only add event listener if it leads to contact and has sherry types
            if (href.includes('#contact') && sherryTypes.length > 0) {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Product card clicked, preselecting:', sherryTypes);
                    handleProductCardClick(sherryTypes);
                });
            }
        });
    });
});

// =================================
// UTILITY FUNCTION FOR MANUAL TRIGGERING
// =================================

/**
 * Manually trigger preselection (useful for testing or external triggers)
 */
function triggerPreselection(types = null) {
    if (types) {
        sessionStorage.setItem('selectedBarrelTypes', JSON.stringify(types));
    }
    preselectSherryTypes();
}

// Make functions globally available for debugging
window.preselectSherryTypes = preselectSherryTypes;
window.triggerPreselection = triggerPreselection;

// =================================
// HERO SEARCH FUNCTIONALITY
// =================================
document.addEventListener('DOMContentLoaded', function() {
    
    // Get hero search elements
    const heroSearchInput = document.getElementById('heroSearchInput');
    const heroSearchButton = document.getElementById('heroSearchButton');
    const heroSuggestionTags = document.querySelectorAll('.hero-suggestion-tag');
    const heroSearchContainer = document.querySelector('.hero-search-container');

    // Only run if hero search elements exist
    if (!heroSearchInput) return;

    // Function to navigate to product finder with pre-populated search - FIXED
function navigateToProductFinder(searchTerm) {
    // Add searching animation
    if (heroSearchContainer) {
        heroSearchContainer.classList.add('searching');
        setTimeout(() => {
            heroSearchContainer.classList.remove('searching');
        }, 600);
    }

    // Small delay for visual feedback
    setTimeout(() => {
        // Find the main product finder input
        const mainProductInput = document.getElementById('productInput');
        
        if (mainProductInput) {
            // Populate the main product finder with the search term
            mainProductInput.value = searchTerm;
            
            // Scroll to the product finder section
            const productFinderSection = document.getElementById('product-finder');
            if (productFinderSection) {
                // Smooth scroll to product finder
                productFinderSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // After scroll, trigger the search in the main product finder
                setTimeout(() => {
                    // Focus the input for better UX
                    mainProductInput.focus();
                    
                    // FIXED: Use the correct processSearch function directly
                    if (typeof processSearch === 'function') {
                        processSearch(searchTerm);
                    } else {
                        // Fallback: trigger keypress event (the event your main finder listens to)
                        const keypressEvent = new KeyboardEvent('keypress', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13,
                            which: 13,
                            bubbles: true
                        });
                        mainProductInput.dispatchEvent(keypressEvent);
                    }
                }, 800); // Wait for scroll to complete
            }
        } else {
            // Fallback: just scroll to product finder section
            const productFinderSection = document.getElementById('product-finder');
            if (productFinderSection) {
                productFinderSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
        }
    }, 300);
}

    // Hero search button click
    if (heroSearchButton) {
        heroSearchButton.addEventListener('click', (e) => {
            e.preventDefault();
            const searchTerm = heroSearchInput.value.trim();
            
            if (searchTerm) {
                navigateToProductFinder(searchTerm);
            } else {
                // If empty, just scroll to product finder
                const productFinderSection = document.getElementById('product-finder');
                if (productFinderSection) {
                    productFinderSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }
        });
    }

    // Hero search input enter key
    if (heroSearchInput) {
        heroSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchTerm = heroSearchInput.value.trim();
                
                if (searchTerm) {
                    navigateToProductFinder(searchTerm);
                }
            }
        });

        // Enhanced placeholder cycling for hero search
        const heroPlaceholders = [
            'What do you produce?',
            'e.g., single malt whisky',
            'e.g., imperial stout', 
            'e.g., añejo tequila',
            'e.g., aged rum'
        ];
        
        let heroPlaceholderIndex = 0;
        
        function cycleHeroPlaceholder() {
            if (document.activeElement !== heroSearchInput && !heroSearchInput.value) {
                heroSearchInput.placeholder = heroPlaceholders[heroPlaceholderIndex];
                heroPlaceholderIndex = (heroPlaceholderIndex + 1) % heroPlaceholders.length;
            }
        }
        
        // Cycle placeholder every 4 seconds for hero
        setInterval(cycleHeroPlaceholder, 4000);
    }

    // Hero suggestion tag clicks
    heroSuggestionTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            const searchTerm = tag.getAttribute('data-search');
            
            if (searchTerm) {
                // Update hero input to show what was selected
                heroSearchInput.value = capitalizeWords(searchTerm);
                
                // Navigate to product finder
                navigateToProductFinder(searchTerm);
            }
        });

        // Add hover effect with brief highlight
        tag.addEventListener('mouseenter', () => {
            tag.style.transform = 'translateY(-2px) scale(1.05)';
        });

        tag.addEventListener('mouseleave', () => {
            tag.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Enhanced visual feedback for search interaction
    if (heroSearchInput && heroSearchContainer) {
        heroSearchInput.addEventListener('focus', () => {
            heroSearchContainer.style.transform = 'scale(1.02)';
            heroSearchContainer.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
        });

        heroSearchInput.addEventListener('blur', () => {
            heroSearchContainer.style.transform = 'scale(1)';
            heroSearchContainer.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        });
    }

    // Utility function to capitalize words
    function capitalizeWords(str) {
        return str.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    console.log('Hero search functionality initialized successfully');

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
            const featuredPost = await this.getFeaturedPost();
            
            if (!featuredPost) {
                console.log('No featured post found, using default content');
                return;
            }
    
            // Find the featured story section
            const storySection = document.querySelector('#story .story-grid');
            if (!storySection) {
                console.error('Featured story section not found');
                return;
            }
    
            // Create post URL
            const postSlug = this.createPostSlug(featuredPost);
            const postUrl = `/post/${postSlug}`;
    
            // Get existing elements
            const storyImage = storySection.querySelector('.story-image');
            const storyContent = storySection.querySelector('.story-content');
    
            if (storyImage && storyContent) {
                // Update image section
                if (featuredPost.featuredImage) {
                    const existingImg = storyImage.querySelector('.story-bg-image');
                    if (existingImg) {
                        existingImg.src = featuredPost.featuredImage;
                        existingImg.alt = `${featuredPost.title} - Featured Story`;
                        storyImage.classList.add('has-image');
                    } else {
                        // Create new image if it doesn't exist
                        const newImg = document.createElement('img');
                        newImg.src = featuredPost.featuredImage;
                        newImg.alt = `${featuredPost.title} - Featured Story`;
                        newImg.className = 'story-bg-image';
                        storyImage.appendChild(newImg);
                        storyImage.classList.add('has-image');
                    }
                }
    
                // Update content section
                const sectionLabel = storyContent.querySelector('.section-label');
                const title = storyContent.querySelector('h2');
                const subtitle = storyContent.querySelector('.story-subtitle');
                const paragraphs = storyContent.querySelectorAll('p:not(.story-subtitle)');
                const ctaButton = storyContent.querySelector('.btn-outline');
    
                if (sectionLabel) {
                    sectionLabel.textContent = `Featured ${featuredPost.type}`;
                }
    
                if (title) {
                    title.textContent = featuredPost.title;
                }
    
                if (subtitle) {
                    // Extract subtitle from excerpt or use default
                    subtitle.textContent = this.extractSubtitle(featuredPost);
                }
    
                // Update description paragraphs
                if (paragraphs.length >= 2) {
                    const contentPreview = this.formatContentPreview(featuredPost);
                    paragraphs[0].textContent = contentPreview.first;
                    paragraphs[1].textContent = contentPreview.second;
                }
    
                if (ctaButton) {
                    ctaButton.href = postUrl;
                    ctaButton.textContent = 'Read Full Story';
                }
            }
        }
    
        // Extract subtitle from post data
        extractSubtitle(post) {
            // Use excerpt as subtitle, or create one from content
            if (post.excerpt && post.excerpt.length > 0) {
                return post.excerpt.length > 80 
                    ? post.excerpt.substring(0, 80) + '...'
                    : post.excerpt;
            }
            
            // Fallback based on post type
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
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.updateFeaturedStorySection());
            } else {
                await this.updateFeaturedStorySection();
            }
        }
    }
    
    // Enhanced post content rendering for HTML support
    class SoleraPostRenderer {
        static formatPostContent(post) {
            // If HTML content exists, use it directly
            if (post.contentHtml && post.contentHtml.trim()) {
                return post.contentHtml;
            }
            
            // Otherwise, format markdown content
            if (!post.content) return '';
            
            // Split into paragraphs and format
            const paragraphs = post.content.split('\n\n').filter(p => p.trim());
            
            return paragraphs.map(paragraph => {
                const trimmed = paragraph.trim();
                if (!trimmed) return '';
                
                // Handle images first (markdown format)
                if (trimmed.match(/^!\[.*?\]\(.*?\)$/)) {
                    const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
                    if (match) {
                        const altText = match[1];
                        const src = match[2];
                        return `<figure><img src="${src}" alt="${altText}" loading="lazy"><figcaption>${altText}</figcaption></figure>`;
                    }
                }
                
                // Format markdown-style elements
                let formatted = trimmed
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code>$1</code>')
                    .replace(/\n/g, '<br>');
                
                // Handle headers
                if (formatted.startsWith('## ')) {
                    return `<h2>${formatted.substring(3)}</h2>`;
                } else if (formatted.startsWith('# ')) {
                    return `<h3>${formatted.substring(2)}</h3>`;
                }
                
                return `<p>${formatted}</p>`;
            }).join('');
        }
    }


    
    // Initialize homepage integration
    const soleraHomepage = new SoleraHomepageIntegration();
    soleraHomepage.init();
    
    // Export for use in other scripts
    window.SoleraHomepageIntegration = SoleraHomepageIntegration;
    window.SoleraPostRenderer = SoleraPostRenderer;
    
});
// =================================
// HERO IMAGE FADE-IN FUNCTIONALITY
// =================================
document.addEventListener('DOMContentLoaded', function() {
    
    class SoleraHeroImageFader {
        constructor() {
            this.heroImages = document.querySelectorAll('.hero-bg-image');
            this.loadedImages = new Set();
            this.initializeImageLoading();
        }

        initializeImageLoading() {
            this.heroImages.forEach((img, index) => {
                // Skip if already processed
                if (img.hasAttribute('data-solera-fade-processed')) return;
                
                // Mark as processed
                img.setAttribute('data-solera-fade-processed', 'true');
                
                // Add loading state to parent hero-image container
                const heroImageContainer = img.closest('.hero-image');
                if (heroImageContainer) {
                    heroImageContainer.classList.add('loading');
                }
                
                // If image is already loaded (cached), fade it in immediately
                if (img.complete && img.naturalHeight !== 0) {
                    this.onImageLoad(img, heroImageContainer);
                } else {
                    // Set up load event listener
                    img.addEventListener('load', () => {
                        this.onImageLoad(img, heroImageContainer);
                    });
                    
                    // Set up error handler
                    img.addEventListener('error', () => {
                        this.onImageError(img, heroImageContainer);
                    });
                }
            });
        }

        onImageLoad(img, container) {
            // Small delay for smooth visual transition
            setTimeout(() => {
                img.classList.add('loaded');
                if (container) {
                    container.classList.remove('loading');
                }
                this.loadedImages.add(img.src);
                console.log('Solera hero image loaded with fade-in effect:', img.alt || img.src);
            }, 100);
        }

        onImageError(img, container) {
            console.warn('Solera hero image failed to load:', img.src);
            // Still remove loading state even if image fails
            if (container) {
                container.classList.remove('loading');
            }
            // Set a fallback or keep the background color
            img.style.opacity = '0'; // Keep it hidden if it failed to load
        }

        // Method to handle dynamic image changes (for future use)
        changeImage(imgElement, newSrc) {
            if (!imgElement) return;
            
            // Fade out current image
            imgElement.classList.remove('loaded');
            
            const container = imgElement.closest('.hero-image');
            if (container) {
                container.classList.add('loading');
            }
            
            // Load new image after fade out
            setTimeout(() => {
                imgElement.src = newSrc;
                // The load event listener will handle fading it back in
            }, 400);
        }

        // Refresh method for dynamically added images
        refresh() {
            this.heroImages = document.querySelectorAll('.hero-bg-image');
            this.initializeImageLoading();
        }
    }

    // Initialize the hero image fader
    window.soleraHeroImageFader = new SoleraHeroImageFader();
    
    // Optional: Refresh on window focus (in case images load while tab is inactive)
    window.addEventListener('focus', () => {
        if (window.soleraHeroImageFader) {
            window.soleraHeroImageFader.refresh();
        }
    });

    console.log('Solera hero image fade-in functionality initialized');
});

// =================================
// NETLIFY FORMS - CONTACT FORM FUNCTIONALITY
// =================================

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        console.log('Initializing Netlify contact form...');
        
        // Setup button selections
        setupFormButtonSelections();
        
        // Setup shipping address toggle
        setupShippingToggle();
        
        // Form submission handler
        contactForm.addEventListener('submit', handleNetlifyFormSubmission);
    }
});

// Setup all button group selections
function setupFormButtonSelections() {
    // Sherry preference buttons
    const preferenceButtons = document.querySelectorAll('.preference-button');
    const hiddenSherryField = document.getElementById('hiddenSherryPreference');
    let selectedPreferences = new Set();
    
    preferenceButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const preference = this.dataset.preference;
            
            if (preference === 'all-types') {
                // Toggle all-types selection
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                    selectedPreferences.clear();
                    preferenceButtons.forEach(btn => btn.classList.remove('disabled'));
                } else {
                    selectedPreferences.clear();
                    selectedPreferences.add('all-types');
                    preferenceButtons.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn !== this) btn.classList.add('disabled');
                    });
                    this.classList.add('active');
                }
            } else {
                // Individual preference clicked
                if (selectedPreferences.has('all-types')) {
                    selectedPreferences.clear();
                    preferenceButtons.forEach(btn => btn.classList.remove('active', 'disabled'));
                }
                
                if (selectedPreferences.has(preference)) {
                    selectedPreferences.delete(preference);
                    this.classList.remove('active');
                } else {
                    selectedPreferences.add(preference);
                    this.classList.add('active');
                }
            }
            
            // Update hidden field
            if (hiddenSherryField) {
                hiddenSherryField.value = Array.from(selectedPreferences).join(', ');
            }
            console.log('Selected preferences:', Array.from(selectedPreferences));
        });
    });
    
    // Cask size buttons (multiple selection)
    const sizeButtons = document.querySelectorAll('.size-button');
    const hiddenSizeField = document.getElementById('hiddenCaskSize');
    let selectedSizes = new Set();
    
    sizeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const size = this.dataset.size;
            
            if (selectedSizes.has(size)) {
                selectedSizes.delete(size);
                this.classList.remove('active');
            } else {
                selectedSizes.add(size);
                this.classList.add('active');
            }
            
            if (hiddenSizeField) {
                hiddenSizeField.value = Array.from(selectedSizes).join(', ');
            }
            console.log('Selected sizes:', Array.from(selectedSizes));
        });
    });
    
    // Quantity buttons (single selection)
const quantityButtons = document.querySelectorAll('.quantity-button');
const hiddenQuantityField = document.getElementById('hiddenQuantity');

quantityButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const quantity = this.dataset.quantity;
        
        // Remove selection from all buttons
        quantityButtons.forEach(btn => btn.classList.remove('active'));
        
        // Select this button
        this.classList.add('active');
        
        // CRITICAL: Update the hidden field
        if (hiddenQuantityField) {
            hiddenQuantityField.value = quantity;
            console.log('Hidden field updated with quantity:', hiddenQuantityField.value);
        } else {
            console.error('Hidden quantity field not found!');
        }
        
        console.log('Selected quantity:', quantity);
    });
});
}

// Setup shipping address toggle
function setupShippingToggle() {
    const shippingToggle = document.getElementById('shippingToggle');
    const shippingSection = document.getElementById('shippingSection');
    
    if (shippingToggle && shippingSection) {
        shippingToggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            const isExpanded = this.classList.contains('active');
            
            if (isExpanded) {
                // Collapse
                this.classList.remove('active');
                shippingSection.style.maxHeight = '0';
                shippingSection.style.opacity = '0';
                shippingSection.style.marginTop = '0';
                const span = this.querySelector('span');
                if (span) span.textContent = this.dataset.textShow || 'Add Shipping Address for Quote';
            } else {
                // Expand
                this.classList.add('active');
                shippingSection.style.maxHeight = shippingSection.scrollHeight + 'px';
                shippingSection.style.opacity = '1';
                shippingSection.style.marginTop = '24px';
                const span = this.querySelector('span');
                if (span) span.textContent = this.dataset.textHide || 'Hide Shipping Address';
            }
        });
    }
}

// Handle Netlify form submission
async function handleNetlifyFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderBottom = '2px solid #d32f2f';
        } else {
            field.style.borderBottom = '1px solid var(--border)';
        }
    });
    
    // Validate quantity selection
const hiddenQuantityField = document.getElementById('hiddenQuantity');
const quantitySelected = hiddenQuantityField ? hiddenQuantityField.value : '';

console.log('Validating quantity. Field exists:', !!hiddenQuantityField, 'Value:', quantitySelected);

if (!quantitySelected || quantitySelected.trim() === '') {
    isValid = false;
    showFormNotification('Please select an estimated quantity', 'error');
    return;
}
    
    if (!isValid) {
        showFormNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    
    try {
        const formData = new FormData(form);
        
        const response = await fetch('/', {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        });
        
        if (response.ok) {
            showFormNotification(
                'Quote Request Received!',
                'success',
                'Thank you for your inquiry. Our team will contact you within 24 hours with a detailed quote.'
            );
            
            // Reset form
            form.reset();
            
            // Reset button selections
            document.querySelectorAll('.preference-button, .size-button, .quantity-button').forEach(btn => {
                btn.classList.remove('active', 'disabled');
            });
            
            // Clear hidden fields
            const hiddenFields = ['hiddenSherryPreference', 'hiddenCaskSize', 'hiddenQuantity'];
            hiddenFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) field.value = '';
            });
            
            // Collapse shipping section
            const shippingSection = document.getElementById('shippingSection');
            const shippingToggle = document.getElementById('shippingToggle');
            if (shippingSection) {
                shippingSection.style.maxHeight = null;
            }
            if (shippingToggle) {
                shippingToggle.classList.remove('active');
                const span = shippingToggle.querySelector('span');
                if (span) span.textContent = shippingToggle.dataset.textShow || 'Add Shipping Address for Quote';
            }
            
        } else {
            throw new Error('Form submission failed');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showFormNotification(
            'Submission Error',
            'error',
            'There was a problem submitting your request. Please try again or contact us directly at info@soleracask.com'
        );
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
}

// Notification system for form
function showFormNotification(title, type = 'info', message = '') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const backgroundColor = type === 'success' ? 'var(--warm-white)' : 
                           type === 'error' ? '#ffebee' : 'var(--warm-white)';
    const borderColor = type === 'success' ? 'var(--primary)' : 
                       type === 'error' ? '#ff4444' : 'var(--border)';
    const titleColor = type === 'success' ? 'var(--primary)' : 
                      type === 'error' ? '#d32f2f' : 'var(--text-primary)';
    
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${backgroundColor};
        border: 2px solid ${borderColor};
        box-shadow: 0 12px 48px rgba(160, 82, 45, 0.15);
        padding: 40px;
        border-radius: 0;
        z-index: 10001;
        text-align: center;
        max-width: 500px;
        font-family: 'Playfair Display', serif;
    `;
    
    notification.innerHTML = `
        <h3 style="font-size: 24px; margin-bottom: 16px; color: ${titleColor};">${title}</h3>
        ${message ? `<p style="font-size: 16px; line-height: 1.6; color: var(--text-secondary);">${message}</p>` : ''}
        <button onclick="this.parentElement.remove()" style="margin-top: 24px; padding: 12px 32px; background: ${borderColor}; color: white; border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Close</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 8000);
}

// Add this at the bottom of js/script.js:
document.addEventListener('DOMContentLoaded', function() {
    // Replace with your actual DeepL API key
    window.universalTranslator.setupForSpanish('a1573e28-05da-41ea-9be4-e6bb29daa694:fx');
});