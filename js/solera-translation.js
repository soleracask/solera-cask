// Universal Auto-Translate Widget
// Positioned below accessibility toolbar with matching circular design

class UniversalTranslator {
    constructor() {
        this.currentLanguage = 'en';
        this.isTranslating = false;
        this.translationCache = new Map();
        this.observer = null;
        this.translatedElements = new Set();
        
        // Supported languages with better coverage
        this.languages = {
            'en': { name: 'English', flag: '🇺🇸' },
            'es': { name: 'Español', flag: '🇪🇸' },
            'fr': { name: 'Français', flag: '🇫🇷' },
            'de': { name: 'Deutsch', flag: '🇩🇪' },
            'it': { name: 'Italiano', flag: '🇮🇹' },
            'pt': { name: 'Português', flag: '🇵🇹' },
            'ru': { name: 'Русский', flag: '🇷🇺' },
            'ja': { name: '日本語', flag: '🇯🇵' },
            'ko': { name: '한국어', flag: '🇰🇷' },
            'zh': { name: '中文', flag: '🇨🇳' },
            'ar': { name: 'العربية', flag: '🇸🇦' },
            'hi': { name: 'हिन्दी', flag: '🇮🇳' },
            'tr': { name: 'Türkçe', flag: '🇹🇷' },
            'pl': { name: 'Polski', flag: '🇵🇱' },
            'nl': { name: 'Nederlands', flag: '🇳🇱' }
        };
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.createTranslateWidget();
        this.startObserver();
        this.loadSavedLanguage();
        console.log('🌐 Universal Translator initialized - positioned below accessibility');
    }

    createTranslateWidget() {
        // Remove existing widget if present
        const existing = document.getElementById('universal-translator');
        if (existing) existing.remove();

        // Create widget HTML
        const widget = document.createElement('div');
        widget.id = 'universal-translator';
        widget.innerHTML = `
            <button id="translate-toggle" class="translate-btn">
                <span class="translate-icon">🌐</span>
            </button>
            <div id="translate-dropdown" class="translate-dropdown">
                <div class="translate-header">
                    <div class="header-title">
                        <span class="header-icon">🌐</span>
                        <span>Choose Language</span>
                    </div>
                    <button class="translate-close" id="translate-close" aria-label="Close language selector">
                        <span>✕</span>
                    </button>
                </div>
                <div class="translate-content">
                    ${Object.entries(this.languages).map(([code, lang]) => `
                        <button class="translate-option ${code === this.currentLanguage ? 'active' : ''}" 
                                data-lang="${code}">
                            <span class="lang-flag">${lang.flag}</span>
                            <span class="lang-name">${lang.name}</span>
                            <span class="lang-code">${code.toUpperCase()}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="translate-footer">
                    <small>Powered by Google Translate</small>
                </div>
            </div>
            <div id="translate-loading" class="translate-loading" style="display: none;">
                <div class="loading-spinner"></div>
                <span>Translating...</span>
            </div>
        `;

        // Add styles
        this.addStyles();
        
        // Append to body
        document.body.appendChild(widget);
        
        // Add event listeners
        this.attachEvents();
    }

    addStyles() {
        if (document.getElementById('universal-translator-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'universal-translator-styles';
        styles.textContent = `
            #universal-translator {
                position: fixed;
                top: calc(50% + 50px); /* Position closer to accessibility button */
                right: 20px;
                z-index: 9997; /* One level below accessibility toolbar */
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }

