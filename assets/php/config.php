<?php
/**
 * ERWEITERTE KONFIGURATIONSDATEI - BAU FRANKE ANGEBOTS-TOOL
 * Zentrale Konfiguration für alle Einstellungen
 * Version: 2.0.0 - Erweitert um Kategorien und PDF-Viewer Support
 *
 * @author Bau GmbH Franke
 * @version 2.0.0 - Kategorieunterstützung und erweiterte Features
 */

// Sicherheitscheck - Direkter Zugriff verhindern
if (!defined('ANGEBOT_TOOL_ACCESS')) {
    die('Direkter Zugriff nicht erlaubt');
}

/**
 * UMGEBUNGS-KONFIGURATION
 * Ändern Sie diese Werte je nach Umgebung (Development/Production)
 */
define('ENVIRONMENT', 'development'); // 'development' oder 'production'
define('DEVELOPMENT_MODE', ENVIRONMENT === 'development');
define('DEBUG_MODE', ENVIRONMENT === 'development');

/**
 * FIRMEN-INFORMATIONEN
 * Diese Daten erscheinen im PDF-Angebot und in E-Mails
 */
$COMPANY_CONFIG = [
    'name' => 'Bau GmbH Franke',
    'address' => [
        'street' => 'Hauptstraße 123',
        'zip' => '02779',
        'city' => 'Hainewalde',
        'country' => 'Deutschland'
    ],
    'contact' => [
        'phone' => '035841-3190',
        'fax' => '035841-3191',
        'email' => 'info@bau-franke.de',
        'web' => 'www.baufranke.de'
    ],
    'legal' => [
        'ust_id' => 'DE123456789',
        'handelsregister' => 'HRB 12345 Dresden',
        'geschaeftsfuehrer' => 'Marco Franke, Dirk Franke'
    ],
    'logo' => 'assets/images/hero/FrankeBau_Logo.png',
    'founded_year' => 1991,
    'slogan' => 'Ihr regionaler Baupartner seit 1991'
];

/**
 * E-MAIL-KONFIGURATION
 * Anpassen für Ihr E-Mail-System
 */
$EMAIL_CONFIG = [
    // Absender-Einstellungen
    'from_email' => 'noreply@baufranke.de',
    'from_name' => 'Bau GmbH Franke - Angebots-Tool',

    // Empfänger für Firmen-Benachrichtigungen
    'company_email' => 'angebote@baufranke.de',
    'backup_email' => 'info@baufranke.de',

    // SMTP-Einstellungen (für PHPMailer - Production)
    'smtp' => [
        'enabled' => false, // Auf true setzen für SMTP
        'host' => 'smtp.your-provider.com',
        'port' => 587,
        'username' => 'your-smtp-username',
        'password' => 'your-smtp-password',
        'encryption' => 'tls', // 'tls' oder 'ssl'
        'auth' => true
    ],

    // E-Mail-Templates
    'templates' => [
        'customer_subject' => 'Ihr unverbindliches Angebot #{angebot_id} - Bau GmbH Franke',
        'company_subject' => 'Neue Angebots-Anfrage #{angebot_id} - {customer_name} ({category})',
        'reply_to' => 'angebote@baufranke.de'
    ],

    // Simulation für Development
    'simulate' => DEVELOPMENT_MODE,
    'log_emails' => true
];

/**
 * ERWEITERTE PREIS-KONFIGURATION
 * Basis-Preise für die Kalkulation nach Kategorien (alle Preise in Euro)
 */
