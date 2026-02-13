// Cookie Consent Manager for Solera Cask
class CookieConsent {
  constructor() {
    this.consentKey = 'solera-cookie-consent';
    this.preferencesKey = 'solera-cookie-preferences';
    this.init();
  }

  init() {
    // Check if user has already made a choice
    const consent = this.getConsent();
    
    if (!consent) {
      // Show banner on first visit
      this.showBanner();
    } else {
      // Apply saved preferences
      this.applyConsent(consent);
    }

    // Set up preference modal triggers
    this.setupModalTriggers();
  }

  getConsent() {
    const stored = localStorage.getItem(this.consentKey);
    return stored ? JSON.parse(stored) : null;
  }

  saveConsent(preferences) {
    const consent = {
      timestamp: new Date().toISOString(),
      preferences: preferences
    };
    localStorage.setItem(this.consentKey, JSON.stringify(consent));
    this.applyConsent(consent);
  }

  applyConsent(consent) {
    const prefs = consent.preferences;
    
    // Load optional scripts based on consent
    if (prefs.analytics) {
      this.loadAnalytics();
    }

    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { 
      detail: prefs 
    }));
  }

  loadAnalytics() {
    // Placeholder for when you add analytics
    console.log('Analytics loaded');
  }

  showBanner() {
    const banner = this.createBanner();
    document.body.appendChild(banner);
    
    // Fade in
    setTimeout(() => banner.classList.add('visible'), 100);
  }

  createBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <div class="cookie-banner-content">
        <div class="cookie-banner-text">
          <h3>Cookie Preferences</h3>
          <p>We use essential cookies for website functionality. You can change your cookie preferences by clicking customize.</p>
        </div>
        <div class="cookie-banner-actions">
          <button class="btn-secondary" id="cookie-reject">Only Necessary Cookies</button>
          <button class="btn-secondary" id="cookie-customize">Customize</button>
          <button class="btn-secondary" id="cookie-accept">Accept All</button>
        </div>
      </div>
    `;

    // Event listeners
    banner.querySelector('#cookie-accept').addEventListener('click', () => {
      this.acceptAll();
      this.hideBanner(banner);
    });

    banner.querySelector('#cookie-reject').addEventListener('click', () => {
      this.rejectAll();
      this.hideBanner(banner);
    });

    banner.querySelector('#cookie-customize').addEventListener('click', () => {
      this.hideBanner(banner);
      this.showPreferencesModal();
    });

    return banner;
  }

  hideBanner(banner) {
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 300);
  }

  acceptAll() {
    this.saveConsent({
      necessary: true,
      analytics: true
    });
  }

  rejectAll() {
    this.saveConsent({
      necessary: true,
      analytics: false
    });
  }

  showPreferencesModal() {
    const modal = this.createPreferencesModal();
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('visible'), 100);
  }

  createPreferencesModal() {
    const currentPrefs = this.getConsent()?.preferences || {
      necessary: true,
      analytics: false
    };

    const modal = document.createElement('div');
    modal.id = 'cookie-preferences-modal';
    modal.className = 'cookie-modal';
    modal.innerHTML = `
      <div class="cookie-modal-overlay"></div>
      <div class="cookie-modal-content">
        <div class="cookie-modal-header">
          <h2>Cookie Preferences</h2>
          <button class="cookie-modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="cookie-modal-body">
          <div class="cookie-category">
            <div class="cookie-category-header">
              <h3>Strictly Necessary Cookies</h3>
              <span class="cookie-status always-on">Always On</span>
            </div>
            <p>These cookies are essential for the website to function properly. They enable core functionality such as form submissions and security features.</p>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <h3>Analytics Cookies</h3>
              <label class="cookie-toggle">
                <input type="checkbox" id="cookie-analytics" ${currentPrefs.analytics ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <p>These cookies help us understand how visitors interact with our website, allowing us to improve our service.</p>
          </div>
        </div>
        <div class="cookie-modal-footer">
          <button class="btn-secondary" id="cookie-save-preferences">Save Preferences</button>
        </div>
      </div>
    `;

    // Event listeners
    modal.querySelector('.cookie-modal-close').addEventListener('click', () => {
      this.hideModal(modal);
    });

    modal.querySelector('.cookie-modal-overlay').addEventListener('click', () => {
      this.hideModal(modal);
    });

    modal.querySelector('#cookie-save-preferences').addEventListener('click', () => {
      const analytics = modal.querySelector('#cookie-analytics').checked;
      
      this.saveConsent({
        necessary: true,
        analytics: analytics
      });
      
      this.hideModal(modal);
    });

    return modal;
  }

  hideModal(modal) {
    modal.classList.remove('visible');
    setTimeout(() => modal.remove(), 300);
  }

  setupModalTriggers() {
    // Allow users to open preferences later via a link
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-cookie-preferences]')) {
        e.preventDefault();
        this.showPreferencesModal();
      }
    });
  }

  // Public method to reset consent (for testing)
  reset() {
    localStorage.removeItem(this.consentKey);
    location.reload();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent = new CookieConsent();
  });
} else {
  window.cookieConsent = new CookieConsent();
}