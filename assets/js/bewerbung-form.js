// js/bewerbung-form.js

class BewerbungsformularManager {
    constructor() {
        this.form = null;
        this.submitButton = null;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['pdf', 'doc', 'docx'];
        this.uploadedFiles = {};
        this.toastContainer = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Wait for modal to be available
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.delayedInit());
        } else {
            this.delayedInit();
        }
    }

    delayedInit() {
        // Wait a bit for other scripts to load
        setTimeout(() => {
            this.form = document.getElementById('bewerbung-form');
            if (!this.form) {
                console.log('Bewerbungsformular nicht gefunden - warte auf Modal öffnung');
                this.waitForModal();
                return;
            }

            this.completeInit();
        }, 500);
    }

    waitForModal() {
        // Listen for modal opening
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-modal-trigger') &&
                e.target.getAttribute('data-modal-trigger') === 'bewerbung-modal') {
                setTimeout(() => {
                    this.form = document.getElementById('bewerbung-form');
                    if (this.form && !this.isInitialized) {
                        this.completeInit();
                    }
                }, 100);
            }
        });
    }

    completeInit() {
        if (this.isInitialized) return;

        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.setupToastStyles();
        this.setupToastContainer();
        this.setupEventListeners();
        this.setupBewerbungFileUploads(); // Spezifisch für Bewerbung
        this.setupFormValidation();
        this.checkUrlParams();
        this.isInitialized = true;
        console.log('Bewerbungsformular Manager initialisiert');
    }

    setupToastStyles() {
        if (!document.getElementById('bewerbung-toast-styles')) {
            const toastStyles = document.createElement('style');
            toastStyles.id = 'bewerbung-toast-styles';
            toastStyles.textContent = `
                .bewerbung-toast-container {
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

                .bewerbung-toast {
                    background: white !important;
                    border-radius: 8px !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                    min-width: 300px !important;
                    max-width: 400px !important;
                    opacity: 0 !important;
                    transform: translateX(100%) !important;
                    transition: all 0.3s ease !important;
                    border-left: 4px solid !important;
                    pointer-events: auto !important;
                }

                .bewerbung-toast.show {
                    opacity: 1 !important;
                    transform: translateX(0) !important;
                }

                .bewerbung-toast.hide {
                    opacity: 0 !important;
                    transform: translateX(100%) !important;
                }

                .bewerbung-toast-content {
                    display: flex !important;
                    align-items: center !important;
                    padding: 16px !important;
                    gap: 12px !important;
                }

                .bewerbung-toast-icon {
                    flex-shrink: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }

                .bewerbung-toast-message {
                    flex: 1 !important;
                    font-size: 14px !important;
                    line-height: 1.4 !important;
                    color: #333 !important;
                }

                .bewerbung-toast-close {
                    background: none !important;
                    border: none !important;
                    cursor: pointer !important;
                    padding: 4px !important;
                    border-radius: 4px !important;
                    color: #666 !important;
                    transition: all 0.2s ease !important;
                    flex-shrink: 0 !important;
                }

                .bewerbung-toast-close:hover {
                    background-color: rgba(0, 0, 0, 0.1) !important;
                    color: #333 !important;
                }

                .bewerbung-toast.success {
                    border-left-color: #22c55e !important;
                }

                .bewerbung-toast.success .bewerbung-toast-icon {
                    color: #22c55e !important;
                }

                .bewerbung-toast.error {
                    border-left-color: #ef4444 !important;
                }

                .bewerbung-toast.error .bewerbung-toast-icon {
                    color: #ef4444 !important;
                }

                .bewerbung-toast.warning {
                    border-left-color: #f59e0b !important;
                }

                .bewerbung-toast.warning .bewerbung-toast-icon {
                    color: #f59e0b !important;
                }

                .bewerbung-toast.info {
                    border-left-color: #3b82f6 !important;
                }

                .bewerbung-toast.info .bewerbung-toast-icon {
                    color: #3b82f6 !important;
                }

                body.dark-mode .bewerbung-toast {
                    background: #1f2937 !important;
                    color: #f9fafb !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
                }

                body.dark-mode .bewerbung-toast-message {
                    color: #f9fafb !important;
                }

                @media (max-width: 480px) {
                    .bewerbung-toast-container {
                        bottom: 10px !important;
                        right: 10px !important;
                        left: 10px !important;
                        max-width: none !important;
                    }

                    .bewerbung-toast {
                        min-width: auto !important;
                        max-width: none !important;
                    }

                    .bewerbung-toast-content {
                        padding: 12px !important;
                    }

                    .bewerbung-toast-message {
                        font-size: 13px !important;
                    }
                }

                .file-input-display.drag-over {
                    border-color: var(--primary-green) !important;
                    background-color: rgba(0, 100, 0, 0.1) !important;
                    transform: scale(1.02) !important;
                }

                .success-message svg {
                    animation: successPulse 0.6s ease-in-out;
                }

                @keyframes successPulse {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(toastStyles);
            console.log('Bewerbung Toast styles loaded');
        }
    }

    setupToastContainer() {
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'bewerbung-toast-container';
            this.toastContainer.className = 'bewerbung-toast-container';
            document.body.appendChild(this.toastContainer);
            console.log('Bewerbung Toast container created');
        }
    }

    setupEventListeners() {
        if (!this.form) return;

        // Form Submit Handler
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Führerschein Toggle
        const fuehrerscheinSelect = document.getElementById('b_fuehrerschein');
        if (fuehrerscheinSelect) {
            fuehrerscheinSelect.addEventListener('change', (e) => {
                this.toggleFuehrerscheinKlassen(e.target.value);
            });
        }

        // Checkbox change listener for Führerschein
        document.addEventListener('change', (e) => {
            if (e.target.name === 'fuehrerschein_klassen[]') {
                const fuehrerscheinKlassenDiv = document.getElementById('fuehrerschein-klassen');
                const existingError = fuehrerscheinKlassenDiv.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
            }
        });

        // Real-time Validation
        const inputs = this.form.querySelectorAll('input:not([type="file"]), select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Modal open listener - close header menu
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-modal-trigger') &&
                e.target.getAttribute('data-modal-trigger') === 'bewerbung-modal') {
                this.closeHeaderMenu();
            }
        });

        // Prevent modal close on backdrop click when form is being submitted
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') &&
                this.form.classList.contains('submitting')) {
                e.stopPropagation();
                e.preventDefault();
            }
        });
    }

    setupBewerbungFileUploads() {
        // Spezielle File-Upload-Behandlung nur für Bewerbungsformular
        const fileInputs = ['b_lebenslauf', 'b_anschreiben', 'b_zeugnisse'];

        fileInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (!input) return;

            // Remove existing event listeners to prevent conflicts
            input.replaceWith(input.cloneNode(true));
            const newInput = document.getElementById(inputId);

            newInput.addEventListener('change', (e) => this.handleBewerbungFileUpload(e));

            // Drag & Drop Support nur für Bewerbungsformular
            const wrapper = newInput.closest('.file-input-wrapper');
            if (wrapper) {
                this.setupBewerbungDragDrop(wrapper, newInput);
            }
        });
    }

    setupBewerbungDragDrop(wrapper, input) {
        const display = wrapper.querySelector('.file-input-display');
        if (!display) return;

        // Remove existing listeners
        const newDisplay = display.cloneNode(true);
        display.parentNode.replaceChild(newDisplay, display);

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            newDisplay.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            newDisplay.addEventListener(eventName, () => {
                newDisplay.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            newDisplay.addEventListener(eventName, () => {
                newDisplay.classList.remove('drag-over');
            });
        });

        newDisplay.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                input.files = files;
                this.handleBewerbungFileUpload({ target: input });
            }
        });
    }

    handleBewerbungFileUpload(e) {
        const input = e.target;
        const wrapper = input.closest('.file-input-wrapper');
        if (!wrapper) return;

        const textElement = wrapper.querySelector('.file-text');
        const files = input.files;

        if (files.length === 0) {
            this.resetBewerbungFileDisplay(wrapper, input.id);
            return;
        }

        // Validate files
        const validFiles = [];
        const errors = [];

        for (let file of files) {
            const validation = this.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                errors.push(`${file.name}: ${validation.error}`);
            }
        }

        if (errors.length > 0) {
            this.showFieldError(input, errors.join('\n'));
            this.resetBewerbungFileDisplay(wrapper, input.id);
            return;
        }

        // Update display
        wrapper.classList.add('has-file');
        this.clearFieldError(input);

        if (validFiles.length === 1) {
            textElement.textContent = validFiles[0].name;
        } else {
            textElement.textContent = `${validFiles.length} Dateien ausgewählt`;
        }

        // Store file info
        this.uploadedFiles[input.id] = validFiles;
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                error: `Datei ist zu groß (max. ${this.formatFileSize(this.maxFileSize)})`
            };
        }

        // Check file type
        const extension = file.name.split('.').pop().toLowerCase();
        if (!this.allowedTypes.includes(extension)) {
            return {
                valid: false,
                error: `Dateityp nicht erlaubt. Erlaubt: ${this.allowedTypes.join(', ')}`
            };
        }

        return { valid: true };
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    resetBewerbungFileDisplay(wrapper, inputId) {
        wrapper.classList.remove('has-file');
        const textElement = wrapper.querySelector('.file-text');
        const originalText = this.getOriginalFileText(inputId);
        textElement.textContent = originalText;
        delete this.uploadedFiles[inputId];
    }

    getOriginalFileText(inputId) {
        const texts = {
            'b_lebenslauf': 'Lebenslauf auswählen (PDF, DOC, DOCX)',
            'b_anschreiben': 'Anschreiben auswählen (optional)',
            'b_zeugnisse': 'Zeugnisse auswählen (optional)'
        };
        return texts[inputId] || 'Datei auswählen';
    }

    toggleFuehrerscheinKlassen(value) {
        const klassensDiv = document.getElementById('fuehrerschein-klassen');
        if (!klassensDiv) return;

        const checkboxes = klassensDiv.querySelectorAll('input[type="checkbox"]');

        if (value === 'ja') {
            klassensDiv.style.display = 'block';
        } else {
            klassensDiv.style.display = 'none';
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
    }

    setupFormValidation() {
        if (!this.form) return;

        const customMessages = {
            'b_vorname': 'Bitte geben Sie Ihren Vornamen ein',
            'b_nachname': 'Bitte geben Sie Ihren Nachnamen ein',
            'b_email': 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
            'b_telefon': 'Bitte geben Sie Ihre Telefonnummer ein',
            'b_position': 'Bitte wählen Sie eine Position aus',
            'b_lebenslauf': 'Bitte laden Sie Ihren Lebenslauf hoch'
        };

        Object.keys(customMessages).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('invalid', (e) => {
                    e.target.setCustomValidity(customMessages[fieldId]);
                });

                field.addEventListener('input', (e) => {
                    e.target.setCustomValidity('');
                });
            }
        });
    }

    validateField(field) {
        const formGroup = field.closest('.form-group');
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'Dieses Feld ist erforderlich';
        }

        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
            }
        }

        // Phone validation
        if (field.type === 'tel' && field.value) {
            const phoneRegex = /^[\d\s\+\-\(\)\/]+$/;
            if (!phoneRegex.test(field.value) || field.value.replace(/\D/g, '').length < 6) {
                isValid = false;
                errorMessage = 'Bitte geben Sie eine gültige Telefonnummer ein';
            }
        }

        // File upload validation
        if (field.type === 'file' && field.hasAttribute('required')) {
            if (!field.files || field.files.length === 0) {
                isValid = false;
                errorMessage = 'Bitte wählen Sie eine Datei aus';
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
            formGroup.classList.add('error');
        } else {
            formGroup.classList.add('success');
        }

        return isValid;
    }

    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Remove existing error
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;

        // Insert after the field or wrapper
        const wrapper = field.closest('.file-input-wrapper') || field;
        wrapper.parentNode.insertBefore(errorElement, wrapper.nextSibling);
    }

    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        const errorElement = formGroup.querySelector('.error-message');

        if (errorElement) {
            errorElement.remove();
        }

        formGroup.classList.remove('error', 'success');
    }

    validateForm() {
        if (!this.form) return false;

        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;
        let firstInvalidField = null;

        // Validate all required fields
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });

        // Special validation for Führerschein - nur prüfen wenn "ja" ausgewählt
        const fuehrerscheinSelect = document.getElementById('b_fuehrerschein');
        if (fuehrerscheinSelect && fuehrerscheinSelect.value === 'ja') {
            const fuehrerscheinKlassenDiv = document.getElementById('fuehrerschein-klassen');
            if (fuehrerscheinKlassenDiv) {
                const checkboxes = fuehrerscheinKlassenDiv.querySelectorAll('input[name="fuehrerschein_klassen[]"]:checked');

                if (checkboxes.length === 0) {
                    const checkboxGroup = fuehrerscheinKlassenDiv.querySelector('.checkbox-group-multi');
                    this.showFieldError(checkboxGroup, 'Bitte wählen Sie mindestens eine Führerscheinklasse aus');
                    isValid = false;
                    if (!firstInvalidField) {
                        firstInvalidField = fuehrerscheinSelect;
                    }
                } else {
                    const existingError = fuehrerscheinKlassenDiv.querySelector('.error-message');
                    if (existingError) {
                        existingError.remove();
                    }
                }
            }
        }

        // Focus first invalid field
        if (firstInvalidField) {
            firstInvalidField.focus();
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return isValid;
    }

    closeHeaderMenu() {
        if (typeof closeMobileMenu === 'function') {
            closeMobileMenu();
        } else {
            const hamburger = document.getElementById('hamburger');
            const navMenu = document.getElementById('nav-menu');
            const overlay = document.querySelector('.mobile-nav-overlay');

            if (hamburger && hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                if (navMenu) navMenu.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                document.body.classList.remove('mobile-menu-open');
                document.body.style.overflow = '';
            }
        }
    }

    showAlert(message, type = 'info') {
        this.showToast(message, type);
    }

    showToast(message, type = 'info', duration = 5000) {
        console.log('showToast called:', message, type);

        if (!this.toastContainer) {
            this.setupToastContainer();
        }

        const toast = document.createElement('div');
        toast.className = `bewerbung-toast ${type}`;

        const icon = this.getToastIcon(type);

        toast.innerHTML = `
            <div class="bewerbung-toast-content">
                <div class="bewerbung-toast-icon">${icon}</div>
                <div class="bewerbung-toast-message">${message}</div>
                <button class="bewerbung-toast-close" aria-label="Benachrichtigung schließen">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                    </svg>
                </button>
            </div>
        `;

        this.toastContainer.appendChild(toast);
        console.log('Toast added to container');

        const closeBtn = toast.querySelector('.bewerbung-toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        return toast;
    }

    getToastIcon(type) {
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13,13H11V7H13M12,17.3A1.3,1.3 0 0,1 10.7,16A1.3,1.3 0 0,1 12,14.7A1.3,1.3 0 0,1 13.3,16A1.3,1.3 0 0,1 12,17.3M15.73,3H8.27L3,8.27V15.73L8.27,21H15.73L21,15.73V8.27L15.73,3Z"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>'
        };
        return icons[type] || icons.info;
    }

    removeToast(toast) {
        if (!toast || !toast.parentElement) return;

        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            this.showToast('Bitte überprüfen Sie Ihre Eingaben und korrigieren Sie die Fehler.', 'error');
            return;
        }

        this.setSubmitState(true);

        try {
            const formData = new FormData(this.form);

            const response = await fetch('bewerbung-handler.php', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server-Fehler: ${response.status}`);
            }

            if (response.redirected) {
                window.location.href = response.url;
                return;
            }

            const result = await response.text();

            if (result.includes('error') || result.includes('Error')) {
                throw new Error('Fehler beim Verarbeiten der Bewerbung');
            }

            this.showSuccess();

        } catch (error) {
            console.error('Submit error:', error);
            this.showToast('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.', 'error');
        } finally {
            this.setSubmitState(false);
        }
    }

    setSubmitState(loading) {
        this.form.classList.toggle('submitting', loading);
        this.submitButton.classList.toggle('loading', loading);
        this.submitButton.disabled = loading;

        if (loading) {
            this.submitButton.setAttribute('aria-label', 'Bewerbung wird gesendet...');
        } else {
            this.submitButton.setAttribute('aria-label', 'Bewerbung senden');
        }

        const formElements = this.form.querySelectorAll('input, select, textarea, button');
        formElements.forEach(element => {
            element.disabled = loading;
        });
    }

    showSuccess() {
        const formBody = this.form.closest('.modal-body');
        formBody.innerHTML = `
            <div class="success-message" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; color: var(--primary-green); margin-bottom: 1rem;">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
                    </svg>
                </div>
                <h3 style="color: var(--primary-green); margin-bottom: 1rem;">Bewerbung erfolgreich gesendet!</h3>
                <p>Vielen Dank für Ihre Bewerbung. Wir haben Ihre Unterlagen erhalten und werden uns innerhalb von 5 Werktagen bei Ihnen melden.</p>
                <p style="margin-top: 1.5rem;">
                    <button class="btn btn-primary" onclick="location.reload()">Weitere Bewerbung senden</button>
                    <button class="btn btn-outline" data-modal-close="bewerbung-modal">Schließen</button>
                </p>
            </div>
        `;
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const message = urlParams.get('msg');

        if (status === 'success') {
            this.showToast('Ihre Bewerbung wurde erfolgreich gesendet!', 'success');
        } else if (status === 'error') {
            this.showToast(message || 'Es ist ein Fehler aufgetreten.', 'error');
        }
    }
}

// Initialize when DOM is loaded - with delay to avoid conflicts
let bewerbungsManager;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        bewerbungsManager = new BewerbungsformularManager();
        window.bewerbungsformularManager = bewerbungsManager;
    }, 1000);
});

// Global functions
function toggleFuehrerscheinKlassen(value) {
    if (window.bewerbungsformularManager) {
        window.bewerbungsformularManager.toggleFuehrerscheinKlassen(value);
    }
}

function testBewerbungToast() {
    if (window.bewerbungsformularManager) {
        window.bewerbungsformularManager.showToast('Test-Nachricht für Bewerbung', 'error');
    } else {
        console.log('BewerbungsformularManager not found');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BewerbungsformularManager;
}