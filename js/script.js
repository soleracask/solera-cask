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
    const scrolledHeaderHeight = 10; // Adjust this value based on your CSS
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
// PRODUCT FINDER FUNCTIONALITY - UPDATED WITH CORRECT BUTTONS
// =================================
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

    // Process search and show results
    function processSearch(query) {
        hideAllStates();
        
        if (!query.trim()) return;
        
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
    }

   // Show results with correct buttons - FIXED VERSION
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
                <div class="recommendation-card">
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
                <a href="${pageButtonLink}" class="btn-primary">${pageButtonText}</a>
                <a href="#contact" class="btn-outline">Get Quote</a>
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
}

// Function to hide results (when clearing search) - FIXED VERSION
function hideResults() {
    const sectionIntro = document.querySelector('.product-finder .section-intro');
    const productFinder = document.querySelector('.product-finder');
    
    if (finderResults) {
        finderResults.classList.remove('show');
    }
    
    if (productFinder) {
        productFinder.classList.remove('has-results');
    }
    
    // CRITICAL FIX: Always ensure section intro is visible
    if (sectionIntro) {
        sectionIntro.style.display = 'block';
        sectionIntro.style.visibility = 'visible';
        sectionIntro.style.opacity = '1';
    }
}

    // Utility function to capitalize words
    function capitalizeWords(str) {
        return str.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    // Event listeners
    if (productInput) {
        productInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                processSearch(productInput.value);
            }
        });
    }

    if (finderSubmit) {
        finderSubmit.addEventListener('click', (e) => {
            e.preventDefault();
            processSearch(productInput.value);
        });
    }

    // Popular tag clicks
    popularTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const product = tag.getAttribute('data-product');
            if (productInput) {
                productInput.value = capitalizeWords(product);
                processSearch(product);
            }
        });
    });

    console.log('Product Finder initialized successfully with correct buttons');
});

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

    // Function to navigate to product finder with pre-populated search
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
            // Find the main product finder input (from the main product finder section)
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
                        
                        // Trigger the product finder search
                        const enterEvent = new KeyboardEvent('keydown', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13,
                            bubbles: true
                        });
                        mainProductInput.dispatchEvent(enterEvent);
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
// CONTACT FORM FUNCTIONALITY
// Add this to the END of your existing js/script.js file
// =================================

