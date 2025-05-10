// Preload screen
window.addEventListener('DOMContentLoaded', function() {
    // Prüfen, ob der Preloader bereits angezeigt wurde
    if (sessionStorage.getItem('preloaderShown')) {
        // Preloader überspringen und direkt zum Hauptinhalt
        document.querySelector('.preloader').style.display = 'none';
        return;
    }

    let progress = 0;
    const progressBar = document.getElementById('progressBar');
    const preloader = document.querySelector('.preloader');
    const hammerContainer = document.getElementById('hammer-container');
    const hammer = hammerContainer.querySelector('.hammer');

    // Define nail positions for hammer animation
    const nailPositions = [
        { x: 42, y: 74 },   // nail-1
        { x: 198, y: 74 },  // nail-3
        { x: 42, y: 55 },   // nail-7
        { x: 198, y: 55 },  // nail-8
        { x: 50, y: 135 },  // nail-5
        { x: 190, y: 135 }, // nail-6
        { x: 42, y: 208 },  // nail-2
        { x: 198, y: 208 }  // nail-4
    ];

    // Animation sequence
    async function nailSequence() {
        hammerContainer.style.opacity = '1';

        for (let i = 0; i < nailPositions.length; i++) {
            const nailId = `nail-${i+1}`;
            const nail = document.getElementById(nailId);
            const pos = nailPositions[i];

            // Position hammer near the nail
            hammerContainer.style.left = `${pos.x + 30}px`;
            hammerContainer.style.top = `${pos.y - 10}px`;

            // Wait a bit before hitting
            await new Promise(resolve => setTimeout(resolve, 300));

            // Hammer animation
            hammer.style.animation = 'hammer-hit 0.5s';

            // Make nail appear with animation
            if (nail) {
                nail.style.opacity = '0';
                nail.style.animation = 'nail-in 0.5s forwards';
                nail.setAttribute('r', '2');
            }

            // Wait for hammer animation to complete
            await new Promise(resolve => setTimeout(resolve, 500));

            // Reset hammer animation
            hammer.style.animation = 'none';

            // Update progress
            progress += 100 / nailPositions.length;
            progressBar.style.width = `${progress}%`;

            // Add a small delay before moving to next nail
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // After all nails are placed, continue to the site
        await new Promise(resolve => setTimeout(resolve, 500));

        // Markieren, dass der Preloader bereits angezeigt wurde
        sessionStorage.setItem('preloaderShown', 'true');

        // Fade out preloader
        fadeOutPreloader();
    }

    // Function to fade out the preloader
    function fadeOutPreloader() {
        preloader.style.opacity = '0';
        preloader.style.transition = 'opacity 1s ease';

        setTimeout(() => {
            preloader.style.display = 'none';
            // Keine Manipulation des Hauptinhalts mehr notwendig
        }, 1000);
    }

    // Start the nail animation sequence
    nailSequence();
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.header__menu-toggle');
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');
    const body = document.body;

    if (menuToggle && nav && header) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            this.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('active');
            nav.setAttribute('aria-hidden', isExpanded);

            if (!isExpanded) {
                header.classList.add('menu-open');
            } else {
                setTimeout(() => {
                    header.classList.remove('menu-open');
                }, 300);
            }
        });

        document.addEventListener('click', function(event) {
            if (nav.classList.contains('active') &&
                !nav.contains(event.target) &&
                !menuToggle.contains(event.target)) {
                menuToggle.setAttribute('aria-expanded', 'false');
                nav.classList.remove('active');
                nav.setAttribute('aria-hidden', 'true');
                header.classList.remove('menu-open');
            }
        });

        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.setAttribute('aria-expanded', 'false');
                nav.classList.remove('active');
                nav.setAttribute('aria-hidden', 'true');
                header.classList.remove('menu-open');
            });
        });

        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && nav.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                nav.classList.remove('active');
                nav.setAttribute('aria-hidden', 'true');
                header.classList.remove('menu-open');
            }
        });
    }
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

