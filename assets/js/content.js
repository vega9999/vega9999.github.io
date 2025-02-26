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
    // Grundlegende Elemente
    const track = document.getElementById('imageTrack');
    const items = track.querySelectorAll('.carousel-item');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    // Konfiguration
    const itemWidth = items[0].offsetWidth;
    const itemsGap = 20; // Entspricht dem --carousel-gap in CSS
    const itemTotalWidth = itemWidth + itemsGap;
    const totalItems = items.length;

    // Anzahl der gleichzeitig sichtbaren Elemente berechnen (basierend auf Containerbreite)
    const containerWidth = track.parentElement.offsetWidth;
    const visibleItems = Math.floor(containerWidth / itemTotalWidth);

    // Starten mit dem ersten Element
    let currentIndex = 0;

    // Funktion zum Aktualisieren des Karussells
    function updateCarousel() {
        // Transformiere den Track zur aktuellen Position
        track.style.transform = `translateX(-${currentIndex * itemTotalWidth}px)`;

        // Aktiviere/Deaktiviere Navigationspfeile basierend auf Position
        prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
        prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';

        const lastVisibleIndex = totalItems - visibleItems;
        nextBtn.style.opacity = currentIndex >= lastVisibleIndex ? '0.3' : '1';
        nextBtn.style.pointerEvents = currentIndex >= lastVisibleIndex ? 'none' : 'auto';
    }

    // Event-Listener für Navigationspfeile
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

    // Lightbox-Funktionalität
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').src;
            lightboxImg.src = imgSrc;
            lightbox.classList.add('active');
        });
    });

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    // Schließe Lightbox auch bei Klick außerhalb des Bildes
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });

    // Tastaturnavigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        } else if (e.key === 'ArrowRight' && currentIndex < totalItems - visibleItems) {
            currentIndex++;
            updateCarousel();
        } else if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
        }
    });

    // Touch-Navigation
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
            // Nach links wischen -> nächstes Bild
            currentIndex++;
            updateCarousel();
        } else if (touchEndX > touchStartX + swipeThreshold && currentIndex > 0) {
            // Nach rechts wischen -> vorheriges Bild
            currentIndex--;
            updateCarousel();
        }
    }

    // Initialisierung
    updateCarousel();

    // Karussell bei Größenänderungen des Fensters aktualisieren
    window.addEventListener('resize', () => {
        // Neu berechnen, wie viele Elemente sichtbar sind
        const containerWidth = track.parentElement.offsetWidth;
        const visibleItems = Math.floor(containerWidth / itemTotalWidth);

        // Wenn der aktuelle Index ungültig wird, passe ihn an
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

