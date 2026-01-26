// ==========================================
// REUSABLE COMPONENTS LOADER
// ==========================================
// This script dynamically loads footer and quote form components
// allowing single-source maintenance across all pages

/**
 * Load HTML component files into placeholder elements
 * @param {string} componentName - Name of the component file (without .html)
 * @param {string} targetId - ID of the placeholder element
 * @returns {Promise<boolean>} - Success status
 */
async function loadComponent(componentName, targetId) {
    try {
        const response = await fetch(`/components/${componentName}.html`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to load ${componentName}`);
        }
        const html = await response.text();
        const target = document.getElementById(targetId);
        
        if (target) {
            target.innerHTML = html;
            console.log(`✓ Loaded ${componentName} component`);
            return true;
        } else {
            console.warn(`⚠ Target element #${targetId} not found for ${componentName}`);
            return false;
        }
    } catch (error) {
        console.error(`✗ Error loading ${componentName}:`, error);
        return false;
    }
}

/**
 * Initialize all components on page load
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔧 Solera Cask - Loading reusable components...');
    
    // Load components in sequence
    const footerLoaded = await loadComponent('footer', 'footer-placeholder');
    const formLoaded = await loadComponent('quote-form', 'quote-form-placeholder');
    
    // Initialize form handlers only if form was successfully loaded
    if (formLoaded) {
        console.log('📋 Quote form loaded, initializing form handlers...');
        
        // Give DOM a moment to fully render before initializing
        setTimeout(() => {
            initializeFormHandlers();
        }, 150);
    }
    
    console.log('✓ Component loading complete');
});

/**
 * Re-initialize all form event handlers after dynamic loading
 * This ensures all form functionality works with dynamically loaded content
 */
function initializeFormHandlers() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) {
        console.warn('⚠ Contact form not found after loading component');
        return;
    }
    
    console.log('🎯 Initializing form handlers...');
    
    // 1. Initialize button groups (size, quantity, sherry preference buttons)
    initializeButtonGroups();
    
    // 2. Initialize Netlify form submission handling
    // (This function should exist in your main script.js)
    if (typeof handleFormSubmission === 'function') {
        handleFormSubmission(contactForm);
        console.log('✓ Form submission handler initialized');
    } else {
        console.warn('⚠ handleFormSubmission function not found');
    }
    
    // 3. Run product-specific preselection logic
    // This detects the current page and pre-selects appropriate options
    if (typeof preselectSherryTypes === 'function') {
        // Add a small delay to ensure all DOM elements are ready
        setTimeout(() => {
            preselectSherryTypes();
            console.log('✓ Preselection logic executed');
        }, 200);
    } else {
        console.warn('⚠ preselectSherryTypes function not found');
    }
    
    console.log('✓ All form handlers initialized successfully');
}

/**
 * Initialize interactive button groups in the form
 * Handles size buttons, quantity buttons, and sherry preference buttons
 */
function initializeButtonGroups() {
    // Initialize size buttons (225L, 500L)
    const sizeButtons = document.querySelectorAll('.size-button');
    const caskSizeInput = document.getElementById('hiddenCaskSize');
    
    sizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove selected class from all size buttons
            sizeButtons.forEach(btn => btn.classList.remove('selected'));
            // Add selected class to clicked button
            this.classList.add('selected');
            // Update hidden input value
            if (caskSizeInput) {
                caskSizeInput.value = this.dataset.size;
            }
            console.log('Cask size selected:', this.dataset.size);
        });
    });
    
    // Initialize quantity buttons (5-20, 21-50, 50+)
    const quantityButtons = document.querySelectorAll('.quantity-button');
    const quantityInput = document.getElementById('hiddenQuantity');
    
    quantityButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove selected class from all quantity buttons
            quantityButtons.forEach(btn => btn.classList.remove('selected'));
            // Add selected class to clicked button
            this.classList.add('selected');
            // Update hidden input value
            if (quantityInput) {
                quantityInput.value = this.dataset.quantity;
            }
            console.log('Quantity selected:', this.dataset.quantity);
        });
    });
    
    // Initialize sherry preference buttons
    const preferenceButtons = document.querySelectorAll('.preference-button');
    const sherryTypesInput = document.getElementById('hiddenSherryPreference');
    
    preferenceButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Toggle selected state
            this.classList.toggle('selected');
            this.setAttribute('aria-pressed', this.classList.contains('selected'));
            
            // Update hidden input with all selected sherry types
            if (sherryTypesInput) {
                const selectedTypes = Array.from(document.querySelectorAll('.preference-button.selected'))
                    .map(btn => btn.dataset.preference);
                sherryTypesInput.value = selectedTypes.join(', ');
                console.log('Sherry types selected:', selectedTypes);
            }
        });
    });
    
    // Initialize shipping address toggle
    const shippingToggle = document.getElementById('shippingToggle');
    const shippingSection = document.getElementById('shippingSection');
    
    if (shippingToggle && shippingSection) {
        shippingToggle.addEventListener('click', function() {
            shippingSection.classList.toggle('expanded');
            this.classList.toggle('active');
            console.log('Shipping address section toggled');
        });
    }
    
    console.log('✓ Button groups initialized:', {
        sizeButtons: sizeButtons.length,
        quantityButtons: quantityButtons.length,
        preferenceButtons: preferenceButtons.length,
        shippingToggle: shippingToggle ? 'initialized' : 'not found'
    });
}