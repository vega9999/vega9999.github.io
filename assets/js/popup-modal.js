// js/popup-modal.js
// Modal Management System
class ModalManager {
    constructor() {
        this.modals = new Map();
        this.currentModal = null;
        this.scrollbarWidth = this.getScrollbarWidth();
        this.init();
    }

    init() {
        // Set scrollbar width CSS variable
        this.setScrollbarWidthProperty();

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.close(this.currentModal);
            }
        });

        // Close modal on backdrop click (click on overlay, not modal content)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') && this.currentModal) {
                this.close(this.currentModal);
            }
        });

        // Initialize all modals
        this.initializeModals();
    }

    // Calculate scrollbar width
    getScrollbarWidth() {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);

        const inner = document.createElement('div');
        outer.appendChild(inner);

        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        outer.parentNode.removeChild(outer);

        return scrollbarWidth;
    }

    // Set CSS custom property for scrollbar width
    setScrollbarWidthProperty() {
        document.documentElement.style.setProperty(
            '--scrollbar-width',
            `${this.scrollbarWidth}px`
        );
    }

    initializeModals() {
        // Look for modal overlays instead of just modals
        const modalOverlays = document.querySelectorAll('.modal-overlay');
        modalOverlays.forEach(overlay => {
            const modal = overlay.querySelector('.modal');
            if (!modal) return;

            const id = overlay.id || modal.id;
            if (!id) {
                console.warn('Modal found without ID:', overlay);
                return;
            }

            this.modals.set(id, overlay);

            // Initialize close buttons
            const closeButtons = overlay.querySelectorAll('.modal-close');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.close(id);
                });
            });
        });

        // Also handle modals without overlay wrapper (backward compatibility)
        const standaloneModals = document.querySelectorAll('.modal:not(.modal-overlay .modal)');
        standaloneModals.forEach(modal => {
            const id = modal.id;
            if (!id) return;

            // Create overlay wrapper if it doesn't exist
            if (!modal.closest('.modal-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay';
                overlay.id = id + '-overlay';
                modal.parentNode.insertBefore(overlay, modal);
                overlay.appendChild(modal);

                this.modals.set(id, overlay);

                // Initialize close buttons
                const closeButtons = overlay.querySelectorAll('.modal-close');
                closeButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.close(id);
                    });
                });
            }
        });
    }

    open(modalId) {
        const modalOverlay = this.modals.get(modalId);
        if (!modalOverlay) {
            console.error(`Modal with id "${modalId}" not found`);
            return;
        }

        // Close current modal if exists
        if (this.currentModal) {
            this.close(this.currentModal);
        }

        this.currentModal = modalId;

        // Check if page has scrollbar and adjust padding
        const hasScrollbar = document.body.scrollHeight > window.innerHeight;
        if (hasScrollbar) {
            document.documentElement.style.setProperty(
                '--scrollbar-width',
                `${this.scrollbarWidth}px`
            );
        } else {
            document.documentElement.style.setProperty('--scrollbar-width', '0px');
        }

        // Add classes for show state and prevent body scroll
        modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');

        // Focus management
        const modal = modalOverlay.querySelector('.modal');
        const firstFocusable = modal.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 150);
        } else {
            // Focus the modal itself if no focusable elements
            modal.setAttribute('tabindex', '-1');
            setTimeout(() => modal.focus(), 150);
        }

        // Dispatch custom event
        modalOverlay.dispatchEvent(new CustomEvent('modal:opened', {
            detail: { modalId, modalElement: modalOverlay }
        }));

        // Return promise for chaining
        return new Promise(resolve => {
            setTimeout(() => resolve(modalOverlay), 150);
        });
    }

    close(modalId) {
        const modalOverlay = this.modals.get(modalId);
        if (!modalOverlay) return;

        // Remove classes and restore body scroll
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');

        // Reset scrollbar width
        document.documentElement.style.setProperty('--scrollbar-width', '0px');

        this.currentModal = null;

        // Dispatch custom event
        modalOverlay.dispatchEvent(new CustomEvent('modal:closed', {
            detail: { modalId, modalElement: modalOverlay }
        }));

        // Return focus to trigger element if it exists
        const triggerElement = document.querySelector(`[data-modal-trigger="${modalId}"]`);
        if (triggerElement) {
            triggerElement.focus();
        }

        // Return promise for chaining
        return new Promise(resolve => {
            setTimeout(() => resolve(), 150);
        });
    }

    closeAll() {
        if (this.currentModal) {
            this.close(this.currentModal);
        }
    }

    isOpen(modalId) {
        return this.currentModal === modalId;
    }

    // Get current modal
    getCurrentModal() {
        return this.currentModal ? this.modals.get(this.currentModal) : null;
    }

    // Create modal programmatically
    createModal(options = {}) {
        const {
            id = 'dynamic-modal-' + Date.now(),
            title = '',
            content = '',
            size = 'medium',
            type = 'default',
            closable = true,
            animation = 'fade-in'
        } = options;

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = `modal-overlay ${animation}`;
        overlay.id = id;

        // Create modal
        const modal = document.createElement('div');
        modal.className = `modal modal-${size}`;
        if (type !== 'default') {
            modal.classList.add(`modal-${type}`);
        }

        // Create header
        const header = document.createElement('div');
        header.className = 'modal-header';

        if (title) {
            const titleElement = document.createElement('h3');
            titleElement.className = 'modal-title';
            titleElement.textContent = title;
            header.appendChild(titleElement);
        }

        if (closable) {
            const closeButton = document.createElement('button');
            closeButton.className = 'modal-close';
            closeButton.setAttribute('aria-label', 'Close modal');
            header.appendChild(closeButton);
        }

        // Create body
        const body = document.createElement('div');
        body.className = 'modal-body';
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        }

        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(body);
        overlay.appendChild(modal);

        // Add to DOM
        document.body.appendChild(overlay);

        // Register modal
        this.modals.set(id, overlay);

        // Initialize close button
        if (closable) {
            const closeButton = overlay.querySelector('.modal-close');
            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.close(id);
            });
        }

        return {
            id,
            overlay,
            modal,
            open: () => this.open(id),
            close: () => this.close(id),
            destroy: () => {
                this.close(id);
                overlay.remove();
                this.modals.delete(id);
            }
        };
    }

    // Show confirmation modal
    confirm(options = {}) {
        const {
            title = 'Bestätigung',
            message = 'Sind Sie sicher?',
            confirmText = 'Bestätigen',
            cancelText = 'Abbrechen',
            type = 'warning'
        } = options;

        return new Promise((resolve) => {
            const content = `
                <div class="modal-icon">${this.getIconForType(type)}</div>
                <p>${message}</p>
            `;

            const modal = this.createModal({
                title,
                content,
                type,
                size: 'small',
                closable: false
            });

            // Add footer with buttons
            const footer = document.createElement('div');
            footer.className = 'modal-footer';

            const cancelButton = document.createElement('button');
            cancelButton.className = 'btn btn-outline btn-cancel';
            cancelButton.textContent = cancelText;
            cancelButton.addEventListener('click', () => {
                modal.destroy();
                resolve(false);
            });

            const confirmButton = document.createElement('button');
            confirmButton.className = `btn btn-${type === 'error' ? 'secondary' : 'primary'} btn-confirm`;
            confirmButton.textContent = confirmText;
            confirmButton.addEventListener('click', () => {
                modal.destroy();
                resolve(true);
            });

            footer.appendChild(cancelButton);
            footer.appendChild(confirmButton);
            modal.modal.appendChild(footer);

            modal.open();
        });
    }

    // Get icon for modal type
    getIconForType(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ',
            default: ''
        };
        return icons[type] || icons.default;
    }
}

