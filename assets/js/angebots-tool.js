(function() {
    'use strict';

    // Haupt-Tool-Controller
    class AngebotsTool {
        constructor() {
            this.currentStep = 1;
            this.totalSteps = 4;
            this.formData = {};
            this.priceData = {};
            this.isInitialized = false;
            this.selectedCategory = null;

            // Kategorie-Konfiguration
            this.categoryConfig = {
                pflaster: {
                    name: 'Pflasterarbeiten',
                    objektarten: {
                        einfahrt: 'Einfahrt pflastern',
                        terrasse: 'Terrasse pflastern',
                        gehweg: 'Gehweg pflastern',
                        hof: 'Hof/Platz pflastern',
                        parkplatz: 'Parkplatz pflastern',
                        zugang: 'Zugang/Weg pflastern'
                    },
                    materials: {
                        betonpflaster: {
                            name: 'Betonpflaster',
                            description: 'Robust und preiswert',
                            price: 'ab 35€/m²',
                            icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2 2h4v4H2V2zm6 0h4v4H8V2zm6 0h4v4h-4V2zm-6 6h4v4H8V8zm6 0h4v4h-4V8zM2 8h4v4H2V8zm0 6h4v4H2v-4zm6 0h4v4H8v-4zm6 0h4v4h-4v-4zm6-6h4v4h-4V8zm0 6h4v4h-4v-4z"/>
                            </svg>`
                        },
                        naturstein: {
                            name: 'Naturstein',
                            description: 'Hochwertig und langlebig',
                            price: 'ab 65€/m²',
                            icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>`
                        },
                        platten: {
                            name: 'Platten',
                            description: 'Modern und elegant',
                            price: 'ab 45€/m²',
                            icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/>
                            </svg>`
                        },
                        rasengitter: {
                            name: 'Rasengitter',
                            description: 'Ökologisch und durchlässig',
                            price: 'ab 25€/m²',
                            icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>`
                        }
                    },
                    zusatzleistungen: {
                        randsteine: { name: 'Randsteine setzen', price: '+8€/lfm', icon: 'construction' },
                        drainage: { name: 'Drainage/Einlauf', price: '+150€ pauschal', icon: 'water_drop' },
                        unterbau_verstaerkung: { name: 'Unterbau verstärken', price: '+12€/m²', icon: 'engineering' },
                        entsorgung: { name: 'Altbelag entsorgen', price: '+8€/m²', icon: 'delete' },
                        treppen: { name: 'Stufen/Treppen', price: '+45€/Stufe', icon: 'stairs' },
                        anschluesse: { name: 'Anschlüsse/Übergänge', price: '+25€/lfm', icon: 'link' }
                    }
                },
                asphalt: {
                    name: 'Asphaltarbeiten',
                    objektarten: {
                        einfahrt_asphalt: 'Einfahrt asphaltieren',
                        zufahrt: 'Zufahrt asphaltieren',
                        hof_asphalt: 'Hof asphaltieren',
                        parkplatz_asphalt: 'Parkplatz asphaltieren',
                        weg_asphalt: 'Weg asphaltieren'
                    },
                    materials: {
                        asphalt_standard: {
                            name: 'Standard-Asphalt',
                            description: 'Bewährte Qualität',
                            price: 'ab 40€/m²',
                            icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                            </svg>`
                        },
                        asphalt_premium: {
                            name: 'Premium-Asphalt',
                            description: 'Hochwertig und langlebig',
                            price: 'ab 55€/m²',
                            icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                            </svg>`
                        }
                    },
                    zusatzleistungen: {
                        unterbau_asphalt: { name: 'Tragschicht verstärken', price: '+15€/m²', icon: 'engineering' },
                        markierung: { name: 'Fahrbahnmarkierung', price: '+5€/lfm', icon: 'edit_road' },
                        entsorgung_asphalt: { name: 'Alten Asphalt entsorgen', price: '+12€/m²', icon: 'delete' },
                        drainage_asphalt: { name: 'Entwässerung', price: '+200€ pauschal', icon: 'water_drop' },
                        randbereich: { name: 'Randbereiche befestigen', price: '+10€/lfm', icon: 'border_outer' }
                    }
                },
                beton: {
                    name: 'Betonarbeiten',
                    objektarten: {
                        bodenplatte: 'Bodenplatte gießen',
                        fundament: 'Fundament erstellen',
                        terrasse_beton: 'Betonterrasse',
                        stellplatz_beton: 'Stellplatz betonieren',
                        gehweg_beton: 'Betongehweg'
                    },
                    materials: {
                        beton_c25: {
                            name: 'Beton C25/30',
                            description: 'Standard für Bodenplatten',
                            price: 'ab 45€/m²',
                            icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>`
                        },
                        beton_c35: {
                            name: 'Beton C35/45',
                            description: 'Hochfest für Fundamente',
                            price: 'ab 55€/m²',
                            icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>`
                        }
                    },
                    zusatzleistungen: {
                        bewehrung: { name: 'Bewehrung einlegen', price: '+8€/m²', icon: 'grid_on' },
                        schalung: { name: 'Schalung stellen', price: '+12€/lfm', icon: 'crop_free' },
                        daemmung: { name: 'Dämmung unter Platte', price: '+15€/m²', icon: 'layers' },
                        oberflaeche: { name: 'Oberfläche glätten', price: '+5€/m²', icon: 'texture' },
                        isolierung: { name: 'Feuchtigkeitssperre', price: '+8€/m²', icon: 'shield' }
                    }
                },
                garten: {
                    name: 'Garten & Landschaft',
                    objektarten: {
                        garten_anlegen: 'Garten neu anlegen',
                        drainage_garten: 'Drainage verlegen',
                        erdarbeiten: 'Erdarbeiten',
                        hangbefestigung: 'Hangbefestigung',
                        wege_anlegen: 'Gartenwege anlegen'
                    },
                    materials: {
                        kies: {
                            name: 'Kiesbelag',
                            description: 'Natürlich und durchlässig',
                            price: 'ab 15€/m²',
                            icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>`
                        },
                        rindenmulch: {
                            name: 'Rindenmulch',
                            description: 'Ökologisch und pflegeleicht',
                            price: 'ab 8€/m²',
                            icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.5 10c0-2.8-2.2-5-5-5s-5 2.2-5 5c0 1.3.5 2.4 1.3 3.3L6 16h12l-2.8-2.7c.8-.9 1.3-2 1.3-3.3z"/>
                            </svg>`
                        }
                    },
                    zusatzleistungen: {
                        drainage_rohr: { name: 'Drainage-Rohre', price: '+25€/lfm', icon: 'water_drop' },
                        kies_unterbau: { name: 'Kies-Unterbau', price: '+10€/m²', icon: 'layers' },
                        vlies: { name: 'Unkrautvlies', price: '+3€/m²', icon: 'texture' },
                        pflanzung: { name: 'Bepflanzung', price: '+20€/m²', icon: 'eco' },
                        bewaesserung: { name: 'Bewässerung', price: '+35€/lfm', icon: 'water_drop' }
                    }
                },
                sonstiges: {
                    name: 'Sonstige Arbeiten',
                    objektarten: {
                        individuell: 'Individuelle Lösung',
                        sanierung: 'Sanierungsarbeiten',
                        reparatur: 'Reparaturen',
                        sonstiges: 'Sonstige Arbeiten'
                    },
                    materials: {
                        nach_bedarf: {
                            name: 'Nach Bedarf',
                            description: 'Individuelle Materialwahl',
                            price: 'Nach Aufwand',
                            icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>`
                        }
                    },
                    zusatzleistungen: {
                        beratung: { name: 'Ausführliche Beratung', price: 'Kostenlos', icon: 'support_agent' },
                        planung: { name: 'Detailplanung', price: '+150€ pauschal', icon: 'architecture' },
                        gutachten: { name: 'Kostengutachten', price: '+200€', icon: 'assessment' }
                    }
                }
            };

            // Preise und Faktoren (in Euro)
            this.pricing = {
                materials: {
                    betonpflaster: { base: 35, labor: 18 },
                    naturstein: { base: 65, labor: 25 },
                    platten: { base: 45, labor: 20 },
                    rasengitter: { base: 25, labor: 15 },
                    asphalt_standard: { base: 40, labor: 15 },
                    asphalt_premium: { base: 55, labor: 18 },
                    beton_c25: { base: 45, labor: 20 },
                    beton_c35: { base: 55, labor: 25 },
                    kies: { base: 15, labor: 8 },
                    rindenmulch: { base: 8, labor: 5 },
                    nach_bedarf: { base: 40, labor: 20 }
                },
                unterbau: {
                    base: 12,
                    depth_extra: {
                        40: 3,
                        50: 6,
                        60: 9
                    }
                },
                zusatzleistungen: {
                    // Pflaster
                    randsteine: { type: 'per_meter', price: 8 },
                    drainage: { type: 'flat', price: 150 },
                    unterbau_verstaerkung: { type: 'per_sqm', price: 12 },
                    entsorgung: { type: 'per_sqm', price: 8 },
                    treppen: { type: 'per_piece', price: 45 },
                    anschluesse: { type: 'per_meter', price: 25 },
                    // Asphalt
                    unterbau_asphalt: { type: 'per_sqm', price: 15 },
                    markierung: { type: 'per_meter', price: 5 },
                    entsorgung_asphalt: { type: 'per_sqm', price: 12 },
                    drainage_asphalt: { type: 'flat', price: 200 },
                    randbereich: { type: 'per_meter', price: 10 },
                    // Beton
                    bewehrung: { type: 'per_sqm', price: 8 },
                    schalung: { type: 'per_meter', price: 12 },
                    daemmung: { type: 'per_sqm', price: 15 },
                    oberflaeche: { type: 'per_sqm', price: 5 },
                    isolierung: { type: 'per_sqm', price: 8 },
                    // Garten
                    drainage_rohr: { type: 'per_meter', price: 25 },
                    kies_unterbau: { type: 'per_sqm', price: 10 },
                    vlies: { type: 'per_sqm', price: 3 },
                    pflanzung: { type: 'per_sqm', price: 20 },
                    bewaesserung: { type: 'per_meter', price: 35 },
                    // Sonstiges
                    beratung: { type: 'flat', price: 0 },
                    planung: { type: 'flat', price: 150 },
                    gutachten: { type: 'flat', price: 200 }
                },
                faktoren: {
                    qualitaet_premium: 1.2,
                    beanspruchung: {
                        fussgaenger: 1.0,
                        pkw: 1.1,
                        lkw: 1.3,
                        schwerlast: 1.5
                    },
                    bodenbeschaffenheit: {
                        normal: 1.0,
                        schwierig: 1.15,
                        fels: 1.3
                    },
                    hangneigung: {
                        eben: 1.0,
                        leicht: 1.05,
                        stark: 1.15
                    },
                    erreichbarkeit: {
                        gut: 1.0,
                        eingeschraenkt: 1.1,
                        schwierig: 1.25
                    }
                },
                anfahrt_base: 150,
                gewinnmarge: 0.15,
                mwst: 0.19
            };

            this.init();
        }

        init() {
            if (this.isInitialized) return;

            try {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => this.setup());
                } else {
                    this.setup();
                }
            } catch (error) {
                console.error('AngebotsTool Init Error:', error);
                this.showError('Fehler beim Laden des Angebots-Tools');
            }
        }

        setup() {
            try {

                // Event Listeners
                this.setupNavigationEvents();
                this.setupFormEvents();
                this.setupCategorySelection();
                this.setupMaterialSelection();
                this.setupZusatzleistungen();
                this.setupFileUploads();
                this.setupFormValidation();
                this.setupPDFViewer();

                // Initiale Berechnungen
                this.updatePreview();
                this.updateProgressSteps();

                this.isInitialized = true;

                this.playWelcomeAnimation();

            } catch (error) {
                console.error('AngebotsTool Setup Error:', error);
                this.showError('Fehler beim Initialisieren des Tools');
            }
        }

        // =====================================
        // KATEGORIEAUSWAHL
        // =====================================

        setupCategorySelection() {
            const categoryCards = document.querySelectorAll('.category-card');
            const categoryRadios = document.querySelectorAll('input[name="category"]');

            categoryCards.forEach(card => {
                card.addEventListener('click', () => {
                    const radio = card.querySelector('input[type="radio"]');
                    if (radio) {
                        radio.checked = true;
                        this.selectedCategory = radio.value;
                        this.updateCategorySelection();
                        this.updateDetailOptions();
                        this.collectFormData();
                        this.updatePreview();
                    }
                });
            });

            categoryRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    this.selectedCategory = radio.value;
                    this.updateCategorySelection();
                    this.updateDetailOptions();
                });
            });
        }

        updateCategorySelection() {
            const categoryCards = document.querySelectorAll('.category-card');
            const selectedCategory = document.querySelector('input[name="category"]:checked');

            categoryCards.forEach(card => {
                card.classList.remove('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio && radio.checked) {
                    card.classList.add('selected');
                    this.animateSelection(card);
                }
            });
        }

        updateDetailOptions() {
            if (!this.selectedCategory || !this.categoryConfig[this.selectedCategory]) return;

            const config = this.categoryConfig[this.selectedCategory];

            // Objektarten aktualisieren
            this.updateObjektarten(config.objektarten);

            // Material-Section nur für relevante Kategorien anzeigen
            this.updateMaterialSection(config);

            // Zusatzleistungen aktualisieren
            this.updateZusatzleistungenForCategory(config.zusatzleistungen);
        }

        updateObjektarten(objektarten) {
            const select = document.getElementById('objektart');
            if (!select) return;

            // Optionen leeren
            select.innerHTML = '<option value="">Bitte wählen</option>';

            // Neue Optionen hinzufügen
            Object.entries(objektarten).forEach(([value, label]) => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = label;
                select.appendChild(option);
            });
        }

        updateMaterialSection(config) {
            const materialSection = document.getElementById('material-section');
            const materialCards = document.getElementById('material-cards');

            if (!materialSection || !materialCards) return;

            // Für bestimmte Kategorien Material-Section verstecken
            if (['sonstiges'].includes(this.selectedCategory)) {
                materialSection.style.display = 'none';
                return;
            }

            materialSection.style.display = 'block';

            // Material-Karten erstellen
            materialCards.innerHTML = '';
            Object.entries(config.materials).forEach(([key, material]) => {
                const card = this.createMaterialCard(key, material);
                materialCards.appendChild(card);
            });

            // Event Listeners für neue Material-Karten
            this.setupMaterialCardEvents();
        }

        createMaterialCard(key, material) {
            const card = document.createElement('div');
            card.className = 'material-card';
            card.setAttribute('data-material', key);
            card.style.backgroundImage = `url('/assets/images/hero/${key}.png')`;

            card.innerHTML = `
        <div class="material-overlay">
            <h3>${material.name}</h3>
            <p>${material.description}<br><span class="price-indicator">${material.price}</span></p>
        </div>
        <input type="radio" name="pflasterart" value="${key}" id="mat-${key}">
    `;

            return card;
        }

        setupMaterialCardEvents() {
            const materialCards = document.querySelectorAll('.material-card');
            materialCards.forEach(card => {
                card.addEventListener('click', () => {
                    const radio = card.querySelector('input[type="radio"]');
                    if (radio) {
                        radio.checked = true;
                        this.updateMaterialSelection();
                        this.collectFormData();
                        this.updatePreview();
                    }
                });
            });
        }

        updateZusatzleistungenForCategory(zusatzleistungen) {
            const zusatzGrid = document.getElementById('zusatz-grid');
            if (!zusatzGrid) return;

            zusatzGrid.innerHTML = '';

            Object.entries(zusatzleistungen).forEach(([key, leistung]) => {
                const option = this.createZusatzleistungOption(key, leistung);
                zusatzGrid.appendChild(option);
            });

            // Event Listeners für neue Zusatzleistungen
            this.setupZusatzleistungenEvents();
        }

        createZusatzleistungOption(key, leistung) {
            const label = document.createElement('label');
            label.className = 'zusatz-option';

            label.innerHTML = `
                <input type="checkbox" name="zusatzleistungen[]" value="${key}">
                <div class="zusatz-card">
                    <div class="zusatz-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                        </svg>
                    </div>
                    <h4>${leistung.name}</h4>
                    <p class="zusatz-price">${leistung.price}</p>
                </div>
            `;

            return label;
        }

        setupZusatzleistungenEvents() {
            const zusatzOptions = document.querySelectorAll('.zusatz-option');

            zusatzOptions.forEach(option => {
                const checkbox = option.querySelector('input[type="checkbox"]');
                const card = option.querySelector('.zusatz-card');

                // Click Event auf Label/Card
                option.addEventListener('click', (e) => {
                    // Verhindern, dass Click doppelt ausgelöst wird
                    if (e.target.type === 'checkbox') return;

                    e.preventDefault();
                    checkbox.checked = !checkbox.checked;

                    // Change Event manuell auslösen
                    const event = new Event('change', { bubbles: true });
                    checkbox.dispatchEvent(event);
                });

                // Change Event auf Checkbox
                checkbox.addEventListener('change', () => {
                    this.updateZusatzSelection();
                    this.collectFormData();
                    this.updatePreview();
                });
            });
        }

        // =====================================
        // NAVIGATION
        // =====================================

        setupNavigationEvents() {
            const nextButtons = document.querySelectorAll('.next-step');
            nextButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.nextStep();
                });
            });

            const prevButtons = document.querySelectorAll('.prev-step');
            prevButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.prevStep();
                });
            });

            const progressSteps = document.querySelectorAll('.progress-step');
            progressSteps.forEach((step, index) => {
                step.addEventListener('click', () => {
                    const targetStep = index + 1;
                    if (targetStep <= this.currentStep) {
                        this.goToStep(targetStep);
                    }
                });
            });
        }

        nextStep() {
            if (!this.validateCurrentStep()) {
                return;
            }

            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateFormSteps();
                this.updateProgressSteps();
                this.collectFormData();
                this.updatePreview();
                this.scrollToForm();
            }
        }

        prevStep() {
            if (this.currentStep > 1) {
                this.currentStep--;
                this.updateFormSteps();
                this.updateProgressSteps();
            }
        }

        goToStep(stepNumber) {
            if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
                this.currentStep = stepNumber;
                this.updateFormSteps();
                this.updateProgressSteps();
                this.collectFormData();
                this.updatePreview();
            }
        }

        updateFormSteps() {
            const steps = document.querySelectorAll('.form-step');

            steps.forEach((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === this.currentStep;

                step.classList.remove('active', 'prev');

                if (isActive) {
                    step.classList.add('active');
                    if (stepNumber < this.previousStep) {
                        step.classList.add('prev');
                    }
                    step.style.display = 'block';

                    requestAnimationFrame(() => {
                        step.style.opacity = '0';
                        step.style.transform = 'translateX(20px)';
                        step.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

                        requestAnimationFrame(() => {
                            step.style.opacity = '1';
                            step.style.transform = 'translateX(0)';
                        });
                    });
                } else {
                    step.style.display = 'none';
                }
            });

            this.previousStep = this.currentStep;
        }

        updateProgressSteps() {
            const progressSteps = document.querySelectorAll('.progress-step');

            progressSteps.forEach((step, index) => {
                const stepNumber = index + 1;

                step.classList.remove('active', 'completed');

                if (stepNumber < this.currentStep) {
                    step.classList.add('completed');
                } else if (stepNumber === this.currentStep) {
                    step.classList.add('active');
                }

                const progressLines = document.querySelectorAll('.progress-line');
                progressLines.forEach((line, lineIndex) => {
                    if (lineIndex < this.currentStep - 1) {
                        line.classList.add('completed');
                    } else {
                        line.classList.remove('completed');
                    }
                });
            });
        }

        scrollToForm() {
            const formSection = document.querySelector('.form-section');
            if (formSection) {
                formSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }

        // =====================================
        // FORM EVENTS & VALIDATION
        // =====================================

        setupFormEvents() {
            const form = document.getElementById('angebots-form');
            if (!form) return;

            const inputs = form.querySelectorAll('input, select');
            inputs.forEach(input => {
                const updateEvent = input.type === 'checkbox' || input.type === 'radio' ? 'change' : 'input';
                input.addEventListener(updateEvent, () => {
                    this.collectFormData();
                    this.updatePreview();
                    this.validateField(input);
                });

                input.addEventListener('focus', () => this.animateFieldFocus(input));
                input.addEventListener('blur', () => this.animateFieldBlur(input));
            });

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitForm();
            });
        }

        setupFormValidation() {
            const requiredFields = document.querySelectorAll('input[required], select[required]');
            requiredFields.forEach(field => {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => {
                    if (field.classList.contains('error')) {
                        this.validateField(field);
                    }
                });
            });
        }

        validateCurrentStep() {
            const currentStepEl = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
            if (!currentStepEl) return true;

            const requiredFields = currentStepEl.querySelectorAll('input[required], select[required]');
            let isValid = true;
            let firstErrorField = null;

            requiredFields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                    if (!firstErrorField) {
                        firstErrorField = field;
                    }
                }
            });

            // Spezielle Validierung für Schritt 1 (Kategorie)
            if (this.currentStep === 1) {
                const categorySelected = document.querySelector('input[name="category"]:checked');
                if (!categorySelected) {
                    this.showError('Bitte wählen Sie eine Projektkategorie aus.');
                    isValid = false;
                }
            }

            // Spezielle Validierung für Schritt 2 (Material)
            if (this.currentStep === 2 && this.selectedCategory !== 'sonstiges') {
                const materialSelected = document.querySelector('input[name="pflasterart"]:checked');
                if (!materialSelected) {
                    this.showError('Bitte wählen Sie ein Material aus.');
                    isValid = false;
                }
            }

            if (!isValid && firstErrorField) {
                firstErrorField.focus();
                this.animateFieldError(firstErrorField);
            }

            return isValid;
        }

        validateField(field) {
            const formGroup = field.closest('.form-group');
            if (!formGroup) return true;

            let isValid = true;
            let errorMessage = '';

            if (field.hasAttribute('required')) {
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Dieses Feld ist erforderlich.';
                }
            }

            if (isValid && field.value.trim()) {
                switch (field.type) {
                    case 'email':
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(field.value)) {
                            isValid = false;
                            errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
                        }
                        break;
                    case 'tel':
                        const telRegex = /^[\d\s\-\+\(\)]+$/;
                        if (!telRegex.test(field.value)) {
                            isValid = false;
                            errorMessage = 'Bitte geben Sie eine gültige Telefonnummer ein.';
                        }
                        break;
                    case 'number':
                        const num = parseFloat(field.value);
                        const min = parseFloat(field.getAttribute('min'));
                        const max = parseFloat(field.getAttribute('max'));
                        if (isNaN(num) || (min && num < min) || (max && num > max)) {
                            isValid = false;
                            errorMessage = `Bitte geben Sie eine Zahl zwischen ${min || 0} und ${max || 'unendlich'} ein.`;
                        }
                        break;
                }

                if (field.name === 'plz') {
                    const plzRegex = /^\d{5}$/;
                    if (!plzRegex.test(field.value)) {
                        isValid = false;
                        errorMessage = 'Bitte geben Sie eine gültige 5-stellige PLZ ein.';
                    }
                }
            }

            // UI Update
            formGroup.classList.remove('error', 'success');
            const existingError = formGroup.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }

            if (!isValid) {
                formGroup.classList.add('error');
                const errorEl = document.createElement('span');
                errorEl.className = 'field-error';
                errorEl.textContent = errorMessage;
                formGroup.appendChild(errorEl);
            } else if (field.value.trim()) {
                formGroup.classList.add('success');
            }

            return isValid;
        }

        animateFieldFocus(field) {
            const formGroup = field.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('focused');
            }
        }

        animateFieldBlur(field) {
            const formGroup = field.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('focused');
            }
        }

        animateFieldError(field) {
            field.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                field.style.animation = '';
            }, 500);
        }

        // =====================================
        // MATERIAL SELECTION
        // =====================================

        setupMaterialSelection() {
            // Wird in updateMaterialSection dynamisch eingerichtet
        }

        updateMaterialSelection() {
            const materialCards = document.querySelectorAll('.material-card');
            const selectedMaterial = document.querySelector('input[name="pflasterart"]:checked');

            materialCards.forEach(card => {
                card.classList.remove('selected');
                const radio = card.querySelector('input[type="radio"]');
                if (radio && radio.checked) {
                    card.classList.add('selected');
                    this.animateSelection(card);
                }
            });
        }

        // =====================================
        // ZUSATZLEISTUNGEN
        // =====================================

        setupZusatzleistungen() {
            // Wird in updateZusatzleistungenForCategory dynamisch eingerichtet
        }

        updateZusatzSelection() {
            const zusatzOptions = document.querySelectorAll('.zusatz-option');

            zusatzOptions.forEach(option => {
                const checkbox = option.querySelector('input[type="checkbox"]');
                const card = option.querySelector('.zusatz-card');

                if (checkbox && checkbox.checked) {
                    card.classList.add('selected');
                    this.animateSelection(card);
                } else {
                    card.classList.remove('selected');
                }
            });
        }

        animateSelection(element) {
            element.style.transform = 'scale(1.02)';
            setTimeout(() => {
                element.style.transform = '';
            }, 200);
        }

        // =====================================
        // FILE UPLOADS
        // =====================================

        setupFileUploads() {
            const fileInputs = document.querySelectorAll('input[type="file"]');

            fileInputs.forEach(input => {
                const uploadItem = input.closest('.upload-item');
                const label = uploadItem.querySelector('.upload-label');

                label.addEventListener('click', () => {
                    input.click();
                });

                input.addEventListener('change', (e) => {
                    this.handleFileUpload(e);
                });

                label.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    label.classList.add('drag-over');
                });

                label.addEventListener('dragleave', () => {
                    label.classList.remove('drag-over');
                });

                label.addEventListener('drop', (e) => {
                    e.preventDefault();
                    label.classList.remove('drag-over');

                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        input.files = files;
                        this.handleFileUpload({ target: input });
                    }
                });
            });
        }

        handleFileUpload(event) {
            const input = event.target;
            const files = input.files;
            const uploadItem = input.closest('.upload-item');
            const label = uploadItem.querySelector('.upload-label');

            if (files.length > 0) {
                uploadItem.classList.add('has-file');

                const span = label.querySelector('span');
                if (files.length === 1) {
                    span.textContent = files[0].name;
                } else {
                    span.textContent = `${files.length} Dateien ausgewählt`;
                }

                let validFiles = true;
                Array.from(files).forEach(file => {
                    if (file.size > 5 * 1024 * 1024) {
                        validFiles = false;
                        this.showError('Dateigröße darf 5MB nicht überschreiten.');
                    }
                });

                if (validFiles) {
                    this.showSuccess('Datei(en) erfolgreich hochgeladen!', null, 3000);
                    this.animateUploadSuccess(uploadItem);
                }
            }
        }

        animateUploadSuccess(uploadItem) {
            const checkmark = document.createElement('div');
            checkmark.innerHTML = '✓';
            checkmark.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                color: var(--accent-green);
                font-weight: bold;
                font-size: 18px;
                opacity: 0;
                transform: scale(0);
                transition: all 0.3s ease;
                z-index: 10;
            `;

            uploadItem.style.position = 'relative';
            uploadItem.appendChild(checkmark);

            requestAnimationFrame(() => {
                checkmark.style.opacity = '1';
                checkmark.style.transform = 'scale(1)';
            });

            setTimeout(() => {
                checkmark.remove();
            }, 3000);
        }

        // =====================================
        // PDF VIEWER
        // =====================================

        setupPDFViewer() {
            const previewPDFBtn = document.getElementById('preview-pdf');
            const downloadBtn = document.getElementById('preview-download');
            const pdfViewer = document.getElementById('pdf-viewer');
            const pdfIframe = document.getElementById('pdf-iframe');

            if (previewPDFBtn) {
                previewPDFBtn.addEventListener('click', () => {
                    this.showPDFPreview();
                });
            }

            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    this.downloadPDF();
                });
            }
        }

        showPDFPreview() {
            const pdfViewer = document.getElementById('pdf-viewer');
            const pdfIframe = document.getElementById('pdf-iframe');

            if (this.currentPDFUrl) {
                pdfIframe.src = this.currentPDFUrl;
                pdfViewer.style.display = 'block';

                // Smooth scroll zum PDF Viewer
                pdfViewer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }

        downloadPDF() {
            if (this.currentPDFUrl) {
                const link = document.createElement('a');
                link.href = this.currentPDFUrl;
                link.download = `Angebot-${this.angebotId || 'BauFranke'}.pdf`;
                link.click();
            }
        }

        // =====================================
        // DATENSAMMLUNG & BERECHNUNGEN
        // =====================================

        collectFormData() {
            const form = document.getElementById('angebots-form');
            if (!form) return;

            const formData = new FormData(form);
            this.formData = {};

            for (let [key, value] of formData.entries()) {
                if (key.endsWith('[]')) {
                    const cleanKey = key.replace('[]', '');
                    if (!this.formData[cleanKey]) {
                        this.formData[cleanKey] = [];
                    }
                    this.formData[cleanKey].push(value);
                } else {
                    this.formData[key] = value;
                }
            }

            // Zusätzliche Daten hinzufügen
            this.formData.category = this.selectedCategory;
            this.formData.flaeche_num = parseFloat(this.formData.flaeche) || 0;
            this.formData.abgrabungstiefe_num = parseInt(this.formData.abgrabungstiefe) || 30;

            console.log('Form Data Updated:', this.formData);
        }

        calculatePrice() {
            try {
                this.collectFormData();

                const flaeche = this.formData.flaeche_num;
                if (!flaeche || flaeche <= 0) {
                    return this.getEmptyPriceData();
                }

                const materialType = this.formData.pflasterart || 'nach_bedarf';
                const material = this.pricing.materials[materialType];
                if (!material) {
                    console.error('Unknown material type:', materialType);
                    return this.getEmptyPriceData();
                }

                let materialCost = material.base * flaeche;
                let laborCost = material.labor * flaeche;

                // Quality Factor
                if (this.formData.qualitaet === 'premium') {
                    materialCost *= this.pricing.faktoren.qualitaet_premium;
                    laborCost *= this.pricing.faktoren.qualitaet_premium;
                }

                // Unterbau Costs
                let unterbauCost = this.pricing.unterbau.base * flaeche;

                const abgrabungstiefe = this.formData.abgrabungstiefe_num;
                if (abgrabungstiefe > 30) {
                    const extraCost = this.pricing.unterbau.depth_extra[abgrabungstiefe] || 0;
                    unterbauCost += extraCost * flaeche;
                }

                // Belastungsfaktor
                const beanspruchung = this.formData.beanspruchung || 'fussgaenger';
                const belastungsFaktor = this.pricing.faktoren.beanspruchung[beanspruchung] || 1.0;

                materialCost *= belastungsFaktor;
                laborCost *= belastungsFaktor;
                unterbauCost *= belastungsFaktor;

                // Umgebungsfaktoren
                const bodenFaktor = this.pricing.faktoren.bodenbeschaffenheit[this.formData.bodenbeschaffenheit] || 1.0;
                const hangFaktor = this.pricing.faktoren.hangneigung[this.formData.hangneigung] || 1.0;
                const erreichbarkeitsFaktor = this.pricing.faktoren.erreichbarkeit[this.formData.erreichbarkeit] || 1.0;

                const umgebungsFaktor = bodenFaktor * hangFaktor * erreichbarkeitsFaktor;

                materialCost *= umgebungsFaktor;
                laborCost *= umgebungsFaktor;
                unterbauCost *= umgebungsFaktor;

                // Zusatzleistungen
                let zusatzCost = 0;
                const zusatzleistungen = this.formData.zusatzleistungen || [];

                zusatzleistungen.forEach(leistung => {
                    const pricing = this.pricing.zusatzleistungen[leistung];
                    if (pricing) {
                        switch (pricing.type) {
                            case 'per_sqm':
                                zusatzCost += pricing.price * flaeche;
                                break;
                            case 'per_meter':
                                const estimatedMeters = Math.sqrt(flaeche) * 4;
                                zusatzCost += pricing.price * estimatedMeters;
                                break;
                            case 'flat':
                                zusatzCost += pricing.price;
                                break;
                            case 'per_piece':
                                zusatzCost += pricing.price;
                                break;
                        }
                    }
                });

                // Anfahrt & Einrichtung
                const anfahrtCost = this.pricing.anfahrt_base;

                // Zwischensumme
                const subtotal = materialCost + laborCost + unterbauCost + zusatzCost + anfahrtCost;

                // Gewinnmarge
                const subtotalWithMargin = subtotal * (1 + this.pricing.gewinnmarge);

                // MwSt
                const taxAmount = subtotalWithMargin * this.pricing.mwst;
                const totalWithTax = subtotalWithMargin + taxAmount;

                return {
                    material: materialCost,
                    labor: laborCost,
                    unterbau: unterbauCost,
                    zusatz: zusatzCost,
                    anfahrt: anfahrtCost,
                    subtotal: subtotal,
                    subtotalWithMargin: subtotalWithMargin,
                    tax: taxAmount,
                    total: totalWithTax,
                    confidence: this.calculateConfidence()
                };

            } catch (error) {
                console.error('Price Calculation Error:', error);
                return this.getEmptyPriceData();
            }
        }

        calculateConfidence() {
            let confidence = 15;

            const uploads = document.querySelectorAll('input[type="file"]');
            let hasUploads = false;
            uploads.forEach(input => {
                if (input.files.length > 0) {
                    hasUploads = true;
                }
            });

            if (hasUploads) {
                confidence -= 5;
            }

            const zusatzleistungen = this.formData.zusatzleistungen || [];
            if (zusatzleistungen.length > 3) {
                confidence += 5;
            }

            if (this.formData.bodenbeschaffenheit === 'fels' ||
                this.formData.hangneigung === 'stark' ||
                this.formData.erreichbarkeit === 'schwierig') {
                confidence += 10;
            }

            return Math.min(Math.max(confidence, 10), 25);
        }

        getEmptyPriceData() {
            return {
                material: 0,
                labor: 0,
                unterbau: 0,
                zusatz: 0,
                anfahrt: 0,
                subtotal: 0,
                subtotalWithMargin: 0,
                tax: 0,
                total: 0,
                confidence: 15
            };
        }

        // =====================================
        // PREVIEW UPDATE
        // =====================================

        updatePreview() {
            this.priceData = this.calculatePrice();
            this.updateProjectSummary();
            this.updateCostBreakdown();
        }

        updateProjectSummary() {
            // Kategorie
            const categoryName = this.selectedCategory ? this.categoryConfig[this.selectedCategory]?.name || '-' : '-';
            this.updateElement('#preview-kategorie', categoryName);

            // Projekt
            const objektart = this.formData.objektart || '-';
            const objektartLabels = this.selectedCategory && this.categoryConfig[this.selectedCategory] ?
                this.categoryConfig[this.selectedCategory].objektarten : {};

            this.updateElement('#preview-projekt', objektartLabels[objektart] || objektart);

            // Fläche
            const flaeche = this.formData.flaeche_num || 0;
            this.updateElement('#preview-flaeche', flaeche > 0 ? `${flaeche} m²` : '- m²');

            // Material
            const material = this.formData.pflasterart || '-';
            const materialConfig = this.selectedCategory && this.categoryConfig[this.selectedCategory] ?
                this.categoryConfig[this.selectedCategory].materials : {};

            let materialText = materialConfig[material]?.name || '-';
            if (this.formData.qualitaet === 'premium') {
                materialText += ' (Premium)';
            }

            this.updateElement('#preview-material', materialText);

            // Belastung
            const beanspruchung = this.formData.beanspruchung || '-';
            const beanspruchungLabels = {
                fussgaenger: 'Fußgänger',
                pkw: 'PKW-befahrbar',
                lkw: 'LKW-befahrbar',
                schwerlast: 'Schwerlast'
            };

            this.updateElement('#preview-belastung', beanspruchungLabels[beanspruchung] || '-');
        }

        updateCostBreakdown() {
            // Material und Arbeitskosten getrennt anzeigen (FIX!)
            this.updateElement('#cost-material', this.formatPrice(this.priceData.material));
            this.updateElement('#cost-arbeit', this.formatPrice(this.priceData.labor));
            this.updateElement('#cost-unterbau', this.formatPrice(this.priceData.unterbau));
            this.updateElement('#cost-zusatz', this.formatPrice(this.priceData.zusatz));
            this.updateElement('#cost-anfahrt', this.formatPrice(this.priceData.anfahrt));
            this.updateElement('#cost-subtotal', this.formatPrice(this.priceData.subtotalWithMargin));
            this.updateElement('#cost-tax', this.formatPrice(this.priceData.tax));
            this.updateElement('#cost-total', this.formatPrice(this.priceData.total));

            // Zusatzleistungen anzeigen/verstecken
            const zusatzSection = document.getElementById('additional-services');
            if (zusatzSection) {
                if (this.priceData.zusatz > 0) {
                    zusatzSection.style.display = 'flex';
                    this.animateElement(zusatzSection, 'fadeInUp');
                } else {
                    zusatzSection.style.display = 'none';
                }
            }

            // Confidence Badge Update
            this.updateElement('.confidence-value', `${this.priceData.confidence}%`);

            // Animate total if significant change
            if (this.priceData.total > 1000) {
                const totalElement = document.getElementById('cost-total');
                if (totalElement) {
                    this.animateElement(totalElement, 'pulse');
                }
            }

            // Enable/disable buttons
            const previewPDFBtn = document.getElementById('preview-pdf');
            const downloadBtn = document.getElementById('preview-download');

            if (this.priceData.total > 0) {
                if (previewPDFBtn) {
                    previewPDFBtn.style.display = 'block';
                    previewPDFBtn.disabled = false;
                }
                if (downloadBtn) {
                    downloadBtn.style.display = 'block';
                    downloadBtn.disabled = false;
                }
            } else {
                if (previewPDFBtn) previewPDFBtn.style.display = 'none';
                if (downloadBtn) downloadBtn.style.display = 'none';
            }
        }

        updateElement(selector, value) {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = value;
            }
        }

        formatPrice(amount) {
            return new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2
            }).format(amount);
        }

        // =====================================
        // FORM SUBMISSION
        // =====================================

        async submitForm() {
            try {
                if (!this.validateCurrentStep()) {
                    return;
                }

                const submitBtn = document.getElementById('submit-btn');
                const form = document.getElementById('angebots-form');

                this.setButtonLoading(submitBtn, true);

                const formData = new FormData(form);
                formData.append('price_data', JSON.stringify(this.priceData));
                formData.append('form_data', JSON.stringify(this.formData));

                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                const result = await response.json();

                if (result.success) {
                    this.showSuccess(
                        result.message,
                        result.title || 'Angebot erstellt',
                        8000
                    );

                    // PDF-URL speichern für Viewer
                    if (result.pdf_url) {
                        this.currentPDFUrl = result.pdf_url;
                        this.angebotId = result.angebot_id;
                        this.showPDFOptions(result.pdf_url);
                    }

                    setTimeout(() => {
                        if (result.redirect) {
                            window.location.href = result.redirect;
                        }
                    }, 5000);

                } else {
                    throw new Error(result.message || 'Unbekannter Fehler beim Erstellen des Angebots');
                }

            } catch (error) {
                console.error('Form Submission Error:', error);
                this.showError(
                    error.message || 'Es gab einen Fehler beim Erstellen des Angebots. Bitte versuchen Sie es erneut.',
                    'Fehler beim Senden'
                );
            } finally {
                const submitBtn = document.getElementById('submit-btn');
                this.setButtonLoading(submitBtn, false);
            }
        }

        setButtonLoading(button, loading) {
            if (!button) return;

            if (loading) {
                button.disabled = true;
                button.classList.add('btn-loading');
                button.setAttribute('data-original-text', button.textContent);
                button.textContent = 'Angebot wird erstellt...';
            } else {
                button.disabled = false;
                button.classList.remove('btn-loading');
                const originalText = button.getAttribute('data-original-text');
                if (originalText) {
                    button.textContent = originalText;
                }
            }
        }

        showPDFOptions(pdfUrl) {
            const previewPDFBtn = document.getElementById('preview-pdf');
            const downloadBtn = document.getElementById('preview-download');

            if (previewPDFBtn) {
                previewPDFBtn.style.display = 'block';
                previewPDFBtn.disabled = false;
            }

            if (downloadBtn) {
                downloadBtn.style.display = 'block';
                downloadBtn.disabled = false;
            }

            // Automatisch PDF anzeigen
            setTimeout(() => {
                this.showPDFPreview();
            }, 1000);
        }

        // =====================================
        // UTILITY FUNCTIONS
        // =====================================

        showSuccess(message, title = 'Erfolgreich', duration = 6000) {
            if (window.showToast) {
                window.showToast(message, 'success', duration, title);
            } else {
                alert(title + ': ' + message);
            }
        }

        showError(message, title = 'Fehler') {
            if (window.showToast) {
                window.showToast(message, 'error', 8000, title);
            } else {
                alert(title + ': ' + message);
            }
        }

        showWarning(message, title = 'Warnung') {
            if (window.showToast) {
                window.showToast(message, 'warning', 6000, title);
            } else {
                alert(title + ': ' + message);
            }
        }

        animateElement(element, animation) {
            if (!element) return;

            element.classList.add(`animate-${animation}`);
            setTimeout(() => {
                element.classList.remove(`animate-${animation}`);
            }, 1000);
        }

        playWelcomeAnimation() {
            const progressContainer = document.querySelector('.progress-container');
            const formSection = document.querySelector('.form-section');
            const previewSection = document.querySelector('.preview-section');

            [progressContainer, formSection, previewSection].forEach((element, index) => {
                if (element) {
                    setTimeout(() => {
                        element.style.opacity = '0';
                        element.style.transform = 'translateY(30px)';
                        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                        requestAnimationFrame(() => {
                            element.style.opacity = '1';
                            element.style.transform = 'translateY(0)';
                        });
                    }, index * 200);
                }
            });
        }

        // Debug Methods
        debugFormData() {
            console.log('=== FORM DATA DEBUG ===');
            console.log('Current Step:', this.currentStep);
            console.log('Selected Category:', this.selectedCategory);
            console.log('Form Data:', this.formData);
            console.log('Price Data:', this.priceData);
            console.log('=======================');
        }

        // Public API
        getFormData() {
            return this.formData;
        }

        getPriceData() {
            return this.priceData;
        }

        getCurrentStep() {
            return this.currentStep;
        }

        getSelectedCategory() {
            return this.selectedCategory;
        }
    }

    // CSS für Animationen hinzufügen
    const animationCSS = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        .animate-fadeInUp {
            animation: fadeInUp 0.6s ease;
        }

        .animate-pulse {
            animation: pulse 1s ease;
        }

        .animate-bounce {
            animation: bounce 0.6s ease;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }

        .drag-over {
            border-color: var(--primary-green) !important;
            background-color: rgba(0, 100, 0, 0.05) !important;
            transform: scale(1.02);
        }

        .btn-loading {
            position: relative;
            pointer-events: none;
            opacity: 0.7;
        }

        .btn-loading::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            margin: auto;
            border: 2px solid transparent;
            border-top-color: currentColor;
            border-radius: 50%;
            animation: button-loading-spinner 1s ease infinite;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
        }

        @keyframes button-loading-spinner {
            from { transform: rotate(0turn); }
            to { transform: rotate(1turn); }
        }
    `;

    // CSS zu DOM hinzufügen
    const styleSheet = document.createElement('style');
    styleSheet.textContent = animationCSS;
    document.head.appendChild(styleSheet);

    // Tool initialisieren
    let angebotsTool;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            angebotsTool = new AngebotsTool();
        });
    } else {
        angebotsTool = new AngebotsTool();
    }

    // Global verfügbar machen
    window.AngebotsTool = angebotsTool;

    // Export für Module
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AngebotsTool;
    }

})();