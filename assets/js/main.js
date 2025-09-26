// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeDarkMode();
    initializeNavigation();
    initializeLazyLoading();
    initializeSmoothScrolling();
    initializeAnimations();

    console.log('Franke Bau Website initialized');
});

// Hero Scroll Button Funktionalität
function scrollToNextSection() {
    const hero = document.querySelector('.hero');
    const nextSection = hero.nextElementSibling;

    if (nextSection) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = nextSection.offsetTop - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Dark Mode Functions
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    // Check for saved dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isDarkMode) {
        body.classList.add('dark-mode');
        updateDarkModeToggle(true);
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
}

function toggleDarkMode() {
    const body = document.body;
    const isDarkMode = body.classList.toggle('dark-mode');

    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeToggle(isDarkMode);

    // Smooth transition
    document.documentElement.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.documentElement.style.transition = '';
    }, 300);
}

function updateDarkModeToggle(isDarkMode) {
    const icon = document.getElementById('dark-mode-icon');
    const toggle = document.getElementById('dark-mode-toggle');
    const logo = document.getElementById('logo');
    const ctaBG = document.getElementById('cta-bg');

    if (icon && toggle) {
        icon.src = isDarkMode
            ? '/assets/images/icons/Icon_FrankeBau_LightMode.png'
            : '/assets/images/icons/Icon_FrankeBau_DarkMode.png';

        icon.alt = isDarkMode ? 'Light Mode Icon' : 'Dark Mode Icon';
        toggle.setAttribute('aria-label', isDarkMode ? 'Light Mode aktivieren' : 'Dark Mode aktivieren');
    }

    if (icon && toggle && ctaBG) {
        ctaBG.src = isDarkMode
            ? '/assets/images/hero/FrankeBau_Footer1_DarkMode.jpg'
            : '/assets/images/hero/FrankeBau_Footer1.jpg';

        ctaBG.alt = isDarkMode ? 'FrankeBau Cartoon bei Nacht' : 'FrankeBau Cartoon bei Tag';
    }

    if (icon && toggle && logo) {
        logo.src = isDarkMode
            ? '/assets/images/hero/FrankeBau_Logo_DarkMode.png'
            : '/assets/images/hero/FrankeBau_Logo.png';

        logo.alt = isDarkMode ? 'FrankeBau Logo weiß' : 'FrankeBau Logo grün';
    }
}

// Navigation
function createMobileOverlay() {
    // Check if overlay already exists
    if (document.querySelector('.mobile-nav-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    document.body.appendChild(overlay);
}

function addMobileMenuFooter() {
    const navMenu = document.getElementById('nav-menu');

    // Check if footer already exists
    if (navMenu.querySelector('.mobile-menu-footer')) return;

    const footer = document.createElement('div');
    footer.className = 'mobile-menu-footer';
    footer.innerHTML = `
        <div class="mobile-contact-info">
            <div><a href="tel:+4935841-3190">📞 035841-3190</a></div>
            <div style="margin-top: 0.5rem;"><a href="mailto:info@bau-franke.de">✉️ info@bau-franke.de</a></div>
        </div>
    `;

    navMenu.appendChild(footer);
}

function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        // Create mobile overlay
        createMobileOverlay();

        // Add mobile menu footer
        addMobileMenuFooter();

        // Set initial menu positioning
        updateMenuPosition();

        hamburger.addEventListener('click', toggleMobileMenu);

        // Handle dropdown clicks on mobile
        setupMobileDropdowns();

        // Close menu when clicking overlay
        const overlay = document.querySelector('.mobile-nav-overlay');
        if (overlay) {
            overlay.addEventListener('click', closeMobileMenu);
        }

        // Update menu position on resize
        window.addEventListener('resize', debounce(updateMenuPosition, 250));
    }

    initializeStickyHeader();
}

function updateMenuPosition() {
    const header = document.querySelector('.header');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.querySelector('.mobile-nav-overlay');

    if (header && navMenu && overlay && window.innerWidth <= 991) {
        const headerHeight = header.offsetHeight;

        // Update CSS custom properties für dynamische Höhen
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);

        // Overlay positioning
        overlay.style.top = `${headerHeight}px`;
        overlay.style.height = `calc(100vh - ${headerHeight}px)`;
    }
}

function toggleMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.querySelector('.mobile-nav-overlay');

    const isActive = navMenu.classList.contains('active');

    if (isActive) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.querySelector('.mobile-nav-overlay');
    const header = document.querySelector('.header');

    if (header) {
        const headerHeight = header.offsetHeight;

        // Set overlay position
        overlay.style.top = `${headerHeight}px`;
        overlay.style.height = `calc(100vh - ${headerHeight}px)`;
    }

    hamburger.classList.add('active');
    navMenu.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('mobile-menu-open');

    // Prevent scrolling on body
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.querySelector('.mobile-nav-overlay');

    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('mobile-menu-open');

    // Restore scrolling on body
    document.body.style.overflow = '';

    // Close all dropdowns
    const dropdowns = navMenu.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
    });
}

// Enhanced dropdown setup mit "Alle ansehen" Links
function setupMobileDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('.nav-link');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');

        // Add "Alle [Kategorie] ansehen" link to dropdown menu
        addMainPageLinkToDropdown(dropdown);

        // Remove any existing click handlers
        const newDropdownLink = dropdownLink.cloneNode(true);
        dropdownLink.parentNode.replaceChild(newDropdownLink, dropdownLink);

        // Variables for touch handling
        let touchStartTime = 0;
        let touchEndTime = 0;

        // Touch start event
        newDropdownLink.addEventListener('touchstart', (e) => {
            touchStartTime = new Date().getTime();
        });

        // Touch end event for mobile
        newDropdownLink.addEventListener('touchend', (e) => {
            if (window.innerWidth <= 991) {
                e.preventDefault();
                touchEndTime = new Date().getTime();
                const touchDuration = touchEndTime - touchStartTime;

                // Short tap (< 300ms) = toggle dropdown
                // Long press (>= 300ms) = go to main page
                if (touchDuration < 300) {
                    // Toggle dropdown
                    const isActive = dropdown.classList.contains('active');

                    // Close all dropdowns first
                    dropdowns.forEach(otherDropdown => {
                        otherDropdown.classList.remove('active');
                    });

                    // Open current if it wasn't active
                    if (!isActive) {
                        dropdown.classList.add('active');
                    }
                } else {
                    // Long press - go to main page
                    const mainPageUrl = newDropdownLink.getAttribute('href');
                    if (mainPageUrl && mainPageUrl !== '#') {
                        setTimeout(() => {
                            window.location.href = mainPageUrl;
                        }, 100);
                    }
                }
            }
        });

        // Click event for desktop fallback
        newDropdownLink.addEventListener('click', (e) => {
            if (window.innerWidth <= 991) {
                e.preventDefault();
                // On mobile, this is handled by touch events
            }
        });
    });

    // Handle submenu clicks
    const submenuLinks = document.querySelectorAll('.dropdown-menu a');
    submenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 991) {
                // Kleine Verzögerung für bessere UX
                setTimeout(() => {
                    closeMobileMenu();
                }, 150);
            }
        });
    });

    // Handle main nav links (non-dropdown)
    const mainNavLinks = document.querySelectorAll('.nav-menu > .nav-link:not(.dropdown .nav-link)');
    mainNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 991) {
                // Kleine Verzögerung für bessere UX
                setTimeout(() => {
                    closeMobileMenu();
                }, 150);
            }
        });
    });
}

function addMainPageLinkToDropdown(dropdown) {
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    const dropdownLink = dropdown.querySelector('.nav-link');

    if (!dropdownMenu || !dropdownLink) return;

    // Check if main page link already exists
    if (dropdownMenu.querySelector('.dropdown-main-link')) return;

    const mainPageUrl = dropdownLink.getAttribute('href');
    const linkText = dropdownLink.textContent.trim();

    if (mainPageUrl && mainPageUrl !== '#') {
        // Create main page link
        const mainPageLi = document.createElement('li');
        mainPageLi.className = 'dropdown-main-link';

        const mainPageLink = document.createElement('a');
        mainPageLink.href = mainPageUrl;
        mainPageLink.textContent = `Alle ${linkText} ansehen`;
        mainPageLink.className = 'dropdown-main-page-link';

        mainPageLi.appendChild(mainPageLink);

        // Insert at the beginning of the dropdown menu
        dropdownMenu.insertBefore(mainPageLi, dropdownMenu.firstChild);

        // Add separator
        const separator = document.createElement('li');
        separator.className = 'dropdown-separator';
        separator.innerHTML = '<hr style="margin: 0.5rem 0; border: none; border-top: 1px solid rgba(0, 100, 0, 0.2);">';
        dropdownMenu.insertBefore(separator, dropdownMenu.children[1]);
    }
}

// Close menu on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
});

// Close menu on resize if window becomes large
window.addEventListener('resize', function() {
    if (window.innerWidth > 991) {
        closeMobileMenu();
    }
});

