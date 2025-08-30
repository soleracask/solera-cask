// Universal Auto-Translate Widget
// Positioned below accessibility toolbar with matching circular design

class UniversalTranslator {
    constructor() {
        this.currentLanguage = 'en';
        this.isTranslating = false;
        this.translationCache = new Map();
        this.observer = null;
        this.translatedElements = new Set();
        
        // Enhanced translation configuration
        this.config = {
            // API Keys (set these with configureAPIs method)
            deepLApiKey: null,
            googleApiKey: null,
            azureKey: null,
            azureRegion: 'global',
            
            // Provider settings
            preferredProvider: 'deepl', // 'deepl', 'google', 'microsoft', 'free'
            enableFallback: true,
            
            // Usage tracking
            monthlyUsage: this.getMonthlyUsage(),
            usageLimit: 450000, // 90% of 500K limit
            
            // Caching settings
            localStorageCache: true,
            cacheExpiry: 30, // days
            maxCacheSize: 5000 // entries
        };
        
        // Supported languages with better coverage
        this.languages = {
            'en': { name: 'English', flag: '🇺🇸' },
            'es': { name: 'Español', flag: '🇪🇸' },
        };
        
        this.init();
    }

    // Configure API keys and settings
    configureAPIs(config) {
        Object.assign(this.config, config);
        console.log(`🔧 Translation APIs configured. Preferred: ${this.config.preferredProvider}`);
    }

    // Get monthly usage from localStorage
    getMonthlyUsage() {
        try {
            const stored = localStorage.getItem('translation-usage');
            if (!stored) return 0;
            
            const data = JSON.parse(stored);
            const currentMonth = new Date().getMonth();
            
            // Reset if new month
            if (data.month !== currentMonth) {
                this.resetMonthlyUsage();
                return 0;
            }
            
            return data.usage || 0;
        } catch (e) {
            return 0;
        }
    }

    // Update monthly usage
    updateMonthlyUsage(characters) {
        try {
            const currentMonth = new Date().getMonth();
            const newUsage = this.config.monthlyUsage + characters;
            
            localStorage.setItem('translation-usage', JSON.stringify({
                month: currentMonth,
                usage: newUsage
            }));
            
            this.config.monthlyUsage = newUsage;
            
            // Log usage warnings
            if (newUsage > this.config.usageLimit * 0.8) {
                console.warn(`⚠️ Translation usage: ${newUsage}/${this.config.usageLimit} (${Math.round(newUsage/this.config.usageLimit*100)}%)`);
            }
        } catch (e) {
            console.warn('Could not update usage tracking');
        }
    }

    // Reset monthly usage
    resetMonthlyUsage() {
        try {
            localStorage.setItem('translation-usage', JSON.stringify({
                month: new Date().getMonth(),
                usage: 0
            }));
            this.config.monthlyUsage = 0;
        } catch (e) {
            // Ignore errors
        }
    }

    // Enhanced caching with localStorage persistence
    getCachedTranslation(text, targetLang) {
        // Check memory cache first
        const memoryKey = `${text}:${targetLang}`;
        if (this.translationCache.has(memoryKey)) {
            return this.translationCache.get(memoryKey);
        }

        // Check localStorage cache
        if (this.config.localStorageCache) {
            try {
                const storageKey = `trans_${btoa(memoryKey).slice(0, 50)}`;
                const cached = localStorage.getItem(storageKey);
                if (cached) {
                    const data = JSON.parse(cached);
                    const age = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);
                    
                    if (age < this.config.cacheExpiry) {
                        // Move to memory cache for faster access
                        this.translationCache.set(memoryKey, data.translation);
                        return data.translation;
                    } else {
                        // Remove expired cache
                        localStorage.removeItem(storageKey);
                    }
                }
            } catch (e) {
                // Ignore localStorage errors
            }
        }