$PRICING_CONFIG = [
    // Material-Preise nach Kategorien (€/m²)
    'materials' => [
        // Pflasterarbeiten
        'betonpflaster' => [
            'name' => 'Betonpflaster',
            'base_price' => 35.00,
            'labor_price' => 18.00,
            'category' => 'pflaster',
            'description' => 'Robust und preiswert'
        ],
        'naturstein' => [
            'name' => 'Naturstein',
            'base_price' => 65.00,
            'labor_price' => 25.00,
            'category' => 'pflaster',
            'description' => 'Hochwertig und langlebig'
        ],
        'platten' => [
            'name' => 'Platten',
            'base_price' => 45.00,
            'labor_price' => 20.00,
            'category' => 'pflaster',
            'description' => 'Modern und elegant'
        ],
        'rasengitter' => [
            'name' => 'Rasengitter',
            'base_price' => 25.00,
            'labor_price' => 15.00,
            'category' => 'pflaster',
            'description' => 'Ökologisch und durchlässig'
        ],

        // Asphaltarbeiten
        'asphalt_standard' => [
            'name' => 'Standard-Asphalt',
            'base_price' => 40.00,
            'labor_price' => 15.00,
            'category' => 'asphalt',
            'description' => 'Bewährte Qualität'
        ],
        'asphalt_premium' => [
            'name' => 'Premium-Asphalt',
            'base_price' => 55.00,
            'labor_price' => 18.00,
            'category' => 'asphalt',
            'description' => 'Hochwertig und langlebig'
        ],

        // Betonarbeiten
        'beton_c25' => [
            'name' => 'Beton C25/30',
            'base_price' => 45.00,
            'labor_price' => 20.00,
            'category' => 'beton',
            'description' => 'Standard für Bodenplatten'
        ],
        'beton_c35' => [
            'name' => 'Beton C35/45',
            'base_price' => 55.00,
            'labor_price' => 25.00,
            'category' => 'beton',
            'description' => 'Hochfest für Fundamente'
        ],

        // Garten & Landschaft
        'kies' => [
            'name' => 'Kiesbelag',
            'base_price' => 15.00,
            'labor_price' => 8.00,
            'category' => 'garten',
            'description' => 'Natürlich und durchlässig'
        ],
        'rindenmulch' => [
            'name' => 'Rindenmulch',
            'base_price' => 8.00,
            'labor_price' => 5.00,
            'category' => 'garten',
            'description' => 'Ökologisch und pflegeleicht'
        ],

        // Sonstige Arbeiten
        'nach_bedarf' => [
            'name' => 'Material nach Bedarf',
            'base_price' => 40.00,
            'labor_price' => 20.00,
            'category' => 'sonstiges',
            'description' => 'Individuelle Materialwahl'
        ]
    ],

    // Unterbau-Preise (€/m²)
    'unterbau' => [
        'base_price' => 12.00,
        'depth_surcharge' => [
            '40' => 3.00,
            '50' => 6.00,
            '60' => 9.00
        ]
    ],

    // Kategorie-spezifische Zusatzleistungen
    'zusatzleistungen' => [
        // Pflasterarbeiten
        'pflaster' => [
            'randsteine' => [
                'name' => 'Randsteine setzen',
                'price' => 8.00,
                'unit' => 'lfm',
                'type' => 'per_meter'
            ],
            'drainage' => [
                'name' => 'Drainage/Einlauf',
                'price' => 150.00,
                'unit' => 'pauschal',
                'type' => 'flat'
            ],
            'unterbau_verstaerkung' => [
                'name' => 'Unterbau verstärken',
                'price' => 12.00,
                'unit' => 'm²',
                'type' => 'per_sqm'
            ],
            'entsorgung' => [
                'name' => 'Altbelag entsorgen',
                'price' => 8.00,
                'unit' => 'm²',
                'type' => 'per_sqm'
            ],
            'treppen' => [
                'name' => 'Stufen/Treppen',
                'price' => 45.00,
                'unit' => 'Stufe',
                'type' => 'per_piece'
            ],
            'anschluesse' => [
                'name' => 'Anschlüsse/Übergänge',
                'price' => 25.00,
                'unit' => 'lfm',
                'type' => 'per_meter'
            ]
        ],

        // Asphaltarbeiten
        'asphalt' => [
            'unterbau_asphalt' => [
                'name' => 'Tragschicht verstärken',
                'price' => 15.00,
                'unit' => 'm²',
                'type' => 'per_sqm'
            ],
            'markierung' => [
                'name' => 'Fahrbahnmarkierung',
                'price' => 5.00,
                'unit' => 'lfm',
                'type' => 'per_meter'
            ],
            'entsorgung_asphalt' => [
                'name' => 'Alten Asphalt entsorgen',
                'price' => 12.00,
                'unit' => 'm²',
                'type' => 'per_sqm'
            ],
            'drainage_asphalt' => [
                'name' => 'Entwässerung',
                'price' => 200.00,
                'unit' => 'pauschal',
                'type' => 'flat'
            ],
            'randbereich' => [
                'name' => 'Randbereiche befestigen',
                'price' => 10.00,
                'unit' => 'lfm',
                'type' => 'per_meter'
            ]
        ],

        // Betonarbeiten
        'beton' => [
            'bewehrung' => [
                'name' => 'Bewehrung einlegen',
                'price' => 8.00,
                'unit' => 'm²',
                'type' => 'per_sqm'
            ],
            'schalung' => [
                'name' => 'Schalung stellen',
                'price' => 12.00,
                'unit' => 'lfm',
                'type' => 'per_meter'
            ],
            'daemmung' => [
                'name' => 'Dämmung unter Platte',
                'price' => 15.00,
                'unit' => 'm²',
                'type' => 'per_sqm'
            ],
            'oberflaeche' => [
                'name' => 'Oberfläche glätten',
                'price' => 5.00,
                'unit' => 'm²',
                'type' => 'per_sqm'
            ],
            'isolierung' => [
                'name' => 'Feuchtigkeitssperre',
                'price' => 8.00,
                'unit' => 'm²',
                'type' => 'per_sqm'
            ]
        ],

        // Garten & Landschaft
        'garten' => [
            'drainage_rohr' => [
                'name' => 'Drainage-Rohre',
                'price' => 25.00,
                'unit' => 'lfm',
                'type' => 'per_meter'
            ],
            'kies_unterbau' => [
                'name' => 'Kies-Unterbau',
                'price' => 10.00,
                'unit' => 'm²',
                'type' => 'per_sqm'
            ],
            'vlies' => [
                'name' => 'Unkrautvlies',
                'price' => 3.00,
                'unit' => 'm²',
                'type' => 'per_sqm'
            ],
            'pflanzung' => [
                'name' => 'Bepflanzung',
                'price' => 20.00,
                'unit' => 'm²',
                'type' => 'per_sqm'
            ],
            'bewaesserung' => [
                'name' => 'Bewässerung',
                'price' => 35.00,
                'unit' => 'lfm',
                'type' => 'per_meter'
            ]
        ],

        // Sonstige Arbeiten
        'sonstiges' => [
            'beratung' => [
                'name' => 'Ausführliche Beratung',
                'price' => 0.00,
                'unit' => 'pauschal',
                'type' => 'flat'
            ],
            'planung' => [
                'name' => 'Detailplanung',
                'price' => 150.00,
                'unit' => 'pauschal',
                'type' => 'flat'
            ],
            'gutachten' => [
                'name' => 'Kostengutachten',
                'price' => 200.00,
                'unit' => 'pauschal',
                'type' => 'flat'
            ]
        ]
    ],

    // Faktoren und Zuschläge
    'faktoren' => [
        'premium_quality' => 1.20,      // 20% Aufschlag für Premium-Qualität
        'profit_margin' => 0.15,        // 15% Gewinnmarge
        'vat_rate' => 0.19,             // 19% Mehrwertsteuer
        'base_delivery' => 150.00,      // Anfahrt & Einrichtung (pauschal)

        // Kategorie-spezifische Faktoren
        'category_factors' => [
            'pflaster' => 1.0,          // Basis
            'asphalt' => 1.1,           // 10% Aufschlag
            'beton' => 1.2,             // 20% Aufschlag
            'garten' => 0.8,            // 20% Rabatt
            'sonstiges' => 1.3          // 30% Aufschlag
        ],

        // Beanspruchungs-Faktoren
        'load_factors' => [
            'fussgaenger' => 1.00,
            'pkw' => 1.10,
            'lkw' => 1.30,
            'schwerlast' => 1.50
        ],

        // Umgebungs-Faktoren
        'ground_factors' => [
            'normal' => 1.00,
            'schwierig' => 1.15,
            'fels' => 1.30
        ],

        'slope_factors' => [
            'eben' => 1.00,
            'leicht' => 1.05,
            'stark' => 1.15
        ],

        'access_factors' => [
            'gut' => 1.00,
            'eingeschraenkt' => 1.10,
            'schwierig' => 1.25
        ],

        // Saisonale Faktoren (optional)
        'seasonal_factors' => [
            'winter' => 1.15,           // 15% Winterzuschlag
            'summer' => 1.00,           // Normaltarif
            'spring' => 0.95,           // 5% Frühlingsrabatt
            'autumn' => 1.00            // Normaltarif
        ]
    ]
];