// Verbesserte Sticky Header Funktion
function initializeStickyHeader() {
    const header = document.querySelector('.sticky-header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.transform = 'translateY(0)';
            header.style.boxShadow = 'none';
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
}

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

// Lazy Loading
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.sticky-header')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Animations
function initializeAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, {
            threshold: 0.1
        });

        animatedElements.forEach(el => animationObserver.observe(el));
    }
}

// Utility Functions
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };

        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func(...args);
    };
}

function throttle(func, limit) {
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

// Performance monitoring
function measurePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
        });
    }
}

// Initialize performance monitoring
measurePerformance();

// Bescheinigungen
const documentInfo = {
    dvgw: {
        title: 'DVGW-Zertifizierung',
        description: 'Die DVGW-Zertifizierung berechtigt uns zur Durchführung von Gas- und Wasserleitungsarbeiten nach den höchsten technischen Standards.',
        purpose: 'Nachweis der Berechtigung für Gas- und Wasserleitungsbau',
        validUntil: 'Dezember 2025',
        details: [
            'Gasrohrleitungen bis 4 bar Betriebsdruck',
            'Trinkwasserleitungen DN 25 bis DN 300',
            'Hausanschlüsse für Gas und Wasser',
            'Reparaturen und Wartungsarbeiten',
            'Druckprüfungen und Inbetriebnahmen'
        ],
        authority: 'DVGW - Deutscher Verein des Gas- und Wasserfaches e.V.',
        importance: 'Diese Zertifizierung ist zwingend erforderlich für alle Arbeiten an Gas- und Wasserleitungen und gewährleistet höchste Sicherheitsstandards.'
    },
    vob: {
        title: 'VOB-Präqualifizierung',
        description: 'Die VOB-Präqualifizierung weist unsere Eignung für öffentliche Aufträge und Ausschreibungen nach.',
        purpose: 'Teilnahme an öffentlichen Ausschreibungen',
        validUntil: 'Juni 2025',
        details: [
            'Tiefbau und Straßenbau',
            'Kanalbau und Rohrleitungsbau',
            'Erdarbeiten und Landschaftsbau',
            'Betonarbeiten und Maurerarbeiten',
            'Asphaltarbeiten'
        ],
        authority: 'Präqualifizierungsstelle des Bundes',
        importance: 'Ohne diese Präqualifizierung können wir nicht an öffentlichen Ausschreibungen teilnehmen. Sie bestätigt unsere fachliche und wirtschaftliche Leistungsfähigkeit.'
    },
    hwk: {
        title: 'Handwerkskammer-Eintragung',
        description: 'Die offizielle Eintragung in die Handwerksrolle der Handwerkskammer Dresden bestätigt unsere handwerkliche Qualifikation.',
        purpose: 'Nachweis der handwerklichen Berechtigung',
        validUntil: 'Unbefristet',
        details: [
            'Maurerhandwerk',
            'Straßenbauer-Handwerk',
            'Tiefbau-Handwerk',
            'Betriebsnummer: 3847291'
        ],
        authority: 'Handwerkskammer Dresden',
        importance: 'Die Eintragung in die Handwerksrolle ist die Grundvoraussetzung für die selbständige Ausübung unserer Handwerkstätigkeiten.'
    },
    finanzamt: {
        title: 'Finanzamt Unbedenklichkeitsbescheinigung',
        description: 'Diese Bescheinigung bestätigt, dass keine steuerlichen Rückstände bestehen.',
        purpose: 'Nachweis steuerlicher Unbedenklichkeit',
        validUntil: 'Ein Jahr ab Ausstellungsdatum',
        details: [
            'Keine Rückstände bei Einkommensteuer',
            'Keine Rückstände bei Umsatzsteuer',
            'Keine Rückstände bei Gewerbesteuer',
            'Ordnungsgemäße Steueranmeldungen',
            'Pünktliche Steuerzahlungen'
        ],
        authority: 'Finanzamt Dresden',
        importance: 'Diese Bescheinigung wird häufig von Auftraggebern verlangt und bestätigt unsere steuerliche Zuverlässigkeit.'
    },
    handelsregister: {
        title: 'Handelregisterauszug',
        description: 'Der aktuelle Handelregisterauszug enthält alle wichtigen Unternehmensdaten und bestätigt unsere Rechtsfähigkeit.',
        purpose: 'Nachweis der Unternehmensdaten und Rechtsverhältnisse',
        validUntil: 'Aktueller Stand',
        details: [
            'Firmenname und Rechtsform',
            'Geschäftsführer und Vertretungsberechtigung',
            'Stammkapital und Gesellschafter',
            'Unternehmenszweck',
            'Geschäftsadresse'
        ],
        authority: 'Amtsgericht Dresden',
        importance: 'Der Handelregisterauszug ist ein wichtiger Nachweis für die Seriosität und Rechtmäßigkeit unseres Unternehmens.'
    },
    aok: {
        title: 'AOK Unbedenklichkeitsbescheinigung',
        description: 'Diese Bescheinigung bestätigt die ordnungsgemäße Zahlung aller Sozialversicherungsbeiträge.',
        purpose: 'Nachweis ordnungsgemäßer Sozialversicherungsbeiträge',
        validUntil: 'Ein Jahr ab Ausstellungsdatum',
        details: [
            'Krankenversicherungsbeiträge',
            'Pflegeversicherungsbeiträge',
            'Rentenversicherungsbeiträge',
            'Arbeitslosenversicherungsbeiträge',
            'Unfallversicherungsbeiträge'
        ],
        authority: 'AOK Plus - Die Gesundheitskasse',
        importance: 'Diese Bescheinigung ist für viele Aufträge erforderlich und belegt unsere sozialversicherungsrechtliche Zuverlässigkeit.'
    },
    soka: {
        title: 'SOKA-Bau Bescheinigung',
        description: 'Die SOKA-Bau Bescheinigung weist die ordnungsgemäße Beitragszahlung zur Sozialkasse der Bauwirtschaft nach.',
        purpose: 'Nachweis der Beitragszahlung zur Sozialkasse Bau',
        validUntil: 'Ein Jahr ab Ausstellungsdatum',
        details: [
            'Urlaubskassenbeiträge',
            'Zusatzversorgungskassenbeiträge',
            'Berufsausbildungsbeiträge',
            'Winterausfallgeld-Umlage',
            'Insolvenzgeld-Umlage'
        ],
        authority: 'SOKA-BAU Sozialkasse der Bauwirtschaft',
        importance: 'Für Bauunternehmen ist diese Bescheinigung verpflichtend und bestätigt die Einhaltung der tariflichen Verpflichtungen.'
    },
    praequalifizierung: {
        title: 'Urkunde Präqualifizierung',
        description: 'Die offizielle Präqualifizierungsurkunde bestätigt unsere Eignung für öffentliche Ausschreibungen.',
        purpose: 'Amtlicher Nachweis der Präqualifizierung',
        validUntil: 'Drei Jahre ab Ausstellungsdatum',
        details: [
            'Fachliche Leistungsfähigkeit',
            'Wirtschaftliche Leistungsfähigkeit',
            'Zuverlässigkeit',
            'Referenzprojekte',
            'Qualitätssicherungssystem'
        ],
        authority: 'Präqualifizierungsstelle des Bundes',
        importance: 'Diese Urkunde ist die Grundvoraussetzung für die Teilnahme an öffentlichen Ausschreibungen ab bestimmten Auftragswerten.'
    },
    freistellung: {
        title: 'Freistellungsbescheinigung §48b EStG',
        description: 'Diese Bescheinigung befreit von der Pflicht zum Steuerabzug bei Bauleistungen.',
        purpose: 'Befreiung vom Steuerabzug bei Bauleistungen',
        validUntil: 'Ein Jahr ab Ausstellungsdatum',
        details: [
            'Befreiung vom 15%igen Steuerabzug',
            'Gültig für alle Bauleistungen',
            'Reduziert Verwaltungsaufwand',
            'Verbessert Liquidität',
            'Vereinfacht Abrechnungen'
        ],
        authority: 'Finanzamt Dresden',
        importance: 'Diese Bescheinigung ist für Bauunternehmen sehr wichtig, da sie den Steuerabzug bei Bauleistungen verhindert und die Liquidität verbessert.'
    },
    steuerschuld: {
        title: 'Nachweis Steuerschuldnerschaft §13b UStG',
        description: 'Diese Bescheinigung regelt die Umkehr der Steuerschuldnerschaft bei Bauleistungen.',
        purpose: 'Nachweis der Berechtigung zur Rechnungsstellung ohne Umsatzsteuer',
        validUntil: 'Ein Jahr ab Ausstellungsdatum',
        details: [
            'Umkehr der Steuerschuldnerschaft',
            'Rechnungsstellung ohne USt.',
            'Gilt für Bauleistungen an Unternehmer',
            'Vereinfacht Umsatzsteuerverfahren',
            'Reduziert Verwaltungsaufwand'
        ],
        authority: 'Finanzamt Dresden',
        importance: 'Diese Regelung vereinfacht die Umsatzsteuerabwicklung bei Bauleistungen zwischen Unternehmen erheblich.'
    },
    bgbau: {
        title: 'BG Bau Unbedenklichkeitsbescheinigung',
        description: 'Diese Bescheinigung bestätigt die ordnungsgemäße Beitragszahlung zur Berufsgenossenschaft der Bauwirtschaft.',
        purpose: 'Nachweis ordnungsgemäßer Berufsgenossenschaftsbeiträge',
        validUntil: 'Ein Jahr ab Ausstellungsdatum',
        details: [
            'Unfallversicherungsbeiträge',
            'Präventionsbeiträge',
            'Umlagebeiträge U1 und U2',
            'Arbeitsschutzmaßnahmen',
            'Gefährdungsbeurteilungen'
        ],
        authority: 'BG BAU - Berufsgenossenschaft der Bauwirtschaft',
        importance: 'Diese Bescheinigung ist für alle Bauunternehmen verpflichtend und bestätigt die Einhaltung der Arbeitsschutzbestimmungen.'
    },
    kanalbau: {
        title: 'Urkunde Fremdüberwachter Kanalbau',
        description: 'Diese Urkunde bestätigt unsere Qualifikation für qualitätsgesicherten Kanalbau mit externer Überwachung.',
        purpose: 'Nachweis für qualitätsgesicherten Kanalbau',
        validUntil: 'Drei Jahre ab Ausstellungsdatum',
        details: [
            'Externe Qualitätsüberwachung',
            'Zertifizierte Ausführung',
            'Dokumentierte Qualitätssicherung',
            'Regelmäßige Kontrollen',
            'Normgerechte Ausführung'
        ],
        authority: 'Gütegemeinschaft Kanalbau',
        importance: 'Diese Zertifizierung ist für hochwertige Kanalbauarbeiten erforderlich und gewährleistet eine dauerhafte und sichere Infrastruktur.'
    }
};

