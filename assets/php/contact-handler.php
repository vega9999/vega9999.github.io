<?php
/**
 * Universeller Kontaktformular-Handler für Bau GmbH Franke
 * Verarbeitet Kontaktanfragen von verschiedenen Website-Seiten
 * Gibt JSON-Responses zurück für Toast-Nachrichten
 *
 * @author Bau GmbH Franke
 * @version 2.2.0 - JSON Response für Toast-System
 */

// Fehlerberichterstattung für Development (in Production auskommentieren)
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

// Security Headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// JSON Response Header
header('Content-Type: application/json; charset=utf-8');

// Konfiguration
$config = [
    'hr_email' => 'info@baufranke.de',
    'from_email' => 'noreply@baufranke.de',
    'from_name' => 'Bau GmbH Franke Website'
];

// Seiten-spezifische Konfigurationen
$page_configs = [
    'index' => [
        'subject_prefix' => 'Allgemeine Anfrage',
        'hr_email' => 'info@baufranke.de',
        'service_name' => 'Allgemeine Leistungen'
    ],
    'tiefbau' => [
        'subject_prefix' => 'Tiefbau-Anfrage',
        'hr_email' => 'tiefbau@baufranke.de',
        'service_name' => 'Tiefbau'
    ],
    'hochbau' => [
        'subject_prefix' => 'Hochbau-Anfrage',
        'hr_email' => 'hochbau@baufranke.de',
        'service_name' => 'Hochbau'
    ],
    'strassenbau' => [
        'subject_prefix' => 'Straßenbau-Anfrage',
        'hr_email' => 'strassenbau@baufranke.de',
        'service_name' => 'Straßenbau'
    ],
    'bauvermessung' => [
        'subject_prefix' => 'Vermessungsanfrage',
        'hr_email' => 'vermessung@baufranke.de',
        'service_name' => 'Bauvermessung'
    ],
    'landwirtschaftsbau' => [
        'subject_prefix' => 'Landwirtschaftsbau-Anfrage',
        'hr_email' => 'landwirtschaft@baufranke.de',
        'service_name' => 'Landwirtschaftsbau'
    ],
    'materialverkauf' => [
        'subject_prefix' => 'Materialbestellung',
        'hr_email' => 'material@baufranke.de',
        'service_name' => 'Materialverkauf'
    ],
    'leistungen' => [
        'subject_prefix' => 'Leistungsanfrage',
        'hr_email' => 'info@baufranke.de',
        'service_name' => 'Alle Leistungen'
    ],
    'referenzen' => [
        'subject_prefix' => 'Projektanfrage',
        'hr_email' => 'projekte@baufranke.de',
        'service_name' => 'Projektberatung'
    ],
    'kontakt' => [
        'subject_prefix' => 'Kontaktanfrage',
        'hr_email' => 'info@baufranke.de',
        'service_name' => 'Kontakt & Beratung'
    ],
    'ueber-uns' => [
        'subject_prefix' => 'Unternehmensanfrage',
        'hr_email' => 'info@baufranke.de',
        'service_name' => 'Unternehmensberatung'
    ]
];

class KontaktHandler {
    private $config;
    private $page_config;
    private $errors = [];
    private $page_type;

    public function __construct($config, $page_configs) {
        $this->config = $config;
        $this->page_type = $this->detectPageType();
        $this->page_config = $page_configs[$this->page_type] ?? $page_configs['index'];
    }

    /**
     * Hauptverarbeitungslogik mit JSON Response
     */
    public function handleSubmission() {
        try {
            // Sicherheitsprüfungen
            if (!$this->validateSecurity()) {
                throw new Exception('Sicherheitsprüfung fehlgeschlagen');
            }

            // Formulardaten validieren
            $data = $this->validateFormData();

            // E-Mails versenden
            $this->sendEmails($data);

            // Erfolg - JSON Response
            $this->sendJsonResponse([
                'success' => true,
                'message' => $this->getSuccessMessage($data['page_type']),
                'title' => $this->getSuccessTitle($data['page_type']),
                'page_type' => $data['page_type'],
                'service_name' => $data['service_name']
            ]);

        } catch (Exception $e) {
            error_log('Kontakt Error: ' . $e->getMessage());

            // Fehler - JSON Response
            $this->sendJsonResponse([
                'success' => false,
                'message' => $e->getMessage(),
                'title' => 'Fehler beim Senden',
                'error_code' => $this->getErrorCode($e->getMessage())
            ], 400);
        }
    }