/**
 * ERWEITERTE DATEI-UPLOAD KONFIGURATION
 */
$UPLOAD_CONFIG = [
    'max_file_size' => 5 * 1024 * 1024, // 5MB in Bytes
    'max_files' => 5,                    // Maximale Anzahl Dateien
    'allowed_types' => ['jpg', 'jpeg', 'png', 'pdf'],
    'upload_dir' => dirname(__FILE__) . '/uploads',
    'pdf_dir' => dirname(__FILE__) . '/pdf',
    'pdf_url' => '/assets/php/pdf',      // Web-zugänglicher Pfad für PDF-Viewer
    'cleanup_days' => 30,                // Alte Dateien nach X Tagen löschen

    // PDF-spezifische Konfiguration
    'pdf_viewer' => [
        'enabled' => true,               // PDF-Viewer aktivieren
        'iframe_allowed' => true,        // iFrame für PDF-Anzeige erlauben
        'download_enabled' => true,      // Download-Button anzeigen
        'preview_enabled' => true        // Vorschau-Button anzeigen
    ]
];

/**
 * ERWEITERTE PDF-KONFIGURATION
 */
$PDF_CONFIG = [
    'validity_days' => 30,               // Angebotsgültigkeit in Tagen
    'page_format' => 'A4',
    'page_orientation' => 'P',           // P = Portrait, L = Landscape
    'margins' => [
        'top' => 15,
        'right' => 15,
        'bottom' => 15,
        'left' => 15
    ],
    'font_family' => 'dejavusans',
    'font_size' => 10,
    'watermark' => false,                // Wasserzeichen aktivieren
    'watermark_text' => 'UNVERBINDLICH',

    // Kategorie-spezifische PDF-Anpassungen
    'category_colors' => [
        'pflaster' => ['r' => 0, 'g' => 100, 'b' => 0],    // Grün
        'asphalt' => ['r' => 50, 'g' => 50, 'b' => 50],     // Grau
        'beton' => ['r' => 100, 'g' => 100, 'b' => 100],    // Hellgrau
        'garten' => ['r' => 34, 'g' => 139, 'b' => 34],     // Waldgrün
        'sonstiges' => ['r' => 0, 'g' => 100, 'b' => 0]     // Standard-Grün
    ],

    // Logo und Branding
    'include_logo' => true,
    'include_qr_code' => false,          // QR-Code für Online-Zugang
    'include_social_media' => false,     // Social Media Links

    // Template-Optionen
    'template_style' => 'modern',        // 'classic', 'modern', 'minimal'
    'show_confidence_badge' => true,     // Vertrauensindikator anzeigen
    'show_category_badge' => true        // Kategorie-Badge anzeigen
];

