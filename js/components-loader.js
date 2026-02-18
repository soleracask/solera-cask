// ==========================================
// REUSABLE COMPONENTS LOADER WITH LANGUAGE DETECTION
// ==========================================
// This script dynamically loads footer and quote form components
// allowing single-source maintenance across all pages

/**
 * Detect current language based on URL path
 * @returns {string} - 'es' or 'en'
 */
function getCurrentLanguage() {
    return window.location.pathname.startsWith('/es/') ? 'es' : 'en';
}

/**
 * Load HTML component files into placeholder elements
 * @param {string} componentName - Name of the component file (without .html)
 * @param {string} targetId - ID of the placeholder element
 * @param {string} lang - Language code ('en' or 'es')
 * @returns {Promise<boolean>} - Success status
 */
async function loadComponent(componentName, targetId, lang) {
    try {
        const response = await fetch(`/components/${componentName}-${lang}.html`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to load ${componentName}-${lang}`);
        }
        const html = await response.text();
        const target = document.getElementById(targetId);
        
        if (target) {
            target.innerHTML = html;
            // Add 'loaded' class to trigger fade-in
            setTimeout(() => {
                target.classList.add('loaded');
            }, 50);
            console.log(`✓ Loaded ${componentName}-${lang} component`);
            return true;
        } else {
            console.warn(`⚠ Target element #${targetId} not found for ${componentName}`);
            return false;
        }
    } catch (error) {
        console.error(`✗ Error loading ${componentName}-${lang}:`, error);
        return false;
    }
}

/**
 * Initialize all components on page load
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔧 Solera Cask - Loading reusable components...');
    
    // Detect language
    const lang = getCurrentLanguage();
    console.log(`🌐 Language detected: ${lang}`);
    
    // Load components in sequence with language detection
    const footerLoaded = await loadComponent('footer', 'footer-placeholder', lang);
    
    // Update copyright year in footer if loaded successfully
    if (footerLoaded) {
        const copyrightYear = document.getElementById('copyright-year');
        if (copyrightYear) {
            copyrightYear.textContent = new Date().getFullYear();
            console.log('✓ Copyright year updated');
        }
    }
    
    const formLoaded = await loadComponent('quote-form', 'quote-form-placeholder', lang);
    
    // Initialize form handlers only if form was successfully loaded
    if (formLoaded) {
        console.log('📋 Quote form loaded, initializing form handlers...');
        
        // Give DOM a moment to fully render before initializing
        setTimeout(() => {
            initializeLoadedForm();
        }, 150);
    }
    
    console.log('✓ Component loading complete');
});

/**
 * Initialize the dynamically loaded form
 * Calls the existing setup functions from script.js
 */
function initializeLoadedForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) {
        console.warn('⚠ Contact form not found after loading component');
        return;
    }
    
    console.log('🎯 Initializing form with existing handlers...');
    
    // Call existing form setup functions from script.js
    if (typeof setupFormButtonSelections === 'function') {
        setupFormButtonSelections();
        console.log('✓ Button selections initialized (from script.js)');
    } else {
        console.warn('⚠ setupFormButtonSelections function not found in script.js');
    }
    
    if (typeof setupShippingToggle === 'function') {
        setupShippingToggle();
        console.log('✓ Shipping toggle initialized (from script.js)');
    } else {
        console.warn('⚠ setupShippingToggle function not found in script.js');
    }
    
    // Add form submission handler
    if (typeof handleNetlifyFormSubmission === 'function') {
        contactForm.removeEventListener('submit', handleNetlifyFormSubmission);
        contactForm.addEventListener('submit', handleNetlifyFormSubmission);
        console.log('✓ Form submission handler attached (from script.js)');
    } else {
        console.warn('⚠ handleNetlifyFormSubmission function not found in script.js');
    }
    
    // Run product-specific preselection logic
    if (typeof preselectSherryTypes === 'function') {
        setTimeout(() => {
            preselectSherryTypes();
            console.log('✓ Preselection logic executed (from script.js)');
        }, 200);
    }
    
    console.log('✓ All form handlers initialized successfully');
}