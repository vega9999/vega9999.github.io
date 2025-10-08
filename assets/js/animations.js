(function() {
    'use strict';

    // Feature-Detection und Kompatibilitätsprüfung
    if (!document.querySelector || !document.addEventListener || !Array.prototype.forEach) {
        console.log('Browser zu alt für Animationen - Fallback aktiv');
        return;
    }

    // Haupt-Animations-Controller
    const FrankeAnimations = {
        // Konfiguration
        config: {
            animationDuration: 600,
            staggerDelay: 100,
            observerThreshold: 0.1,
            observerRootMargin: '0px 0px -50px 0px'
        },

        // Interne Variablen
        observers: [],
        isInitialized: false,
        elementsToAnimate: [],

        // Haupt-Initialisierung
        init: function() {
            if (this.isInitialized) return;

            try {
                // Warten auf DOM
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        this.setup();
                    });
                } else {
                    this.setup();
                }
            } catch (error) {
                console.warn('Animation Init Fehler:', error);
                this.enableFallbackMode();
            }
        },

        // Setup aller Animationskomponenten
        setup: function() {
            try {

                // Basis-Animationen einrichten
                this.setupScrollAnimations();
                this.setupHoverEffects();
                this.setupFormAnimations();
                this.setupNavigationAnimations();
                this.setupModalAnimations();
                this.setupUtilityAnimations();

                this.isInitialized = true;

            } catch (error) {
                console.warn('Setup Fehler:', error);
                this.enableFallbackMode();
            }
        },

        // Scroll-basierte Animationen mit Intersection Observer
        setupScrollAnimations: function() {
            try {
                // Prüfen ob Intersection Observer verfügbar
                if (!window.IntersectionObserver) {
                    this.setupFallbackScrollAnimations();
                    return;
                }

                // Observer erstellen
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        try {
                            if (entry.isIntersecting) {
                                this.animateElement(entry.target);
                                observer.unobserve(entry.target);
                            }
                        } catch (error) {
                            console.warn('Observer Callback Fehler:', error);
                        }
                    });
                }, {
                    threshold: this.config.observerThreshold,
                    rootMargin: this.config.observerRootMargin
                });

                this.observers.push(observer);

                // Elemente für Animation vorbereiten
                this.prepareScrollElements(observer);

            } catch (error) {
                console.warn('Scroll Animation Fehler:', error);
                this.setupFallbackScrollAnimations();
            }
        },

        // Elemente für Scroll-Animation vorbereiten
        prepareScrollElements: function(observer) {
            try {
                // Automatisch animierbare Elemente definieren
                const autoAnimateSelectors = [
                    '.section-header',
                    '.intro-content',
                    '.intro-image',
                    '.service-card',
                    '.benefit-card',
                    '.feature-item',
                    '.team-member',
                    '.reference-item',
                    '.process-step',
                    '.job-card',
                    '.testimonial-card',
                    '.contact-method',
                    '.certificate-card',
                    '.tech-item'
                ];

                // Explizit markierte Elemente
                const explicitSelectors = [
                    '.scroll-animate',
                    '.scroll-fade-in',
                    '.scroll-slide-left',
                    '.scroll-slide-right',
                    '.scroll-scale',
                    '.animate-on-scroll'
                ];

                // Alle Selektoren kombinieren
                const allSelectors = [...autoAnimateSelectors, ...explicitSelectors];

                allSelectors.forEach((selector) => {
                    try {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach((element, index) => {
                            // Nur animieren wenn noch nicht animiert
                            if (!element.classList.contains('franke-animated') &&
                                !element.classList.contains('animate')) {

                                // Element für Animation markieren
                                element.classList.add('franke-animated');

                                // Initial-Zustand setzen (falls nicht schon gesetzt)
                                if (!this.hasAnimationStyles(element)) {
                                    this.setInitialAnimationState(element, selector);
                                }

                                // Staggered delay für mehrere Elemente
                                if (elements.length > 1) {
                                    element.style.transitionDelay = `${index * 0.1}s`;
                                }

                                // Element beobachten
                                observer.observe(element);
                            }
                        });
                    } catch (error) {
                        console.warn(`Fehler bei Selektor ${selector}:`, error);
                    }
                });

            } catch (error) {
                console.warn('Element Preparation Fehler:', error);
            }
        },

        // Prüfen ob Element bereits Animation-Styles hat
        hasAnimationStyles: function(element) {
            const computedStyle = window.getComputedStyle(element);
            return computedStyle.opacity !== '1' ||
                computedStyle.transform !== 'none' ||
                element.classList.contains('scroll-animate') ||
                element.classList.contains('animate-on-scroll');
        },

        // Initial-Zustand für Animation setzen
        setInitialAnimationState: function(element, selector) {
            try {
                // Basis-Transition setzen
                element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

                // Je nach Selektor verschiedene Initial-Zustände
                if (selector.includes('slide-left')) {
                    element.style.opacity = '0';
                    element.style.transform = 'translateX(-30px)';
                } else if (selector.includes('slide-right')) {
                    element.style.opacity = '0';
                    element.style.transform = 'translateX(30px)';
                } else if (selector.includes('scale')) {
                    element.style.opacity = '0';
                    element.style.transform = 'scale(0.9)';
                } else if (selector.includes('fade-in')) {
                    element.style.opacity = '0';
                } else {
                    // Standard: fade in up
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(20px)';
                }
            } catch (error) {
                console.warn('Initial State Fehler:', error);
            }
        },

        // Element animieren
        animateElement: function(element) {
            try {
                // Verzögerung für smooth Animation
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'none';
                    element.classList.add('animate');
                });
            } catch (error) {
                console.warn('Element Animation Fehler:', error);
            }
        },

        // Hover-Effekte einrichten
        setupHoverEffects: function() {
            try {
                // Service Cards
                this.addHoverEffect('.service-card', {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
                });

                // Benefit Cards
                this.addHoverEffect('.benefit-card', {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
                });

                // Buttons
                this.addHoverEffect('.btn', {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                });

                // Team Members
                this.addHoverEffect('.team-member', {
                    transform: 'scale(1.02)'
                });

                // Reference Items
                this.addHoverEffect('.reference-item', {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)'
                });

                // Job Cards
                this.addHoverEffect('.job-card', {
                    transform: 'translateX(5px)',
                    borderLeftColor: 'var(--primary-green, #2c5f2d)',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
                });

            } catch (error) {
                console.warn('Hover Effects Fehler:', error);
            }
        },

        // Hover-Effekt zu Elementen hinzufügen
        addHoverEffect: function(selector, hoverStyles) {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach((element) => {
                    // Basis-Transition hinzufügen
                    element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

                    // Hover Event Listeners
                    element.addEventListener('mouseenter', () => {
                        Object.keys(hoverStyles).forEach((property) => {
                            element.style[property] = hoverStyles[property];
                        });
                    });

                    element.addEventListener('mouseleave', () => {
                        Object.keys(hoverStyles).forEach((property) => {
                            element.style[property] = '';
                        });
                    });
                });
            } catch (error) {
                console.warn(`Hover Effect Fehler für ${selector}:`, error);
            }
        },

        // Formular-Animationen
        setupFormAnimations: function() {
            try {
                const formFields = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');

                formFields.forEach((field) => {
                    try {
                        // Basis-Transition
                        field.style.transition = 'all 0.3s ease';

                        // Focus Events
                        field.addEventListener('focus', () => {
                            field.style.transform = 'translateY(-2px)';
                            field.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';

                            const formGroup = field.closest('.form-group');
                            if (formGroup) {
                                formGroup.classList.add('focused');
                            }
                        });

                        field.addEventListener('blur', () => {
                            field.style.transform = '';
                            field.style.boxShadow = '';

                            const formGroup = field.closest('.form-group');
                            if (formGroup) {
                                formGroup.classList.remove('focused');
                            }
                        });

                    } catch (error) {
                        console.warn('Form Field Animation Fehler:', error);
                    }
                });

                // File Upload Animationen
                this.setupFileUploadAnimations();

            } catch (error) {
                console.warn('Form Animations Fehler:', error);
            }
        },

        // File Upload Animationen
        setupFileUploadAnimations: function() {
            try {
                const fileInputs = document.querySelectorAll('input[type="file"]');

                fileInputs.forEach((input) => {
                    input.addEventListener('change', (e) => {
                        try {
                            const wrapper = input.closest('.file-input-wrapper');
                            if (wrapper && e.target.files.length > 0) {
                                wrapper.classList.add('has-file');

                                // Success Animation
                                const successIndicator = document.createElement('div');
                                successIndicator.innerHTML = '✓';
                                successIndicator.style.cssText = `
                                    position: absolute;
                                    top: 10px;
                                    right: 10px;
                                    color: #28a745;
                                    font-weight: bold;
                                    font-size: 16px;
                                    opacity: 0;
                                    transform: scale(0);
                                    transition: all 0.3s ease;
                                `;

                                wrapper.style.position = 'relative';
                                wrapper.appendChild(successIndicator);

                                // Animate in
                                requestAnimationFrame(() => {
                                    successIndicator.style.opacity = '1';
                                    successIndicator.style.transform = 'scale(1)';
                                });
                            }
                        } catch (error) {
                            console.warn('File Upload Animation Fehler:', error);
                        }
                    });
                });

            } catch (error) {
                console.warn('File Upload Setup Fehler:', error);
            }
        },

        // Navigation Animationen
        setupNavigationAnimations: function() {
            try {
                // Smooth Scrolling für Anker-Links
                const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
                anchorLinks.forEach((link) => {
                    link.addEventListener('click', (e) => {
                        try {
                            const targetId = link.getAttribute('href');
                            const target = document.querySelector(targetId);

                            if (target) {
                                e.preventDefault();
                                target.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }
                        } catch (error) {
                            console.warn('Smooth Scroll Fehler:', error);
                        }
                    });
                });

                // Back to Top Button
                this.setupBackToTop();

                // Header Scroll Behavior
                this.setupHeaderScrollBehavior();

            } catch (error) {
                console.warn('Navigation Animations Fehler:', error);
            }
        },

        // Back to Top Button Animation
        setupBackToTop: function() {
            try {
                const backToTop = document.querySelector('#scrollToTop, .scroll-top');
                if (!backToTop) return;

                // Initial versteckt
                backToTop.style.opacity = '0';
                backToTop.style.visibility = 'hidden';
                backToTop.style.transform = 'translateY(20px)';
                backToTop.style.transition = 'all 0.3s ease';

                // Scroll Event
                let ticking = false;
                const updateBackToTop = () => {
                    const scrolled = window.pageYOffset;

                    if (scrolled > 300) {
                        backToTop.style.opacity = '1';
                        backToTop.style.visibility = 'visible';
                        backToTop.style.transform = 'translateY(0)';
                    } else {
                        backToTop.style.opacity = '0';
                        backToTop.style.visibility = 'hidden';
                        backToTop.style.transform = 'translateY(20px)';
                    }

                    ticking = false;
                };

                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        requestAnimationFrame(updateBackToTop);
                        ticking = true;
                    }
                });

            } catch (error) {
                console.warn('Back to Top Fehler:', error);
            }
        },

        // Header Scroll Behavior
        setupHeaderScrollBehavior: function() {
            try {
                const header = document.querySelector('.header');
                if (!header) return;

                let lastScrollTop = 0;
                let ticking = false;

                const updateHeader = () => {
                    const scrollTop = window.pageYOffset;

                    if (scrollTop > lastScrollTop && scrollTop > 100) {
                        // Scrolling down
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        // Scrolling up
                        header.style.transform = 'translateY(0)';
                    }

                    lastScrollTop = scrollTop;
                    ticking = false;
                };

                // Transition hinzufügen
                header.style.transition = 'transform 0.3s ease';

                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        requestAnimationFrame(updateHeader);
                        ticking = true;
                    }
                });

            } catch (error) {
                console.warn('Header Scroll Fehler:', error);
            }
        },

        // Modal Animationen
        setupModalAnimations: function() {
            try {
                // Modal Trigger Buttons
                const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
                modalTriggers.forEach((trigger) => {
                    trigger.addEventListener('click', () => {
                        try {
                            const modalId = trigger.getAttribute('data-modal-trigger');
                            const modal = document.querySelector(`#${modalId}`);

                            if (modal) {
                                this.showModal(modal);
                            }
                        } catch (error) {
                            console.warn('Modal Trigger Fehler:', error);
                        }
                    });
                });

                // Modal Close Handlers
                const modalCloseButtons = document.querySelectorAll('.modal-close, [data-modal-close]');
                modalCloseButtons.forEach((closeBtn) => {
                    closeBtn.addEventListener('click', () => {
                        try {
                            const modal = closeBtn.closest('.modal-overlay');
                            if (modal) {
                                this.hideModal(modal);
                            }
                        } catch (error) {
                            console.warn('Modal Close Fehler:', error);
                        }
                    });
                });

                // Click outside to close
                const modalOverlays = document.querySelectorAll('.modal-overlay');
                modalOverlays.forEach((overlay) => {
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            this.hideModal(overlay);
                        }
                    });
                });

            } catch (error) {
                console.warn('Modal Animations Fehler:', error);
            }
        },

        // Modal anzeigen
        showModal: function(modal) {
            try {
                modal.style.display = 'flex';
                modal.style.opacity = '0';
                modal.style.transform = 'scale(0.9)';
                modal.style.transition = 'all 0.3s ease';

                requestAnimationFrame(() => {
                    modal.style.opacity = '1';
                    modal.style.transform = 'scale(1)';
                });

                // Body Scroll verhindern
                document.body.style.overflow = 'hidden';

            } catch (error) {
                console.warn('Show Modal Fehler:', error);
            }
        },

        // Modal verstecken
        hideModal: function(modal) {
            try {
                modal.style.opacity = '0';
                modal.style.transform = 'scale(0.9)';

                setTimeout(() => {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }, 300);

            } catch (error) {
                console.warn('Hide Modal Fehler:', error);
            }
        },

        // Utility Animationen
        setupUtilityAnimations: function() {
            try {
                // Counter Animationen
                this.setupCounterAnimations();

                // Progress Bar Animationen
                this.setupProgressBars();

                // Typing Effekt
                this.setupTypingEffect();

            } catch (error) {
                console.warn('Utility Animations Fehler:', error);
            }
        },

        // Counter Animationen
        setupCounterAnimations: function() {
            try {
                const counters = document.querySelectorAll('[data-count]');
                if (counters.length === 0) return;

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            this.animateCounter(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });

                counters.forEach((counter) => observer.observe(counter));
                this.observers.push(observer);

            } catch (error) {
                console.warn('Counter Animations Fehler:', error);
            }
        },

        // Counter animieren
        animateCounter: function(counter) {
            try {
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000;
                const start = performance.now();

                const animate = (currentTime) => {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);

                    const current = Math.floor(progress * target);
                    counter.textContent = current.toLocaleString();

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        counter.textContent = target.toLocaleString();
                    }
                };

                requestAnimationFrame(animate);

            } catch (error) {
                console.warn('Counter Animation Fehler:', error);
            }
        },

        // Progress Bars
        setupProgressBars: function() {
            try {
                const progressBars = document.querySelectorAll('.progress-fill');
                if (progressBars.length === 0) return;

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const bar = entry.target;
                            const targetWidth = bar.getAttribute('data-width') || '100%';

                            bar.style.width = '0%';
                            bar.style.transition = 'width 1s ease-out';

                            setTimeout(() => {
                                bar.style.width = targetWidth;
                            }, 100);

                            observer.unobserve(bar);
                        }
                    });
                }, { threshold: 0.5 });

                progressBars.forEach((bar) => observer.observe(bar));
                this.observers.push(observer);

            } catch (error) {
                console.warn('Progress Bars Fehler:', error);
            }
        },

        // Typing Effekt
        setupTypingEffect: function() {
            try {
                const typingElements = document.querySelectorAll('[data-typing="true"]');

                typingElements.forEach((element) => {
                    const text = element.textContent;
                    element.textContent = '';
                    element.style.opacity = '1';

                    let i = 0;
                    const typeInterval = setInterval(() => {
                        if (i < text.length) {
                            element.textContent += text.charAt(i);
                            i++;
                        } else {
                            clearInterval(typeInterval);
                        }
                    }, 50);
                });

            } catch (error) {
                console.warn('Typing Effect Fehler:', error);
            }
        },

        // Fallback für Browser ohne Intersection Observer
        setupFallbackScrollAnimations: function() {
            try {
                console.log('Fallback: Intersection Observer nicht verfügbar');

                const elements = document.querySelectorAll('.scroll-animate, .animate-on-scroll, .scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale');

                elements.forEach((element) => {
                    element.style.opacity = '1';
                    element.style.transform = 'none';
                    element.classList.add('animate');
                });

            } catch (error) {
                console.warn('Fallback Scroll Fehler:', error);
            }
        },

        // Vollständiger Fallback-Modus
        enableFallbackMode: function() {
            try {
                console.log('Fallback Modus aktiv - Alle Inhalte werden sofort angezeigt');

                // Alle versteckten Elemente sofort anzeigen
                const elements = document.querySelectorAll('[style*="opacity: 0"], .scroll-animate, .animate-on-scroll');
                elements.forEach((element) => {
                    element.style.opacity = '1';
                    element.style.transform = 'none';
                    element.style.visibility = 'visible';
                    element.classList.add('animate');
                });

                // Observer cleanup
                this.cleanup();

            } catch (error) {
                console.warn('Fallback Mode Fehler:', error);
            }
        },

        // Cleanup
        cleanup: function() {
            try {
                this.observers.forEach((observer) => {
                    observer.disconnect();
                });
                this.observers = [];
            } catch (error) {
                console.warn('Cleanup Fehler:', error);
            }
        }
    };

    // Animations-System starten
    try {
        FrankeAnimations.init();

        // Global verfügbar für Debugging
        window.FrankeAnimations = FrankeAnimations;

    } catch (error) {
        console.warn('Kritischer Fehler beim Laden der Animationen:', error);

        // Notfall-Fallback
        document.addEventListener('DOMContentLoaded', function() {
            try {
                const allElements = document.querySelectorAll('[style*="opacity: 0"]');
                allElements.forEach((el) => {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                });
            } catch (e) {
                // Silent fail
            }
        });
    }

    // Cleanup bei Seitenwechsel
    window.addEventListener('beforeunload', function() {
        try {
            if (window.FrankeAnimations) {
                window.FrankeAnimations.cleanup();
            }
        } catch (error) {
            // Silent cleanup
        }
    });

})();