/**
 * SICHERHEITS-KONFIGURATION
 */
$SECURITY_CONFIG = [
    'honeypot_field' => 'website',       // Name des Honeypot-Feldes
    'rate_limit_seconds' => 60,          // Mindestabstand zwischen Anfragen
    'max_attempts_per_ip' => 5,          // Max. Versuche pro IP/Stunde
    'csrf_protection' => false,          // CSRF-Schutz aktivieren
    'ip_whitelist' => [],                // IP-Adressen die immer erlaubt sind
    'ip_blacklist' => [],                // Gesperrte IP-Adressen
    'user_agent_check' => true,          // User Agent Validierung
    'referer_check' => false,            // HTTP Referer prüfen

    // Erweiterte Sicherheit
    'max_request_size' => 50 * 1024 * 1024, // 50MB maximale Anfragegröße
    'block_suspicious_patterns' => true,     // Verdächtige Muster blockieren
    'log_security_events' => true,           // Sicherheitsereignisse protokollieren

    // Content Security Policy
    'csp_enabled' => !DEVELOPMENT_MODE,
    'csp_directives' => [
        'default-src' => "'self'",
        'script-src' => "'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
        'style-src' => "'self' 'unsafe-inline' https://fonts.googleapis.com",
        'font-src' => "'self' https://fonts.gstatic.com",
        'img-src' => "'self' data: https:",
        'frame-src' => "'self'",         // Wichtig für PDF-Viewer
        'object-src' => "'none'"
    ]
];

/**
 * KATEGORIEN-KONFIGURATION
 * Zentrale Definition aller verfügbaren Kategorien
 */
