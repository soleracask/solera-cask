class SoleraTranslationToolbar {
    constructor() {
        this.settings = {
            language: 'en' // Default language: English
        };

        this.isOpen = false;
        this.isInitialized = false;
        this.eventListenersAttached = false;

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        console.log('Initializing Solera Translation Toolbar');
        this.loadGoogleTranslate(() => {
            console.log('Google Translate script loaded');
            this.loadSettings();
            this.addStyles();
            this.createToggleButton();
            this.createToolbar();
            this.setupPersistentEventListeners();
            this.initializeGoogleTranslate();
            this.applySettings();
            this.updateUI();
            this.ensureToolbarVisibility();

            this.isInitialized = true;
            console.log('Solera Translation Toolbar fully initialized');
        });
    }

    loadGoogleTranslate(callback) {
        if (window.google && window.google.translate) {
            console.log('Google Translate already loaded');
            callback();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.onload = () => {
            console.log('Google Translate script loaded successfully');
            callback();
        };
        script.onerror = () => console.error('Failed to load Google Translate script');
        document.head.appendChild(script);

        window.googleTranslateElementInit = () => {
            console.log('Google Translate element initialized');
            this.initializeGoogleTranslate();
            callback();
        };
    }

    initializeGoogleTranslate() {
        const googleWidget = document.getElementById('google_translate_element');
        if (!googleWidget) {
            console.error('Google Translate widget container not found. Ensure <div id="google_translate_element"> exists in HTML.');
            return;
        }
        try {
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,es,fr',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
            }, 'google_translate_element');
            console.log('Google Translate widget initialized');
        } catch (error) {
            console.error('Error initializing Google Translate:', error);
        }
    }

    loadSettings() {
        const stored = localStorage.getItem('solera-trans-language');
        if (stored !== null) {
            this.settings.language = stored;
        }
        console.log('Loaded settings:', this.settings);
    }

    saveSettings() {
        localStorage.setItem('solera-trans-language', this.settings.language);
        console.log('Saved settings:', this.settings);
    }

    createToggleButton() {
        let button = document.getElementById('soleraTranslationToggle');
        if (!button) {
            button = document.createElement('button');
            button.id = 'soleraTranslationToggle';
            button.className = 'solera-translation-toggle-btn';
            button.setAttribute('data-solera-trans-toggle', 'true');
            button.setAttribute('aria-label', 'Select Language');
            button.innerHTML = `
                <span class="solera-translation-icon" aria-hidden="true">🌐</span>
            `;
            document.body.appendChild(button);
            console.log('Solera translation toggle button created');
        }
    }

    createToolbar() {
        let toolbar = document.getElementById('solera-translation-toolbar');
        if (!toolbar) {
            toolbar = document.createElement('div');
            toolbar.id = 'solera-translation-toolbar';
            toolbar.className = 'solera-translation-toolbar';
            toolbar.setAttribute('data-solera-trans-toolbar', 'true');
            toolbar.innerHTML = `
                <div class="solera-trans-header">
                    <div class="solera-trans-title">
                        <span class="solera-trans-icon">🌐</span>
                        <span>Language</span>
                    </div>
                    <button class="solera-trans-close" data-solera-trans-close="true" aria-label="Close translation options">
                        <span>✕</span>
                    </button>
                </div>
                <div class="solera-trans-content" data-solera-trans-content="true">
                    <div class="solera-trans-section">
                        <h3>Language</h3>
                        <select class="solera-trans-language-select" data-solera-trans-action="changeLanguage">
                            <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
                            <option value="es" ${this.settings.language === 'es' ? 'selected' : ''}>Español</option>
                            <option value="fr" ${this.settings.language === 'fr' ? 'selected' : ''}>Français</option>
                        </select>
                    </div>
                </div>
            `;
            document.body.appendChild(toolbar);
            console.log('Solera translation toolbar created');
        }
    }

    addStyles() {
        let styles = document.getElementById('solera-translation-toolbar-styles');
        if (!styles) {
            styles = document.createElement('style');
            styles.id = 'solera-translation-toolbar-styles';
            document.head.appendChild(styles);
        }

        styles.textContent = `
            /* Solera Translation Toggle Button */
            .solera-translation-toggle-btn {
                position: fixed !important;
                top: calc(50% + 60px) !important;
                right: 20px !important;
                transform: translateY(-50%) !important;
                background: var(--primary, #3B2F2F) !important;
                border: 1px solid var(--border, #D4A373) !important;
                color: var(--text-white, #FFFFFF) !important;
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
                box-shadow: var(--shadow-medium, 0 4px 6px rgba(0,0,0,0.1)) !important;
                z-index: 9997 !important;
                filter: none !important;
                -webkit-filter: none !important;
                isolation: isolate !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }

            .solera-translation-toggle-btn:hover {
                background: var(--accent-gold, #D4A373) !important;
                color: var(--text-primary, #3B2F2F) !important;
                transform: translateY(-50%) scale(1.05) !important;
                box-shadow: var(--shadow-strong, 0 6px 12px rgba(0,0,0,0.15)) !important;
            }

            .solera-translation-icon {
                color: inherit !important;
                font-size: 20px !important;
                filter: none !important;
                -webkit-filter: none !important;
                line-height: 1 !important;
            }

            /* Solera Translation Toolbar */
            .solera-translation-toolbar {
                position: fixed !important;
                top: 50% !important;
                right: -420px !important;
                transform: translateY(-50%) !important;
                width: 380px !important;
                max-height: 80vh !important;
                background: var(--warm-white, #F8F1E9) !important;
                border: 1px solid var(--border, #D4A373) !important;
                border-radius: 0 !important;
                box-shadow: var(--shadow-strong, 0 6px 12px rgba(0,0,0,0.15)) !important;
                z-index: 9998 !important;
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

            .solera-translation-toolbar.open {
                right: 20px !important;
            }

            /* Elegant Header */
            .solera-trans-header {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 24px !important;
                background: linear-gradient(135deg, var(--primary, #3B2F2F) 0%, var(--primary-dark, #2A1F1F) 100%) !important;
                color: var(--text-white, #FFFFFF) !important;
                position: relative !important;
            }

            .solera-trans-title {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                font-family: 'Playfair Display', serif !important;
                font-weight: 400 !important;
                font-size: 18px !important;
                color: var(--text-white, #FFFFFF) !important;
            }

            .solera-trans-icon {
                font-size: 24px !important;
                color: var(--accent-gold, #D4A373) !important;
                filter: none !important;
                -webkit-filter: none !important;
            }

            .solera-trans-close {
                background: transparent !important;
                border: 1px solid rgba(255, 255, 255, 0.3) !important;
                color: var(--text-white, #FFFFFF) !important;
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

            .solera-trans-close:hover {
                background: rgba(255, 255, 255, 0.1) !important;
                border-color: rgba(255, 255, 255, 0.5) !important;
                transform: scale(1.05) !important;
            }

            /* Content Area */
            .solera-trans-content {
                padding: 24px !important;
                background: var(--warm-white, #F8F1E9) !important;
                color: var(--text-primary, #3B2F2F) !important;
                max-height: calc(80vh - 96px) !important;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch !important;
            }

            /* Custom scrollbar for webkit browsers */
            .solera-trans-content::-webkit-scrollbar {
                width: 6px !important;
            }

            .solera-trans-content::-webkit-scrollbar-track {
                background: var(--light-beige, #EDE4D3) !important;
            }

            .solera-trans-content::-webkit-scrollbar-thumb {
                background: var(--accent-gold, #D4A373) !important;
                border-radius: 3px !important;
            }

            .solera-trans-content::-webkit-scrollbar-thumb:hover {
                background: var(--primary-dark, #2A1F1F) !important;
            }

            /* Sections */
            .solera-trans-section {
                margin-bottom: 32px !important;
            }

            .solera-trans-section:last-child {
                margin-bottom: 0 !important;
            }

            .solera-trans-section h3 {
                font-family: 'Playfair Display', serif !important;
                font-weight: 400 !important;
                font-size: 16px !important;
                color: var(--text-primary, #3B2F2F) !important;
                margin-bottom: 16px !important;
                padding-bottom: 8px !important;
                border-bottom: 1px solid var(--border-light, #E0E0E0) !important;
            }

            /* Language Selector */
            .solera-trans-language-select {
                width: 100% !important;
                padding: 12px 16px !important;
                background: var(--cream, #FFF8E7) !important;
                border: 1px solid var(--border, #D4A373) !important;
                border-radius: 4px !important;
                font-family: 'Inter', sans-serif !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                color: var(--text-primary, #3B2F2F) !important;
                cursor: pointer !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                appearance: none !important;
                -webkit-appearance: none !important;
                -moz-appearance: none !important;
                background-image: url('data:image/svg+xml;utf8,<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3"/></svg>') !important;
                background-repeat: no-repeat !important;
                background-position: right 12px center !important;
                background-size: 16px !important;
            }

            .solera-trans-language-select:hover {
                border-color: var(--accent-gold, #D4A373) !important;
                transform: translateY(-1px) !important;
                box-shadow: var(--shadow-subtle, 0 2px 4px rgba(0,0,0,0.05)) !important;
            }

            .solera-trans-language-select:focus {
                outline: none !important;
                border-color: var(--accent-gold, #D4A373) !important;
                box-shadow: 0 0 0 3px rgba(212,163,115,0.2) !important;
            }

            /* Exclude toolbar from accessibility effects */
            .solera-translation-toolbar, .solera-translation-toolbar *,
            .solera-translation-toggle-btn, .solera-translation-toggle-btn * {
                filter: none !important;
                -webkit-filter: none !important;
                isolation: isolate !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }

            /* Hide Google Translate's default widget */
            #google_translate_element, .goog-te-banner-frame {
                display: none !important;
            }

            /* Mobile Responsive Design */
            @media (max-width: 768px) {
                .solera-translation-toggle-btn {
                    right: 15px !important;
                    top: calc(50% + 55px) !important;
                    width: 44px !important;
                    height: 44px !important;
                    font-size: 18px !important;
                }

                .solera-translation-toolbar {
                    width: calc(100vw - 30px) !important;
                    right: -100vw !important;
                    top: 20px !important;
                    transform: none !important;
                    max-height: calc(100vh - 40px) !important;
                }

                .solera-translation-toolbar.open {
                    right: 15px !important;
                }

                .solera-trans-header {
                    padding: 20px !important;
                }

                .solera-trans-title {
                    font-size: 16px !important;
                    gap: 10px !important;
                }

                .solera-trans-icon {
                    font-size: 20px !important;
                }

                .solera-trans-content {
                    padding: 20px !important;
                    max-height: calc(100vh - 136px) !important;
                }

                .solera-trans-section {
                    margin-bottom: 24px !important;
                }

                .solera-trans-language-select {
                    padding: 14px 16px !important;
                    font-size: 15px !important;
                }
            }

            /* Extra small mobile screens */
            @media (max-width: 480px) {
                .solera-translation-toolbar {
                    width: calc(100vw - 20px) !important;
                }

                .solera-translation-toolbar.open {
                    right: 10px !important;
                }

                .solera-trans-header {
                    padding: 16px !important;
                }

                .solera-trans-title {
                    font-size: 15px !important;
                }

                .solera-trans-content {
                    padding: 16px !important;
                }

                .solera-trans-language-select {
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

            const toggleButton = e.target.closest('[data-solera-trans-toggle]');
            if (toggleButton) {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
                return;
            }

            const closeButton = e.target.closest('[data-solera-trans-close]');
            if (closeButton) {
                e.preventDefault();
                e.stopPropagation();
                this.close();
                return;
            }
        };

        const globalChangeHandler = (e) => {
            const actionSelect = e.target.closest('[data-solera-trans-action]');
            if (actionSelect) {
                e.preventDefault();
                console.log('Language select changed:', actionSelect.value);
                const action = actionSelect.getAttribute('data-solera-trans-action');
                this.handleAction(action, actionSelect.value);
            }
        };

        const globalKeyHandler = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };

        document.addEventListener('click', globalClickHandler, true);
        document.addEventListener('change', globalChangeHandler, true);
        document.addEventListener('keydown', globalKeyHandler, true);

        const observer = new MutationObserver(() => {
            if (!document.querySelector('#soleraTranslationToggle')) {
                this.createToggleButton();
            }
            if (!document.querySelector('#solera-translation-toolbar')) {
                this.createToolbar();
            }
            this.ensureToolbarVisibility();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        window.addEventListener('resize', () => this.handleResize());

        this.globalClickHandler = globalClickHandler;
        this.globalChangeHandler = globalChangeHandler;
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
        const toolbar = document.getElementById('solera-translation-toolbar');
        if (!toolbar) {
            this.createToolbar();
            return this.open();
        }

        this.isOpen = true;
        toolbar.classList.add('open');
        this.ensureToolbarVisibility();
    }

    close() {
        const toolbar = document.getElementById('solera-translation-toolbar');
        if (!toolbar) return;

        this.isOpen = false;
        toolbar.classList.remove('open');
    }

    handleAction(action, value) {
        console.log('Handling action:', action, 'with value:', value);
        if (action === 'changeLanguage') {
            this.settings.language = value;
            this.saveSettings();
            const translateSelect = document.querySelector('.goog-te-combo');
            if (translateSelect) {
                translateSelect.value = value;
                translateSelect.dispatchEvent(new Event('change'));
                console.log('Dispatched change event to Google Translate with value:', value);
            } else {
                console.error('Google Translate select (.goog-te-combo) not found');
            }
            this.updateUI();
            this.ensureToolbarVisibility();
        }
    }

    applySettings() {
        const translateSelect = document.querySelector('.goog-te-combo');
        if (translateSelect) {
            translateSelect.value = this.settings.language;
            translateSelect.dispatchEvent(new Event('change'));
            console.log('Applied settings, set language to:', this.settings.language);
        } else {
            console.error('Google Translate select (.goog-te-combo) not found during applySettings');
        }
    }

    updateUI() {
        const select = document.querySelector('.solera-trans-language-select');
        if (select) {
            select.value = this.settings.language;
            console.log('Updated UI, set dropdown to:', this.settings.language);
        }
    }

    ensureToolbarVisibility() {
        setTimeout(() => {
            const toolbar = document.getElementById('solera-translation-toolbar');
            const toggleBtn = document.getElementById('soleraTranslationToggle');

            if (toolbar) {
                toolbar.style.cssText += 'filter: none !important; -webkit-filter: none !important; isolation: isolate !important; visibility: visible !important; opacity: 1 !important; pointer-events: auto !important;';
            }

            if (toggleBtn) {
                toggleBtn.style.cssText += 'filter: none !important; -webkit-filter: none !important; isolation: isolate !important; visibility: visible !important; opacity: 1 !important; pointer-events: auto !important;';
            }

            const googleWidget = document.getElementById('google_translate_element');
            if (googleWidget) {
                googleWidget.style.display = 'none';
            }
        }, 50);
    }

    handleResize() {
        this.ensureToolbarVisibility();
    }

    destroy() {
        if (this.globalClickHandler) {
            document.removeEventListener('click', this.globalClickHandler, true);
        }
        if (this.globalChangeHandler) {
            document.removeEventListener('change', this.globalChangeHandler, true);
        }
        if (this.globalKeyHandler) {
            document.removeEventListener('keydown', this.globalKeyHandler, true);
        }
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }

        const toolbar = document.getElementById('solera-translation-toolbar');
        if (toolbar) toolbar.remove();

        const toggleButton = document.getElementById('soleraTranslationToggle');
        if (toggleButton) toggleButton.remove();

        const styles = document.getElementById('solera-translation-toolbar-styles');
        if (styles) styles.remove();

        this.eventListenersAttached = false;
        this.isInitialized = false;
    }
}

// Initialize the Solera translation toolbar
window.soleraTranslationToolbar = new SoleraTranslationToolbar();