// Mobile menu toggle
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    document.querySelector('nav').classList.toggle('active');
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.padding = '0';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.padding = '';
        header.style.boxShadow = '';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            document.querySelector('nav').classList.remove('active');
        }
    });
});

// About scroll reveal
document.addEventListener('DOMContentLoaded', function() {
    const revealElements = document.querySelectorAll('.reveal-element, .reveal-left, .reveal-right');

    function checkReveal() {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight * 0.85) {
                element.classList.add('revealed');
            }
        });
    }

    checkReveal();

    window.addEventListener('scroll', checkReveal);
});

// Service Card Effect
document.addEventListener('DOMContentLoaded', function() {
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();

        const visibleThreshold = rect.height * 0.3;

        return (
            rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
            (rect.bottom - visibleThreshold) > 0
        );
    }

    const serviceCards = document.querySelectorAll('.service-card');

    function checkVisibility() {
        serviceCards.forEach(card => {
            if (isElementInViewport(card)) {
                card.classList.add('visible');
            }
        });
    }

    setTimeout(checkVisibility, 300);

    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);
});


// Timeline element
document.addEventListener("DOMContentLoaded", function () {
    const timelineSection = document.querySelector(".timeline-section");
    const timelineItems = document.querySelectorAll(".timeline-item");
    const timelineLine = document.querySelector(".timeline-line");
    const timeline = document.querySelector(".timeline");

    if (!timelineSection || !timelineItems.length || !timelineLine) {
        console.error("Timeline-Elemente konnten nicht gefunden werden.", {
            section: timelineSection,
            items: timelineItems.length,
            line: timelineLine
        });
        return;
    }

    console.log("Timeline-Elemente erfolgreich gefunden:", {
        items: timelineItems.length
    });

    // Höhe der Timeline anpassen
    const adjustTimelineHeight = function() {
        if (timeline && timelineLine) {
            const lastItem = timelineItems[timelineItems.length - 1];
            const timelineHeight = lastItem.offsetTop + lastItem.offsetHeight;
            timelineLine.style.height = `${timelineHeight}px`;
            console.log("Timeline-Höhe angepasst:", timelineHeight);
        }
    };

    adjustTimelineHeight();
    window.addEventListener("resize", adjustTimelineHeight);

    // Speichere den höchsten erreichten Fortschritt
    let maxProgress = 0;

    // Animations-Funktion beim Scrollen mit kontinuierlicher Progression
    const animateOnScroll = function() {
        const sectionRect = timelineSection.getBoundingClientRect();
        const sectionTop = sectionRect.top;
        const sectionHeight = timelineSection.offsetHeight;
        const windowHeight = window.innerHeight;

        // Einfachere Berechnung für den kontinuierlichen Fortschritt
        let currentProgress = 0;

        // Berechne den prozentualen Anteil der Timeline-Sektion, der bereits gescrollt wurde
        if (sectionTop <= windowHeight) {
            // Beginne bei 0%, wenn die Sektion gerade in den Viewport eintritt
            // Erreiche 100%, wenn die Sektion vollständig durchgescrollt wurde
            const scrolledDistance = windowHeight - sectionTop;
            const totalScrollDistance = sectionHeight + windowHeight;
            currentProgress = Math.min(1, Math.max(0, scrolledDistance / totalScrollDistance));

            // Skaliere den Fortschritt etwas, um schneller zu 100% zu kommen
            currentProgress = Math.min(1, currentProgress * 1.3);
        }

        // Aktualisiere den höchsten Fortschritt nur, wenn der aktuelle Wert höher ist
        if (currentProgress > maxProgress) {
            maxProgress = currentProgress;
        }

        // Verwende den höchsten erreichten Fortschritt für die Anzeige
        timelineLine.style.background = `linear-gradient(to bottom, 
            var(--primary-color) 0%, 
            orange ${maxProgress * 100}%, 
            #e6e6e6 ${maxProgress * 100}%, 
            #e6e6e6 100%)`;

        console.log(`Aktueller Fortschritt: ${Math.round(currentProgress * 100)}%, Maximaler Fortschritt: ${Math.round(maxProgress * 100)}%`);

        // Fade-in und Transformations-Animation für Timeline-Items
        timelineItems.forEach((item, index) => {
            const itemRect = item.getBoundingClientRect();
            const itemTop = itemRect.top;

            // Wenn das Item im Viewport ist
            if (itemTop < windowHeight * 0.85) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    // Initial ausführen und dann bei Scroll-Events
    animateOnScroll();
    window.addEventListener("scroll", animateOnScroll);
});

// Referenzen
document.addEventListener('DOMContentLoaded', function() {
    const track = document.getElementById('imageTrack');
    const items = track.querySelectorAll('.carousel-item');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const body = document.body;

    const itemWidth = items[0].offsetWidth;
    const itemsGap = 20;
    const itemTotalWidth = itemWidth + itemsGap;
    const totalItems = items.length;

    const containerWidth = track.parentElement.offsetWidth;
    const visibleItems = Math.floor(containerWidth / itemTotalWidth);

    let currentIndex = 0;
    let currentLightboxIndex = 0;
    let scrollPosition = 0;

    const existingNavs = lightbox.querySelectorAll('.lightbox-nav');
    existingNavs.forEach(nav => nav.remove());

    const lightboxNavPrev = document.createElement('div');
    lightboxNavPrev.className = 'carousel-nav prev lightbox-nav';
    lightboxNavPrev.innerHTML = '&#10094;';
    lightboxNavPrev.setAttribute('aria-label', 'Vorheriges Bild');
    lightbox.appendChild(lightboxNavPrev);

    const lightboxNavNext = document.createElement('div');
    lightboxNavNext.className = 'carousel-nav next lightbox-nav';
    lightboxNavNext.innerHTML = '&#10095;';
    lightboxNavNext.setAttribute('aria-label', 'Nächstes Bild');
    lightbox.appendChild(lightboxNavNext);

    lightboxNavPrev.style.zIndex = '1020';
    lightboxNavNext.style.zIndex = '1020';

    function lockScroll() {
        scrollPosition = window.pageYOffset;
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = `-${scrollPosition}px`;
        body.style.width = '100%';
    }

    function unlockScroll() {
        body.style.removeProperty('overflow');
        body.style.removeProperty('position');
        body.style.removeProperty('top');
        body.style.removeProperty('width');
        window.scrollTo(0, scrollPosition);
    }

    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * itemTotalWidth}px)`;

        prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
        prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';

        const lastVisibleIndex = totalItems - visibleItems;
        nextBtn.style.opacity = currentIndex >= lastVisibleIndex ? '0.3' : '1';
        nextBtn.style.pointerEvents = currentIndex >= lastVisibleIndex ? 'none' : 'auto';
    }

    function updateLightbox(index) {
        currentLightboxIndex = index;
        lightboxImg.src = items[index].querySelector('img').src;

        lightboxNavPrev.style.opacity = index === 0 ? '0.3' : '1';
        lightboxNavPrev.style.pointerEvents = index === 0 ? 'none' : 'auto';

        lightboxNavNext.style.opacity = index === totalItems - 1 ? '0.3' : '1';
        lightboxNavNext.style.pointerEvents = index === totalItems - 1 ? 'none' : 'auto';
    }

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < totalItems - visibleItems) {
            currentIndex++;
            updateCarousel();
        }
    });

    lightboxNavPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentLightboxIndex > 0) {
            updateLightbox(currentLightboxIndex - 1);
        }
    });

    lightboxNavNext.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentLightboxIndex < totalItems - 1) {
            updateLightbox(currentLightboxIndex + 1);
        }
    });

    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            updateLightbox(index);
            lightbox.classList.add('active');
            lockScroll();
        });
    });

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
        unlockScroll();
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            unlockScroll();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('active')) {
            if (e.key === 'ArrowLeft' && currentLightboxIndex > 0) {
                updateLightbox(currentLightboxIndex - 1);
            } else if (e.key === 'ArrowRight' && currentLightboxIndex < totalItems - 1) {
                updateLightbox(currentLightboxIndex + 1);
            } else if (e.key === 'Escape') {
                lightbox.classList.remove('active');
                unlockScroll();
            }
        } else {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            } else if (e.key === 'ArrowRight' && currentIndex < totalItems - visibleItems) {
                currentIndex++;
                updateCarousel();
            }
        }
    });

    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold && currentIndex < totalItems - visibleItems) {
            currentIndex++;
            updateCarousel();
        } else if (touchEndX > touchStartX + swipeThreshold && currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    }

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleLightboxSwipe();
    });

    function handleLightboxSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold && currentLightboxIndex < totalItems - 1) {
            updateLightbox(currentLightboxIndex + 1);
        } else if (touchEndX > touchStartX + swipeThreshold && currentLightboxIndex > 0) {
            updateLightbox(currentLightboxIndex - 1);
        }
    }

    updateCarousel();

    window.addEventListener('resize', () => {
        const containerWidth = track.parentElement.offsetWidth;
        const visibleItems = Math.floor(containerWidth / itemTotalWidth);

        if (currentIndex > totalItems - visibleItems) {
            currentIndex = Math.max(0, totalItems - visibleItems);
        }

        updateCarousel();
    });
});

// Kontaktformular
document.addEventListener('DOMContentLoaded', function() {
    // Popup öffnen, wenn der "Jetzt anfragen" Button geklickt wird
    const ctaButton = document.querySelector('.cta .btn');
    const popup = document.getElementById('kontakt-popup');
    const closeBtn = document.querySelector('.close-popup');
    const kontaktForm = document.getElementById('kontaktformular');

    ctaButton.addEventListener('click', function(e) {
        e.preventDefault();
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Verhindert Scrollen im Hintergrund
    });

    // Popup schließen
    closeBtn.addEventListener('click', function() {
        popup.style.display = 'none';
        document.body.style.overflow = 'auto'; // Scrollen wieder aktivieren
    });

    // Popup schließen, wenn außerhalb geklickt wird
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Formular AJAX-Verarbeitung
    kontaktForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const submitBtn = this.querySelector('.submit-btn');
        const formMessage = document.getElementById('form-message');

        // Button während des Sendens deaktivieren
        submitBtn.disabled = true;
        submitBtn.innerText = 'Wird gesendet...';

        fetch('kontakt-verarbeitung.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                formMessage.innerHTML = data.message;

                if (data.success) {
                    formMessage.className = 'success';
                    kontaktForm.reset(); // Formular zurücksetzen

                    // Nach 3 Sekunden Popup schließen
                    setTimeout(() => {
                        popup.style.display = 'none';
                        document.body.style.overflow = 'auto';
                        formMessage.style.display = 'none';
                    }, 3000);
                } else {
                    formMessage.className = 'error';
                }

                // Button zurücksetzen
                submitBtn.disabled = false;
                submitBtn.innerText = 'Absenden';
            })
            .catch(error => {
                formMessage.innerHTML = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
                formMessage.className = 'error';

                // Button zurücksetzen
                submitBtn.disabled = false;
                submitBtn.innerText = 'Absenden';
            });
    });
});

// Datenschutz Popup
document.addEventListener('DOMContentLoaded', function() {
    const datenschutzPopup = document.getElementById('datenschutz-popup');
    const closeButtons = document.querySelectorAll('#close-datenschutz, #close-datenschutz-btn');

    function openDatenschutzPopup() {
        datenschutzPopup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeDatenschutzPopup() {
        datenschutzPopup.style.display = 'none';
        document.body.style.overflow = '';
    }

    document.querySelectorAll('a[href="#datenschutz"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openDatenschutzPopup();
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', closeDatenschutzPopup);
    });

    datenschutzPopup.addEventListener('click', function(e) {
        if (e.target === datenschutzPopup) {
            closeDatenschutzPopup();
        }
    });

    document.querySelectorAll('.toc a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const scrollContainer = document.querySelector('.datenschutz-scrollable');
                scrollContainer.scrollTo({
                    top: targetElement.offsetTop - 30,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Scroll top
document.addEventListener("DOMContentLoaded", function () {
    const scrollToTopBtn = document.getElementById("scrollToTop");

    window.addEventListener("scroll", function () {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add("show");
        } else {
            scrollToTopBtn.classList.remove("show");
        }
    });

    scrollToTopBtn.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });
});