// Accordion functionality
class AccordionManager {
    constructor() {
        this.accordionHeaders = document.querySelectorAll('.accordion-header');
        this.init();
    }

    init() {
        this.accordionHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                this.toggleAccordion(header);
            });

            // Keyboard support
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleAccordion(header);
                }
            });
        });

        // Auto-open first accordion on load
        if (this.accordionHeaders.length > 0) {
            setTimeout(() => {
                this.openAccordion(this.accordionHeaders[0]);
            }, 500);
        }
    }

    toggleAccordion(header) {
        const targetId = header.getAttribute('data-target');
        const content = document.getElementById(targetId);

        if (header.classList.contains('active')) {
            this.closeAccordion(header);
        } else {
            // Close all other accordions
            this.closeAllAccordions();
            this.openAccordion(header);
        }
    }

    openAccordion(header) {
        const targetId = header.getAttribute('data-target');
        const content = document.getElementById(targetId);

        header.classList.add('active');
        content.classList.add('active');

        // Update ARIA attributes
        header.setAttribute('aria-expanded', 'true');
        content.setAttribute('aria-hidden', 'false');

        // Animate document cards
        const documentCards = content.querySelectorAll('.document-card');
        documentCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.transition = 'all 0.3s ease';
            }, index * 100 + 200);
        });
    }

    closeAccordion(header) {
        const targetId = header.getAttribute('data-target');
        const content = document.getElementById(targetId);

        header.classList.remove('active');
        content.classList.remove('active');

        // Update ARIA attributes
        header.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true');
    }

    closeAllAccordions() {
        this.accordionHeaders.forEach(header => {
            this.closeAccordion(header);
        });
    }
}

// PDF Modal functionality
class PDFModal {
    constructor() {
        this.modal = document.getElementById('pdfModal');
        this.modalTitle = document.getElementById('pdfModalTitle');
        this.pdfFrame = document.getElementById('pdfFrame');
        this.pdfInfoContent = document.getElementById('pdfInfoContent');
        this.closeBtn = document.getElementById('pdfModalClose');

        this.init();
    }

    init() {
        // Add event listeners for preview buttons
        document.querySelectorAll('.btn-preview, .preview-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const pdfUrl = button.getAttribute('data-pdf');
                const title = button.getAttribute('data-title');
                const type = button.getAttribute('data-type');

                this.openModal(pdfUrl, title, type);
            });
        });

        // Close modal events
        this.closeBtn.addEventListener('click', () => this.closeModal());

        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal(pdfUrl, title, type) {
        // Set title
        this.modalTitle.textContent = title;

        // Load PDF
        this.pdfFrame.src = pdfUrl;

        // Load document information
        this.loadDocumentInfo(type);

        // Show modal
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus management
        this.closeBtn.focus();
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';

        // Clear PDF source to stop loading
        this.pdfFrame.src = '';

        // Return focus to the button that opened the modal
        const activeButton = document.querySelector('.btn-preview:focus, .preview-btn:focus');
        if (activeButton) {
            activeButton.focus();
        }
    }

    loadDocumentInfo(type) {
        const info = documentInfo[type];
        if (!info) {
            this.pdfInfoContent.innerHTML = '<p>Keine weiteren Informationen verfügbar.</p>';
            return;
        }

        const html = `
            <div class="pdf-info-section">
                <h4>Beschreibung</h4>
                <p>${info.description}</p>
            </div>
            
            <div class="pdf-info-section">
                <h4>Zweck</h4>
                <p>${info.purpose}</p>
            </div>
            
            <div class="pdf-info-section">
                <h4>Details</h4>
                <ul>
                    ${info.details.map(detail => `<li>${detail}</li>`).join('')}
                </ul>
            </div>
            
            <div class="pdf-info-section">
                <h4>Ausstellende Behörde</h4>
                <p>${info.authority}</p>
            </div>
            
            <div class="pdf-info-section">
                <h4>Gültigkeit</h4>
                <p>${info.validUntil}</p>
            </div>
            
            <div class="pdf-info-section">
                <h4>Bedeutung</h4>
                <p>${info.importance}</p>
            </div>
        `;

        this.pdfInfoContent.innerHTML = html;
    }
}

// Animation for cards on scroll
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fade-in');
                        this.observer.unobserve(entry.target);
                    }
                });
            }, this.observerOptions);

            // Observe all cards and accordion items
            document.querySelectorAll('.certificate-card, .accordion-item, .membership-card').forEach(card => {
                this.observer.observe(card);
            });
        }
    }
}

// Download tracking
class DownloadTracker {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[download]').forEach(link => {
            link.addEventListener('click', (e) => {
                const fileName = link.getAttribute('href').split('/').pop();
                const documentTitle = link.closest('.certificate-card, .document-card')
                    ?.querySelector('h3, h4')?.textContent || 'Unbekanntes Dokument';

                this.trackDownload(fileName, documentTitle);
            });
        });
    }

    trackDownload(fileName, documentTitle) {
        // Log download for debugging
        console.log('Document downloaded:', {
            file: fileName,
            title: documentTitle,
            timestamp: new Date().toISOString()
        });

        // Here you could integrate with analytics services like Google Analytics
        // gtag('event', 'download', {
        //     'event_category': 'Documents',
        //     'event_label': documentTitle,
        //     'value': fileName
        // });
    }
}

// Error handling for PDF loading
class PDFErrorHandler {
    constructor() {
        this.init();
    }

    init() {
        // Handle PDF loading errors
        document.addEventListener('DOMContentLoaded', () => {
            const iframe = document.getElementById('pdfFrame');
            if (iframe) {
                iframe.addEventListener('error', () => {
                    this.showPDFError();
                });
            }
        });
    }

    showPDFError() {
        const errorMessage = `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary-dark);">
                <h4>PDF konnte nicht geladen werden</h4>
                <p>Das Dokument konnte nicht angezeigt werden. Bitte versuchen Sie es später erneut oder laden Sie die Datei direkt herunter.</p>
            </div>
        `;

        const pdfPreview = document.querySelector('.pdf-preview');
        if (pdfPreview) {
            pdfPreview.innerHTML = errorMessage;
        }
    }
}

// Accessibility improvements
class AccessibilityEnhancements {
    constructor() {
        this.init();
    }

    init() {
        // Add ARIA labels to buttons
        document.querySelectorAll('.btn-preview, .preview-btn').forEach(button => {
            const title = button.getAttribute('data-title');
            button.setAttribute('aria-label', `Vorschau für ${title}`);
        });

        // Add ARIA attributes to accordion
        document.querySelectorAll('.accordion-header').forEach(header => {
            const targetId = header.getAttribute('data-target');
            header.setAttribute('role', 'button');
            header.setAttribute('aria-expanded', 'false');
            header.setAttribute('aria-controls', targetId);
            header.setAttribute('tabindex', '0');

            const content = document.getElementById(targetId);
            if (content) {
                content.setAttribute('role', 'region');
                content.setAttribute('aria-hidden', 'true');
            }
        });

        // Add keyboard navigation for modal
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('pdfModal');
            if (modal && modal.classList.contains('active')) {
                this.handleModalKeyboard(e);
            }
        });

        // Announce dynamic content changes
        this.createAriaLiveRegion();
    }

    handleModalKeyboard(e) {
        const modal = document.getElementById('pdfModal');
        const focusableElements = modal.querySelectorAll(
            'button, iframe, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }

    createAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        liveRegion.id = 'aria-live-region';

        document.body.appendChild(liveRegion);
    }

    announce(message) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }
}