// Navbar section tracking
document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll("nav ul li a");

    const observerOptions = {
        root: null,
        threshold: 0.4,
    };

    const observerCallback = (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                let activeSection = entry.target.id;

                navLinks.forEach((link) => {
                    link.classList.toggle(
                        "active",
                        link.getAttribute("href") === `#${activeSection}`
                    );
                });
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((section) => observer.observe(section));
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

        const lastVisibleIndex = Math.max(0, totalItems - visibleItems);
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

        fetch('/assets/php/kontakt-verarbeitung.php', {
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

// Maps
document.addEventListener('DOMContentLoaded', function() {
    // Städte und Orte mit Koordinaten
    const locations = [
        { name: "Horka", lat: 51.1882, lng: 14.7566, description: "Gemeinde im Landkreis Görlitz" },
        { name: "Niesky", lat: 51.2934, lng: 14.8236, description: "Stadt im Landkreis Görlitz" },
        { name: "Görlitz", lat: 51.1533, lng: 14.9880, description: "Kreisstadt des Landkreises Görlitz" },
        { name: "Neißeaue", lat: 51.2333, lng: 15.0167, description: "Gemeinde im Landkreis Görlitz" },
        { name: "Rietschen", lat: 51.3904, lng: 14.7822, description: "Gemeinde im Landkreis Görlitz" },
        { name: "Waldhufen", lat: 51.2417, lng: 14.7250, description: "Gemeinde im Landkreis Görlitz" },
        { name: "Mücka", lat: 51.3112, lng: 14.6969, description: "Gemeinde im Landkreis Görlitz" },
        { name: "Hähnichen", lat: 51.3713, lng: 14.8630, description: "Gemeinde im Landkreis Görlitz" },
        { name: "Kodersdorf", lat: 51.1983, lng: 14.9033, description: "Gemeinde im Landkreis Görlitz" },
        { name: "Vierkirchen", lat: 51.2194, lng: 14.9158, description: "Gemeinde im Landkreis Görlitz" },
        { name: "Niesky-See", lat: 51.2819, lng: 14.8312, description: "Ortsteil von Niesky" },
        { name: "Königshain", lat: 51.1833, lng: 14.8417, description: "Gemeinde im Landkreis Görlitz" },
        { name: "Kreba-Neudorf", lat: 51.3521, lng: 14.6093, description: "Gemeinde im Landkreis Görlitz" },
        { name: "Quitzdorf am See", lat: 51.2964, lng: 14.7936, description: "Gemeinde im Landkreis Görlitz" },
        { name: "Görlitz-Girbigsdorf", lat: 51.1467, lng: 14.9469, description: "Ortsteil von Görlitz" },
        { name: "Rothenburg/Oberlausitz", lat: 51.2783, lng: 14.9685, description: "Stadt im Landkreis Görlitz" },
        { name: "Schöpstal-Girbigsdorf", lat: 51.1656, lng: 14.9101, description: "Ortsteil von Schöpstal" },
        { name: "Kodersdorf-Särichen", lat: 51.2155, lng: 14.9250, description: "Ortsteil von Kodersdorf" }
    ];

    // Zentrum und Zoomstufe der Karte
    const mapCenter = [51.2500, 14.8500];
    const mapZoom = 10;

    // Karte initialisieren
    const map = L.map('map', {
        center: mapCenter,
        zoom: mapZoom,
        zoomControl: false,
        attributionControl: false
    });

    // Eigener MapTiles-Stil (OpenStreetMap als Basis mit angepasstem Stil)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        className: 'map-tiles'
    }).addTo(map);

    // Custom Icon für Marker
    const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#eb7013" fill-opacity="0.2" />
                <circle cx="12" cy="12" r="4" fill="#eb7013" />
              </svg>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });

    // Einzugsgebiet Marker hinzufügen
    locations.forEach(location => {
        const marker = L.marker([location.lat, location.lng], {icon: markerIcon}).addTo(map);

        // PopUp für jeden Marker erstellen
        const popupContent = `
            <div class="popup-content">
                <div class="popup-header">${location.name}</div>
                <div class="popup-body">
                    <p>${location.description}</p>
                    <p>Koordinaten: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</p>
                    <div class="popup-action">
                        <button class="popup-button" onclick="showLocationDetails('${location.name}')">Details anzeigen</button>
                    </div>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent, {
            className: 'custom-popup',
            closeButton: false,
            maxWidth: 250
        });

        // Event-Handler für Marker
        marker.on('mouseover', function() {
            this.openPopup();
        });

        marker.on('click', function() {
            showLocationDetails(location.name);
        });
    });

    // Einzugsgebiet Kreis (radius ca. 25km um Zentrum)
    const serviceRadius = L.circle(mapCenter, {
        radius: 25000,
        color: '#eb7013',
        weight: 2,
        opacity: 0.5,
        fillColor: '#eb7013',
        fillOpacity: 0.05
    }).addTo(map);

    // Stadt-Liste generieren
    const cityList = document.getElementById('city-list');
    locations.sort((a, b) => a.name.localeCompare(b.name)).forEach(location => {
        const listItem = document.createElement('li');
        listItem.textContent = location.name;
        listItem.setAttribute('data-city', location.name);
        listItem.addEventListener('click', function() {
            map.setView([location.lat, location.lng], 13);
            showLocationDetails(location.name);
        });
        cityList.appendChild(listItem);
    });

    // Zoom-Steuerung an besserer Position
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    // Funktion zum Anzeigen der Standortdetails im Panel
    window.showLocationDetails = function(cityName) {
        const location = locations.find(loc => loc.name === cityName);
        if (!location) return;

        const locationDetails = document.getElementById('location-details');

        // Zufällige Informationen generieren (hier könnten echte Daten stehen)
        const randomProjects = Math.floor(Math.random() * 10) + 5;

        // HTML für Standortdetails
        locationDetails.innerHTML = `
            <div class="location-card">
                <h4>${location.name}</h4>
                <p>${location.description}</p>
                <p>Wir haben bereits ${randomProjects} Projekte in ${location.name} erfolgreich abgeschlossen und freuen uns auf Ihren Auftrag!</p>
                <div class="distance">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L19 21L12 17L5 21L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Teil unseres Kerngebiets
                </div>
            </div>
        `;

        // Finde und markiere den ausgewählten Ort in der Liste
        document.querySelectorAll('#city-list li').forEach(item => {
            if (item.getAttribute('data-city') === cityName) {
                item.style.backgroundColor = '#f2c49b';
                item.style.fontWeight = 'bold';
            } else {
                item.style.backgroundColor = '';
                item.style.fontWeight = '';
            }
        });
    };

    // Animation für einen dynamischeren Einstieg
    setTimeout(() => {
        serviceRadius.setStyle({
            fillOpacity: 0.1
        });
    }, 500);
});