// Updated form handling function with all previous functionality
function handleFormSubmission(formElement) {
    const form = formElement;
    
    console.log('Initializing form...'); // Debug log
    
    // Initialize address autocomplete
    initializeAddressAutocomplete(form);
    
    // Shipping address toggle functionality
    const shippingToggle = form.querySelector('#shippingToggle');
    const shippingSection = form.querySelector('#shippingSection');
    
    console.log('Shipping toggle found:', !!shippingToggle); // Debug log
    console.log('Shipping section found:', !!shippingSection); // Debug log
    
    if (shippingToggle && shippingSection) {
        shippingToggle.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default button behavior
            console.log('Shipping toggle clicked'); // Debug log
            
            const isExpanded = this.classList.contains('active');
            
            if (isExpanded) {
                // Collapse
                this.classList.remove('active');
                shippingSection.classList.remove('expanded');
                this.querySelector('span').textContent = 'Add Shipping Address for Quote';
                console.log('Collapsed shipping section'); // Debug log
            } else {
                // Expand
                this.classList.add('active');
                shippingSection.classList.add('expanded');
                this.querySelector('span').textContent = 'Hide Shipping Address';
                console.log('Expanded shipping section'); // Debug log
            }
        });
    } else {
        console.error('Shipping toggle or section not found!');
    }
    
    // Handle Sherry Preference Buttons
    const preferenceButtons = form.querySelectorAll('.preference-button');
    let selectedPreferences = new Set();
    
    console.log('Preference buttons found:', preferenceButtons.length); // Debug log
    
    preferenceButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default button behavior
            console.log('Preference button clicked:', this.getAttribute('data-preference')); // Debug log
            
            const preference = this.getAttribute('data-preference');
            
            if (preference === 'all-types') {
                // If "All Types" is clicked
                if (this.classList.contains('selected')) {
                    // Deselect all types
                    this.classList.remove('selected');
                    selectedPreferences.clear();
                    preferenceButtons.forEach(function(btn) {
                        btn.classList.remove('disabled');
                    });
                } else {
                    // Select all types and disable others
                    selectedPreferences.clear();
                    selectedPreferences.add('all-types');
                    const currentButton = this;
                    preferenceButtons.forEach(function(btn) {
                        btn.classList.remove('selected');
                        if (btn !== currentButton) {
                            btn.classList.add('disabled');
                        }
                    });
                    this.classList.add('selected');
                }
            } else {
                // Individual preference clicked
                if (selectedPreferences.has('all-types')) {
                    // Clear all-types selection first
                    selectedPreferences.clear();
                    preferenceButtons.forEach(function(btn) {
                        btn.classList.remove('selected', 'disabled');
                    });
                }
                
                if (selectedPreferences.has(preference)) {
                    // Deselect this preference
                    selectedPreferences.delete(preference);
                    this.classList.remove('selected');
                } else {
                    // Select this preference
                    selectedPreferences.add(preference);
                    this.classList.add('selected');
                }
            }
            
            console.log('Selected preferences:', Array.from(selectedPreferences)); // Debug log
        });
    });

    // Handle Cask Size Buttons (multiple selection allowed)
    const sizeButtons = form.querySelectorAll('.size-button');
    let selectedSizes = new Set();
    
    console.log('Size buttons found:', sizeButtons.length); // Debug log
    
    sizeButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default button behavior
            console.log('Size button clicked:', this.getAttribute('data-size')); // Debug log
            
            const size = this.getAttribute('data-size');
            
            if (selectedSizes.has(size)) {
                selectedSizes.delete(size);
                this.classList.remove('selected');
            } else {
                selectedSizes.add(size);
                this.classList.add('selected');
            }
            
            console.log('Selected sizes:', Array.from(selectedSizes)); // Debug log
        });
    });

    // Handle Quantity Buttons (single selection only)
    const quantityButtons = form.querySelectorAll('.quantity-button');
    let selectedQuantity = null;
    
    console.log('Quantity buttons found:', quantityButtons.length); // Debug log
    
    quantityButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default button behavior
            console.log('Quantity button clicked:', this.getAttribute('data-quantity')); // Debug log
            
            const quantity = this.getAttribute('data-quantity');
            
            // Remove selection from all buttons
            quantityButtons.forEach(function(btn) {
                btn.classList.remove('selected');
            });
            
            if (selectedQuantity === quantity) {
                // Deselect if clicking the same button
                selectedQuantity = null;
            } else {
                // Select this button
                selectedQuantity = quantity;
                this.classList.add('selected');
            }
            
            console.log('Selected quantity:', selectedQuantity); // Debug log
        });
    });

    // Form submission with updated validation
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Validate required fields
        const requiredFields = this.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(function(field) {
            const formGroup = field.closest('.form-group');
            if (!field.value.trim()) {
                isValid = false;
                if (formGroup) {
                    formGroup.classList.add('error');
                }
                field.style.borderBottomColor = '#d32f2f';
                field.style.borderBottomWidth = '2px';
            } else {
                if (formGroup) {
                    formGroup.classList.remove('error');
                }
                field.style.borderBottomColor = 'var(--border)';
                field.style.borderBottomWidth = '1px';
            }
        });

        // Validate quantity selection (required)
        if (!selectedQuantity) {
            isValid = false;
            quantityButtons.forEach(function(btn) {
                btn.style.borderColor = '#d32f2f';
                btn.style.borderWidth = '3px';
            });
            setTimeout(function() {
                quantityButtons.forEach(function(btn) {
                    if (!btn.classList.contains('selected')) {
                        btn.style.borderColor = 'var(--border)';
                        btn.style.borderWidth = '2px';
                    }
                });
            }, 3000);
        } else {
            quantityButtons.forEach(function(btn) {
                const borderColor = btn.classList.contains('selected') ? 'var(--primary)' : 'var(--border)';
                btn.style.borderColor = borderColor;
                btn.style.borderWidth = '2px';
            });
        }

        // Validate reCAPTCHA if available
        let recaptchaResponse = '';
        if (typeof grecaptcha !== 'undefined') {
            try {
                recaptchaResponse = grecaptcha.getResponse();
                if (!recaptchaResponse) {
                    isValid = false;
                    const captchaGroup = form.querySelector('.captcha-group');
                    if (captchaGroup) {
                        captchaGroup.style.borderColor = '#d32f2f';
                        captchaGroup.style.borderWidth = '2px';
                        setTimeout(function() {
                            captchaGroup.style.borderColor = 'var(--border-light)';
                            captchaGroup.style.borderWidth = '1px';
                        }, 3000);
                    }
                }
            } catch (error) {
                console.warn('reCAPTCHA validation error:', error);
            }
        }

        if (!isValid) {
            let errorMessage = 'Please fill in all required fields and select an estimated quantity.';
            if (typeof grecaptcha !== 'undefined' && !recaptchaResponse) {
                errorMessage += ' Also complete the captcha verification.';
            }
            showNotification(errorMessage, 'error');
            return;
        }

        // Show loading state
        submitBtn.textContent = 'SUBMITTING REQUEST...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        
        // Collect form data including new address fields
        const formData = {
            firstName: form.querySelector('#firstName').value,
            lastName: form.querySelector('#lastName').value,
            email: form.querySelector('#email').value,
            phone: form.querySelector('#phone').value || '',
            company: form.querySelector('#company').value,
            
            // Shipping address (only if provided)
            shippingAddress: {
                country: form.querySelector('#country').value || '',
                stateProvince: form.querySelector('#stateProvince').value || '',
                streetAddress: form.querySelector('#streetAddress').value || '',
                unitNumber: form.querySelector('#unitNumber').value || '',
                city: form.querySelector('#city').value || '',
                postalCode: form.querySelector('#postalCode').value || ''
            },
            
            sherryCaskPreferences: Array.from(selectedPreferences),
            caskSizes: Array.from(selectedSizes),
            estimatedQuantity: selectedQuantity,
            projectDetails: form.querySelector('#project').value || '',
            recaptchaResponse: recaptchaResponse
        };
        
        console.log('Updated form submission data:', formData);
        
        // Simulate form submission
        setTimeout(function() {
            showNotification(
                'Consultation Request Received',
                'success',
                'Thank you for your interest in our premium sherry casks. Our Spanish cooperage experts will contact you within 24 hours.'
            );
            
            // Reset form
            form.reset();
            selectedPreferences.clear();
            selectedSizes.clear();
            selectedQuantity = null;
            
            // Reset button states
            preferenceButtons.forEach(function(btn) {
                btn.classList.remove('selected', 'disabled');
            });
            sizeButtons.forEach(function(btn) {
                btn.classList.remove('selected');
            });
            quantityButtons.forEach(function(btn) {
                btn.classList.remove('selected');
            });
            
            // Reset shipping section
            const shippingToggle = form.querySelector('#shippingToggle');
            const shippingSection = form.querySelector('#shippingSection');
            if (shippingToggle && shippingSection) {
                shippingToggle.classList.remove('active');
                shippingSection.classList.remove('expanded');
                shippingToggle.querySelector('span').textContent = 'Add Shipping Address for Quote';
            }
            
            // Reset reCAPTCHA if available
            if (typeof grecaptcha !== 'undefined') {
                try {
                    grecaptcha.reset();
                } catch (error) {
                    console.warn('reCAPTCHA reset error:', error);
                }
            }
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            
        }, 2500);
    });
}

