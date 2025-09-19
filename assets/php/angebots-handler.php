<?php
/**
 * ANGEBOTS-HANDLER - BAU FRANKE (VERBESSERT)
 * Backend-Handler für das automatisierte Angebots-Tool
 * Version: 2.0.0 - Mit Kategorien und PDF-Viewer
 *
 * @author Bau GmbH Franke
 * @version 2.0.0 - Erweiterte Kategorien und verbesserter PDF-Handler
 */

// Konfiguration laden
define('ANGEBOT_TOOL_ACCESS', true);
require_once 'angebots-config.php';

// Sicherheitscheck - Direkter Zugriff verhindern
if (!defined('ANGEBOT_TOOL_ACCESS')) {
    die('Direkter Zugriff nicht erlaubt');
}

// Security Headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN'); // Geändert für PDF-Viewer
header('X-XSS-Protection: 1; mode=block');
header('Content-Type: application/json; charset=utf-8');

// Error Reporting basierend auf Umgebung
if (DEVELOPMENT_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Required Libraries
require_once 'libraries/tcpdf/tcpdf.php';

/**
 * Hauptklasse für erweiterte Angebotserstellung
 */
class AngebotsTool {
    private $config;
    private $uploadDir;
    private $pdfDir;
    private $pdfUrlPath;
    private $errors = [];
    private $formData = [];
    private $priceData = [];
    private $angebotId;
    private $categoryConfig;

    public function __construct() {
        $this->loadConfigurations();
        $this->angebotId = $this->generateAngebotId();
        $this->ensureDirectories();
        $this->setupCategoryConfiguration();
    }

    /**
     * Konfigurationen laden
     */
    private function loadConfigurations() {
        global $COMPANY_CONFIG, $EMAIL_CONFIG, $UPLOAD_CONFIG, $PDF_CONFIG, $PRICING_CONFIG;

        $this->config = [
            'company' => $COMPANY_CONFIG,
            'email' => $EMAIL_CONFIG,
            'upload' => $UPLOAD_CONFIG,
            'pdf' => $PDF_CONFIG,
            'pricing' => $PRICING_CONFIG
        ];

        $this->uploadDir = $this->config['upload']['upload_dir'];
        $this->pdfDir = $this->config['upload']['pdf_dir'];
        $this->pdfUrlPath = $this->config['upload']['pdf_url'];
    }

    /**
     * Kategorie-Konfiguration einrichten
     */
    private function setupCategoryConfiguration() {
        $this->categoryConfig = [
            'pflaster' => [
                'name' => 'Pflasterarbeiten',
                'materials' => ['betonpflaster', 'naturstein', 'platten', 'rasengitter'],
                'base_factor' => 1.0
            ],
            'asphalt' => [
                'name' => 'Asphaltarbeiten',
                'materials' => ['asphalt_standard', 'asphalt_premium'],
                'base_factor' => 1.1
            ],
            'beton' => [
                'name' => 'Betonarbeiten',
                'materials' => ['beton_c25', 'beton_c35'],
                'base_factor' => 1.2
            ],
            'garten' => [
                'name' => 'Garten & Landschaft',
                'materials' => ['kies', 'rindenmulch'],
                'base_factor' => 0.8
            ],
            'sonstiges' => [
                'name' => 'Sonstige Arbeiten',
                'materials' => ['nach_bedarf'],
                'base_factor' => 1.3
            ]
        ];
    }

    /**
     * Hauptverarbeitungsfunktion
     */
    public function processRequest() {
        try {
            // Sicherheitsprüfungen
            if (!$this->validateSecurity()) {
                throw new Exception('Sicherheitsprüfung fehlgeschlagen');
            }

            // Request Method prüfen
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Nur POST-Requests erlaubt');
            }

            // Formulardaten validieren und sammeln
            $this->validateAndCollectData();

            // PDF generieren
            $pdfPath = $this->generatePDF();

            // In Datenbank speichern (optional)
            $this->saveToDatabase($pdfPath);

            // E-Mails versenden
            $this->sendEmails($pdfPath);

            // PDF-URL für Frontend generieren
            $pdfUrl = $this->generatePDFUrl(basename($pdfPath));

            // Erfolgs-Response
            $this->sendJsonResponse([
                'success' => true,
                'message' => 'Ihr Angebot wurde erfolgreich erstellt und versendet. Sie können es nun direkt ansehen oder herunterladen.',
                'title' => 'Angebot erfolgreich erstellt',
                'angebot_id' => $this->angebotId,
                'pdf_url' => $pdfUrl,
                'estimated_total' => $this->formatPrice($this->priceData['total']),
                'confidence' => $this->priceData['confidence'] . '%',
                'category' => $this->formData['category'] ?? 'unbekannt',
                'project_type' => $this->formData['objektart'] ?? 'unbekannt'
            ]);

        } catch (Exception $e) {
            error_log('AngebotsTool Error: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());

            $this->sendJsonResponse([
                'success' => false,
                'message' => $e->getMessage(),
                'title' => 'Fehler beim Erstellen des Angebots',
                'error_code' => $this->getErrorCode($e->getMessage())
            ], 400);
        }
    }

    /**
     * Erweiterte Sicherheitsprüfungen
     */
    private function validateSecurity() {
        // Honeypot Check
        if (!empty($_POST['website'])) {
            throw new Exception('Spam erkannt - Honeypot ausgelöst');
        }

        // Rate Limiting
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $rateLimitFile = sys_get_temp_dir() . '/angebot_' . md5($ip);

        if (file_exists($rateLimitFile)) {
            $lastRequest = filemtime($rateLimitFile);
            if (time() - $lastRequest < 60) { // 60 Sekunden Mindestabstand
                throw new Exception('Zu viele Anfragen. Bitte warten Sie eine Minute.');
            }
        }

        touch($rateLimitFile);

        // User Agent Check
        if (empty($_SERVER['HTTP_USER_AGENT'])) {
            throw new Exception('Kein User Agent - möglicherweise Bot');
        }

        // Content-Length Check
        $maxSize = 50 * 1024 * 1024; // 50MB
        $contentLength = $_SERVER['CONTENT_LENGTH'] ?? 0;
        if ($contentLength > $maxSize) {
            throw new Exception('Anfrage zu groß');
        }

        return true;
    }

    /**
     * Erweiterte Formulardaten-Validierung mit Kategorieunterstützung
     */
    private function validateAndCollectData() {
        // Pflichtfelder definieren
        $requiredFields = [
            'category' => 'Kategorie',
            'objektart' => 'Projekt-/Objektart',
            'flaeche' => 'Fläche',
            'beanspruchung' => 'Beanspruchung',
            'vorname' => 'Vorname',
            'nachname' => 'Nachname',
            'email' => 'E-Mail-Adresse',
            'telefon' => 'Telefon',
            'strasse' => 'Straße',
            'plz' => 'PLZ',
            'ort' => 'Ort',
            'datenschutz' => 'Datenschutzerklärung',
            'agb' => 'AGB'
        ];

        // Pflichtfelder prüfen
        foreach ($requiredFields as $field => $label) {
            if (empty($_POST[$field])) {
                throw new Exception("Pflichtfeld '{$label}' fehlt");
            }
            $this->formData[$field] = $this->sanitizeInput($_POST[$field]);
        }

        // Kategorie validieren
        if (!isset($this->categoryConfig[$this->formData['category']])) {
            throw new Exception('Ungültige Kategorie ausgewählt');
        }

        // E-Mail validieren
        if (!filter_var($this->formData['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Ungültige E-Mail-Adresse');
        }

        // PLZ validieren
        if (!preg_match('/^\d{5}$/', $this->formData['plz'])) {
            throw new Exception('PLZ muss 5-stellig sein');
        }

        // Telefon validieren
        if (!preg_match('/^[\d\s\-\+\(\)]+$/', $this->formData['telefon'])) {
            throw new Exception('Ungültige Telefonnummer');
        }

        // Fläche validieren
        $flaeche = floatval($this->formData['flaeche']);
        if ($flaeche <= 0 || $flaeche > 50000) { // Erweitert auf 50.000m²
            throw new Exception('Fläche muss zwischen 1 und 50.000 m² liegen');
        }
        $this->formData['flaeche_num'] = $flaeche;

        // Optionale Felder sammeln
        $optionalFields = [
            'firma', 'projektadresse', 'ausfuehrungszeitraum', 'qualitaet',
            'verlegemuster', 'abgrabungstiefe', 'bodenbeschaffenheit',
            'hangneigung', 'erreichbarkeit', 'rueckruf', 'pflasterart'
        ];

        foreach ($optionalFields as $field) {
            $this->formData[$field] = isset($_POST[$field]) ? $this->sanitizeInput($_POST[$field]) : '';
        }

        // Material validieren (nur wenn nicht "sonstiges")
        if ($this->formData['category'] !== 'sonstiges') {
            if (empty($this->formData['pflasterart'])) {
                throw new Exception('Material muss ausgewählt werden');
            }

            $validMaterials = $this->categoryConfig[$this->formData['category']]['materials'];
            if (!in_array($this->formData['pflasterart'], $validMaterials)) {
                throw new Exception('Ungültiges Material für gewählte Kategorie');
            }
        } else {
            // Für "sonstiges" Standard-Material setzen
            $this->formData['pflasterart'] = 'nach_bedarf';
        }

        // Zusatzleistungen (Array)
        $this->formData['zusatzleistungen'] = isset($_POST['zusatzleistungen'])
            ? array_map([$this, 'sanitizeInput'], $_POST['zusatzleistungen'])
            : [];

        // Preisdaten aus Frontend (falls übertragen)
        if (!empty($_POST['price_data'])) {
            $priceDataJson = json_decode($_POST['price_data'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->priceData = $priceDataJson;
            }
        }

        // Wenn keine Preisdaten übertragen, selbst berechnen
        if (empty($this->priceData)) {
            $this->priceData = $this->calculatePrices();
        }

        // Datei-Uploads verarbeiten
        $this->processUploads();

        if (DEBUG_MODE) {
            error_log('Form Data: ' . print_r($this->formData, true));
            error_log('Price Data: ' . print_r($this->priceData, true));
        }
    }

    /**
     * Erweiterte Preisberechnung mit Kategorieunterstützung
     */
    private function calculatePrices() {
        $flaeche = $this->formData['flaeche_num'];
        $category = $this->formData['category'];
        $materialType = $this->formData['pflasterart'];

        // Material-Preise aus Konfiguration
        $materialPrices = $this->config['pricing']['materials'];

        if (!isset($materialPrices[$materialType])) {
            // Fallback für unbekannte Materialien
            $materialPrices[$materialType] = ['base' => 40, 'labor' => 20];
        }

        $material = $materialPrices[$materialType];

        // Kategorie-Faktor anwenden
        $categoryFactor = $this->categoryConfig[$category]['base_factor'] ?? 1.0;

        // Grundkosten
        $materialCost = $material['base'] * $flaeche * $categoryFactor;
        $laborCost = $material['labor'] * $flaeche * $categoryFactor;

        // Qualitätsfaktor
        if ($this->formData['qualitaet'] === 'premium') {
            $materialCost *= 1.2;
            $laborCost *= 1.2;
        }

        // Unterbau-Kosten (nur für relevante Kategorien)
        $unterbauCost = 0;
        if (in_array($category, ['pflaster', 'asphalt', 'beton'])) {
            $unterbauBase = $this->config['pricing']['unterbau']['base_price'] ?? 12;
            $unterbauCost = $unterbauBase * $flaeche;

            // Zusätzliche Tiefe
            $abgrabungstiefe = intval($this->formData['abgrabungstiefe']) ?: 30;
            if ($abgrabungstiefe > 30) {
                $extraCost = [40 => 3, 50 => 6, 60 => 9][$abgrabungstiefe] ?? 0;
                $unterbauCost += $extraCost * $flaeche;
            }
        }

        // Belastungsfaktor
        $beanspruchungsFaktoren = [
            'fussgaenger' => 1.0,
            'pkw' => 1.1,
            'lkw' => 1.3,
            'schwerlast' => 1.5
        ];
        $belastungsFaktor = $beanspruchungsFaktoren[$this->formData['beanspruchung']] ?? 1.0;

        $materialCost *= $belastungsFaktor;
        $laborCost *= $belastungsFaktor;
        $unterbauCost *= $belastungsFaktor;

        // Umgebungsfaktoren
        $bodenFaktoren = ['normal' => 1.0, 'schwierig' => 1.15, 'fels' => 1.3];
        $hangFaktoren = ['eben' => 1.0, 'leicht' => 1.05, 'stark' => 1.15];
        $erreichbarkeitsFaktoren = ['gut' => 1.0, 'eingeschraenkt' => 1.1, 'schwierig' => 1.25];

        $bodenFaktor = $bodenFaktoren[$this->formData['bodenbeschaffenheit']] ?? 1.0;
        $hangFaktor = $hangFaktoren[$this->formData['hangneigung']] ?? 1.0;
        $erreichbarkeitsFaktor = $erreichbarkeitsFaktoren[$this->formData['erreichbarkeit']] ?? 1.0;

        $umgebungsFaktor = $bodenFaktor * $hangFaktor * $erreichbarkeitsFaktor;

        $materialCost *= $umgebungsFaktor;
        $laborCost *= $umgebungsFaktor;
        $unterbauCost *= $umgebungsFaktor;

        // Zusatzleistungen berechnen
        $zusatzCost = $this->calculateZusatzleistungen($flaeche, $category);

        // Anfahrt & Einrichtung
        $anfahrtCost = 150; // Basis-Anfahrtskosten

        // Zwischensumme
        $subtotal = $materialCost + $laborCost + $unterbauCost + $zusatzCost + $anfahrtCost;

        // Gewinnmarge (15%)
        $subtotalWithMargin = $subtotal * 1.15;

        // MwSt (19%)
        $tax = $subtotalWithMargin * 0.19;
        $total = $subtotalWithMargin + $tax;

        return [
            'material' => $materialCost,
            'labor' => $laborCost,
            'unterbau' => $unterbauCost,
            'zusatz' => $zusatzCost,
            'anfahrt' => $anfahrtCost,
            'subtotal' => $subtotal,
            'subtotalWithMargin' => $subtotalWithMargin,
            'tax' => $tax,
            'total' => $total,
            'confidence' => $this->calculateConfidence()
        ];
    }

    /**
     * Zusatzleistungen basierend auf Kategorie berechnen
     */
    private function calculateZusatzleistungen($flaeche, $category) {
        $zusatzCost = 0;
        $zusatzleistungen = $this->formData['zusatzleistungen'];

        // Basis-Preise für Zusatzleistungen
        $zusatzPreise = [
            // Pflaster
            'randsteine' => ['type' => 'per_meter', 'price' => 8],
            'drainage' => ['type' => 'flat', 'price' => 150],
            'unterbau_verstaerkung' => ['type' => 'per_sqm', 'price' => 12],
            'entsorgung' => ['type' => 'per_sqm', 'price' => 8],
            'treppen' => ['type' => 'per_piece', 'price' => 45],
            'anschluesse' => ['type' => 'per_meter', 'price' => 25],

            // Asphalt
            'unterbau_asphalt' => ['type' => 'per_sqm', 'price' => 15],
            'markierung' => ['type' => 'per_meter', 'price' => 5],
            'entsorgung_asphalt' => ['type' => 'per_sqm', 'price' => 12],
            'drainage_asphalt' => ['type' => 'flat', 'price' => 200],
            'randbereich' => ['type' => 'per_meter', 'price' => 10],

            // Beton
            'bewehrung' => ['type' => 'per_sqm', 'price' => 8],
            'schalung' => ['type' => 'per_meter', 'price' => 12],
            'daemmung' => ['type' => 'per_sqm', 'price' => 15],
            'oberflaeche' => ['type' => 'per_sqm', 'price' => 5],
            'isolierung' => ['type' => 'per_sqm', 'price' => 8],

            // Garten
            'drainage_rohr' => ['type' => 'per_meter', 'price' => 25],
            'kies_unterbau' => ['type' => 'per_sqm', 'price' => 10],
            'vlies' => ['type' => 'per_sqm', 'price' => 3],
            'pflanzung' => ['type' => 'per_sqm', 'price' => 20],
            'bewaesserung' => ['type' => 'per_meter', 'price' => 35],

            // Sonstiges
            'beratung' => ['type' => 'flat', 'price' => 0],
            'planung' => ['type' => 'flat', 'price' => 150],
            'gutachten' => ['type' => 'flat', 'price' => 200]
        ];

        foreach ($zusatzleistungen as $leistung) {
            if (isset($zusatzPreise[$leistung])) {
                $pricing = $zusatzPreise[$leistung];

                switch ($pricing['type']) {
                    case 'per_sqm':
                        $zusatzCost += $pricing['price'] * $flaeche;
                        break;
                    case 'per_meter':
                        // Geschätzte Meter basierend auf Fläche (Perimeter)
                        $estimatedMeters = sqrt($flaeche) * 4;
                        $zusatzCost += $pricing['price'] * $estimatedMeters;
                        break;
                    case 'flat':
                        $zusatzCost += $pricing['price'];
                        break;
                    case 'per_piece':
                        // Standard 1 Stück
                        $zusatzCost += $pricing['price'];
                        break;
                }
            }
        }

        return $zusatzCost;
    }

    /**
     * Datei-Upload-Verarbeitung
     */
    private function processUploads() {
        $this->formData['uploaded_files'] = [];

        // Fotos verarbeiten
        if (isset($_FILES['fotos']) && $_FILES['fotos']['error'][0] !== UPLOAD_ERR_NO_FILE) {
            foreach ($_FILES['fotos']['tmp_name'] as $index => $tmpName) {
                if ($_FILES['fotos']['error'][$index] === UPLOAD_ERR_OK) {
                    $uploadedFile = $this->handleFileUpload([
                        'tmp_name' => $tmpName,
                        'name' => $_FILES['fotos']['name'][$index],
                        'size' => $_FILES['fotos']['size'][$index]
                    ], 'foto');

                    if ($uploadedFile) {
                        $this->formData['uploaded_files'][] = $uploadedFile;
                    }
                }
            }
        }

        // Pläne verarbeiten
        if (isset($_FILES['plaene']) && $_FILES['plaene']['error'] === UPLOAD_ERR_OK) {
            $uploadedFile = $this->handleFileUpload([
                'tmp_name' => $_FILES['plaene']['tmp_name'],
                'name' => $_FILES['plaene']['name'],
                'size' => $_FILES['plaene']['size']
            ], 'plan');

            if ($uploadedFile) {
                $this->formData['uploaded_files'][] = $uploadedFile;
            }
        }
    }

    /**
     * Einzelne Datei verarbeiten
     */
    private function handleFileUpload($fileData, $type) {
        // Dateigröße prüfen
        if ($fileData['size'] > 5 * 1024 * 1024) { // 5MB
            error_log("Datei zu groß: {$fileData['name']} ({$fileData['size']} bytes)");
            return null;
        }

        // Dateierweiterung prüfen
        $extension = strtolower(pathinfo($fileData['name'], PATHINFO_EXTENSION));
        $allowedTypes = ['jpg', 'jpeg', 'png', 'pdf'];

        if (!in_array($extension, $allowedTypes)) {
            error_log("Dateitype nicht erlaubt: {$extension}");
            return null;
        }

        // Dateiname generieren
        $filename = $this->angebotId . '_' . $type . '_' . uniqid() . '.' . $extension;
        $targetPath = $this->uploadDir . '/' . $filename;

        // Datei verschieben
        if (move_uploaded_file($fileData['tmp_name'], $targetPath)) {
            return [
                'original_name' => $fileData['name'],
                'filename' => $filename,
                'path' => $targetPath,
                'type' => $type,
                'size' => $fileData['size']
            ];
        } else {
            error_log("Fehler beim Verschieben der Datei: {$fileData['name']}");
            return null;
        }
    }

    /**
     * PDF-Angebot generieren mit Kategorie-Support
     */
    private function generatePDF() {
        try {
            // TCPDF initialisieren
            $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);

            // PDF-Metadaten
            $pdf->SetCreator('Bau GmbH Franke Angebots-Tool v2.0');
            $pdf->SetAuthor($this->config['company']['name']);
            $pdf->SetTitle('Unverbindliches Angebot #' . $this->angebotId);
            $pdf->SetSubject($this->categoryConfig[$this->formData['category']]['name'] . ' Kostenvoranschlag');

            // Header/Footer deaktivieren
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);

            // Seitenränder
            $pdf->SetMargins(15, 15, 15);
            $pdf->SetAutoPageBreak(true, 25);

            // Schriftart
            $pdf->SetFont('dejavusans', '', 10);

            // Erste Seite
            $pdf->AddPage();

            // PDF-Inhalt generieren
            $this->generateEnhancedPDFContent($pdf);

            // PDF speichern
            $filename = $this->angebotId . '.pdf';
            $filePath = $this->pdfDir . '/' . $filename;

            $pdf->Output($filePath, 'F');

            if (DEBUG_MODE) {
                error_log("PDF erstellt: $filePath");
            }

            return $filePath;

        } catch (Exception $e) {
            error_log('PDF Generation Error: ' . $e->getMessage());
            throw new Exception('Fehler bei der PDF-Erstellung: ' . $e->getMessage());
        }
    }

    /**
     * Erweiterten PDF-Inhalt generieren
     */
    private function generateEnhancedPDFContent($pdf) {
        $y = 20;

        // Logo und Firmenadresse
        if (file_exists($this->config['company']['logo'])) {
            $pdf->Image($this->config['company']['logo'], 15, $y, 40);
            $logoHeight = 25;
        } else {
            $logoHeight = 0;
        }

        // Firmenadresse rechts
        $pdf->SetXY(120, $y);
        $pdf->SetFont('dejavusans', 'B', 12);
        $pdf->Cell(0, 6, $this->config['company']['name'], 0, 1, 'R');
        $pdf->SetFont('dejavusans', '', 10);

        $address = $this->config['company']['address'];
        $pdf->SetX(120);
        $pdf->Cell(0, 5, $address['street'], 0, 1, 'R');
        $pdf->SetX(120);
        $pdf->Cell(0, 5, $address['zip'] . ' ' . $address['city'], 0, 1, 'R');
        $pdf->SetX(120);
        $pdf->Cell(0, 5, 'Tel: ' . $this->config['company']['contact']['phone'], 0, 1, 'R');
        $pdf->SetX(120);
        $pdf->Cell(0, 5, $this->config['company']['contact']['email'], 0, 1, 'R');
        $pdf->SetX(120);
        $pdf->Cell(0, 5, $this->config['company']['contact']['web'], 0, 1, 'R');

        $y = max(60, $logoHeight + 30);

        // Empfängeradresse links
        $pdf->SetXY(15, $y);
        $pdf->SetFont('dejavusans', '', 10);
        if ($this->formData['firma']) {
            $pdf->Cell(0, 5, $this->formData['firma'], 0, 1, 'L');
        }
        $pdf->Cell(0, 5, $this->formData['vorname'] . ' ' . $this->formData['nachname'], 0, 1, 'L');
        $pdf->Cell(0, 5, $this->formData['strasse'], 0, 1, 'L');
        $pdf->Cell(0, 5, $this->formData['plz'] . ' ' . $this->formData['ort'], 0, 1, 'L');

        $y += 40;

        // Angebotskopf rechts
        $pdf->SetXY(120, $y);
        $pdf->SetFont('dejavusans', 'B', 10);
        $pdf->Cell(0, 5, 'Angebotsnummer:', 0, 0, 'R');
        $pdf->SetX(160);
        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(0, 5, $this->angebotId, 0, 1, 'R');

        $pdf->SetX(120);
        $pdf->SetFont('dejavusans', 'B', 10);
        $pdf->Cell(0, 5, 'Datum:', 0, 0, 'R');
        $pdf->SetX(160);
        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(0, 5, date('d.m.Y'), 0, 1, 'R');

        $pdf->SetX(120);
        $pdf->SetFont('dejavusans', 'B', 10);
        $pdf->Cell(0, 5, 'Gültig bis:', 0, 0, 'R');
        $pdf->SetX(160);
        $pdf->SetFont('dejavusans', '', 10);
        $validUntil = date('d.m.Y', strtotime('+30 days'));
        $pdf->Cell(0, 5, $validUntil, 0, 1, 'R');

        $y += 25;

        // Angebots-Titel mit Kategorie
        $pdf->SetXY(15, $y);
        $pdf->SetFont('dejavusans', 'B', 16);
        $categoryName = $this->categoryConfig[$this->formData['category']]['name'];
        $objektart = ucfirst($this->formData['objektart']);
        $pdf->Cell(0, 10, "Unverbindliches Angebot - $categoryName", 0, 1, 'L');

        $y += 15;

        // Projektbeschreibung
        $pdf->SetY($y);
        $pdf->SetFont('dejavusans', '', 10);
        $projektText = "Sehr geehrte Damen und Herren,\n\nvielen Dank für Ihre Anfrage über unser Online-Angebots-Tool. Gerne unterbreiten wir Ihnen folgendes unverbindliche Angebot für Ihr " . strtolower($categoryName) . "-Projekt:";
        $pdf->MultiCell(0, 6, $projektText, 0, 'L');

        $y = $pdf->GetY() + 10;

        // Projektdetails
        $this->generateProjectDetails($pdf, $y);

        // Leistungstabelle
        $y = $pdf->GetY() + 10;
        $pdf->SetY($y);
        $this->generateEnhancedPDFTable($pdf);

        $y = $pdf->GetY() + 15;

        // Wichtige Hinweise
        $pdf->SetY($y);
        $pdf->SetFont('dejavusans', 'B', 12);
        $pdf->Cell(0, 8, 'Wichtige Hinweise:', 0, 1, 'L');

        $pdf->SetFont('dejavusans', '', 9);
        $hinweise = "• Dieses Angebot ist unverbindlich und basiert auf Ihren Online-Angaben\n";
        $hinweise .= "• Preise sind Schätzwerte (±{$this->priceData['confidence']}%)\n";
        $hinweise .= "• Endgültige Preise werden nach Besichtigung vor Ort bestätigt\n";
        $hinweise .= "• Gültigkeit: 30 Tage ab Ausstellungsdatum\n";
        $hinweise .= "• Alle Preise verstehen sich inklusive 19% MwSt.\n";
        $hinweise .= "• Es gelten unsere AGB (verfügbar auf {$this->config['company']['contact']['web']})\n";
        $hinweise .= "• Bei Fragen erreichen Sie uns unter: {$this->config['company']['contact']['phone']}";

        $pdf->MultiCell(0, 5, $hinweise, 0, 'L');

        // Footer
        if ($pdf->GetY() < 250) {
            $pdf->SetY(270);
        } else {
            $pdf->AddPage();
            $pdf->SetY(20);
        }

        $pdf->SetFont('dejavusans', '', 8);
        $footer = $this->config['company']['name'] . " | " .
            $this->config['company']['address']['street'] . " | " .
            $this->config['company']['address']['zip'] . " " . $this->config['company']['address']['city'];
        $footer .= " | Tel: " . $this->config['company']['contact']['phone'] . " | " . $this->config['company']['contact']['email'];
        if (!empty($this->config['company']['legal']['ust_id'])) {
            $footer .= " | USt-ID: " . $this->config['company']['legal']['ust_id'];
        }

        $pdf->MultiCell(0, 4, $footer, 0, 'C');
    }

    /**
     * Projektdetails im PDF
     */
    private function generateProjectDetails($pdf, $y) {
        $pdf->SetY($y);
        $pdf->SetFont('dejavusans', 'B', 12);
        $pdf->Cell(0, 8, 'Projektdetails:', 0, 1, 'L');

        $pdf->SetFont('dejavusans', '', 9);
        $details = "Kategorie: " . $this->categoryConfig[$this->formData['category']]['name'] . "\n";
        $details .= "Projektart: " . ucfirst($this->formData['objektart']) . "\n";
        $details .= "Fläche: " . number_format($this->formData['flaeche_num'], 1, ',', '.') . " m²\n";

        if (!empty($this->formData['projektadresse'])) {
            $details .= "Projektadresse: " . $this->formData['projektadresse'] . "\n";
        }

        $details .= "Belastung: " . ucfirst($this->formData['beanspruchung']) . "\n";

        if (!empty($this->formData['ausfuehrungszeitraum'])) {
            $details .= "Gewünschter Zeitraum: " . ucfirst(str_replace('-', ' ', $this->formData['ausfuehrungszeitraum'])) . "\n";
        }

        $pdf->MultiCell(0, 5, $details, 0, 'L');
    }

    /**
     * Erweiterte Leistungstabelle für PDF
     */
    private function generateEnhancedPDFTable($pdf) {
        // Tabellenkopf
        $pdf->SetFont('dejavusans', 'B', 10);
        $pdf->SetFillColor(240, 240, 240);

        $pdf->Cell(80, 8, 'Leistungsbeschreibung', 1, 0, 'L', 1);
        $pdf->Cell(25, 8, 'Menge', 1, 0, 'C', 1);
        $pdf->Cell(20, 8, 'Einheit', 1, 0, 'C', 1);
        $pdf->Cell(30, 8, 'Einzelpreis', 1, 0, 'R', 1);
        $pdf->Cell(30, 8, 'Gesamt', 1, 1, 'R', 1);

        $pdf->SetFont('dejavusans', '', 9);
        $pdf->SetFillColor(255, 255, 255);

        $flaeche = $this->formData['flaeche_num'];
        $categoryName = $this->categoryConfig[$this->formData['category']]['name'];

        // Hauptleistung
        $materialName = $this->getMaterialDisplayName();
        $beschreibung = "$materialName für $categoryName";

        if (!empty($this->formData['verlegemuster']) && $this->formData['verlegemuster'] !== 'reihenverband') {
            $beschreibung .= " im " . ucfirst($this->formData['verlegemuster']);
        }

        $materialEinzelpreis = $flaeche > 0 ? $this->priceData['material'] / $flaeche : 0;

        $pdf->Cell(80, 7, $beschreibung, 1, 0, 'L');
        $pdf->Cell(25, 7, number_format($flaeche, 1, ',', '.'), 1, 0, 'C');
        $pdf->Cell(20, 7, 'm²', 1, 0, 'C');
        $pdf->Cell(30, 7, $this->formatPrice($materialEinzelpreis), 1, 0, 'R');
        $pdf->Cell(30, 7, $this->formatPrice($this->priceData['material']), 1, 1, 'R');

        // Arbeitskosten (separate Zeile)
        if ($this->priceData['labor'] > 0) {
            $laborEinzelpreis = $this->priceData['labor'] / $flaeche;
            $pdf->Cell(80, 7, 'Arbeitskosten inkl. Montage', 1, 0, 'L');
            $pdf->Cell(25, 7, number_format($flaeche, 1, ',', '.'), 1, 0, 'C');
            $pdf->Cell(20, 7, 'm²', 1, 0, 'C');
            $pdf->Cell(30, 7, $this->formatPrice($laborEinzelpreis), 1, 0, 'R');
            $pdf->Cell(30, 7, $this->formatPrice($this->priceData['labor']), 1, 1, 'R');
        }

        // Unterbau
        if ($this->priceData['unterbau'] > 0) {
            $unterbauPreis = $this->priceData['unterbau'] / $flaeche;
            $unterbauText = 'Unterbau inkl. Verdichtung';

            $abgrabung = intval($this->formData['abgrabungstiefe']) ?: 30;
            $unterbauText .= " (Abgrabung {$abgrabung}cm)";

            $pdf->Cell(80, 7, $unterbauText, 1, 0, 'L');
            $pdf->Cell(25, 7, number_format($flaeche, 1, ',', '.'), 1, 0, 'C');
            $pdf->Cell(20, 7, 'm²', 1, 0, 'C');
            $pdf->Cell(30, 7, $this->formatPrice($unterbauPreis), 1, 0, 'R');
            $pdf->Cell(30, 7, $this->formatPrice($this->priceData['unterbau']), 1, 1, 'R');
        }

        // Zusatzleistungen
        if ($this->priceData['zusatz'] > 0) {
            $zusatzTexte = $this->getZusatzleistungenTexte();

            foreach ($this->formData['zusatzleistungen'] as $zusatz) {
                if (isset($zusatzTexte[$zusatz])) {
                    $pdf->Cell(80, 7, $zusatzTexte[$zusatz], 1, 0, 'L');
                    $pdf->Cell(25, 7, 'pauschal', 1, 0, 'C');
                    $pdf->Cell(20, 7, '', 1, 0, 'C');
                    $pdf->Cell(30, 7, '', 1, 0, 'R');
                    $pdf->Cell(30, 7, 'inkl.', 1, 1, 'R');
                }
            }

            // Zusatzleistungen Summe
            $pdf->Cell(80, 7, 'Zusatzleistungen gesamt', 1, 0, 'L');
            $pdf->Cell(25, 7, '', 1, 0, 'C');
            $pdf->Cell(20, 7, '', 1, 0, 'C');
            $pdf->Cell(30, 7, '', 1, 0, 'R');
            $pdf->Cell(30, 7, $this->formatPrice($this->priceData['zusatz']), 1, 1, 'R');
        }

        // Anfahrt & Baustelleneinrichtung
        if ($this->priceData['anfahrt'] > 0) {
            $pdf->Cell(80, 7, 'Anfahrt & Baustelleneinrichtung', 1, 0, 'L');
            $pdf->Cell(25, 7, 'pauschal', 1, 0, 'C');
            $pdf->Cell(20, 7, '', 1, 0, 'C');
            $pdf->Cell(30, 7, $this->formatPrice($this->priceData['anfahrt']), 1, 0, 'R');
            $pdf->Cell(30, 7, $this->formatPrice($this->priceData['anfahrt']), 1, 1, 'R');
        }

        // Zwischensumme
        $pdf->SetFont('dejavusans', 'B', 9);
        $pdf->Cell(155, 8, 'Zwischensumme (netto)', 1, 0, 'R', 1);
        $pdf->Cell(30, 8, $this->formatPrice($this->priceData['subtotal']), 1, 1, 'R', 1);

        // MwSt.
        $pdf->Cell(155, 7, 'zzgl. 19% MwSt.', 1, 0, 'R');
        $pdf->Cell(30, 7, $this->formatPrice($this->priceData['tax']), 1, 1, 'R');

        // Gesamtsumme
        $pdf->SetFont('dejavusans', 'B', 11);
        $pdf->SetFillColor(0, 100, 0);
        $pdf->SetTextColor(255, 255, 255);
        $pdf->Cell(155, 10, 'GESAMTSUMME (brutto)', 1, 0, 'R', 1);
        $pdf->Cell(30, 10, $this->formatPrice($this->priceData['total']), 1, 1, 'R', 1);

        // Farben zurücksetzen
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetFillColor(255, 255, 255);
    }

    /**
     * Material-Anzeigename für PDF
     */
    private function getMaterialDisplayName() {
        $materialNames = [
            'betonpflaster' => 'Betonpflaster',
            'naturstein' => 'Naturstein',
            'platten' => 'Platten',
            'rasengitter' => 'Rasengitter',
            'asphalt_standard' => 'Standard-Asphalt',
            'asphalt_premium' => 'Premium-Asphalt',
            'beton_c25' => 'Beton C25/30',
            'beton_c35' => 'Beton C35/45',
            'kies' => 'Kiesbelag',
            'rindenmulch' => 'Rindenmulch',
            'nach_bedarf' => 'Material nach Bedarf'
        ];

        $materialKey = $this->formData['pflasterart'];
        $materialName = $materialNames[$materialKey] ?? 'Standard-Material';

        if ($this->formData['qualitaet'] === 'premium') {
            $materialName .= ' (Premium-Qualität)';
        }

        return $materialName;
    }

    /**
     * Zusatzleistungen-Texte für PDF
     */
    private function getZusatzleistungenTexte() {
        return [
            // Pflaster
            'randsteine' => 'Randsteine setzen',
            'drainage' => 'Drainage/Einlauf',
            'unterbau_verstaerkung' => 'Unterbau verstärken',
            'entsorgung' => 'Altbelag entsorgen',
            'treppen' => 'Stufen/Treppen',
            'anschluesse' => 'Anschlüsse/Übergänge',
            // Asphalt
            'unterbau_asphalt' => 'Tragschicht verstärken',
            'markierung' => 'Fahrbahnmarkierung',
            'entsorgung_asphalt' => 'Alten Asphalt entsorgen',
            'drainage_asphalt' => 'Entwässerung',
            'randbereich' => 'Randbereiche befestigen',
            // Beton
            'bewehrung' => 'Bewehrung einlegen',
            'schalung' => 'Schalung stellen',
            'daemmung' => 'Dämmung unter Platte',
            'oberflaeche' => 'Oberfläche glätten',
            'isolierung' => 'Feuchtigkeitssperre',
            // Garten
            'drainage_rohr' => 'Drainage-Rohre',
            'kies_unterbau' => 'Kies-Unterbau',
            'vlies' => 'Unkrautvlies',
            'pflanzung' => 'Bepflanzung',
            'bewaesserung' => 'Bewässerung',
            // Sonstiges
            'beratung' => 'Ausführliche Beratung',
            'planung' => 'Detailplanung',
            'gutachten' => 'Kostengutachten'
        ];
    }

    /**
     * PDF-URL für Frontend generieren
     */
    private function generatePDFUrl($filename) {
        return rtrim($this->pdfUrlPath, '/') . '/' . $filename;
    }

    /**
     * Erweiterte E-Mail-Funktionen
     */
    private function sendEmails($pdfPath) {
        if (DEVELOPMENT_MODE) {
            $this->simulateEmails($pdfPath);
        } else {
            $this->sendCustomerEmail($pdfPath);
            $this->sendCompanyEmail($pdfPath);
        }
    }

    /**
     * E-Mail-Simulation für Development
     */
    private function simulateEmails($pdfPath) {
        $timestamp = date('Y-m-d H:i:s');
        $logDir = dirname(__FILE__) . '/email-logs';

        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $logFile = $logDir . '/email_log_' . $this->angebotId . '.html';

        $emailLog = "<!DOCTYPE html><html><head><title>E-Mail Log - {$this->angebotId}</title><style>body{font-family:Arial,sans-serif;margin:20px;}</style></head><body>";
        $emailLog .= "<h1>E-Mail Simulation - $timestamp</h1>";
        $emailLog .= "<h2>Angebot: {$this->angebotId}</h2>";
        $emailLog .= "<p><strong>Kategorie:</strong> " . $this->categoryConfig[$this->formData['category']]['name'] . "</p>";
        $emailLog .= "<p><strong>Kunde:</strong> {$this->formData['vorname']} {$this->formData['nachname']} ({$this->formData['email']})</p>";
        $emailLog .= "<p><strong>Projekt:</strong> {$this->formData['objektart']} - {$this->formData['flaeche_num']} m²</p>";
        $emailLog .= "<p><strong>Material:</strong> " . $this->getMaterialDisplayName() . "</p>";
        $emailLog .= "<p><strong>Gesamtpreis:</strong> " . $this->formatPrice($this->priceData['total']) . "</p>";
        $emailLog .= "<p><strong>PDF:</strong> " . basename($pdfPath) . "</p>";
        $emailLog .= "<p><strong>PDF-URL:</strong> " . $this->generatePDFUrl(basename($pdfPath)) . "</p>";

        $emailLog .= "<h3>1. E-Mail an Kunden ({$this->formData['email']})</h3>";
        $emailLog .= "<div style='border:1px solid #ccc; padding:15px; background:#f9f9f9;'>";
        $emailLog .= $this->getEnhancedCustomerEmailTemplate();
        $emailLog .= "</div>";

        $emailLog .= "<h3>2. E-Mail an Firma ({$this->config['email']['company_email']})</h3>";
        $emailLog .= "<div style='border:1px solid #ccc; padding:15px; background:#f0f8ff;'>";
        $emailLog .= $this->getEnhancedCompanyEmailTemplate();
        $emailLog .= "</div>";

        $emailLog .= "</body></html>";

        file_put_contents($logFile, $emailLog);
        error_log("E-Mail-Simulation gespeichert: $logFile");
    }

    /**
     * Erweiterte Kunden-E-Mail Template
     */
    private function getEnhancedCustomerEmailTemplate() {
        $categoryName = $this->categoryConfig[$this->formData['category']]['name'];
        $projektart = ucfirst($this->formData['objektart']);
        $materialName = $this->getMaterialDisplayName();
        $gesamtpreis = $this->formatPrice($this->priceData['total']);
        $confidence = $this->priceData['confidence'];

        return '
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Ihr ' . $categoryName . '-Angebot von der Bau GmbH Franke</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 3px solid #006400; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { color: #006400; font-size: 24px; font-weight: bold; }
        .category-badge { background: #006400; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; display: inline-block; margin: 10px 0; }
        .angebot-box { background: #f0f8f0; border-left: 5px solid #006400; padding: 20px; margin: 20px 0; }
        .price-highlight { background: #006400; color: white; padding: 15px; text-align: center; border-radius: 8px; }
        .pdf-section { background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        h2 { color: #006400; }
        .contact-info { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px; }
        .btn { background: #006400; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">' . $this->config['company']['name'] . '</div>
            <p>Ihr regionaler Baupartner seit 1991</p>
            <div class="category-badge">' . $categoryName . '</div>
        </div>
        
        <h2>Ihr unverbindliches ' . $categoryName . '-Angebot ist da!</h2>
        
        <p>Sehr geehrte/r ' . $this->formData['vorname'] . ' ' . $this->formData['nachname'] . ',</p>
        
        <p>vielen Dank für Ihr Interesse an unseren ' . strtolower($categoryName) . '. Wie gewünscht haben wir für Sie ein unverbindliches Angebot erstellt.</p>
        
        <div class="angebot-box">
            <h3>Ihr ' . $categoryName . '-Projekt im Überblick:</h3>
            <p><strong>Kategorie:</strong> ' . $categoryName . '</p>
            <p><strong>Projekt:</strong> ' . $projektart . '</p>
            <p><strong>Fläche:</strong> ' . number_format($this->formData['flaeche_num'], 1, ',', '.') . ' m²</p>
            <p><strong>Material:</strong> ' . $materialName . '</p>
            <p><strong>Angebotsnummer:</strong> ' . $this->angebotId . '</p>
            <p><strong>Gültig bis:</strong> ' . date('d.m.Y', strtotime('+30 days')) . '</p>
        </div>
        
        <div class="price-highlight">
            <h3 style="color: white; margin: 0;">Geschätzte Gesamtsumme: ' . $gesamtpreis . '</h3>
            <p style="color: white; margin: 5px 0 0 0; font-size: 14px;">Schätzgenauigkeit: ±' . $confidence . '%</p>
        </div>
        
        <div class="pdf-section">
            <h3>🎉 Ihr Angebot ist sofort verfügbar!</h3>
            <p>Sie können Ihr detailliertes PDF-Angebot jetzt direkt in unserem Tool ansehen oder herunterladen.</p>
            <a href="' . $this->generatePDFUrl(basename($pdfPath ?? '')) . '" class="btn">PDF-Angebot öffnen</a>
        </div>
        
        <p><strong>Wichtig:</strong> Dieses Angebot ist unverbindlich und basiert auf Ihren Online-Angaben. Die endgültigen Preise werden nach einer kostenlosen Besichtigung vor Ort bestätigt.</p>
        
        <h3>Wie geht es weiter?</h3>
        <p>Wir melden uns innerhalb von 24 Stunden bei Ihnen für:</p>
        <ul>
            <li>Klärung offener Fragen zu Ihrem ' . strtolower($categoryName) . '-Projekt</li>
            <li>Terminvereinbarung für eine kostenlose Besichtigung vor Ort</li>
            <li>Detailplanung und finales Angebot</li>
        </ul>
        
        ' . ($this->formData['rueckruf'] ? '<p><strong>✓ Sie haben einen Rückruf gewünscht</strong> - wir rufen Sie zeitnah an!</p>' : '') . '
        
        <div class="contact-info">
            <h3>Bei Fragen stehen wir gerne zur Verfügung:</h3>
            <p><strong>Telefon:</strong> ' . $this->config['company']['contact']['phone'] . '</p>
            <p><strong>E-Mail:</strong> ' . $this->config['company']['contact']['email'] . '</p>
            <p><strong>Web:</strong> ' . $this->config['company']['contact']['web'] . '</p>
        </div>
        
        <p>Vielen Dank für Ihr Vertrauen!</p>
        <p>Ihr Team der ' . $this->config['company']['name'] . '</p>
    </div>
</body>
</html>';
    }

    /**
     * Erweiterte Firmen-E-Mail Template
     */
    private function getEnhancedCompanyEmailTemplate() {
        $categoryName = $this->categoryConfig[$this->formData['category']]['name'];
        $projektart = ucfirst($this->formData['objektart']);
        $materialName = $this->getMaterialDisplayName();
        $gesamtpreis = $this->formatPrice($this->priceData['total']);

        $zusatzleistungen = empty($this->formData['zusatzleistungen']) ? 'Keine' :
            implode(', ', array_map(function($key) {
                $texte = $this->getZusatzleistungenTexte();
                return $texte[$key] ?? $key;
            }, $this->formData['zusatzleistungen']));

        return '
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Neue ' . $categoryName . '-Anfrage</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; color: #006400; font-weight: bold; }
        .highlight { background-color: #e8f4f8; }
        .category-highlight { background-color: #006400; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
        h1 { color: #006400; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Neue ' . $categoryName . '-Anfrage - ' . $this->angebotId . '</h1>
        
        <div class="category-highlight">
            <h2 style="color: white; margin: 0;">Kategorie: ' . $categoryName . '</h2>
            <p style="color: white; margin: 5px 0 0 0;">Eingegangen am: ' . date('d.m.Y H:i:s') . '</p>
        </div>
        
        <h2>Kundendaten:</h2>
        <table>
            <tr><th>Name</th><td>' . $this->formData['vorname'] . ' ' . $this->formData['nachname'] . '</td></tr>
            <tr><th>E-Mail</th><td>' . $this->formData['email'] . '</td></tr>
            <tr><th>Telefon</th><td>' . $this->formData['telefon'] . '</td></tr>
            <tr><th>Firma</th><td>' . ($this->formData['firma'] ?: '-') . '</td></tr>
            <tr><th>Adresse</th><td>' . $this->formData['strasse'] . '<br>' . $this->formData['plz'] . ' ' . $this->formData['ort'] . '</td></tr>
            <tr><th>Rückruf gewünscht</th><td>' . ($this->formData['rueckruf'] ? 'Ja' : 'Nein') . '</td></tr>
        </table>
        
        <h2>Projektdaten:</h2>
        <table>
            <tr><th>Kategorie</th><td>' . $categoryName . '</td></tr>
            <tr><th>Projektart</th><td>' . $projektart . '</td></tr>
            <tr><th>Fläche</th><td>' . number_format($this->formData['flaeche_num'], 1, ',', '.') . ' m²</td></tr>
            <tr><th>Projektadresse</th><td>' . ($this->formData['projektadresse'] ?: 'Wie Kundenadresse') . '</td></tr>
            <tr><th>Material</th><td>' . $materialName . '</td></tr>
            <tr><th>Qualität</th><td>' . ucfirst($this->formData['qualitaet'] ?: 'Standard') . '</td></tr>
            <tr><th>Verlegemuster</th><td>' . ucfirst($this->formData['verlegemuster'] ?: 'Reihenverband') . '</td></tr>
            <tr><th>Beanspruchung</th><td>' . ucfirst($this->formData['beanspruchung']) . '</td></tr>
            <tr><th>Ausführungszeitraum</th><td>' . ($this->formData['ausfuehrungszeitraum'] ?: 'Flexibel') . '</td></tr>
        </table>
        
        <h2>Zusätzliche Optionen:</h2>
        <table>
            <tr><th>Zusatzleistungen</th><td>' . $zusatzleistungen . '</td></tr>
            <tr><th>Abgrabungstiefe</th><td>' . ($this->formData['abgrabungstiefe'] ?: '30') . ' cm</td></tr>
            <tr><th>Bodenverhältnisse</th><td>' . ucfirst($this->formData['bodenbeschaffenheit'] ?: 'Normal') . '</td></tr>
            <tr><th>Hangneigung</th><td>' . ucfirst($this->formData['hangneigung'] ?: 'Eben') . '</td></tr>
            <tr><th>Erreichbarkeit</th><td>' . ucfirst($this->formData['erreichbarkeit'] ?: 'Gut') . '</td></tr>
        </table>
        
        <h2>Preiskalkulation:</h2>
        <table class="highlight">
            <tr><th>Material</th><td>' . $this->formatPrice($this->priceData['material']) . '</td></tr>
            <tr><th>Arbeitskosten</th><td>' . $this->formatPrice($this->priceData['labor']) . '</td></tr>
            <tr><th>Unterbau</th><td>' . $this->formatPrice($this->priceData['unterbau']) . '</td></tr>
            <tr><th>Zusatzleistungen</th><td>' . $this->formatPrice($this->priceData['zusatz']) . '</td></tr>
            <tr><th>Anfahrt & Einrichtung</th><td>' . $this->formatPrice($this->priceData['anfahrt']) . '</td></tr>
            <tr><th style="font-size: 18px; font-weight: bold; color: #006400;">Gesamtsumme (brutto)</th><td style="font-size: 18px; font-weight: bold; color: #006400;">' . $gesamtpreis . '</td></tr>
            <tr><th>Schätzgenauigkeit</th><td>±' . $this->priceData['confidence'] . '%</td></tr>
        </table>
        
        ' . (!empty($this->formData['uploaded_files']) ? '
        <h2>Hochgeladene Dateien:</h2>
        <ul>
            ' . implode('', array_map(function($file) {
                    return '<li>' . $file['original_name'] . ' (' . round($file['size']/1024, 1) . ' KB)</li>';
                }, $this->formData['uploaded_files'])) . '
        </ul>
        ' : '') . '
        
        <h2>Nächste Schritte:</h2>
        <p>1. Kundenanfrage prüfen und bei Bedarf zeitnah zurückrufen<br>
        2. Terminvereinbarung für kostenlose Vor-Ort-Besichtigung<br>
        3. Detailplanung und finales Angebot für ' . strtolower($categoryName) . ' erstellen<br>
        4. PDF-Angebot wurde automatisch an den Kunden versendet</p>
        
        <p><strong>PDF-Angebot:</strong> <a href="' . $this->generatePDFUrl(basename($pdfPath ?? '')) . '">' . $this->angebotId . '.pdf</a></p>
    </div>
</body>
</html>';
    }

    /**
     * Erweiterte Hilfsfunktionen
     */
    private function calculateConfidence() {
        $confidence = 15; // Basis

        // Uploads reduzieren Unsicherheit
        if (!empty($this->formData['uploaded_files'])) {
            $confidence -= 5;
        }

        // Viele Zusatzleistungen erhöhen Unsicherheit
        if (count($this->formData['zusatzleistungen']) > 3) {
            $confidence += 5;
        }

        // Schwierige Bedingungen erhöhen Unsicherheit
        if ($this->formData['bodenbeschaffenheit'] === 'fels' ||
            $this->formData['hangneigung'] === 'stark' ||
            $this->formData['erreichbarkeit'] === 'schwierig') {
            $confidence += 10;
        }

        // Kategorie-spezifische Anpassungen
        switch ($this->formData['category']) {
            case 'sonstiges':
                $confidence += 10;
                break;
            case 'beton':
                $confidence += 5;
                break;
            case 'garten':
                $confidence -= 3;
                break;
        }

        return max(10, min(25, $confidence));
    }

    private function generateAngebotId() {
        return 'A' . date('Y') . '-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
    }

    private function sanitizeInput($input) {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }

    private function formatPrice($amount) {
        return number_format($amount, 2, ',', '.') . ' €';
    }

    private function ensureDirectories() {
        $dirs = [$this->uploadDir, $this->pdfDir, dirname(__FILE__) . '/email-logs'];
        foreach ($dirs as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }

    private function getErrorCode($message) {
        if (strpos($message, 'Spam') !== false) return 'SPAM_DETECTED';
        if (strpos($message, 'Rate Limit') !== false) return 'RATE_LIMIT';
        if (strpos($message, 'Pflichtfeld') !== false) return 'VALIDATION_ERROR';
        if (strpos($message, 'Kategorie') !== false) return 'INVALID_CATEGORY';
        if (strpos($message, 'Material') !== false) return 'INVALID_MATERIAL';
        if (strpos($message, 'E-Mail') !== false) return 'INVALID_EMAIL';
        if (strpos($message, 'PDF') !== false) return 'PDF_GENERATION_ERROR';
        return 'GENERAL_ERROR';
    }

    private function sendJsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Placeholder-Funktionen (für zukünftige Implementierung)
     */
    private function sendCustomerEmail($pdfPath) {
        // TODO: Implementierung für Production
        error_log("Kunden-E-Mail würde gesendet werden: " . $this->formData['email']);
    }

    private function sendCompanyEmail($pdfPath) {
        // TODO: Implementierung für Production
        error_log("Firmen-E-Mail würde gesendet werden: " . $this->config['email']['company_email']);
    }

    private function saveToDatabase($pdfPath) {
        // TODO: Datenbankintegration
        error_log("Datenbankintegration für Angebot: " . $this->angebotId);
    }
}

// Hauptverarbeitung
try {
    $angebotsTool = new AngebotsTool();
    $angebotsTool->processRequest();
} catch (Exception $e) {
    error_log('Critical AngebotsTool Error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
        'title' => 'Systemfehler',
        'error_code' => 'SYSTEM_ERROR'
    ], JSON_UNESCAPED_UNICODE);
}
?>