// Document Card Interactions
class DocumentCardEnhancements {
    constructor() {
        this.init();
    }

    init() {
        // Add hover effects for document cards
        document.querySelectorAll('.document-card').forEach(card => {
            card.addEventListener('mouseenter', this.onCardHover);
            card.addEventListener('mouseleave', this.onCardLeave);
        });

        // Add click effects for document icons
        document.querySelectorAll('.document-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const previewBtn = icon.closest('.document-card').querySelector('.preview-btn');
                if (previewBtn) {
                    previewBtn.click();
                }
            });
        });
    }

    onCardHover(e) {
        const card = e.currentTarget;
        const icon = card.querySelector('.document-icon');

        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
            icon.style.cursor = 'pointer';
        }
    }

    onCardLeave(e) {
        const card = e.currentTarget;
        const icon = card.querySelector('.document-icon');

        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
    }
}

// Category Statistics
class CategoryStatistics {
    constructor() {
        this.updateDocumentCounts();
    }

    updateDocumentCounts() {
        document.querySelectorAll('.accordion-item').forEach(item => {
            const content = item.querySelector('.accordion-content');
            const documentCards = content.querySelectorAll('.document-card');
            const countElement = item.querySelector('.document-count');

            if (countElement) {
                const count = documentCards.length;
                countElement.textContent = count === 1 ? '1 Dokument' : `${count} Dokumente`;
            }
        });
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all classes
    const accordionManager = new AccordionManager();
    const pdfModal = new PDFModal();
    const scrollAnimations = new ScrollAnimations();
    const downloadTracker = new DownloadTracker();
    const pdfErrorHandler = new PDFErrorHandler();
    const accessibility = new AccessibilityEnhancements();
    const documentCardEnhancements = new DocumentCardEnhancements();
    const categoryStatistics = new CategoryStatistics();

    // Add loading states to preview buttons
    document.querySelectorAll('.btn-preview, .preview-btn').forEach(button => {
        button.addEventListener('click', function() {
            const originalText = this.textContent;
            this.textContent = 'Lädt...';
            this.disabled = true;

            // Re-enable button after modal opens
            setTimeout(() => {
                this.textContent = originalText;
                this.disabled = false;
            }, 1000);
        });
    });

    // Add smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add copy functionality for important information
    const addCopyButtons = () => {
        const importantInfo = document.querySelectorAll('.certificate-details li, .document-meta .valid-until');
        importantInfo.forEach(item => {
            if (item.textContent.includes('Betriebsnummer') ||
                item.textContent.includes('Gültig bis')) {
                item.style.cursor = 'pointer';
                item.title = 'Klicken zum Kopieren';

                item.addEventListener('click', () => {
                    navigator.clipboard.writeText(item.textContent).then(() => {
                        // Visual feedback
                        const originalBg = item.style.backgroundColor;
                        const originalColor = item.style.color;
                        item.style.backgroundColor = 'var(--accent-green)';
                        item.style.color = 'white';

                        setTimeout(() => {
                            item.style.backgroundColor = originalBg;
                            item.style.color = originalColor;
                        }, 1000);
                    });
                });
            }
        });
    };

    // Initialize copy functionality
    addCopyButtons();

    // Add "Expand All" / "Collapse All" functionality
    const addGlobalAccordionControls = () => {
        // Find the section that contains the accordion (Weitere Bescheinigungen)
        const accordionContainer = document.querySelector('.documents-accordion');
        if (accordionContainer) {
            // Find the section-header that comes before the accordion
            const accordionSection = accordionContainer.closest('.section-padding');
            const sectionHeader = accordionSection?.querySelector('.section-header');

            if (sectionHeader && document.querySelectorAll('.accordion-item').length > 1) {
                const controlsDiv = document.createElement('div');
                controlsDiv.className = 'accordion-global-controls';
                controlsDiv.style.cssText = `
                    margin-top: var(--spacing-md);
                    display: flex;
                    gap: var(--spacing-sm);
                    justify-content: center;
                    flex-wrap: wrap;
                `;

                const expandAllBtn = document.createElement('button');
                expandAllBtn.className = 'btn btn-outline btn-small';
                expandAllBtn.textContent = 'Alle aufklappen';
                expandAllBtn.style.cssText = `
                    background: var(--primary-green);
                    color: white;
                    border-color: var(--primary-green);
                `;

                const collapseAllBtn = document.createElement('button');
                collapseAllBtn.className = 'btn btn-outline btn-small';
                collapseAllBtn.textContent = 'Alle zuklappen';

                expandAllBtn.addEventListener('click', () => {
                    document.querySelectorAll('.accordion-header').forEach(header => {
                        if (!header.classList.contains('active')) {
                            accordionManager.openAccordion(header);
                        }
                    });
                });

                collapseAllBtn.addEventListener('click', () => {
                    accordionManager.closeAllAccordions();
                });

                expandAllBtn.addEventListener('mouseenter', () => {
                    expandAllBtn.style.background = 'var(--accent-green)';
                    expandAllBtn.style.transform = 'translateY(-1px)';
                });

                expandAllBtn.addEventListener('mouseleave', () => {
                    expandAllBtn.style.background = 'var(--primary-green)';
                    expandAllBtn.style.transform = 'translateY(0)';
                });

                controlsDiv.appendChild(expandAllBtn);
                controlsDiv.appendChild(collapseAllBtn);
                sectionHeader.appendChild(controlsDiv);
            }
        }
    };

    // Add global controls
    addGlobalAccordionControls();

    console.log('Accordion bescheinigungen page initialized successfully');
});