// MULTI-SERVICE ADDRESS AUTOCOMPLETE
// Uses multiple free services for best accuracy
// Replace your existing initializeAddressAutocomplete function

function initializeAddressAutocomplete(form) {
    const streetAddressInput = form.querySelector('#streetAddress');
    const addressSuggestions = form.querySelector('#addressSuggestions');
    const autocompleteNote = form.querySelector('#autocompleteNote');
    
    const countryInput = form.querySelector('#country');
    const stateProvinceInput = form.querySelector('#stateProvince');
    const cityInput = form.querySelector('#city');
    const postalCodeInput = form.querySelector('#postalCode');
    
    if (!streetAddressInput) {
        console.log('Street address input not found');
        return;
    }
    
    let searchTimeout;
    let currentSearchQuery = '';
    
    // Configuration for different services
    const serviceConfig = {
        // Get free tokens from respective services
        mapbox: {
            token: 'pk.eyJ1IjoiaW1hbGRvbWFyIiwiYSI6ImNtZThzdWhrODBieXUyanIwYnJqZnh2dzUifQ.XpJkdv1-VTG2WNV79DWA1g', // Get from mapbox.com (100k free/month)
            enabled: true // Set to true when you have a token
        },
        locationiq: {
            token: 'pk.473ce33befb0cdee4d1acc95bf98e0b7', // Get from locationiq.com (5k free/day)
            enabled: true // Set to true when you have a token
        },
        nominatim: {
            enabled: true // Always available as fallback
        }
    };
    
    streetAddressInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (query.length < 3) {
            hideSuggestions();
            return;
        }
        
        if (query === currentSearchQuery) {
            return;
        }
        
        currentSearchQuery = query;
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(function() {
            searchAddressesMultiService(query);
        }, 300);
    });
    
    // Handle click outside to close suggestions
    document.addEventListener('click', function(e) {
        const addressContainer = streetAddressInput.closest('.address-input-container');
        if (addressContainer && !addressContainer.contains(e.target)) {
            hideSuggestions();
        }
    });
    
    // Multi-service search with intelligent fallback
    async function searchAddressesMultiService(query) {
        try {
            updateAutocompleteNote('Searching addresses...', 'loading');
            
            const countryHint = getCountryContext();
            let results = [];
            
            // Service priority based on region and availability
            const servicePriority = determineServicePriority(countryHint);
            
            // Try services in order of priority
            for (const service of servicePriority) {
                try {
                    console.log(`Trying ${service} for address search...`);
                    
                    switch (service) {
                        case 'mapbox':
                            if (serviceConfig.mapbox.enabled) {
                                results = await searchMapbox(query, countryHint);
                            }
                            break;
                        case 'locationiq':
                            if (serviceConfig.locationiq.enabled) {
                                results = await searchLocationIQ(query, countryHint);
                            }
                            break;
                        case 'nominatim':
                            results = await searchNominatim(query, countryHint);
                            break;
                    }
                    
                    if (results && results.length > 0) {
                        console.log(`Successfully got ${results.length} results from ${service}`);
                        break; // Stop trying other services
                    }
                } catch (error) {
                    console.warn(`${service} search failed:`, error);
                    continue; // Try next service
                }
            }
            
            if (results && results.length > 0) {
                showSuggestions(results);
                updateAutocompleteNote('Select an address from the suggestions');
            } else {
                hideSuggestions();
                updateAutocompleteNote('No addresses found. Try different search terms.', 'error');
            }
            
        } catch (error) {
            console.warn('All address search services failed:', error);
            updateAutocompleteNote('Manual address entry (autocomplete unavailable)', 'manual');
            hideSuggestions();
        }
    }
    
    // Determine service priority based on region
    function determineServicePriority(countryHint) {
        const country = countryHint?.toLowerCase() || '';
        
        // North America: Mapbox is best
        if (country.includes('us') || country.includes('canada') || country.includes('united states')) {
            return ['mapbox', 'locationiq', 'nominatim'];
        }
        
        // Europe: LocationIQ often better than Nominatim
        if (country.includes('germany') || country.includes('france') || country.includes('uk') || 
            country.includes('spain') || country.includes('italy') || country.includes('netherlands')) {
            return ['locationiq', 'mapbox', 'nominatim'];
        }
        
        // Australia/Oceania: Mapbox preferred
        if (country.includes('australia') || country.includes('new zealand')) {
            return ['mapbox', 'locationiq', 'nominatim'];
        }
        
        // Default order
        return ['mapbox', 'locationiq', 'nominatim'];
    }
    
    // Get country context from form
    function getCountryContext() {
        let context = '';
        if (countryInput && countryInput.value) {
            context = countryInput.value;
        }
        if (stateProvinceInput && stateProvinceInput.value) {
            context += ' ' + stateProvinceInput.value;
        }
        return context.trim();
    }
    
    // Mapbox Geocoding API
    async function searchMapbox(query, countryHint) {
        if (!serviceConfig.mapbox.token) {
            throw new Error('Mapbox token not configured');
        }
        
        const searchQuery = countryHint ? `${query}, ${countryHint}` : query;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${serviceConfig.mapbox.token}&types=address&limit=6`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Mapbox API error: ${response.status}`);
        
        const data = await response.json();
        return data.features.map(feature => ({
            display_name: feature.place_name,
            address: parseMapboxAddress(feature),
            source: 'Mapbox'
        }));
    }
    
    // LocationIQ API (Enhanced Nominatim)
    async function searchLocationIQ(query, countryHint) {
        if (!serviceConfig.locationiq.token) {
            throw new Error('LocationIQ token not configured');
        }
        
        const searchQuery = countryHint ? `${query}, ${countryHint}` : query;
        const url = `https://eu1.locationiq.com/v1/search.php?key=${serviceConfig.locationiq.token}&q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=6`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`LocationIQ API error: ${response.status}`);
        
        const data = await response.json();
        return data.map(item => ({
            display_name: item.display_name,
            address: item.address,
            source: 'LocationIQ'
        }));
    }
    
    // Enhanced Nominatim (fallback)
    async function searchNominatim(query, countryHint) {
        const searchQuery = countryHint ? `${query}, ${countryHint}` : query;
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(searchQuery)}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SoleraCask/1.0 (contact@soleracask.com)'
            }
        });
        
        if (!response.ok) throw new Error(`Nominatim API error: ${response.status}`);
        
        const data = await response.json();
        return data.map(item => ({
            display_name: item.display_name,
            address: item.address,
            source: 'OpenStreetMap'
        }));
    }
    
    // Parse Mapbox address format
    function parseMapboxAddress(feature) {
        const context = feature.context || [];
        const properties = feature.properties || {};
        
        return {
            house_number: properties.address || '',
            road: feature.text || '',
            city: context.find(c => c.id.includes('place'))?.text || '',
            state: context.find(c => c.id.includes('region'))?.text || '',
            country: context.find(c => c.id.includes('country'))?.text || '',
            postcode: context.find(c => c.id.includes('postcode'))?.text || ''
        };
    }
    
    // Enhanced suggestions display with service indicators
    function showSuggestions(addresses) {
        if (!addressSuggestions) return;
        
        addressSuggestions.innerHTML = '';
        
        addresses.forEach(function(address, index) {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = 'address-suggestion';
            
            const displayName = address.display_name;
            const addressComponents = address.address || {};
            
            // Format main part
            let mainPart = '';
            if (addressComponents.house_number && addressComponents.road) {
                mainPart = addressComponents.house_number + ' ' + addressComponents.road;
            } else if (addressComponents.road) {
                mainPart = addressComponents.road;
            } else {
                const parts = displayName.split(', ');
                mainPart = parts[0];
            }
            
            // Format secondary part
            const cityPart = addressComponents.city || addressComponents.town || addressComponents.village || '';
            const statePart = addressComponents.state || '';
            const countryPart = addressComponents.country || '';
            const secondaryPart = [cityPart, statePart, countryPart].filter(part => part).join(', ');
            
            // Service indicator
            const serviceIndicator = address.source ? `<span style="color: #666; font-size: 10px; float: right;">${address.source}</span>` : '';
            
            suggestionDiv.innerHTML = `
                <div style="position: relative;">
                    ${serviceIndicator}
                    <div class="suggestion-main">${mainPart}</div>
                    ${secondaryPart ? `<div class="suggestion-secondary">${secondaryPart}</div>` : ''}
                </div>
            `;
            
            suggestionDiv.addEventListener('click', function() {
                selectAddress(address);
            });
            
            addressSuggestions.appendChild(suggestionDiv);
        });
        
        addressSuggestions.style.display = 'block';
    }
    
    // Handle address selection (unchanged)
    function selectAddress(address) {
        const addressComponents = address.address || {};
        
        const streetNumber = addressComponents.house_number || '';
        const streetName = addressComponents.road || '';
        const city = addressComponents.city || addressComponents.town || addressComponents.village || '';
        const state = addressComponents.state || '';
        const country = addressComponents.country || '';
        const postalCode = addressComponents.postcode || '';
        
        streetAddressInput.value = (streetNumber + ' ' + streetName).trim();
        
        if (cityInput && city) cityInput.value = city;
        if (postalCodeInput && postalCode) postalCodeInput.value = postalCode;
        if (countryInput && country) countryInput.value = country;
        if (stateProvinceInput && state) stateProvinceInput.value = state;
        
        hideSuggestions();
        updateAutocompleteNote('Address selected successfully', 'success');
        
        setTimeout(function() {
            updateAutocompleteNote('Start typing for address suggestions');
        }, 3000);
    }
    
    // Utility functions
    function hideSuggestions() {
        if (addressSuggestions) {
            addressSuggestions.style.display = 'none';
        }
    }
    
    function updateAutocompleteNote(message, type) {
        if (autocompleteNote) {
            autocompleteNote.textContent = message;
            autocompleteNote.className = 'autocomplete-note ' + (type || 'default');
        }
    }
}

// Simple notification system
function showNotification(title, type, message) {
    // Create notification element
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#4caf50' : (type === 'error' ? '#f44336' : '#2196f3');
    
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: ' + bgColor + '; color: white; padding: 16px 24px; border-radius: 4px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); z-index: 10000; max-width: 400px; font-family: Inter, sans-serif; font-size: 14px; line-height: 1.4; transform: translateX(100%); transition: transform 0.3s ease;';
    
    const titleDiv = '<div style="font-weight: 600; margin-bottom: ' + (message ? '8px' : '0') + ';">' + title + '</div>';
    const messageDiv = message ? '<div style="font-size: 13px; opacity: 0.9;">' + message + '</div>' : '';
    
    notification.innerHTML = titleDiv + messageDiv;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(function() {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(function() {
        notification.style.transform = 'translateX(100%)';
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Initialize contact form when DOM is loaded
// Add this AFTER your existing DOMContentLoaded code, or modify your existing one
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, looking for contact form...'); // Debug log
    const contactForm = document.getElementById('contactForm');
    console.log('Contact form found:', !!contactForm); // Debug log
    
    if (contactForm) {
        console.log('Initializing contact form...'); // Debug log
        handleFormSubmission(contactForm);
    }
});