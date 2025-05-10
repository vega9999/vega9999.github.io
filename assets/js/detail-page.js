
document.addEventListener('DOMContentLoaded', function() {
    // Initialisiere AOS (Animation On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Counter Animation für Statistiken
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        const statsSection = document.querySelector('.intro-stats');
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-count'));
                    let current = 0;
                    const increment = Math.ceil(target / 100);
                    const timer = setInterval(() => {
                        current += 1;
                        if (current > target) {
                            current = target;
                            clearInterval(timer);
                        }
                        stat.textContent = current;
                        stat.style.animation = 'countUp 0.2s ease-out';
                    }, 20);
                });
                observer.disconnect();
            }
        }, { threshold: 0.25 });

        observer.observe(statsSection);
    }

    // Gallery Filter
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Entferne active class von allen buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Füge active class zum geklickten button hinzu
                this.classList.add('active');

                const filterValue = this.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    if (filterValue === 'all' || item.classList.contains(filterValue)) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // Testimonial Slider
    const testimonialSlider = document.querySelector('.testimonial-slider');
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.dots');

    if (testimonialSlider && testimonialSlides.length > 0) {
        let currentSlide = 0;

        // Erstelle Dots basierend auf Anzahl der Slides
        testimonialSlides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.dot');

        // Initialisiere Slider
        function initSlider() {
            testimonialSlides.forEach((slide, index) => {
                slide.style.transform = `translateX(${100 * (index - currentSlide)}%)`;
            });
        }

        // Gehe zu bestimmtem Slide
        function goToSlide(slideIndex) {
            currentSlide = slideIndex;

            testimonialSlides.forEach((slide, index) => {
                slide.style.transform = `translateX(${100 * (index - currentSlide)}%)`;
            });

            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        // Event Listeners für Buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
                goToSlide(currentSlide);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % testimonialSlides.length;
                goToSlide(currentSlide);
            });
        }

        // Auto-slide
        let slideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % testimonialSlides.length;
            goToSlide(currentSlide);
        }, 5000);

        // Pausiere Auto-slide bei Hover
        testimonialSlider.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });

        testimonialSlider.addEventListener('mouseleave', () => {
            slideInterval = setInterval(() => {
                currentSlide = (currentSlide + 1) % testimonialSlides.length;
                goToSlide(currentSlide);
            }, 5000);
        });

        // Initialisiere Slider
        initSlider();
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');

    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');

            question.addEventListener('click', () => {
                // Prüfe, ob dieses Item bereits aktiv ist
                const isActive = item.classList.contains('active');

                // Schließe alle anderen FAQ-Items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle das aktuelle Item
                item.classList.toggle('active', !isActive);
            });
        });
    }

    // Smooth Scrolling für Anker-Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Berücksichtige die Höhe des Headers beim Scrollen
                const headerOffset = document.querySelector('.header')?.offsetHeight || 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Image Lightbox für Galerie-Items
    const galleryImages = document.querySelectorAll('.gallery-item');

    if (galleryImages.length > 0) {
        galleryImages.forEach(item => {
            item.addEventListener('click', function() {
                const imgSrc = this.querySelector('img').src;
                const title = this.querySelector('h4').textContent;
                const description = this.querySelector('p').textContent;

                // Erstelle Lightbox-Element
                const lightbox = document.createElement('div');
                lightbox.classList.add('lightbox');
                lightbox.innerHTML = `
                    <div class="lightbox-content">
                        <button class="close-lightbox">&times;</button>
                        <img src="${imgSrc}" alt="${title}">
                        <div class="lightbox-caption">
                            <h3>${title}</h3>
                            <p>${description}</p>
                        </div>
                    </div>
                `;

                // Füge Lightbox zum Body hinzu
                document.body.appendChild(lightbox);

                // Verhindere Scrollen
                document.body.style.overflow = 'hidden';

                // Zeige Lightbox mit Animation
                setTimeout(() => {
                    lightbox.style.opacity = '1';
                }, 10);

                // Event-Listener zum Schließen der Lightbox
                lightbox.querySelector('.close-lightbox').addEventListener('click', () => {
                    lightbox.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(lightbox);
                        document.body.style.overflow = '';
                    }, 300);
                });

                // Schließe Lightbox bei Klick außerhalb des Bildes
                lightbox.addEventListener('click', function(e) {
                    if (e.target === this) {
                        lightbox.style.opacity = '0';
                        setTimeout(() => {
                            document.body.removeChild(lightbox);
                            document.body.style.overflow = '';
                        }, 300);
                    }
                });
            });
        });
    }

    // Sticky Header
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        });
    }

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }
});