// Global modal manager instance
const modalManager = new ModalManager();

// Global functions for backward compatibility and convenience
function openModal(modalId) {
    return modalManager.open(modalId);
}

function closeModal(modalId) {
    if (modalId) {
        return modalManager.close(modalId);
    } else {
        return modalManager.closeAll();
    }
}

function createModal(options) {
    return modalManager.createModal(options);
}

function confirmModal(options) {
    return modalManager.confirm(options);
}

// Special handling for bewerbung modal
function openBewerbungModal(jobTitle = '') {
    const stelleSelect = document.getElementById('bewerbung-stelle');
    if (stelleSelect && jobTitle) {
        // Find matching option
        const options = stelleSelect.querySelectorAll('option');
        for (let option of options) {
            if (option.textContent.includes(jobTitle) ||
                option.value.includes(jobTitle.toLowerCase().replace(/\s+/g, '-'))) {
                stelleSelect.value = option.value;
                break;
            }
        }
    }

    return openModal('bewerbung-modal');
}

// Auto-initialize modal triggers
document.addEventListener('DOMContentLoaded', () => {
    // Handle data-modal-trigger attributes
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-modal-trigger]');
        if (trigger) {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal-trigger');
            const jobTitle = trigger.getAttribute('data-job-title');

            if (modalId === 'bewerbung-modal' && jobTitle) {
                openBewerbungModal(jobTitle);
            } else {
                openModal(modalId);
            }
        }
    });

    // Handle data-modal-close attributes
    document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('[data-modal-close]');
        if (closeBtn) {
            e.preventDefault();
            const modalId = closeBtn.getAttribute('data-modal-close');
            if (modalId) {
                closeModal(modalId);
            } else {
                closeModal(); // Close current modal
            }
        }
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { modalManager, openModal, closeModal, createModal, confirmModal };
}