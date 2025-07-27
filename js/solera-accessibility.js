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