    /**
     * Erfolgs-Nachricht basierend auf Seitentyp
     */
    private function getSuccessMessage($pageType) {
        $messages = [
            'materialverkauf' => 'Ihre Materialanfrage wurde erfolgreich übermittelt. Wir erstellen Ihnen ein unverbindliches Angebot und melden uns innerhalb von 24 Stunden mit Preisen und Verfügbarkeit.',
            'karriere' => 'Ihre Bewerbung wurde erfolgreich übermittelt. Wir prüfen Ihre Unterlagen sorgfältig und melden uns innerhalb von 5 Werktagen bei Ihnen.',
            'bauvermessung' => 'Ihre Vermessungsanfrage wurde erfolgreich gesendet. Wir prüfen den Umfang und erstellen Ihnen ein Angebot. Sie erhalten innerhalb von 24 Stunden eine Rückmeldung.',
            'tiefbau' => 'Ihre Tiefbau-Anfrage wurde erfolgreich gesendet. Wir prüfen Ihr Projekt und melden uns innerhalb von 24 Stunden für ein persönliches Gespräch.',
            'hochbau' => 'Ihre Hochbau-Anfrage wurde erfolgreich gesendet. Wir freuen uns auf Ihr Projekt und melden uns innerhalb von 24 Stunden für eine Beratung.',
            'strassenbau' => 'Ihre Straßenbau-Anfrage wurde erfolgreich gesendet. Wir prüfen die Projektdetails und melden uns innerhalb von 24 Stunden.',
            'landwirtschaftsbau' => 'Ihre Landwirtschaftsbau-Anfrage wurde erfolgreich gesendet. Wir besprechen gerne Ihr Bauvorhaben und melden uns innerhalb von 24 Stunden.',
            'kontakt' => 'Ihre Nachricht wurde erfolgreich gesendet. Wir bearbeiten Ihre Anfrage mit hoher Priorität und melden uns zeitnah bei Ihnen.',
            'default' => 'Ihre Anfrage wurde erfolgreich gesendet. Wir melden uns innerhalb von 24 Stunden bei Ihnen. Bei dringenden Anliegen erreichen Sie uns telefonisch unter 035841-3190.'
        ];

        return $messages[$pageType] ?? $messages['default'];
    }

    /**
     * Erfolgs-Titel basierend auf Seitentyp
     */
    private function getSuccessTitle($pageType) {
        $titles = [
            'materialverkauf' => 'Materialanfrage gesendet',
            'karriere' => 'Bewerbung eingegangen',
            'bauvermessung' => 'Vermessungsanfrage gesendet',
            'tiefbau' => 'Tiefbau-Anfrage gesendet',
            'hochbau' => 'Hochbau-Anfrage gesendet',
            'strassenbau' => 'Straßenbau-Anfrage gesendet',
            'landwirtschaftsbau' => 'Landwirtschaftsbau-Anfrage gesendet',
            'kontakt' => 'Nachricht gesendet',
            'default' => 'Anfrage gesendet'
        ];

        return $titles[$pageType] ?? $titles['default'];
    }

    /**
     * Error Code für bessere Fehlerbehandlung
     */
    private function getErrorCode($message) {
        if (strpos($message, 'Spam erkannt') !== false) return 'SPAM_DETECTED';
        if (strpos($message, 'Rate Limit') !== false) return 'RATE_LIMIT';
        if (strpos($message, 'Pflichtfeld') !== false) return 'VALIDATION_ERROR';
        if (strpos($message, 'E-Mail') !== false) return 'INVALID_EMAIL';
        if (strpos($message, 'Datenschutz') !== false) return 'PRIVACY_NOT_ACCEPTED';

        return 'GENERAL_ERROR';
    }

