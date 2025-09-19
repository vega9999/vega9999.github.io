// js/lazy-loading.js
class LazyLoadManager {
    constructor() {
        this.imageObserver = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            this.fallbackLazyLoad();
        }

        this.observeImages();
    }

    setupIntersectionObserver() {
        this.imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '50px',
            threshold: 0.01
        });
    }

    observeImages() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src], .lazy-load');

        lazyImages.forEach(img => {
            if (this.imageObserver) {
                this.imageObserver.observe(img);
            } else {
                this.loadImage(img);
            }
        });
    }

    loadImage(img) {
        // Handle data-src attribute
        if (img.dataset.src && !img.src) {
            img.src = img.dataset.src;
        }

        // Handle srcset
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
        }

        // Add loaded class for animations
        img.addEventListener('load', () => {
            img.classList.add('loaded');
            img.classList.remove('lazy-load');
        });

        // Handle error
        img.addEventListener('error', () => {
            img.classList.add('error');
            console.warn('Failed to load image:', img.src);
        });
    }

    fallbackLazyLoad() {
        // Fallback for browsers without IntersectionObserver
        const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src], .lazy-load');

        const loadImagesInViewport = () => {
            lazyImages.forEach(img => {
                if (this.isInViewport(img)) {
                    this.loadImage(img);
                }
            });
        };

        // Load images on scroll and resize
        window.addEventListener('scroll', this.throttle(loadImagesInViewport, 100));
        window.addEventListener('resize', this.throttle(loadImagesInViewport, 100));

        // Initial load
        loadImagesInViewport();
    }

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top < window.innerHeight + 50 &&
            rect.bottom > -50 &&
            rect.left < window.innerWidth + 50 &&
            rect.right > -50
        );
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Public method to observe new images
    observeNewImages(container = document) {
        const newImages = container.querySelectorAll('img[loading="lazy"], img[data-src], .lazy-load');

        newImages.forEach(img => {
            if (this.imageObserver) {
                this.imageObserver.observe(img);
            } else {
                if (this.isInViewport(img)) {
                    this.loadImage(img);
                }
            }
        });
    }
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoadManager = new LazyLoadManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoadManager;
}