$CATEGORY_CONFIG = [
    'pflaster' => [
        'name' => 'Pflasterarbeiten',
        'description' => 'Einfahrten, Terrassen, Gehwege und Höfe pflastern',
        'icon' => 'construction',
        'base_factor' => 1.0,
        'min_area' => 5,              // Mindestfläche in m²
        'max_area' => 10000,          // Maximale Fläche in m²
        'typical_projects' => [
            'einfahrt' => 'Einfahrt pflastern',
            'terrasse' => 'Terrasse pflastern',
            'gehweg' => 'Gehweg pflastern',
            'hof' => 'Hof/Platz pflastern',
            'parkplatz' => 'Parkplatz pflastern',
            'zugang' => 'Zugang/Weg pflastern'
        ]
    ],

    'asphalt' => [
        'name' => 'Asphaltarbeiten',
        'description' => 'Einfahrten und Wege asphaltieren',
        'icon' => 'road',
        'base_factor' => 1.1,
        'min_area' => 20,             // Größere Mindestfläche für Asphalt
        'max_area' => 50000,
        'typical_projects' => [
            'einfahrt_asphalt' => 'Einfahrt asphaltieren',
            'zufahrt' => 'Zufahrt asphaltieren',
            'hof_asphalt' => 'Hof asphaltieren',
            'parkplatz_asphalt' => 'Parkplatz asphaltieren',
            'weg_asphalt' => 'Weg asphaltieren'
        ]
    ],

    'beton' => [
        'name' => 'Betonarbeiten',
        'description' => 'Bodenplatten, Fundamente und Betonflächen',
        'icon' => 'foundation',
        'base_factor' => 1.2,
        'min_area' => 10,
        'max_area' => 5000,
        'typical_projects' => [
            'bodenplatte' => 'Bodenplatte gießen',
            'fundament' => 'Fundament erstellen',
            'terrasse_beton' => 'Betonterrasse',
            'stellplatz_beton' => 'Stellplatz betonieren',
            'gehweg_beton' => 'Betongehweg'
        ]
    ],

    'garten' => [
        'name' => 'Garten & Landschaft',
        'description' => 'Gartengestaltung, Drainage und Erdarbeiten',
        'icon' => 'park',
        'base_factor' => 0.8,
        'min_area' => 1,              // Kleinste Mindestfläche
        'max_area' => 20000,
        'typical_projects' => [
            'garten_anlegen' => 'Garten neu anlegen',
            'drainage_garten' => 'Drainage verlegen',
            'erdarbeiten' => 'Erdarbeiten',
            'hangbefestigung' => 'Hangbefestigung',
            'wege_anlegen' => 'Gartenwege anlegen'
        ]
    ],

    'sonstiges' => [
        'name' => 'Sonstige Arbeiten',
        'description' => 'Weitere Bauleistungen und individuelle Projekte',
        'icon' => 'build',
        'base_factor' => 1.3,         // Höherer Faktor wegen individueller Beratung
        'min_area' => 1,
        'max_area' => 100000,         // Keine Obergrenze
        'typical_projects' => [
            'individuell' => 'Individuelle Lösung',
            'sanierung' => 'Sanierungsarbeiten',
            'reparatur' => 'Reparaturen',
            'beratung' => 'Beratung und Planung',
            'sonstiges' => 'Sonstige Arbeiten'
        ]
    ]
];

/**
 * DATENBANK-KONFIGURATION (optional)
 */
$DATABASE_CONFIG = [
    'enabled' => false,                  // Auf true setzen für DB-Integration
    'host' => 'localhost',
    'database' => 'baufranke_angebote',
    'username' => 'db_user',
    'password' => 'db_password',
    'charset' => 'utf8mb4',
    'table_prefix' => 'bf_',

    // Tabellen für erweiterte Features
    'tables' => [
        'angebote' => 'angebote',
        'kategorien' => 'kategorien',
        'materialien' => 'materialien',
        'zusatzleistungen' => 'zusatzleistungen',
        'kunden' => 'kunden',
        'projekte' => 'projekte'
    ]
];

/**
 * LOGGING-KONFIGURATION
 */
$LOGGING_CONFIG = [
    'enabled' => true,
    'level' => DEVELOPMENT_MODE ? 'DEBUG' : 'INFO', // DEBUG, INFO, WARNING, ERROR
    'log_dir' => dirname(__FILE__) . '/logs',
    'max_file_size' => 10 * 1024 * 1024, // 10MB
    'rotation_days' => 30,                // Logs nach X Tagen rotieren
    'email_errors' => !DEVELOPMENT_MODE,  // Fehler per E-Mail senden

    // Kategorisierte Logs
    'log_categories' => [
        'security' => 'security.log',
        'pdf' => 'pdf_generation.log',
        'email' => 'email.log',
        'errors' => 'errors.log',
        'access' => 'access.log'
    ]
];

