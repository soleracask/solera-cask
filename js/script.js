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
    // FORM HANDLING
    // =================================
    const form = document.getElementById('contactForm');
    const tequilaForm = document.getElementById('tequilaContactForm');
    
    // Handle main contact form
    if (form) {
        handleFormSubmission(form);
    }
    
    // Handle tequila contact form
    if (tequilaForm) {
        handleFormSubmission(tequilaForm);
    }
    
    function handleFormSubmission(formElement) {
        const allTypesCheckbox = formElement.querySelector('#all-types');
        const otherCheckboxes = formElement.querySelectorAll('input[name="caskType"]:not(#all-types), input[name="sherryCaskType"]:not(#all-types)');

        // Handle "All Types" checkbox logic
        if (allTypesCheckbox) {
            allTypesCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    otherCheckboxes.forEach(cb => {
                        cb.checked = false;
                        cb.disabled = true;
                        cb.parentElement.style.opacity = '0.5';
                    });
                } else {
                    otherCheckboxes.forEach(cb => {
                        cb.disabled = false;
                        cb.parentElement.style.opacity = '1';
                    });
                }
            });
        }

        // Handle individual checkbox changes
        otherCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked && allTypesCheckbox) {
                    allTypesCheckbox.checked = false;
                }
            });
        });

        // Form submission
        formElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Basic form validation
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderBottomColor = '#ff4444';
                    field.style.borderBottomWidth = '2px';
                } else {
                    field.style.borderBottomColor = 'var(--border)';
                    field.style.borderBottomWidth = '1px';
                }
            });

            if (!isValid) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }

            // Show loading state
            submitBtn.textContent = 'SUBMITTING REQUEST...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            
            // Simulate form submission
            setTimeout(() => {
                // Show success notification
                showNotification(
                    'Consultation Request Received',
                    'success',
                    'Thank you for your interest in our premium sherry casks. Our Spanish cooperage experts will contact you within 24 hours.'
                );
                
                // Reset form
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                
                // Reset checkbox states
                otherCheckboxes.forEach(cb => {
                    cb.disabled = false;
                    cb.parentElement.style.opacity = '1';
                });
                
            }, 2500);
        });
    }

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

    // Show results with correct buttons
    function showResults(product, data) {
        if (!finderResults) return;
        
        const productTitle = capitalizeWords(product);
        const categoryLower = data.category.toLowerCase();
        
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
        
        finderResults.classList.add('show');
        
        // Scroll to results
        setTimeout(() => {
            finderResults.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
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
    
    // Initialize homepage integration
    const soleraHomepage = new SoleraHomepageIntegration();
    soleraHomepage.init();
    
    // Export for use in other scripts
    window.SoleraHomepageIntegration = SoleraHomepageIntegration;
    window.SoleraPostRenderer = SoleraPostRenderer;
    
});