        return null;
    }

    // Store translation in both memory and localStorage
    setCachedTranslation(text, targetLang, translation) {
        const memoryKey = `${text}:${targetLang}`;
        
        // Store in memory
        if (this.translationCache.size >= this.config.maxCacheSize) {
            // Remove oldest entry
            const firstKey = this.translationCache.keys().next().value;
            this.translationCache.delete(firstKey);
        }
        this.translationCache.set(memoryKey, translation);

        // Store in localStorage
        if (this.config.localStorageCache) {
            try {
                const storageKey = `trans_${btoa(memoryKey).slice(0, 50)}`;
                const data = {
                    translation,
                    timestamp: Date.now()
                };
                localStorage.setItem(storageKey, JSON.stringify(data));
            } catch (e) {
                // Ignore localStorage errors (quota exceeded, etc.)
            }
        }
    }

    // Get provider order based on preferences and usage limits
    getProviderOrder() {
        const providers = [];
        
        // Check if we're near usage limits for paid APIs
        const nearLimit = this.config.monthlyUsage > this.config.usageLimit;
        
        if (!nearLimit) {
            // Add preferred provider first if under limit
            if (this.config.preferredProvider === 'deepl' && this.config.deepLApiKey) {
                providers.push('deepl');
            } else if (this.config.preferredProvider === 'google' && this.config.googleApiKey) {
                providers.push('google');
            } else if (this.config.preferredProvider === 'microsoft' && this.config.azureKey) {
                providers.push('microsoft');
            }

            // Add fallback providers if enabled
            if (this.config.enableFallback) {
                if (this.config.deepLApiKey && !providers.includes('deepl')) {
                    providers.push('deepl');
                }
                if (this.config.googleApiKey && !providers.includes('google')) {
                    providers.push('google');
                }
                if (this.config.azureKey && !providers.includes('microsoft')) {
                    providers.push('microsoft');
                }
            }
        }
        
        // Always add free as final fallback
        providers.push('free');
        
        return providers;
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

    // Enhanced translation method with caching and fallback
    async translateText(text, targetLang) {
        // Check cache first
        const cached = this.getCachedTranslation(text, targetLang);
        if (cached) {
            return cached;
        }

        // Skip translation for very short or irrelevant text
        if (this.shouldSkipTranslation(text)) {
            return text;
        }

        const providers = this.getProviderOrder();
        let translation = null;

        for (const provider of providers) {
            try {
                translation = await this.translateWithProvider(text, targetLang, provider);
                if (translation && translation !== text) {
                    // Track usage for paid APIs
                    if (provider !== 'free') {
                        this.updateMonthlyUsage(text.length);
                    }
                    break;
                }
            } catch (error) {
                console.warn(`${provider} translation failed:`, error.message);
                continue;
            }
        }

        // Cache successful translation
        if (translation && translation !== text) {
            this.setCachedTranslation(text, targetLang, translation);
        }

        return translation || text;
    }

    // Check if text should be skipped
    shouldSkipTranslation(text) {
        // Skip very short text
        if (text.length < 3) return true;
        
        // Skip numbers, dates, emails, phone numbers
        if (/^[\d\s\-+().,]+$/.test(text)) return true;
        if (/^\d{4}-\d{2}-\d{2}/.test(text)) return true;
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return true;
        if (/^[\+]?[\d\s\-()]{10,}$/.test(text)) return true;
        
        // Skip URLs
        if (/^https?:\/\//.test(text)) return true;
        
        // Skip common untranslatable content
        const skipPatterns = [
            /^[A-Z]{2,}$/, // All caps abbreviations
            /^\$[\d,.]+$/, // Prices
            /^[\d]+%$/, // Percentages
        ];
        
        return skipPatterns.some(pattern => pattern.test(text.trim()));
    }

    // Route to specific provider
    async translateWithProvider(text, targetLang, provider) {
        switch (provider) {
            case 'deepl':
                return await this.translateWithDeepL(text, targetLang);
            case 'google':
                return await this.translateWithGoogleAPI(text, targetLang);
            case 'microsoft':
                return await this.translateWithMicrosoft(text, targetLang);
            case 'free':
                return await this.translateWithFreeAPI(text, targetLang);
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }

    // DeepL API (Best for Spanish)
    async translateWithDeepL(text, targetLang) {
        if (!this.config.deepLApiKey) {
            throw new Error('DeepL API key not configured');
        }

        // Map language codes for DeepL
        const deepLLangMap = {
            'es': 'ES',
            'fr': 'FR', 
            'de': 'DE',
            'it': 'IT',
            'pt': 'PT',
            'ru': 'RU',
            'ja': 'JA',
            'zh': 'ZH'
        };

        const deepLTarget = deepLLangMap[targetLang] || targetLang.toUpperCase();

        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${this.config.deepLApiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'text': text,
                'target_lang': deepLTarget,
                'source_lang': 'EN'
            })
        });

        if (!response.ok) {
            throw new Error(`DeepL API error: ${response.status}`);
        }

        const data = await response.json();
        return data.translations[0].text;
    }

    // Google Translate API (Official)
    async translateWithGoogleAPI(text, targetLang) {
        if (!this.config.googleApiKey) {
            throw new Error('Google API key not configured');
        }

        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.config.googleApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: 'en',
                target: targetLang,
                format: 'text'
            })
        });

        if (!response.ok) {
            throw new Error(`Google Translate API error: ${response.status}`);
        }

        const data = await response.json();
        return data.data.translations[0].translatedText;
    }

    // Microsoft Translator
    async translateWithMicrosoft(text, targetLang) {
        if (!this.config.azureKey) {
            throw new Error('Azure key not configured');
        }

        const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${targetLang}`, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': this.config.azureKey,
                'Ocp-Apim-Subscription-Region': this.config.azureRegion,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{ text: text }])
        });

        if (!response.ok) {
            throw new Error(`Microsoft Translator error: ${response.status}`);
        }

        const data = await response.json();
        return data[0].translations[0].text;
    }

    // Free API fallback (your current method)
    async translateWithFreeAPI(text, targetLang) {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
        
        if (!response.ok) throw new Error('Free translation failed');
        
        const data = await response.json();
        return data[0]?.map(item => item[0]).join('') || text;
    }

    // Public API methods for easy setup
    setDeepLKey(apiKey) {
        this.config.deepLApiKey = apiKey;
        this.config.preferredProvider = 'deepl';
        console.log('✅ DeepL API configured as primary provider');
    }

    setGoogleKey(apiKey) {
        this.config.googleApiKey = apiKey;
        if (!this.config.deepLApiKey) {
            this.config.preferredProvider = 'google';
        }
        console.log('✅ Google Translate API configured');
    }

    // Setup method for Solera Cask specifically
    setupForSpanish(deepLKey = null, googleKey = null) {
        const config = {
            preferredProvider: 'deepl',
            enableFallback: true,
            localStorageCache: true,
            cacheExpiry: 30, // 30 days
            usageLimit: 450000 // 90% of DeepL free limit
        };

        if (deepLKey) {
            config.deepLApiKey = deepLKey;
            console.log('🇪🇸 Spanish translation optimized with DeepL');
        }
        
        if (googleKey) {
            config.googleApiKey = googleKey;
            console.log('🔄 Google Translate configured as fallback');
        }

        this.configureAPIs(config);
        
        // Show current setup
        console.log('📊 Translation setup:', {
            primary: this.getProviderOrder()[0],
            fallback: this.config.enableFallback,
            caching: this.config.localStorageCache,
            monthlyUsage: `${this.config.monthlyUsage}/${this.config.usageLimit}`
        });
    }

    // Monitor usage in real-time
    onUsageUpdate(callback) {
        this.usageCallback = callback;
    }

    // Override updateMonthlyUsage to trigger callback
    updateMonthlyUsage(characters) {
        const oldUsage = this.config.monthlyUsage;
        
        try {
            const currentMonth = new Date().getMonth();
            const newUsage = this.config.monthlyUsage + characters;
            
            localStorage.setItem('translation-usage', JSON.stringify({
                month: currentMonth,
                usage: newUsage
            }));
            
            this.config.monthlyUsage = newUsage;
            
            // Trigger callback if provided
            if (this.usageCallback) {
                this.usageCallback({
                    characters,
                    totalUsage: newUsage,
                    limit: this.config.usageLimit,
                    percentage: Math.round((newUsage / this.config.usageLimit) * 100)
                });
            }
            
            // Log usage warnings
            const percentage = newUsage / this.config.usageLimit;
            if (percentage > 0.9) {
                console.warn(`🚨 Translation usage: ${newUsage}/${this.config.usageLimit} (${Math.round(percentage*100)}%) - Switching to free tier`);
            } else if (percentage > 0.8) {
                console.warn(`⚠️ Translation usage: ${newUsage}/${this.config.usageLimit} (${Math.round(percentage*100)}%)`);
            }
        } catch (e) {
            console.warn('Could not update usage tracking');
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
        
        // Example setup for Solera Cask
        // Uncomment and add your API keys:
        
        // window.universalTranslator.setupForSpanish(
        //     'YOUR_DEEPL_API_KEY',  // Get from https://www.deepl.com/pro-api
        //     'YOUR_GOOGLE_API_KEY'  // Optional fallback
        // );
        
        // Monitor usage (optional)
        // window.universalTranslator.onUsageUpdate((stats) => {
        //     console.log(`Translation usage: ${stats.percentage}%`);
        // });
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

/*
QUICK SETUP GUIDE FOR SOLERA CASK:

1. Get DeepL API Key (FREE):
   - Go to https://www.deepl.com/pro-api
   - Sign up for free account
   - Get API key from dashboard

2. Configure translation:
   window.universalTranslator.setupForSpanish('your-deepl-key');

3. Optional Google Translate backup:
   window.universalTranslator.setGoogleKey('your-google-key');

4. Check usage anytime:
   console.log(window.universalTranslator.getUsageStats());

FEATURES INCLUDED:
✅ Aggressive caching (localStorage + memory)
✅ Smart fallback (DeepL → Google → Free)
✅ Usage tracking and limits
✅ Spanish-optimized translation
✅ Skip irrelevant content (emails, numbers, etc.)
✅ 30-day cache expiry
✅ Real-time usage monitoring

The system will automatically:
- Use cached translations when available
- Fall back to free tier when approaching limits
- Skip translating phone numbers, emails, etc.
- Persist translations across browser sessions
*/