/**
 * CACHE-KONFIGURATION
 */
$CACHE_CONFIG = [
    'enabled' => !DEVELOPMENT_MODE,
    'ttl' => 3600,                       // Cache-Gültigkeitsdauer (Sekunden)
    'cache_dir' => dirname(__FILE__) . '/cache',
    'compress' => true,                   // Gzip-Kompression

    // Verschiedene Cache-Typen
    'cache_types' => [
        'pricing' => 7200,              // Preise 2h cachen
        'categories' => 86400,          // Kategorien 24h cachen
        'materials' => 3600,            // Materialien 1h cachen
        'pdfs' => 604800                // PDFs 7 Tage cachen
    ]
];

/**
 * ANALYTICS & TRACKING KONFIGURATION
 */
$ANALYTICS_CONFIG = [
    // Google Analytics
    'google_analytics' => [
        'enabled' => !DEVELOPMENT_MODE,
        'tracking_id' => 'GA-XXXXXXXXX',
        'track_conversions' => true,
        'track_pdf_downloads' => true,
        'track_category_selections' => true
    ],

    // Facebook Pixel
    'facebook_pixel' => [
        'enabled' => false,
        'pixel_id' => 'XXXXXXXXXXXXXXXXX'
    ],

    // Eigene Statistiken
    'internal_stats' => [
        'enabled' => true,
        'track_popular_categories' => true,
        'track_average_prices' => true,
        'track_completion_rate' => true,
        'track_abandonment_points' => true
    ]
];

/**
 * INTEGRATION-KONFIGURATION
 * Für zukünftige Integrationen (CRM, ERP, etc.)
 */
$INTEGRATION_CONFIG = [
    // CRM-Integration
    'crm' => [
        'enabled' => false,
        'type' => 'hubspot',             // 'hubspot', 'salesforce', 'pipedrive'
        'api_key' => '',
        'sync_leads' => true,
        'sync_projects' => true
    ],

    // ERP-Integration
    'erp' => [
        'enabled' => false,
        'type' => 'custom',              // 'sap', 'odoo', 'custom'
        'api_endpoint' => '',
        'sync_materials' => true,
        'sync_prices' => true
    ],

    // Webhook für externe Systeme
    'webhooks' => [
        'enabled' => false,
        'urls' => [],                    // Array von Webhook-URLs
        'events' => ['quote_created', 'pdf_generated', 'email_sent']
    ],

    // API für mobile App (zukünftig)
    'api' => [
        'enabled' => false,
        'version' => 'v1',
        'auth_required' => true,
        'rate_limit' => 100             // Requests pro Stunde
    ]
];

/**
 * NOTIFICATION-KONFIGURATION
 */
$NOTIFICATION_CONFIG = [
    // Slack-Integration
    'slack' => [
        'enabled' => false,
        'webhook_url' => '',
        'channel' => '#angebote',
        'notify_on_quote' => true,
        'notify_on_errors' => true
    ],

    // SMS-Benachrichtigungen
    'sms' => [
        'enabled' => false,
        'provider' => 'twilio',          // twilio, nexmo, etc.
        'api_key' => '',
        'numbers' => [],                 // Array von Telefonnummern
        'notify_on_quote' => false
    ],

    // Push-Benachrichtigungen (für mobile App)
    'push' => [
        'enabled' => false,
        'service' => 'firebase',        // firebase, onesignal
        'api_key' => ''
    ]
];

/**
 * BACKUP-KONFIGURATION
 */
$BACKUP_CONFIG = [
    'auto_backup' => true,
    'backup_dir' => dirname(__FILE__) . '/backups',
    'keep_backups' => 10,                // Anzahl Backups aufbewahren
    'include_files' => ['uploads', 'pdf', 'logs', 'cache'],
    'schedule' => 'daily',               // daily, weekly, monthly
    'compress' => true,                  // Backups komprimieren

    // Cloud-Backup (optional)
    'cloud_backup' => [
        'enabled' => false,
        'provider' => 's3',              // s3, dropbox, google_drive
        'credentials' => []
    ]
];