            .translate-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 48px;
                height: 48px;
                background: var(--primary, #8B4513);
                border: 1px solid var(--border, #ddd);
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                color: var(--text-white, white);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: var(--shadow-medium, 0 4px 12px rgba(0,0,0,0.1));
                position: relative;
            }

            .translate-btn:hover {
                background: var(--accent-gold, #DAA520);
                color: var(--text-primary, #333);
                transform: scale(1.05);
                box-shadow: var(--shadow-strong, 0 6px 16px rgba(0,0,0,0.15));
            }

            .translate-icon {
                font-size: 20px;
                line-height: 1;
            }

            .translate-dropdown {
                position: fixed;
                top: 50% !important;
                right: -420px !important;
                transform: translateY(-50%) !important;
                background: var(--warm-white, white);
                border: 1px solid var(--border, #ddd);
                border-radius: 0;
                box-shadow: var(--shadow-strong, 0 8px 25px rgba(0,0,0,0.15));
                opacity: 1;
                visibility: visible;
                transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                width: 380px;
                max-height: 80vh;
                overflow: hidden;
                z-index: 10000;
            }

            .translate-dropdown.open {
                right: 20px !important;
            }

            .translate-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 24px;
                border-bottom: 1px solid var(--border-light, #eee);
                font-weight: 600;
                color: var(--text-white, white);
                background: linear-gradient(135deg, var(--primary, #8B4513) 0%, var(--primary-dark, #654321) 100%);
                font-family: 'Playfair Display', serif;
                font-size: 18px;
            }

            .translate-header .header-title {
                display: flex;
                align-items: center;
                gap: 12px;
                color: var(--text-white, white);
            }

            .translate-header .header-icon {
                font-size: 24px;
                color: var(--accent-gold, #DAA520);
            }

            .translate-close {
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: var(--text-white, white);
                cursor: pointer;
                padding: 8px;
                border-radius: 4px;
                font-size: 14px;
                font-family: 'Inter', sans-serif;
                transition: all 0.3s ease;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .translate-close:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.5);
                transform: scale(1.05);
            }

            .translate-content {
                padding: 24px;
                background: var(--warm-white, white);
                color: var(--text-primary, #333);
                max-height: calc(80vh - 96px);
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            }

            /* Custom scrollbar for webkit browsers */
            .translate-content::-webkit-scrollbar {
                width: 6px;
            }

            .translate-content::-webkit-scrollbar-track {
                background: var(--light-beige, #f8f9fa);
            }

            .translate-content::-webkit-scrollbar-thumb {
                background: var(--accent-gold, #DAA520);
                border-radius: 3px;
            }

            .translate-content::-webkit-scrollbar-thumb:hover {
                background: var(--primary-dark, #654321);
            }

            .translate-option {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                padding: 12px 16px;
                border: none;
                background: var(--cream, #fdf5e6);
                cursor: pointer;
                font-size: 14px;
                color: var(--text-primary, #333);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                text-align: left;
                margin-bottom: 8px;
                border: 1px solid var(--border, #ddd);
                border-radius: 4px;
                position: relative;
                overflow: hidden;
                font-family: 'Inter', sans-serif;
                font-weight: 500;
            }

            .translate-option::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: var(--accent-gold, #DAA520);
                transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: -1;
            }

            .translate-option:hover::before {
                left: 0;
            }

            .translate-option:hover {
                border-color: var(--accent-gold, #DAA520);
                transform: translateY(-1px);
                box-shadow: var(--shadow-subtle, 0 2px 8px rgba(0,0,0,0.1));
                color: var(--text-primary, #333);
            }

            .translate-option.active {
                background: var(--primary, #8B4513);
                color: var(--text-white, white);
                font-weight: 500;
                border-color: var(--primary, #8B4513);
            }

            .translate-option.active::before {
                background: var(--primary-dark, #654321);
                left: 0;
            }

            .translate-option.active:hover {
                background: var(--primary-dark, #654321);
                border-color: var(--primary-dark, #654321);
                color: var(--text-white, white);
            }

            .lang-flag {
                font-size: 18px;
                width: 24px;
                text-align: center;
            }

            .lang-name {
                flex: 1;
            }

            .lang-code {
                font-size: 11px;
                color: inherit;
                opacity: 0.7;
                background: rgba(0,0,0,0.1);
                padding: 2px 6px;
                border-radius: 4px;
            }

            .translate-option.active .lang-code {
                background: rgba(255,255,255,0.2);
                color: inherit;
            }

            .translate-footer {
                padding: 12px 16px;
                border-top: 1px solid var(--border-light, #eee);
                background: var(--light-beige, #f8f9fa);
                text-align: center;
            }

            .translate-footer small {
                color: var(--text-secondary, #666);
                font-size: 11px;
            }

            .translate-loading {
                position: fixed;
                top: 50% !important;
                right: -420px !important;
                transform: translateY(-50%) !important;
                background: var(--warm-white, white);
                border: 1px solid var(--border, #ddd);
                border-radius: 12px;
                box-shadow: var(--shadow-strong, 0 8px 25px rgba(0,0,0,0.15));
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 150px;
                font-size: 14px;
                color: var(--text-secondary, #666);
                transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .translate-loading.show {
                right: 20px !important;
            }

            .loading-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid #f3f3f3;
                border-top: 2px solid var(--primary, #8B4513);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Translation effects */
            .translating {
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }

            .translated {
                opacity: 1;
                transition: opacity 0.3s ease;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                #universal-translator {
                    top: calc(50% + 45px); /* Adjust for mobile spacing */
                    right: 15px;
                }
                
                .translate-btn {
                    width: 44px;
                    height: 44px;
                    font-size: 18px;
                }
                
                .translate-dropdown {
                    width: calc(100vw - 30px) !important;
                    right: -100vw !important;
                    top: 20px !important;
                    transform: none !important;
                    max-height: calc(100vh - 40px) !important;
                }

                .translate-dropdown.open {
                    right: 15px !important;
                }

                .translate-loading {
                    width: calc(100vw - 30px) !important;
                    right: -100vw !important;
                    top: 20px !important;
                    transform: none !important;
                }

                .translate-loading.show {
                    right: 15px !important;
                }
            }

            /* Ensure translator is not affected by accessibility filters */
            #universal-translator,
            #universal-translator *,
            .translate-btn,
            .translate-btn * {
                filter: none !important;
                -webkit-filter: none !important;
                isolation: isolate !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }

            /* Specific handling when accessibility toolbar is active */
            html.solera-a11y-grayscale #universal-translator,
            html.solera-a11y-high-contrast #universal-translator,
            html.solera-a11y-negative-contrast #universal-translator,
            html.solera-a11y-light-background #universal-translator {
                filter: none !important;
                -webkit-filter: none !important;
            }

            /* Keep translator functional during accessibility text scaling */
            html.solera-a11y-increased-text #universal-translator,
            html.solera-a11y-increased-text #universal-translator *,
            html.solera-a11y-extra-large-text #universal-translator,
            html.solera-a11y-extra-large-text #universal-translator *,
            html.solera-a11y-decreased-text #universal-translator,
            html.solera-a11y-decreased-text #universal-translator *,
            html.solera-a11y-extra-small-text #universal-translator,
            html.solera-a11y-extra-small-text #universal-translator * {
                font-size: revert !important;
            }

            /* High contrast for accessibility */
            @media (prefers-contrast: high) {
                .translate-btn {
                    border: 2px solid #000;
                }
                
                .translate-dropdown {
                    border: 2px solid #000;
                }
            }

            /* Reduced motion for accessibility */
            @media (prefers-reduced-motion: reduce) {
                .translate-btn,
                .translate-dropdown,
                .translating,
                .translated {
                    transition: none;
                }
                
                .loading-spinner {
                    animation: none;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    attachEvents() {
        const toggle = document.getElementById('translate-toggle');
        const dropdown = document.getElementById('translate-dropdown');
        const closeBtn = document.getElementById('translate-close');

        // Toggle dropdown
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        // Close button
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.remove('open');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#universal-translator')) {
                dropdown.classList.remove('open');
            }
        });

        // Language selection
        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.translate-option');
            if (option) {
                const langCode = option.dataset.lang;
                this.translateTo(langCode);
                dropdown.classList.remove('open');
            }
        });

        // Keyboard navigation
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dropdown.classList.toggle('open');
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dropdown.classList.contains('open')) {
                dropdown.classList.remove('open');
            }
        });
    }

    async translateTo(langCode) {
        if (this.isTranslating || langCode === this.currentLanguage) return;

        this.isTranslating = true;
        this.showLoading();

        try {
            if (langCode === 'en') {
                this.restoreOriginal();
            } else {
                await this.translatePage(langCode);
            }

            this.currentLanguage = langCode;
            this.updateUI();
            this.saveLanguage();
            
        } catch (error) {
            console.error('Translation failed:', error);
            this.showError();
        } finally {
            this.isTranslating = false;
            this.hideLoading();
        }
    }

    async translatePage(targetLang) {
        const textNodes = this.getAllTextNodes();
        const batches = this.createBatches(textNodes, 100); // Process in batches

        for (const batch of batches) {
            await this.translateBatch(batch, targetLang);
            await this.sleep(100); // Small delay between batches
        }
    }

    getAllTextNodes() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip script, style, and other non-visible elements
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    
                    const tagName = parent.tagName.toLowerCase();
                    if (['script', 'style', 'noscript', 'iframe', 'object'].includes(tagName)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    // Skip if parent has no-translate attribute
                    if (parent.closest('[translate="no"], [data-no-translate]')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    // Skip translator elements
                    if (parent.closest('#universal-translator, #solera-accessibility-toolbar')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    // Skip if text is too short or only whitespace/numbers
                    const text = node.textContent.trim();
                    if (text.length < 2 || /^[\s\d\W]*$/.test(text)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        return textNodes;
    }

    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }

    async translateBatch(textNodes, targetLang) {
        const translations = await Promise.all(
            textNodes.map(node => this.translateText(node.textContent.trim(), targetLang))
        );

        textNodes.forEach((node, index) => {
            const translation = translations[index];
            if (translation && translation !== node.textContent.trim()) {
                // Store original text
                if (!node.originalText) {
                    node.originalText = node.textContent;
                }
                node.textContent = translation;
                this.translatedElements.add(node);
            }
        });
    }

    async translateText(text, targetLang) {
        const cacheKey = `${text}:${targetLang}`;
        if (this.translationCache.has(cacheKey)) {
            return this.translationCache.get(cacheKey);
        }

        try {
            // Use Google Translate API (you can replace with any translation service)
            const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
            
            if (!response.ok) throw new Error('Translation request failed');
            
            const data = await response.json();
            const translation = data[0]?.map(item => item[0]).join('') || text;
            
            // Cache the result
            this.translationCache.set(cacheKey, translation);
            return translation;
            
        } catch (error) {
            console.warn('Translation failed for:', text, error);
            return text; // Return original text on failure
        }
    }

    restoreOriginal() {
        this.translatedElements.forEach(node => {
            if (node.originalText) {
                node.textContent = node.originalText;
            }
        });
        this.translatedElements.clear();
    }

    startObserver() {
        // Watch for new content being added to the page
        this.observer = new MutationObserver((mutations) => {
            if (this.currentLanguage === 'en' || this.isTranslating) return;

            let hasNewText = false;
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.textContent.trim()) {
                            hasNewText = true;
                        }
                    });
                }
            });

            if (hasNewText) {
                // Debounce rapid changes
                clearTimeout(this.retranslateTimeout);
                this.retranslateTimeout = setTimeout(() => {
                    this.translatePage(this.currentLanguage);
                }, 500);
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    updateUI() {
        const options = document.querySelectorAll('.translate-option');
        
        options.forEach(option => {
            option.classList.toggle('active', option.dataset.lang === this.currentLanguage);
        });
    }

    showLoading() {
        const loading = document.getElementById('translate-loading');
        const dropdown = document.getElementById('translate-dropdown');
        
        if (loading) {
            loading.style.display = 'flex';
            loading.classList.add('show');
        }
        if (dropdown) dropdown.classList.remove('open');
        
        document.body.classList.add('translating');
    }

    hideLoading() {
        const loading = document.getElementById('translate-loading');
        
        if (loading) {
            loading.classList.remove('show');
            setTimeout(() => {
                loading.style.display = 'none';
            }, 400); // Wait for transition to complete
        }
        
        document.body.classList.remove('translating');
        document.body.classList.add('translated');
        setTimeout(() => document.body.classList.remove('translated'), 300);
    }

    showError() {
        // Simple error notification
        const notification = document.createElement('div');
        notification.textContent = 'Translation failed. Please try again.';
        notification.style.cssText = `
            position: fixed;
            bottom: calc(50% - 100px);
            right: 20px;
            background: #f44336;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000000;
            font-family: inherit;
            font-size: 14px;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    saveLanguage() {
        try {
            localStorage.setItem('universal-translator-lang', this.currentLanguage);
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    loadSavedLanguage() {
        try {
            const saved = localStorage.getItem('universal-translator-lang');
            if (saved && this.languages[saved]) {
                this.translateTo(saved);
            }
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        const widget = document.getElementById('universal-translator');
        const styles = document.getElementById('universal-translator-styles');
        
        if (widget) widget.remove();
        if (styles) styles.remove();
        
        this.restoreOriginal();
        
        clearTimeout(this.retranslateTimeout);
    }

    setLanguage(langCode) {
        return this.translateTo(langCode);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return { ...this.languages };
    }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    const initTranslator = () => {
        window.universalTranslator = new UniversalTranslator();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTranslator);
    } else {
        initTranslator();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalTranslator;
}