    /**
     * JSON Response senden
     */
    private function sendJsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Seitentyp erkennen
     */
    private function detectPageType() {
        // Aus HTTP_REFERER oder POST-Parameter
        if (!empty($_POST['page_type'])) {
            return $_POST['page_type'];
        }

        if (!empty($_SERVER['HTTP_REFERER'])) {
            $referer = $_SERVER['HTTP_REFERER'];
            foreach (['tiefbau', 'hochbau', 'strassenbau', 'bauvermessung', 'landwirtschaftsbau', 'materialverkauf', 'leistungen', 'referenzen', 'kontakt', 'ueber-uns', 'karriere'] as $page) {
                if (strpos($referer, $page) !== false) {
                    return $page;
                }
            }
        }

        return 'index';
    }

    /**
     * Sicherheitsprüfungen
     */
    private function validateSecurity() {
        // Honeypot-Check
        if (!empty($_POST['website'])) {
            throw new Exception('Spam erkannt');
        }

        // Rate-Limiting
        $ip = $_SERVER['REMOTE_ADDR'];
        $rate_limit_file = sys_get_temp_dir() . '/kontakt_' . md5($ip);

        if (file_exists($rate_limit_file)) {
            $last_submission = filemtime($rate_limit_file);
            if (time() - $last_submission < 60) {
                throw new Exception('Zu viele Anfragen. Bitte warten Sie eine Minute.');
            }
        }

        touch($rate_limit_file);
        return true;
    }

    /**
     * Formulardaten validieren
     */
    private function validateFormData() {
        $required_fields = ['vorname', 'nachname', 'email', 'nachricht'];
        $data = [];

        foreach ($required_fields as $field) {
            if (empty($_POST[$field])) {
                throw new Exception("Pflichtfeld '$field' fehlt");
            }
            $data[$field] = $this->sanitizeInput($_POST[$field]);
        }

        // E-Mail validieren
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Ungültige E-Mail-Adresse');
        }

        // Optionale Felder
        $optional_fields = [
            'telefon', 'firma', 'leistung', 'betreff', 'projektstart',
            'budget', 'betriebsart', 'adresse', 'verfuegbar_ab',
            'gehaltsvorstellung', 'rueckruf',
            // Materialverkauf-spezifische Felder
            'material', 'quantity', 'delivery_type'
        ];

        foreach ($optional_fields as $field) {
            $data[$field] = isset($_POST[$field]) ? $this->sanitizeInput($_POST[$field]) : '';
        }

        // Datenschutz-Bestätigung
        if (empty($_POST['datenschutz'])) {
            throw new Exception('Datenschutzerklärung muss akzeptiert werden');
        }

        // Page Type hinzufügen
        $data['page_type'] = $this->page_type;
        $data['service_name'] = $this->page_config['service_name'];