/**
 * PERFORMANCE-KONFIGURATION
 */
$PERFORMANCE_CONFIG = [
    // Memory und Execution Limits
    'memory_limit' => '256M',
    'max_execution_time' => 60,

    // Optimierungen
    'gzip_compression' => true,
    'minify_output' => !DEVELOPMENT_MODE,
    'lazy_loading' => true,

    // Caching-Strategien
    'browser_cache_ttl' => 3600,        // 1 Stunde
    'static_cache_ttl' => 86400,        // 24 Stunden für statische Inhalte

    // PDF-Optimierung
    'pdf_optimization' => [
        'compress_images' => true,
        'optimize_fonts' => true,
        'reduce_file_size' => true
    ]
];

/**
 * KONFIGURATION VALIDIEREN
 */
function validateExtendedConfig() {
    global $COMPANY_CONFIG, $EMAIL_CONFIG, $UPLOAD_CONFIG, $CATEGORY_CONFIG;

    $errors = [];

    // Firmen-E-Mail prüfen
    if (!filter_var($EMAIL_CONFIG['company_email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Ungültige Firmen-E-Mail-Adresse';
    }

    // Verzeichnisse prüfen und erstellen
    $dirs = [
        $UPLOAD_CONFIG['upload_dir'],
        $UPLOAD_CONFIG['pdf_dir'],
        dirname(__FILE__) . '/logs',
        dirname(__FILE__) . '/cache',
        dirname(__FILE__) . '/backups'
    ];

    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            if (!mkdir($dir, 0755, true)) {
                $errors[] = "Kann Verzeichnis nicht erstellen: $dir";
            }
        } elseif (!is_writable($dir)) {
            $errors[] = "Verzeichnis nicht beschreibbar: $dir";
        }
    }

    // Kategorien validieren
    foreach ($CATEGORY_CONFIG as $key => $category) {
        if (empty($category['name']) || empty($category['typical_projects'])) {
            $errors[] = "Kategorie '$key' ist unvollständig konfiguriert";
        }
    }

    // Logo-Datei prüfen
    if (!empty($COMPANY_CONFIG['logo']) && !file_exists($COMPANY_CONFIG['logo'])) {
        $errors[] = "Logo-Datei nicht gefunden: " . $COMPANY_CONFIG['logo'];
    }

    if (!empty($errors)) {
        if (DEVELOPMENT_MODE) {
            echo '<div style="background:red;color:white;padding:10px;">';
            echo '<h3>Konfigurationsfehler:</h3>';
            foreach ($errors as $error) {
                echo '<p>• ' . htmlspecialchars($error) . '</p>';
            }
            echo '</div>';
        }
        error_log('Angebots-Tool Konfigurationsfehler: ' . implode(', ', $errors));
        return false;
    }

    return true;
}

/**
 * ERWEITERTE HILFSFUNKTIONEN
 */

// Konfigurationswert sicher abrufen mit Fallback
function getConfig($section, $key = null, $default = null) {
    global ${strtoupper($section) . '_CONFIG'};

    $config = ${strtoupper($section) . '_CONFIG'} ?? [];

    if ($key === null) {
        return $config;
    }

    // Verschachtelte Keys unterstützen (z.B. 'email.smtp.host')
    if (strpos($key, '.') !== false) {
        $keys = explode('.', $key);
        $value = $config;

        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }

        return $value;
    }

    return $config[$key] ?? $default;
}

// Kategorie-spezifische Konfiguration abrufen
function getCategoryConfig($category, $key = null, $default = null) {
    global $CATEGORY_CONFIG;

    if (!isset($CATEGORY_CONFIG[$category])) {
        return $default;
    }

    $config = $CATEGORY_CONFIG[$category];

    if ($key === null) {
        return $config;
    }

    return $config[$key] ?? $default;
}

// Material-Preise für Kategorie abrufen
function getMaterialPrices($category) {
    global $PRICING_CONFIG;

    $materials = [];

    foreach ($PRICING_CONFIG['materials'] as $key => $material) {
        if ($material['category'] === $category) {
            $materials[$key] = $material;
        }
    }

    return $materials;
}

// Zusatzleistungen für Kategorie abrufen
function getZusatzleistungen($category) {
    global $PRICING_CONFIG;

    return $PRICING_CONFIG['zusatzleistungen'][$category] ?? [];
}

