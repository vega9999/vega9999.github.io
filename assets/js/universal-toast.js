// js/universal-toast.js - Enhanced Toast-System mit AJAX-Support

class UniversalToastManager {
    constructor() {
        this.toastContainer = null;
        this.isInitialized = false;
        this.submitButtons = new Map(); // Store original button states
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
        if (this.isInitialized) return;

        this.setupStyles();
        this.setupContainer();
        this.checkUrlParams();
        this.setupFormHandlers();
        this.isInitialized = true;

        // Global verfügbar machen
        window.showToast = (message, type, duration, title) => this.showToast(message, type, duration, title);
        window.universalToast = this;

        console.log('Enhanced Universal Toast System initialized with AJAX support');
    }

    setupStyles() {
        if (document.getElementById('universal-toast-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'universal-toast-styles';
        styles.textContent = `
            .universal-toast-container {
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                z-index: 10001 !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 10px !important;
                max-width: 400px !important;
                pointer-events: none !important;
            }

            .universal-toast {
                background: white !important;
                border-radius: 12px !important;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
                min-width: 320px !important;
                max-width: 400px !important;
                opacity: 0 !important;
                transform: translateX(100%) !important;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                border-left: 4px solid !important;
                pointer-events: auto !important;
                position: relative !important;
                overflow: hidden !important;
            }

            .universal-toast::before {
                content: '' !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                height: 100% !important;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent) !important;
                transform: translateX(-100%) !important;
                transition: transform 0.6s ease !important;
            }

            .universal-toast.show::before {
                transform: translateX(100%) !important;
            }

            .universal-toast.show {
                opacity: 1 !important;
                transform: translateX(0) !important;
            }

            .universal-toast.hide {
                opacity: 0 !important;
                transform: translateX(100%) !important;
            }

            .universal-toast-content {
                display: flex !important;
                align-items: flex-start !important;
                padding: 18px !important;
                gap: 14px !important;
                position: relative !important;
                z-index: 1 !important;
            }

            .universal-toast-icon {
                flex-shrink: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 24px !important;
                height: 24px !important;
                margin-top: 2px !important;
            }

            .universal-toast-text {
                flex: 1 !important;
                min-width: 0 !important;
            }

            .universal-toast-title {
                font-size: 15px !important;
                font-weight: 600 !important;
                line-height: 1.3 !important;
                color: #1f2937 !important;
                margin: 0 0 4px 0 !important;
            }

            .universal-toast-message {
                font-size: 14px !important;
                line-height: 1.5 !important;
                color: #6b7280 !important;
                margin: 0 !important;
            }

            .universal-toast-close {
                background: none !important;
                border: none !important;
                cursor: pointer !important;
                padding: 4px !important;
                border-radius: 6px !important;
                color: #9ca3af !important;
                transition: all 0.2s ease !important;
                flex-shrink: 0 !important;
                width: 24px !important;
                height: 24px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }

            .universal-toast-close:hover {
                background-color: rgba(0, 0, 0, 0.05) !important;
                color: #374151 !important;
            }

            .universal-toast-progress {
                position: absolute !important;
                bottom: 0 !important;
                left: 0 !important;
                height: 3px !important;
                background: currentColor !important;
                opacity: 0.3 !important;
                transition: width linear !important;
            }

            /* Success Toast */
            .universal-toast.success {
                border-left-color: #10b981 !important;
            }

            .universal-toast.success .universal-toast-icon {
                color: #10b981 !important;
            }

            .universal-toast.success .universal-toast-progress {
                background: #10b981 !important;
            }

            /* Error Toast */
            .universal-toast.error {
                border-left-color: #ef4444 !important;
            }

            .universal-toast.error .universal-toast-icon {
                color: #ef4444 !important;
            }

            .universal-toast.error .universal-toast-progress {
                background: #ef4444 !important;
            }

            /* Warning Toast */
            .universal-toast.warning {
                border-left-color: #f59e0b !important;
            }

            .universal-toast.warning .universal-toast-icon {
                color: #f59e0b !important;
            }

            .universal-toast.warning .universal-toast-progress {
                background: #f59e0b !important;
            }

            /* Info Toast */
            .universal-toast.info {
                border-left-color: #3b82f6 !important;
            }

            .universal-toast.info .universal-toast-icon {
                color: #3b82f6 !important;
            }

            .universal-toast.info .universal-toast-progress {
                background: #3b82f6 !important;
            }

            /* Loading States for Buttons */
            .btn-loading {
                position: relative !important;
                pointer-events: none !important;
                opacity: 0.7 !important;
            }

            .btn-loading::after {
                content: '' !important;
                position: absolute !important;
                width: 16px !important;
                height: 16px !important;
                margin: auto !important;
                border: 2px solid transparent !important;
                border-top-color: currentColor !important;
                border-radius: 50% !important;
                animation: button-loading-spinner 1s ease infinite !important;
                top: 0 !important;
                left: 0 !important;
                bottom: 0 !important;
                right: 0 !important;
            }

            @keyframes button-loading-spinner {
                from { transform: rotate(0turn); }
                to { transform: rotate(1turn); }
            }

            /* Dark Mode */
            body.dark-mode .universal-toast {
                background: #1f2937 !important;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4) !important;
            }

            body.dark-mode .universal-toast-title {
                color: #f9fafb !important;
            }

            body.dark-mode .universal-toast-message {
                color: #d1d5db !important;
            }

            body.dark-mode .universal-toast-close {
                color: #9ca3af !important;
            }

            body.dark-mode .universal-toast-close:hover {
                background-color: rgba(255, 255, 255, 0.1) !important;
                color: #f3f4f6 !important;
            }

            /* Mobile Responsive */
            @media (max-width: 480px) {
                .universal-toast-container {
                    bottom: 10px !important;
                    right: 10px !important;
                    left: 10px !important;
                    max-width: none !important;
                }

                .universal-toast {
                    min-width: auto !important;
                    max-width: none !important;
                    border-radius: 8px !important;
                }

                .universal-toast-content {
                    padding: 14px !important;
                    gap: 12px !important;
                }

                .universal-toast-title {
                    font-size: 14px !important;
                }

                .universal-toast-message {
                    font-size: 13px !important;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    setupContainer() {
        if (this.toastContainer) return;

        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'universal-toast-container';
        this.toastContainer.className = 'universal-toast-container';
        document.body.appendChild(this.toastContainer);
    }

    showToast(message, type = 'info', duration = 6000, title = null) {
        if (!this.toastContainer) {
            this.setupContainer();
        }

        // Auto-generate title based on type if not provided
        if (!title) {
            const titles = {
                success: 'Erfolgreich',
                error: 'Fehler',
                warning: 'Warnung',
                info: 'Information'
            };
            title = titles[type] || 'Benachrichtigung';
        }

        const toast = document.createElement('div');
        toast.className = `universal-toast ${type}`;

        const icon = this.getIcon(type);
        const progressBar = duration > 0 ? '<div class="universal-toast-progress"></div>' : '';

        toast.innerHTML = `
            <div class="universal-toast-content">
                <div class="universal-toast-icon">${icon}</div>
                <div class="universal-toast-text">
                    <div class="universal-toast-title">${title}</div>
                    <div class="universal-toast-message">${message}</div>
                </div>
                <button class="universal-toast-close" aria-label="Benachrichtigung schließen">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                    </svg>
                </button>
            </div>
            ${progressBar}
        `;

        // Event Handlers
        const closeBtn = toast.querySelector('.universal-toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        // Add to container
        this.toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Progress bar animation
        if (duration > 0) {
            const progressElement = toast.querySelector('.universal-toast-progress');
            if (progressElement) {
                progressElement.style.width = '100%';
                progressElement.style.transitionDuration = `${duration}ms`;

                requestAnimationFrame(() => {
                    progressElement.style.width = '0%';
                });
            }

            // Auto remove
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        return toast;
    }

    removeToast(toast) {
        if (!toast || !toast.parentElement) return;

        toast.classList.add('hide');
        toast.classList.remove('show');

        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 400);
    }

    getIcon(type) {
        const icons = {
            success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
            </svg>`,

            error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
            </svg>`,

            warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,13H11V7H13M12,17.3A1.3,1.3 0 0,1 10.7,16A1.3,1.3 0 0,1 12,14.7A1.3,1.3 0 0,1 13.3,16A1.3,1.3 0 0,1 12,17.3M15.73,3H8.27L3,8.27V15.73L8.27,21H15.73L21,15.73V8.27L15.73,3Z"/>
            </svg>`,

            info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>`
        };

        return icons[type] || icons.info;
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const message = urlParams.get('msg');

        if (status === 'success') {
            this.showToast(
                'Ihre Anfrage wurde erfolgreich gesendet! Wir melden uns innerhalb von 24 Stunden bei Ihnen.',
                'success',
                8000,
                'Anfrage gesendet'
            );
            this.cleanUrl();
        } else if (status === 'error') {
            const errorMsg = message ?
                decodeURIComponent(message) :
                'Es gab einen Fehler beim Senden Ihrer Anfrage. Bitte versuchen Sie es erneut.';

            this.showToast(errorMsg, 'error', 8000, 'Fehler beim Senden');
            this.cleanUrl();
        }
    }

    cleanUrl() {
        // URL Parameter entfernen nach dem Anzeigen der Nachricht
        if (window.history && window.history.replaceState) {
            const url = window.location.pathname;
            window.history.replaceState({}, document.title, url);
        }
    }

    setupFormHandlers() {
        // AJAX Form-Handler für alle Kontaktformulare
        document.addEventListener('submit', (e) => {
            const form = e.target;

            // Nur für Formulare die contact-handler.php verwenden
            if (form.action && form.action.includes('contact-handler.php')) {
                e.preventDefault(); // Standard-Submit verhindern
                this.handleAjaxFormSubmit(form);
            }
        });
    }

    async handleAjaxFormSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');

        if (!submitBtn) {
            console.error('Submit button not found');
            return;
        }

        // Button State speichern
        const buttonState = {
            text: submitBtn.textContent || submitBtn.value,
            disabled: submitBtn.disabled
        };

        try {
            // Loading State setzen
            this.setButtonLoading(submitBtn, true);

            // Form data sammeln
            const formData = new FormData(form);

            // AJAX Request
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const result = await response.json();

            if (result.success) {
                // Erfolg
                this.showToast(
                    result.message,
                    'success',
                    8000,
                    result.title || 'Erfolgreich'
                );

                // Form reset
                form.reset();

                // Optional: Scroll to top for better UX
                window.scrollTo({ top: 0, behavior: 'smooth' });

            } else {
                // Fehler
                this.showToast(
                    result.message || 'Ein unbekannter Fehler ist aufgetreten.',
                    'error',
                    8000,
                    result.title || 'Fehler'
                );
            }

        } catch (error) {
            console.error('AJAX Error:', error);

            // Network/Parse Error
            this.showToast(
                'Es gab einen Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
                'error',
                8000,
                'Verbindungsfehler'
            );

        } finally {
            // Button State zurücksetzen
            this.setButtonLoading(submitBtn, false, buttonState);
        }
    }

    setButtonLoading(button, loading, originalState = null) {
        if (loading) {
            // Loading State
            button.disabled = true;
            button.classList.add('btn-loading');

            // Text ändern
            const loadingTexts = {
                'Senden': 'Wird gesendet...',
                'Absenden': 'Wird gesendet...',
                'Anfrage senden': 'Wird gesendet...',
                'Nachricht senden': 'Wird gesendet...',
                'Bewerbung senden': 'Wird gesendet...',
                'default': 'Wird gesendet...'
            };

            const currentText = button.textContent || button.value;
            const loadingText = loadingTexts[currentText] || loadingTexts.default;

            if (button.textContent !== undefined) {
                button.textContent = loadingText;
            } else {
                button.value = loadingText;
            }

        } else {
            // Normal State
            button.classList.remove('btn-loading');

            if (originalState) {
                button.disabled = originalState.disabled;
                if (button.textContent !== undefined) {
                    button.textContent = originalState.text;
                } else {
                    button.value = originalState.text;
                }
            } else {
                button.disabled = false;
            }
        }
    }

    // Legacy URL-Parameter Support (falls noch alte Links existieren)
    handleLegacyRedirectParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const message = urlParams.get('msg');

        if (status || message) {
            console.warn('Legacy URL parameters detected. Consider updating to AJAX forms.');
            this.checkUrlParams();
        }
    }

    // Utility-Methoden
    clearAllToasts() {
        const toasts = this.toastContainer.querySelectorAll('.universal-toast');
        toasts.forEach(toast => this.removeToast(toast));
    }

    // Spezielle Methoden für verschiedene Formulartypen
    showContactSuccess() {
        this.showToast(
            'Ihre Nachricht wurde erfolgreich gesendet. Wir bearbeiten Ihre Anfrage mit hoher Priorität und melden uns zeitnah bei Ihnen.',
            'success',
            7000,
            'Nachricht gesendet'
        );
    }

    showContactError(message = null) {
        const defaultMessage = 'Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte überprüfen Sie Ihre Angaben und versuchen Sie es erneut.';
        this.showToast(
            message || defaultMessage,
            'error',
            8000,
            'Fehler beim Senden'
        );
    }

    showMaterialSuccess() {
        this.showToast(
            'Ihre Materialanfrage wurde erfolgreich übermittelt. Wir erstellen Ihnen ein unverbindliches Angebot und melden uns innerhalb von 24 Stunden mit Preisen und Verfügbarkeit.',
            'success',
            8000,
            'Materialanfrage gesendet'
        );
    }

    showApplicationSuccess() {
        this.showToast(
            'Ihre Bewerbung wurde erfolgreich übermittelt. Wir prüfen Ihre Unterlagen sorgfältig und melden uns innerhalb von 5 Werktagen bei Ihnen.',
            'success',
            8000,
            'Bewerbung eingegangen'
        );
    }

    // Debug-Methoden
    debugFormData(form) {
        const formData = new FormData(form);
        console.log('Form Debug Info:');
        console.log('Action:', form.action);
        console.log('Method:', form.method);

        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
    }
}

// Initialisierung
let universalToastManager;

// Sofortige Initialisierung
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        universalToastManager = new UniversalToastManager();
    });
} else {
    universalToastManager = new UniversalToastManager();
}

// Globale Funktionen für einfache Nutzung
window.showToast = function(message, type = 'info', duration = 6000, title = null) {
    if (universalToastManager) {
        return universalToastManager.showToast(message, type, duration, title);
    }
};

window.showSuccessToast = function(message, title = 'Erfolgreich') {
    return window.showToast(message, 'success', 7000, title);
};

window.showErrorToast = function(message, title = 'Fehler') {
    return window.showToast(message, 'error', 8000, title);
};

window.showWarningToast = function(message, title = 'Warnung') {
    return window.showToast(message, 'warning', 6000, title);
};

window.showInfoToast = function(message, title = 'Information') {
    return window.showToast(message, 'info', 5000, title);
};

// Shortcut-Funktionen für häufige Use Cases
window.showContactSuccess = function() {
    if (universalToastManager) {
        universalToastManager.showContactSuccess();
    }
};

window.showMaterialSuccess = function() {
    if (universalToastManager) {
        universalToastManager.showMaterialSuccess();
    }
};

window.showApplicationSuccess = function() {
    if (universalToastManager) {
        universalToastManager.showApplicationSuccess();
    }
};

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalToastManager;
}