        return $data;
    }

    /**
     * Eingaben bereinigen
     */
    private function sanitizeInput($input) {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }

    /**
     * E-Mails versenden (Development-Mode berücksichtigen)
     */
    private function sendEmails($data) {
        if (DEVELOPMENT_MODE) {
            // Development: E-Mails nur simulieren und loggen
            error_log('=== DEVELOPMENT MODE - E-MAIL SIMULATION ===');
            error_log('Kundenbestätigung würde gesendet an: ' . $data['email']);
            error_log('HR-Benachrichtigung würde gesendet an: ' . $this->page_config['hr_email']);
            error_log('Betreff: ' . $this->page_config['subject_prefix'] . ' - ' . $data['vorname'] . ' ' . $data['nachname']);
            error_log('Service: ' . $data['service_name']);
            error_log('=== ENDE E-MAIL SIMULATION ===');

            // Optional: E-Mail-Inhalte in Datei speichern für Development
            $this->saveEmailsToFile($data);
        } else {
            // Production: Echte E-Mails versenden
            $this->sendCustomerConfirmation($data);
            $this->sendHRNotification($data);
        }
    }

    /**
     * E-Mails in Datei speichern für Development
     */
    private function saveEmailsToFile($data) {
        $timestamp = date('Y-m-d H:i:s');
        $logDir = sys_get_temp_dir() . '/baufranke_emails/';

        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $filename = $logDir . 'email_' . date('Y-m-d_H-i-s') . '_' . $data['page_type'] . '.html';

        $emailContent = "
<!DOCTYPE html>
<html>
<head><title>Development Email Log - {$timestamp}</title></head>
<body>
<h1>E-Mail Simulation - {$timestamp}</h1>
<h2>Kundendaten:</h2>
<ul>
    <li><strong>Name:</strong> {$data['vorname']} {$data['nachname']}</li>
    <li><strong>E-Mail:</strong> {$data['email']}</li>
    <li><strong>Service:</strong> {$data['service_name']}</li>
    <li><strong>Seite:</strong> {$data['page_type']}</li>
</ul>

<h2>Nachricht:</h2>
<div style='border: 1px solid #ccc; padding: 10px; margin: 10px 0;'>
" . nl2br(htmlspecialchars($data['nachricht'])) . "
</div>

<h2>E-Mails die versendet würden:</h2>
<h3>1. Kundenbestätigung an: {$data['email']}</h3>
<div style='border: 1px solid #green; padding: 10px; margin: 10px 0;'>
" . $this->getCustomerEmailTemplate($data) . "
</div>

<h3>2. HR-Benachrichtigung an: {$this->page_config['hr_email']}</h3>
<div style='border: 1px solid #blue; padding: 10px; margin: 10px 0;'>
" . $this->getHREmailTemplate($data) . "
</div>

</body>
</html>";

        file_put_contents($filename, $emailContent);
        error_log('E-Mail-Inhalte gespeichert in: ' . $filename);
    }

    /**
     * Bestätigungsmail an Kunden
     */
    private function sendCustomerConfirmation($data) {
        $subject = 'Ihre Anfrage bei der Bau GmbH Franke - Bestätigung';
        $message = $this->getCustomerEmailTemplate($data);

        $headers = [
            'From: ' . $this->config['from_name'] . ' <' . $this->config['from_email'] . '>',
            'Reply-To: ' . $this->page_config['hr_email'],
            'X-Mailer: PHP/' . phpversion(),
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8'
        ];

        if (!mail($data['email'], $subject, $message, implode("\r\n", $headers))) {
            error_log('Fehler beim Versenden der Bestätigungsmail an: ' . $data['email']);
            // Hinweis: Fehler beim E-Mail-Versand führt nicht zum Abbruch,
            // da die Anfrage trotzdem eingegangen ist
        }
    }

    /**
     * Benachrichtigung an HR
     */
    private function sendHRNotification($data) {
        $subject = $this->page_config['subject_prefix'] . ' - ' . $data['vorname'] . ' ' . $data['nachname'];
        $message = $this->getHREmailTemplate($data);

        $headers = [
            'From: ' . $this->config['from_name'] . ' <' . $this->config['from_email'] . '>',
            'Reply-To: ' . $data['email'],
            'X-Mailer: PHP/' . phpversion(),
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8'
        ];

        if (!mail($this->page_config['hr_email'], $subject, $message, implode("\r\n", $headers))) {
            error_log('Fehler beim Versenden der HR-Benachrichtigung');
            // Hinweis: Fehler beim E-Mail-Versand führt nicht zum Abbruch,
            // da die Anfrage trotzdem eingegangen ist
        }
    }

    /**
     * E-Mail-Template für Kunden (gekürzt für bessere Performance)
     */
    private function getCustomerEmailTemplate($data) {
        $service_info = '';
        if (!empty($data['leistung'])) {
            $service_info = '<p><strong>Gewünschte Leistung:</strong> ' . $data['leistung'] . '</p>';
        }

        // Materialverkauf-spezifische Informationen
        $material_info = '';
        if ($this->page_type === 'materialverkauf') {
            if (!empty($data['material'])) {
                $material_info .= '<p><strong>Material:</strong> ' . $data['material'] . '</p>';
            }
            if (!empty($data['quantity'])) {
                $material_info .= '<p><strong>Menge:</strong> ' . $data['quantity'] . ' Tonnen</p>';
            }
            if (!empty($data['delivery_type'])) {
                $delivery_text = ($data['delivery_type'] === 'lieferung') ? 'Lieferung gewünscht' : 'Abholung';
                $material_info .= '<p><strong>Lieferung:</strong> ' . $delivery_text . '</p>';
            }
        }

        $contact_info = '';
        if (!empty($data['telefon'])) {
            $contact_info .= '<p><strong>Telefon:</strong> ' . $data['telefon'] . '</p>';
        }
        if (!empty($data['firma'])) {
            $contact_info .= '<p><strong>Firma:</strong> ' . $data['firma'] . '</p>';
        }

        return '
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Anfrage bestätigt - Bau GmbH Franke</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 3px solid #006400; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { color: #006400; font-size: 24px; font-weight: bold; }
        .info-box { background-color: #f0f8f0; border-left: 5px solid #006400; padding: 15px; margin: 15px 0; }
        .contact-section { background-color: #f8f9fa; padding: 15px; border-radius: 6px; }
        h2 { color: #006400; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Bau GmbH Franke</div>
            <p>Ihr regionaler Baupartner seit 1991</p>
        </div>
        
        <h2>Vielen Dank für Ihre Anfrage!</h2>
        
        <p>Sehr geehrte/r ' . $data['vorname'] . ' ' . $data['nachname'] . ',</p>
        <p>wir haben Ihre Anfrage zum Bereich <strong>' . $data['service_name'] . '</strong> erhalten.</p>
        
        <div class="info-box">
            <h3>Ihre Anfrage im Überblick:</h3>
            <p><strong>Bereich:</strong> ' . $data['service_name'] . '</p>
            <p><strong>E-Mail:</strong> ' . $data['email'] . '</p>
            ' . $contact_info . '
            ' . $service_info . '
            ' . $material_info . '
            <p><strong>Eingangsdatum:</strong> ' . date('d.m.Y H:i') . '</p>
        </div>
        
        <h3>Wie geht es weiter?</h3>
        <p>Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
        
        <div class="contact-section">
            <h3>Kontakt:</h3>
            <p><strong>Telefon:</strong> 035841-3190</p>
            <p><strong>E-Mail:</strong> ' . $this->page_config['hr_email'] . '</p>
        </div>
    </div>
</body>
</html>';
    }

    /**
     * E-Mail-Template für HR (gekürzt für bessere Performance)
     */
    private function getHREmailTemplate($data) {
        $optional_info = '';

        $optional_fields = [
            'firma' => 'Firma',
            'telefon' => 'Telefon',
            'leistung' => 'Gewünschte Leistung'
        ];

        // Materialverkauf-spezifische Felder hinzufügen
        if ($this->page_type === 'materialverkauf') {
            $optional_fields['material'] = 'Gewünschtes Material';
            $optional_fields['quantity'] = 'Menge (Tonnen)';
            $optional_fields['delivery_type'] = 'Lieferart';
        }

        foreach ($optional_fields as $field => $label) {
            if (!empty($data[$field])) {
                $value = $data[$field];
                if ($field === 'delivery_type') {
                    $value = ($value === 'lieferung') ? 'Lieferung gewünscht' : 'Abholung';
                }
                $optional_info .= '<tr><th>' . $label . '</th><td>' . $value . '</td></tr>';
            }
        }

        return '
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Neue Anfrage - ' . $this->page_config['subject_prefix'] . '</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .data-table th, .data-table td { padding: 10px; border-bottom: 1px solid #ddd; }
        .data-table th { background-color: #f8f9fa; color: #006400; }
        .message-box { background-color: #e8f4f8; padding: 15px; border-radius: 6px; }
        h1 { color: #006400; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Neue Anfrage: ' . $data['service_name'] . '</h1>
        
        <table class="data-table">
            <tr><th>Name</th><td>' . $data['vorname'] . ' ' . $data['nachname'] . '</td></tr>
            <tr><th>E-Mail</th><td>' . $data['email'] . '</td></tr>
            ' . $optional_info . '
            <tr><th>Eingangsdatum</th><td>' . date('d.m.Y H:i:s') . '</td></tr>
        </table>
        
        <div class="message-box">
            <h3>Nachricht:</h3>
            <p>' . nl2br($data['nachricht']) . '</p>
        </div>
    </div>
</body>
</html>';
    }
}

// Hauptverarbeitung - nur POST-Requests akzeptieren
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $handler = new KontaktHandler($config, $page_configs);
    $handler->handleSubmission();
} else {
    // Alle anderen Request-Methoden ablehnen
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed',
        'title' => 'Fehler'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>