// Preis formatieren mit Kategorieunterstützung
function formatPrice($amount, $currency = '€', $precision = 2) {
    return number_format($amount, $precision, ',', '.') . ' ' . $currency;
}

// Debug-Ausgabe (nur in Development)
function debugLog($message, $data = null, $category = 'general') {
    if (DEBUG_MODE) {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp][$category] $message";

        if ($data !== null) {
            $logMessage .= "\n" . print_r($data, true);
        }

        error_log($logMessage);
    }
}

// Sicherheits-Log
function securityLog($event, $details = '', $ip = null) {
    global $LOGGING_CONFIG;

    if (!$LOGGING_CONFIG['enabled']) return;

    $ip = $ip ?: ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] SECURITY: $event - IP: $ip - $details";

    $logFile = $LOGGING_CONFIG['log_dir'] . '/security.log';
    file_put_contents($logFile, $logMessage . "\n", FILE_APPEND | LOCK_EX);
}

// Performance-Messungen
function startPerformanceTimer($name) {
    if (DEBUG_MODE) {
        $GLOBALS['perf_timers'][$name] = microtime(true);
    }
}

function endPerformanceTimer($name) {
    if (DEBUG_MODE && isset($GLOBALS['perf_timers'][$name])) {
        $duration = microtime(true) - $GLOBALS['perf_timers'][$name];
        debugLog("Performance: $name took " . round($duration * 1000, 2) . "ms", null, 'performance');
        unset($GLOBALS['perf_timers'][$name]);
    }
}

/**
 * UMGEBUNGS-SPEZIFISCHE EINSTELLUNGEN
 */
if (DEVELOPMENT_MODE) {
    // Development-Einstellungen
    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    // E-Mail-Simulation aktivieren
    $EMAIL_CONFIG['simulate'] = true;

    // Debug-Modus für PDF
    $PDF_CONFIG['watermark'] = true;
    $PDF_CONFIG['watermark_text'] = 'ENTWICKLUNG';

    // Weniger strikte Sicherheit
    $SECURITY_CONFIG['rate_limit_seconds'] = 10;

} else {
    // Production-Einstellungen
    ini_set('display_errors', 0);
    error_reporting(E_ERROR);

    // Performance-Optimierungen
    ini_set('memory_limit', $PERFORMANCE_CONFIG['memory_limit']);
    ini_set('max_execution_time', $PERFORMANCE_CONFIG['max_execution_time']);

    // Sicherheits-Header
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN'); // Erlaubt für PDF-Viewer
    header('X-XSS-Protection: 1; mode=block');

    // Content Security Policy
    if ($SECURITY_CONFIG['csp_enabled']) {
        $cspHeader = 'Content-Security-Policy: ';
        $cspParts = [];

        foreach ($SECURITY_CONFIG['csp_directives'] as $directive => $value) {
            $cspParts[] = "$directive $value";
        }

        header($cspHeader . implode('; ', $cspParts));
    }
}

// Automatische Initialisierung
if (!validateExtendedConfig() && !DEVELOPMENT_MODE) {
    // In Production bei Konfigurationsfehlern abbrechen
    die('Systemkonfiguration fehlerhaft. Bitte Administrator kontaktieren.');
}

// Performance-Timer starten
startPerformanceTimer('config_load');

/**
 * CHANGELOG
 *
 * Version 2.0.0 (2024-12-XX)
 * - Kategorieunterstützung hinzugefügt
 * - PDF-Viewer Integration
 * - Erweiterte Sicherheitsfeatures
 * - Performance-Optimierungen
 * - Umfassendes Logging-System
 * - Backup-Funktionalität
 * - Erweiterte E-Mail-Templates
 * - Material-Konfiguration nach Kategorien
 *
 * Version 1.0.0 (2024-11-XX)
 * - Initiale Konfigurationsdatei
 * - Basis-Preiskonfiguration
 * - E-Mail und PDF-Einstellungen
 * - Sicherheitskonfiguration
 */

// Performance-Timer beenden
endPerformanceTimer('config_load');

// Konfiguration erfolgreich geladen
if (DEBUG_MODE) {
    debugLog('Konfiguration erfolgreich geladen', [
        'categories' => count($CATEGORY_CONFIG),
        'materials' => count($PRICING_CONFIG['materials']),
        'mode' => ENVIRONMENT
    ], 'config');
}

?>