// Project Map
// Project Map - Überarbeitete Version
class ProjectMapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.projectData = [];
        this.currentLightboxIndex = 0;
        this.currentLightboxImages = [];
        this.originalBounds = null; // Speichert die ursprüngliche Kartenansicht
        this.isZoomedToMarker = false; // Track ob zu einem Marker gezoomt wurde

        this.init();
    }

    /**
     * Initialisiert die Karte und lädt die Projektdaten
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupMap();
            });
        } else {
            this.setupMap();
        }
    }

    /**
     * Setzt die Leaflet-Karte auf
     */
    setupMap() {
        const mapElement = document.getElementById('project-map');
        if (!mapElement) {
            console.error('Projekt-Karte Element nicht gefunden');
            return;
        }

        try {
            console.log('Initialisiere Projekt-Karte...');
            this.showLoading();

            // Initialisiere Leaflet-Karte mit deaktivierten Zoom-Kontrollen
            this.map = L.map('project-map', {
                zoomControl: false,          // Deaktiviere Zoom-Buttons
                scrollWheelZoom: false,      // Deaktiviere Scroll-Zoom
                doubleClickZoom: false,      // Deaktiviere Doppelklick-Zoom
                touchZoom: false,            // Deaktiviere Touch-Zoom
                boxZoom: false,              // Deaktiviere Box-Zoom
                keyboard: false,             // Deaktiviere Tastatur-Navigation
                dragging: true,              // Behalte Drag-Funktionalität
                attributionControl: true
            });

            // Setze Anfangsansicht auf die Region Hainewalde/Oberlausitz
            this.map.setView([51.0504, 14.7372], 9);

            // Erstelle Tile Layers für Light und Dark Mode
            this.createTileLayers();

            // Setze initialen Tile Layer
            this.setTileLayer(this.isDarkMode);

            // Lade Projektdaten aus HTML
            this.loadProjectData();

            // Erstelle Marker
            this.createMarkers();

            // Initialisiere Event-Listener
            this.setupEventListeners();

            this.setupDarkModeWatcher();

            // Verstecke Loading-Indikator
            setTimeout(() => {
                this.hideLoading();
            }, 1000);

            console.log('Projekt-Karte erfolgreich initialisiert');

        } catch (error) {
            console.error('Fehler beim Initialisieren der Karte:', error);
            this.showError('Die Karte konnte nicht geladen werden. Fehler: ' + error.message);
        }
    }

    /**
     * Lädt Projektdaten aus den versteckten HTML-Elementen
     */
    loadProjectData() {
        const projectItems = document.querySelectorAll('.project-item');
        console.log(`Gefundene Projekt-Elemente: ${projectItems.length}`);

        projectItems.forEach((item, index) => {
            try {
                const images = Array.from(item.querySelectorAll('.project-images img')).map(img => ({
                    src: img.src,
                    alt: img.alt,
                    caption: img.getAttribute('data-caption') || img.alt
                }));

                const details = Array.from(item.querySelectorAll('.project-detail')).map(detail =>
                    detail.textContent.trim()
                );

                const project = {
                    id: index,
                    lat: parseFloat(item.getAttribute('data-lat')),
                    lng: parseFloat(item.getAttribute('data-lng')),
                    title: item.getAttribute('data-title'),
                    category: item.getAttribute('data-category'),
                    year: item.getAttribute('data-year'),
                    location: item.getAttribute('data-location'),
                    description: item.querySelector('.project-description').textContent.trim(),
                    images: images,
                    details: details
                };

                console.log(`Projekt ${index + 1} geladen:`, project.title);
                this.projectData.push(project);

            } catch (error) {
                console.error(`Fehler beim Laden von Projekt ${index}:`, error);
            }
        });

        console.log(`${this.projectData.length} Projekte erfolgreich geladen`);
    }

    /**
     * Erstellt Marker für alle Projekte
     */
    createMarkers() {
        console.log('Erstelle Marker für', this.projectData.length, 'Projekte');

        if (this.projectData.length === 0) {
            console.error('Keine Projektdaten verfügbar für Marker');
            return;
        }

        this.projectData.forEach(project => {
            try {
                this.createProjectMarker(project);
            } catch (error) {
                console.error(`Fehler beim Erstellen des Markers für Projekt ${project.title}:`, error);
            }
        });

        console.log(`${this.markers.length} Marker erstellt`);

        // Passe Kartenansicht an alle Marker an und speichere die Bounds
        if (this.markers.length > 0) {
            try {
                const group = new L.featureGroup(this.markers);
                this.originalBounds = group.getBounds().pad(0.1);
                this.map.fitBounds(this.originalBounds);

                // Verhindere weiteres Zoomen nach dem initialen Fit
                this.map.setMaxBounds(this.originalBounds.pad(0.2));

                console.log('Kartenansicht an Marker angepasst und Bounds gespeichert');
            } catch (error) {
                console.error('Fehler beim Anpassen der Kartenansicht:', error);
            }
        }
    }

    /**
     * Erstellt einen individuellen Marker für ein Projekt
     */
    createProjectMarker(project) {
        console.log('Erstelle Marker für:', project.title);

        // Verwende Standard Leaflet Marker mit angepasstem Icon
        const markerIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // Erstelle Marker
        const marker = L.marker([project.lat, project.lng], {
            icon: markerIcon,
            title: project.title,
            alt: `Projekt: ${project.title}`
        });

        // Marker zu Karte hinzufügen
        marker.addTo(this.map);

        // Click-Event für Marker - öffne das Projekt-Modal
        marker.on('click', (e) => {
            console.log('Marker geklickt für:', project.title);
            this.zoomToMarkerAndOpenModal(project, marker);
        });

        // Marker zur Sammlung hinzufügen
        this.markers.push(marker);

        return marker;
    }

    createTileLayers() {
        // Light Mode Tile Layer (Standard OpenStreetMap)
        this.lightTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
            minZoom: 8,
            className: 'light-tile-layer'
        });

        // Dark Mode Tile Layer (CartoDB Dark Matter)
        this.darkTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 18,
            minZoom: 8,
            className: 'dark-tile-layer'
        });

        console.log('Tile Layers für Light/Dark Mode erstellt');
    }

    /**
     * Setzt den Tile Layer basierend auf dem Mode
     */
    setTileLayer(isDark) {
        // Entferne aktuellen Layer
        if (this.currentTileLayer) {
            this.map.removeLayer(this.currentTileLayer);
        }

        // Setze neuen Layer
        this.currentTileLayer = isDark ? this.darkTileLayer : this.lightTileLayer;
        this.currentTileLayer.addTo(this.map);

        console.log(`Tile Layer gewechselt zu: ${isDark ? 'Dark' : 'Light'} Mode`);
    }

    /**
     * Aktualisiert alle Marker-Icons basierend auf dem Mode
     */
    updateMarkerIcons(isDark) {
        const newIcon = isDark ? this.darkMarkerIcon : this.lightMarkerIcon;

        this.markers.forEach(marker => {
            marker.setIcon(newIcon);
        });

        console.log(`Marker-Icons aktualisiert für ${isDark ? 'Dark' : 'Light'} Mode`);
    }

    /**
     * Setup Dark Mode Watcher
     */
    setupDarkModeWatcher() {
        // MutationObserver für Body-Klassen-Änderungen
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const newDarkMode = document.body.classList.contains('dark-mode');

                    if (newDarkMode !== this.isDarkMode) {
                        this.isDarkMode = newDarkMode;
                        this.switchMode(newDarkMode);
                    }
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Event-Listener für Dark Mode Toggle Button
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                // Kleine Verzögerung für smooth Transition
                setTimeout(() => {
                    const newDarkMode = document.body.classList.contains('dark-mode');
                    if (newDarkMode !== this.isDarkMode) {
                        this.isDarkMode = newDarkMode;
                        this.switchMode(newDarkMode);
                    }
                }, 50);
            });
        }

        console.log('Dark Mode Watcher eingerichtet');
    }

    /**
     * Wechselt zwischen Light und Dark Mode
     */
    switchMode(isDark) {
        console.log(`Wechsle Karten-Mode zu: ${isDark ? 'Dark' : 'Light'}`);

        // Smooth Transition-Effekt
        const mapContainer = document.getElementById('project-map');
        if (mapContainer) {
            mapContainer.style.transition = 'all 0.3s ease';
            mapContainer.style.opacity = '0.7';
        }

        setTimeout(() => {
            // Wechsle Tile Layer
            this.setTileLayer(isDark);

            // Aktualisiere Marker Icons
            this.updateMarkerIcons(isDark);

            // Entferne Transition-Effekt
            if (mapContainer) {
                mapContainer.style.opacity = '1';
                setTimeout(() => {
                    mapContainer.style.transition = '';
                }, 300);
            }
        }, 150);
    }

    /**
     * Zoomt zu einem Marker und öffnet das Modal
     */
    zoomToMarkerAndOpenModal(project, marker) {
        console.log('Zoome zu Marker und öffne Modal für:', project.title);

        this.isZoomedToMarker = true;

        // Zoome zu dem Marker
        const targetLatLng = marker.getLatLng();
        this.map.setView(targetLatLng, 14, {
            animate: true,
            duration: 0.8
        });

        // Warte bis Zoom-Animation fertig ist, dann öffne Modal
        setTimeout(() => {
            if (window.projectModalManager) {
                window.projectModalManager.openModal(project.id);
            } else {
                // Fallback: verwende focusOnProject
                this.openProjectModal(project);
            }
        }, 900);
    }

    /**
     * Öffnet das Projekt-Modal (Fallback)
     */
    openProjectModal(project) {
        // Wenn kein projectModalManager verfügbar, verwende focusOnProject
        if (typeof focusOnProject === 'function') {
            focusOnProject(project.id);
        } else {
            console.warn('Keine Modal-Funktionalität verfügbar');
        }
    }

    /**
     * Zoomt zurück zur ursprünglichen Ansicht
     */
    zoomBackToOriginalView() {
        if (this.originalBounds && this.isZoomedToMarker) {
            console.log('Zoome zurück zur ursprünglichen Ansicht');

            this.map.fitBounds(this.originalBounds, {
                animate: true,
                duration: 0.8
            });

            this.isZoomedToMarker = false;
        }
    }

    /**
     * Öffnet die Lightbox mit einem Bild
     */
    openLightbox(images, startIndex = 0) {
        this.currentLightboxImages = images;
        this.currentLightboxIndex = startIndex;

        const lightbox = document.getElementById('lightbox');
        if (!lightbox) {
            console.warn('Lightbox-Element nicht gefunden');
            return;
        }

        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.updateLightboxImage();

        const closeBtn = lightbox.querySelector('.lightbox-close');
        if (closeBtn) {
            closeBtn.focus();
        }
    }

    /**
     * Aktualisiert das Bild in der Lightbox
     */
    updateLightboxImage() {
        const lightbox = document.getElementById('lightbox');
        const img = lightbox.querySelector('.lightbox-image');
        const caption = lightbox.querySelector('.lightbox-caption');

        const currentImage = this.currentLightboxImages[this.currentLightboxIndex];

        if (img && currentImage) {
            img.src = currentImage.src;
            img.alt = currentImage.alt;

            if (caption) {
                caption.textContent = currentImage.caption;
            }
        }

        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');

        if (prevBtn) {
            prevBtn.style.display = this.currentLightboxImages.length > 1 ? 'flex' : 'none';
        }
        if (nextBtn) {
            nextBtn.style.display = this.currentLightboxImages.length > 1 ? 'flex' : 'none';
        }
    }

    /**
     * Zeigt alle Bilder eines Projekts in der Lightbox
     */
    showAllImages(projectId) {
        const project = this.projectData.find(p => p.id === projectId);
        if (project && project.images.length > 0) {
            console.log('Öffne Lightbox für Projekt:', project.title);
            this.openLightbox(project.images, 0);
        }
    }

    /**
     * Setzt globale Event-Listener auf
     */
    setupEventListeners() {
        // Lightbox Event-Listener
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            const closeBtn = lightbox.querySelector('.lightbox-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeLightbox());
            }

            const prevBtn = lightbox.querySelector('.lightbox-prev');
            if (prevBtn) {
                prevBtn.addEventListener('click', () => this.previousLightboxImage());
            }

            const nextBtn = lightbox.querySelector('.lightbox-next');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.nextLightboxImage());
            }

            const backdrop = lightbox.querySelector('.lightbox-backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', () => this.closeLightbox());
            }
        }

        // Keyboard Event-Listener
        document.addEventListener('keydown', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (lightbox && lightbox.classList.contains('active')) {
                switch(e.key) {
                    case 'Escape':
                        e.preventDefault();
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousLightboxImage();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextLightboxImage();
                        break;
                }
            }
        });

        // Window Resize Handler
        window.addEventListener('resize', this.debounce(() => {
            if (this.map && this.originalBounds) {
                this.map.invalidateSize();
                if (!this.isZoomedToMarker) {
                    this.map.fitBounds(this.originalBounds);
                }
            }
        }, 250));

        // Event-Listener für Modal-Schließung
        this.setupModalCloseListeners();
    }

    /**
     * Setzt Event-Listener für Modal-Schließung auf
     */
    setupModalCloseListeners() {
        // Überwache Modal-Schließung über MutationObserver
        const modal = document.getElementById('project-modal');
        if (modal) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const isActive = modal.classList.contains('active');
                        if (!isActive && this.isZoomedToMarker) {
                            // Modal wurde geschlossen, zoome zurück
                            setTimeout(() => {
                                this.zoomBackToOriginalView();
                            }, 100);
                        }
                    }
                });
            });

            observer.observe(modal, {
                attributes: true,
                attributeFilter: ['class']
            });

            // Zusätzlicher Event-Listener für Close-Button
            const closeBtn = modal.querySelector('.project-modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    setTimeout(() => {
                        this.zoomBackToOriginalView();
                    }, 100);
                });
            }

            // Event-Listener für Backdrop-Click
            const backdrop = modal.querySelector('.project-modal-backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', () => {
                    setTimeout(() => {
                        this.zoomBackToOriginalView();
                    }, 100);
                });
            }
        }

        // Event-Listener für Escape-Taste
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('project-modal');
                if (modal && modal.classList.contains('active')) {
                    setTimeout(() => {
                        this.zoomBackToOriginalView();
                    }, 100);
                }
            }
        });
    }

    /**
     * Navigation in der Lightbox
     */
    previousLightboxImage() {
        if (this.currentLightboxImages.length <= 1) return;

        this.currentLightboxIndex--;
        if (this.currentLightboxIndex < 0) {
            this.currentLightboxIndex = this.currentLightboxImages.length - 1;
        }
        this.updateLightboxImage();
    }

    nextLightboxImage() {
        if (this.currentLightboxImages.length <= 1) return;

        this.currentLightboxIndex++;
        if (this.currentLightboxIndex >= this.currentLightboxImages.length) {
            this.currentLightboxIndex = 0;
        }
        this.updateLightboxImage();
    }

    /**
     * Schließt die Lightbox
     */
    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        this.currentLightboxImages = [];
        this.currentLightboxIndex = 0;
    }

    /**
     * Zeigt einen Loading-Indikator
     */
    showLoading() {
        const mapContainer = document.querySelector('.project-map-container');
        if (!mapContainer) return;

        const loadingElement = document.createElement('div');
        loadingElement.className = 'project-map-loading active';
        loadingElement.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Karte wird geladen...</p>
        `;

        mapContainer.appendChild(loadingElement);
    }

    /**
     * Versteckt den Loading-Indikator
     */
    hideLoading() {
        const loadingElement = document.querySelector('.project-map-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    /**
     * Zeigt eine Fehlermeldung
     */
    showError(message) {
        const mapContainer = document.querySelector('.project-map-container');
        if (!mapContainer) return;

        this.hideLoading();

        const errorElement = document.createElement('div');
        errorElement.className = 'project-map-error';
        errorElement.innerHTML = `
            <div style="text-align: center; padding: var(--spacing-xl); color: var(--text-secondary-dark);">
                <h4>Fehler beim Laden der Karte</h4>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-outline btn-small">
                    Seite neu laden
                </button>
            </div>
        `;

        mapContainer.appendChild(errorElement);
    }

    /**
     * Debounce-Funktion
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Zerstört die Karten-Instanz
     */
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.markers = [];
        this.projectData = [];
        this.originalBounds = null;
        this.isZoomedToMarker = false;
        this.closeLightbox();
    }
}

// Überarbeitete focusOnProject Funktion
function focusOnProject(projectIndex) {
    console.log('Fokussiere auf Projekt:', projectIndex);

    // Scrolle zur Karte
    const mapContainer = document.querySelector('.project-map-container');
    if (mapContainer) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = mapContainer.offsetTop - headerHeight - 50;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Warte kurz und öffne dann das Modal direkt (ohne Zoom, da von Legend geklickt)
        setTimeout(() => {
            if (window.projectModalManager) {
                window.projectModalManager.openModal(projectIndex);
            }
        }, 800);
    } else {
        // Falls Karte nicht vorhanden, öffne Modal direkt
        if (window.projectModalManager) {
            window.projectModalManager.openModal(projectIndex);
        }
    }
}

// Erweiterte ProjectModalManager Klasse
class ProjectModalManager {
    constructor() {
        this.modal = null;
        this.currentProjectIndex = 0;
        this.currentImageIndex = 0;
        this.currentProject = null;
        this.projectData = [];

        this.init();
    }

    init() {
        this.createModal();
        this.loadProjectData();
        this.setupEventListeners();
    }

    createModal() {
        this.modal = document.getElementById('project-modal');
        if (!this.modal) {
            console.error('Projekt-Modal nicht gefunden');
            return;
        }
    }

    loadProjectData() {
        const projectItems = document.querySelectorAll('.project-item');

        projectItems.forEach((item, index) => {
            try {
                const images = Array.from(item.querySelectorAll('.project-images img')).map(img => ({
                    src: img.src,
                    alt: img.alt,
                    caption: img.getAttribute('data-caption') || img.alt
                }));

                const details = Array.from(item.querySelectorAll('.project-detail')).map(detail =>
                    detail.textContent.trim()
                );

                const project = {
                    id: index,
                    lat: parseFloat(item.getAttribute('data-lat')),
                    lng: parseFloat(item.getAttribute('data-lng')),
                    title: item.getAttribute('data-title'),
                    category: item.getAttribute('data-category'),
                    year: item.getAttribute('data-year'),
                    location: item.getAttribute('data-location'),
                    description: item.querySelector('.project-description').textContent.trim(),
                    images: images,
                    details: details
                };

                this.projectData.push(project);
            } catch (error) {
                console.error(`Fehler beim Laden von Projekt ${index}:`, error);
            }
        });
    }

    setupEventListeners() {
        if (!this.modal) return;

        // Close-Button
        const closeBtn = this.modal.querySelector('.project-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Backdrop Click
        const backdrop = this.modal.querySelector('.project-modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeModal());
        }

        // Navigation Buttons
        const prevBtn = this.modal.querySelector('.project-prev-btn');
        const nextBtn = this.modal.querySelector('.project-next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousImage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextImage());
        }

        // Keyboard Navigation
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;

            switch(e.key) {
                case 'Escape':
                    e.preventDefault();
                    this.closeModal();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousImage();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextImage();
                    break;
            }
        });
    }

    openModal(projectIndex) {
        if (!this.modal || !this.projectData[projectIndex]) {
            console.error('Modal oder Projekt nicht gefunden');
            return;
        }

        this.currentProjectIndex = projectIndex;
        this.currentProject = this.projectData[projectIndex];
        this.currentImageIndex = 0;

        this.populateModal();

        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        const closeBtn = this.modal.querySelector('.project-modal-close');
        if (closeBtn) {
            closeBtn.focus();
        }

        console.log('Projekt-Modal geöffnet für:', this.currentProject.title);
    }

    closeModal() {
        if (!this.modal) return;

        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        this.currentProject = null;
        this.currentProjectIndex = 0;
        this.currentImageIndex = 0;

        // Informiere MapManager über Modal-Schließung
        if (window.projectMapManager && window.projectMapManager.isZoomedToMarker) {
            setTimeout(() => {
                window.projectMapManager.zoomBackToOriginalView();
            }, 100);
        }
    }

    populateModal() {
        if (!this.currentProject) return;

        const project = this.currentProject;

        // Titel setzen
        const title = this.modal.querySelector('#project-modal-title');
        if (title) {
            title.textContent = project.title;
        }

        // Meta-Informationen
        const metaContainer = this.modal.querySelector('#project-modal-meta');
        if (metaContainer) {
            metaContainer.innerHTML = `
                <span class="project-meta-badge category">${project.category}</span>
                <span class="project-meta-badge">${project.year}</span>
                <span class="project-meta-badge">${project.location}</span>
            `;
        }

        // Beschreibung
        const description = this.modal.querySelector('#project-modal-description');
        if (description) {
            description.innerHTML = `<p>${project.description}</p>`;
        }

        // Details
        const details = this.modal.querySelector('#project-modal-details');
        if (details && project.details.length > 0) {
            details.innerHTML = `
                <h4>Projektdetails</h4>
                <ul class="project-detail-list">
                    ${project.details.map(detail => `<li>${detail}</li>`).join('')}
                </ul>
            `;
        }

        this.loadModalImages();
    }

    loadModalImages() {
        if (!this.currentProject || !this.currentProject.images.length) return;

        const mainImage = this.modal.querySelector('#project-modal-main-image');
        const thumbnailsContainer = this.modal.querySelector('#project-modal-thumbnails');

        if (!mainImage || !thumbnailsContainer) return;

        const images = this.currentProject.images;

        this.updateMainImage();

        thumbnailsContainer.innerHTML = images.map((image, index) => `
            <img src="${image.src}" 
                 alt="${image.alt}" 
                 class="project-thumbnail ${index === 0 ? 'active' : ''}"
                 data-index="${index}"
                 onclick="projectModalManager.setActiveImage(${index})" />
        `).join('');

        const prevBtn = this.modal.querySelector('.project-prev-btn');
        const nextBtn = this.modal.querySelector('.project-next-btn');

        if (prevBtn && nextBtn) {
            const showNavigation = images.length > 1;
            prevBtn.style.display = showNavigation ? 'flex' : 'none';
            nextBtn.style.display = showNavigation ? 'flex' : 'none';
        }
    }

    updateMainImage() {
        const mainImage = this.modal.querySelector('#project-modal-main-image');
        if (!mainImage || !this.currentProject) return;

        const currentImage = this.currentProject.images[this.currentImageIndex];
        if (currentImage) {
            mainImage.src = currentImage.src;
            mainImage.alt = currentImage.alt;

            const thumbnails = this.modal.querySelectorAll('.project-thumbnail');
            thumbnails.forEach((thumb, index) => {
                thumb.classList.toggle('active', index === this.currentImageIndex);
            });
        }
    }

    setActiveImage(index) {
        if (!this.currentProject || index < 0 || index >= this.currentProject.images.length) return;

        this.currentImageIndex = index;
        this.updateMainImage();
    }

    previousImage() {
        if (!this.currentProject || this.currentProject.images.length <= 1) return;

        this.currentImageIndex--;
        if (this.currentImageIndex < 0) {
            this.currentImageIndex = this.currentProject.images.length - 1;
        }
        this.updateMainImage();
    }

    nextImage() {
        if (!this.currentProject || this.currentProject.images.length <= 1) return;

        this.currentImageIndex++;
        if (this.currentImageIndex >= this.currentProject.images.length) {
            this.currentImageIndex = 0;
        }
        this.updateMainImage();
    }
}

// Globale Initialisierung
let projectMapManager = null;
let projectModalManager = null;

// Initialisierung nach DOM-Load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initialisiere Projekt-System...');

    // Prüfe ob Leaflet verfügbar ist
    if (typeof L === 'undefined') {
        console.error('Leaflet.js ist nicht geladen');
        return;
    }

    // Initialisiere Projekt-Modal Manager
    projectModalManager = new ProjectModalManager();
    window.projectModalManager = projectModalManager;

    // Initialisiere Projekt-Karte
    projectMapManager = new ProjectMapManager();
    window.projectMapManager = projectMapManager;

    console.log('Projekt-System vollständig initialisiert');
});

// Cleanup bei Page Unload
window.addEventListener('beforeunload', () => {
    if (projectMapManager) {
        projectMapManager.destroy();
    }
});

// Organigramm Funktionalität
class OrganigrammManager {
    constructor() {
        this.departments = [];
        this.memberCards = [];
        this.isLoaded = false;

        this.init();
    }

    /**
     * Initialisiert das Organigramm
     */
    init() {
        // Warten bis DOM geladen ist
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupOrganigramm();
            });
        } else {
            this.setupOrganigramm();
        }
    }

    /**
     * Setzt das Organigramm auf
     */
    setupOrganigramm() {
        const organigrammContainer = document.querySelector('#ansprechpartner .organigramm-container');
        if (!organigrammContainer) {
            console.warn('Organigramm Container nicht gefunden');
            return;
        }

        try {
            console.log('Initialisiere Organigramm...');

            // Sammle alle Abteilungen und Mitarbeiterkarten
            this.collectElements();

            // Setze Intersection Observer auf
            this.setupIntersectionObserver();

            // Initialisiere Event-Listener
            this.setupEventListeners();

            // Füge Tastatur-Navigation hinzu
            this.setupKeyboardNavigation();

            // Initialisiere Kontakt-Tracking
            this.setupContactTracking();

            this.isLoaded = true;
            console.log('Organigramm erfolgreich initialisiert');

        } catch (error) {
            console.error('Fehler beim Initialisieren des Organigramms:', error);
        }
    }

    /**
     * Sammelt alle relevanten DOM-Elemente
     */
    collectElements() {
        this.departments = Array.from(document.querySelectorAll('.org-department'));
        this.memberCards = Array.from(document.querySelectorAll('.member-card'));

        console.log(`Gefunden: ${this.departments.length} Abteilungen, ${this.memberCards.length} Mitarbeiterkarten`);
    }

    /**
     * Setzt Intersection Observer für Scroll-Animationen auf
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver nicht unterstützt');
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElementIn(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Beobachte alle Abteilungen
        this.departments.forEach(department => {
            this.observer.observe(department);
        });
    }

    /**
     * Animiert ein Element beim Einblenden
     * @param {Element} element - Das zu animierende Element
     */
    animateElementIn(element) {
        element.classList.add('animate-in');

        // Animiere Mitarbeiterkarten nacheinander
        const memberCards = element.querySelectorAll('.member-card');
        memberCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-in');
            }, index * 100 + 200);
        });
    }

    /**
     * Setzt Event-Listener auf
     */
    setupEventListeners() {
        // Hover-Effekte für Abteilungen
        this.departments.forEach(department => {
            department.addEventListener('mouseenter', (e) => {
                this.onDepartmentHover(e.currentTarget, true);
            });

            department.addEventListener('mouseleave', (e) => {
                this.onDepartmentHover(e.currentTarget, false);
            });
        });

        // Click-Events für Mitarbeiterkarten
        this.memberCards.forEach(card => {
            card.addEventListener('click', (e) => {
                this.onMemberCardClick(e.currentTarget);
            });
        });

        // Touch-Unterstützung für mobile Geräte
        if ('ontouchstart' in window) {
            this.setupTouchEvents();
        }

        // Resize-Handler
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    /**
     * Behandelt Abteilungs-Hover-Effekte
     * @param {Element} department - Die Abteilung
     * @param {boolean} isHovering - Hover-Status
     */
    onDepartmentHover(department, isHovering) {
        const icon = department.querySelector('.department-icon');
        const memberCards = department.querySelectorAll('.member-card');

        if (isHovering) {
            // Highlight-Effekt
            department.classList.add('department-highlighted');

            // Animiere Icon
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(360deg)';
            }

            // Leichte Animation der Mitarbeiterkarten
            memberCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.transform = 'translateY(-2px)';
                }, index * 50);
            });

        } else {
            // Entferne Highlight
            department.classList.remove('department-highlighted');

            // Reset Icon
            if (icon) {
                icon.style.transform = '';
            }

            // Reset Mitarbeiterkarten
            memberCards.forEach(card => {
                card.style.transform = '';
            });
        }
    }

    /**
     * Behandelt Klicks auf Mitarbeiterkarten
     * @param {Element} card - Die geklickte Karte
     */
    onMemberCardClick(card) {
        const memberName = card.querySelector('.member-name')?.textContent;
        const phoneLink = card.querySelector('a[href^="tel:"]');
        const emailLink = card.querySelector('a[href^="mailto:"]');

        // Zeige Kontakt-Optionen an
        this.showContactOptions(memberName, phoneLink, emailLink, card);

        // Tracking
        this.trackMemberCardClick(memberName);
    }

    /**
     * Zeigt Kontakt-Optionen für einen Mitarbeiter
     * @param {string} name - Name des Mitarbeiters
     * @param {Element} phoneLink - Telefon-Link
     * @param {Element} emailLink - E-Mail-Link
     * @param {Element} card - Die Mitarbeiterkarte
     */
    showContactOptions(name, phoneLink, emailLink, card) {
        // Erstelle Kontakt-Modal oder -Tooltip
        const contactModal = this.createContactModal(name, phoneLink, emailLink);

        // Positioniere Modal relativ zur Karte
        const cardRect = card.getBoundingClientRect();
        contactModal.style.top = (cardRect.bottom + window.scrollY + 10) + 'px';
        contactModal.style.left = (cardRect.left + window.scrollX) + 'px';

        document.body.appendChild(contactModal);

        // Schließe Modal nach 5 Sekunden oder bei Klick außerhalb
        setTimeout(() => {
            this.closeContactModal(contactModal);
        }, 5000);

        // Event-Listener für Schließen
        const closeHandler = (e) => {
            if (!contactModal.contains(e.target)) {
                this.closeContactModal(contactModal);
                document.removeEventListener('click', closeHandler);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeHandler);
        }, 100);
    }

    /**
     * Erstellt ein Kontakt-Modal
     * @param {string} name - Name des Mitarbeiters
     * @param {Element} phoneLink - Telefon-Link
     * @param {Element} emailLink - E-Mail-Link
     * @returns {Element} Modal-Element
     */
    createContactModal(name, phoneLink, emailLink) {
        const modal = document.createElement('div');
        modal.className = 'contact-modal';
        modal.style.cssText = `
            position: absolute;
            background: white;
            border: 2px solid var(--primary-green);
            border-radius: var(--radius-lg);
            padding: var(--spacing-md);
            box-shadow: var(--shadow-xl);
            z-index: 1000;
            min-width: 200px;
            animation: fadeInScale 0.3s ease;
        `;

        const phoneNumber = phoneLink ? phoneLink.getAttribute('href').replace('tel:', '') : '';
        const emailAddress = emailLink ? emailLink.getAttribute('href').replace('mailto:', '') : '';

        modal.innerHTML = `
            <div style="margin-bottom: var(--spacing-sm);">
                <strong style="color: var(--primary-green);">${name}</strong>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
                ${phoneNumber ? `
                    <a href="tel:${phoneNumber.replace(/\s/g, '')}" 
                       style="display: flex; align-items: center; gap: var(--spacing-xs); 
                              text-decoration: none; padding: var(--spacing-xs); 
                              border-radius: var(--radius-md); background: var(--bg-light);
                              color: var(--text-dark); transition: all 0.2s ease;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                        ${phoneNumber}
                    </a>
                ` : ''}
                ${emailAddress ? `
                    <a href="mailto:${emailAddress}" 
                       style="display: flex; align-items: center; gap: var(--spacing-xs); 
                              text-decoration: none; padding: var(--spacing-xs); 
                              border-radius: var(--radius-md); background: var(--bg-light);
                              color: var(--text-dark); transition: all 0.2s ease;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        E-Mail senden
                    </a>
                ` : ''}
            </div>
            <div style="text-align: center; margin-top: var(--spacing-sm);">
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: var(--text-secondary-dark); 
                               font-size: 0.8rem; cursor: pointer;">
                    Schließen
                </button>
            </div>
        `;

        // Hover-Effekte für Links
        const links = modal.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.background = 'var(--primary-green)';
                link.style.color = 'white';
            });
            link.addEventListener('mouseleave', () => {
                link.style.background = 'var(--bg-light)';
                link.style.color = 'var(--text-dark)';
            });
        });

        return modal;
    }

    /**
     * Schließt das Kontakt-Modal
     * @param {Element} modal - Modal-Element
     */
    closeContactModal(modal) {
        if (modal && modal.parentElement) {
            modal.style.animation = 'fadeOutScale 0.2s ease';
            setTimeout(() => {
                modal.remove();
            }, 200);
        }
    }

    /**
     * Setzt Touch-Events für mobile Geräte auf
     */
    setupTouchEvents() {
        this.memberCards.forEach(card => {
            let touchStartTime = 0;

            card.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
            });

            card.addEventListener('touchend', (e) => {
                const touchDuration = Date.now() - touchStartTime;

                // Kurzer Tap = Kontakt-Info anzeigen
                if (touchDuration < 300) {
                    e.preventDefault();
                    this.onMemberCardClick(card);
                }
            });
        });
    }

    /**
     * Setzt Tastatur-Navigation auf
     */
    setupKeyboardNavigation() {
        this.memberCards.forEach((card, index) => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');

            const memberName = card.querySelector('.member-name')?.textContent || 'Mitarbeiter';
            card.setAttribute('aria-label', `Kontakt-Informationen für ${memberName}`);

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.onMemberCardClick(card);
                }

                // Pfeiltasten-Navigation
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const nextCard = this.memberCards[index + 1];
                    if (nextCard) nextCard.focus();
                }

                if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevCard = this.memberCards[index - 1];
                    if (prevCard) prevCard.focus();
                }
            });
        });
    }

    /**
     * Setzt Kontakt-Tracking auf
     */
    setupContactTracking() {
        // Tracke Telefon-Klicks
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const phoneNumber = e.currentTarget.getAttribute('href').replace('tel:', '');
                const memberCard = e.currentTarget.closest('.member-card');
                const memberName = memberCard?.querySelector('.member-name')?.textContent || 'Unbekannt';

                this.trackContactAction('phone', memberName, phoneNumber);
            });
        });

        // Tracke E-Mail-Klicks
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const emailAddress = e.currentTarget.getAttribute('href').replace('mailto:', '');
                const memberCard = e.currentTarget.closest('.member-card');
                const memberName = memberCard?.querySelector('.member-name')?.textContent || 'Unbekannt';

                this.trackContactAction('email', memberName, emailAddress);
            });
        });
    }

    /**
     * Trackt Kontakt-Aktionen
     * @param {string} type - Art des Kontakts ('phone' oder 'email')
     * @param {string} memberName - Name des Mitarbeiters
     * @param {string} contactValue - Telefonnummer oder E-Mail
     */
    trackContactAction(type, memberName, contactValue) {
        console.log(`Kontakt-Aktion: ${type} für ${memberName} (${contactValue})`);

        // Hier könnte Google Analytics oder ein anderes Tracking-System integriert werden
        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact_action', {
                'event_category': 'Organigramm',
                'event_label': `${type}_${memberName}`,
                'value': contactValue
            });
        }
    }

    /**
     * Trackt Mitarbeiterkarten-Klicks
     * @param {string} memberName - Name des Mitarbeiters
     */
    trackMemberCardClick(memberName) {
        console.log(`Mitarbeiterkarte geklickt: ${memberName}`);

        if (typeof gtag !== 'undefined') {
            gtag('event', 'member_card_click', {
                'event_category': 'Organigramm',
                'event_label': memberName
            });
        }
    }

    /**
     * Behandelt Fenster-Resize
     */
    handleResize() {
        // Schließe alle offenen Kontakt-Modals
        const modals = document.querySelectorAll('.contact-modal');
        modals.forEach(modal => this.closeContactModal(modal));

        // Aktualisiere Layout falls nötig
        console.log('Organigramm Layout aktualisiert');
    }

    /**
     * Debounce-Funktion
     * @param {Function} func - Zu verzögernde Funktion
     * @param {number} wait - Wartezeit in ms
     * @returns {Function} Verzögerte Funktion
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Zerstört das Organigramm (cleanup)
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }

        // Entferne alle Event-Listener und Modals
        const modals = document.querySelectorAll('.contact-modal');
        modals.forEach(modal => modal.remove());

        this.departments = [];
        this.memberCards = [];
        this.isLoaded = false;

        console.log('Organigramm zerstört');
    }
}

// CSS-Animationen für das Modal
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes fadeOutScale {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.8);
        }
    }

    .department-highlighted {
        box-shadow: 0 0 20px rgba(0, 100, 0, 0.3) !important;
    }

    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    /* Fokus-Styles für Accessibility */
    .member-card:focus {
        outline: 3px solid var(--primary-green);
        outline-offset: 2px;
    }

    /* Mobile-optimierte Modal-Styles */
    @media (max-width: 768px) {
        .contact-modal {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            max-width: 90vw;
            z-index: 9999 !important;
        }
    }
`;

document.head.appendChild(modalStyles);

// Globale Instanz
let organigrammManager = null;

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    const ansprechpartnerSection = document.getElementById('ansprechpartner');

    if (ansprechpartnerSection) {
        console.log('Ansprechpartner-Sektion gefunden, initialisiere Organigramm...');
        organigrammManager = new OrganigrammManager();

        // Globale Referenz für externe Zugriffe
        window.organigrammManager = organigrammManager;
    }
});

// Cleanup bei Page Unload
window.addEventListener('beforeunload', () => {
    if (organigrammManager) {
        organigrammManager.destroy();
    }
});

// Export für Module (falls verwendet)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OrganigrammManager };
}

// Smooth Scroll für Hero Button
function initializeHeroScrollButton() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;

    // Verstecke Scroll-Indikator beim Scrollen
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const heroHeight = document.querySelector('.hero')?.offsetHeight || 0;

        if (scrollY > heroHeight * 0.3) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.pointerEvents = 'none';
        } else {
            scrollIndicator.style.opacity = '1';
            scrollIndicator.style.pointerEvents = 'auto';
        }
    });

    // Smooth Scroll Animation
    const scrollBtn = document.querySelector('.scroll-down-btn');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToNextSection();
        });
    }
}