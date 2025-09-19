<?php
/**
 * Bewerbungsformular Handler für Bau GmbH Franke
 * Verarbeitet Bewerbungen mit File-Upload und E-Mail-Versand
 *
 * @author Bau GmbH Franke
 * @version 2.0
 */

// Fehlerberichterstattung für Development (in Production auskommentieren)
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

// Security Headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Konfiguration
$config = [
    'upload_dir' => '/assets/bewerbungen/',
    'max_file_size' => 5 * 1024 * 1024, // 5MB
    'allowed_types' => ['pdf', 'doc', 'docx'],
    'hr_email' => 'louis.riedel@me.com',
    'from_email' => 'louis.riedel@me.com',
    'from_name' => 'Bau GmbH Franke',
    'success_redirect' => 'karriere.html?status=success',
    'error_redirect' => 'karriere.html?status=error'
];

// Autoload für PHPMailer (falls verwendet)
// require_once 'vendor/autoload.php';

class BewerbungsHandler {
    private $config;
    private $errors = [];
    private $uploaded_files = [];

    public function __construct($config) {
        $this->config = $config;
        $this->createUploadDir();
    }

    /**
     * Hauptverarbeitungslogik
     */
    public function handleSubmission() {
        try {
            // CSRF-Schutz und Honeypot-Check
            if (!$this->validateSecurity()) {
                throw new Exception('Sicherheitsprüfung fehlgeschlagen');
            }

            // Formulardaten validieren
            $data = $this->validateFormData();

            // Dateien verarbeiten
            $this->processFileUploads();

            // E-Mails versenden
            $this->sendEmails($data);

            // Erfolg - Weiterleitung
            $this->redirect($this->config['success_redirect']);

        } catch (Exception $e) {
            error_log('Bewerbung Error: ' . $e->getMessage());
            $this->cleanup(); // Hochgeladene Dateien löschen bei Fehler
            $this->redirect($this->config['error_redirect'] . '&msg=' . urlencode($e->getMessage()));
        }
    }

    /**
     * Sicherheitsprüfungen
     */
    private function validateSecurity() {
        // Honeypot-Check
        if (!empty($_POST['website'])) {
            throw new Exception('Spam erkannt');
        }

        // Rate-Limiting (einfache Implementation)
        $ip = $_SERVER['REMOTE_ADDR'];
        $rate_limit_file = sys_get_temp_dir() . '/bewerbung_' . md5($ip);

        if (file_exists($rate_limit_file)) {
            $last_submission = filemtime($rate_limit_file);
            if (time() - $last_submission < 60) { // 1 Minute Wartezeit
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
        $required_fields = ['vorname', 'nachname', 'email', 'telefon', 'position'];
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
        $optional_fields = ['adresse', 'verfuegbar_ab', 'gehaltsvorstellung', 'fuehrerschein', 'nachricht'];
        foreach ($optional_fields as $field) {
            $data[$field] = isset($_POST[$field]) ? $this->sanitizeInput($_POST[$field]) : '';
        }

        // Führerscheinklassen
        $data['fuehrerschein_klassen'] = [];
        if (isset($_POST['fuehrerschein_klassen']) && is_array($_POST['fuehrerschein_klassen'])) {
            foreach ($_POST['fuehrerschein_klassen'] as $klasse) {
                $data['fuehrerschein_klassen'][] = $this->sanitizeInput($klasse);
            }
        }

        // Datenschutz-Bestätigung
        if (empty($_POST['datenschutz'])) {
            throw new Exception('Datenschutzerklärung muss akzeptiert werden');
        }

        return $data;
    }

    /**
     * Eingaben bereinigen
     */
    private function sanitizeInput($input) {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Datei-Uploads verarbeiten
     */
    private function processFileUploads() {
        $file_fields = ['lebenslauf', 'anschreiben', 'zeugnisse'];

        foreach ($file_fields as $field) {
            if (isset($_FILES[$field]) && $_FILES[$field]['error'] !== UPLOAD_ERR_NO_FILE) {
                if ($field === 'zeugnisse' && is_array($_FILES[$field]['name'])) {
                    // Multiple files
                    for ($i = 0; $i < count($_FILES[$field]['name']); $i++) {
                        if ($_FILES[$field]['error'][$i] === UPLOAD_ERR_OK) {
                            $file_info = [
                                'name' => $_FILES[$field]['name'][$i],
                                'tmp_name' => $_FILES[$field]['tmp_name'][$i],
                                'size' => $_FILES[$field]['size'][$i],
                                'type' => $_FILES[$field]['type'][$i]
                            ];
                            $this->processFile($file_info, $field . '_' . ($i + 1));
                        }
                    }
                } else {
                    // Single file
                    if ($_FILES[$field]['error'] === UPLOAD_ERR_OK) {
                        $this->processFile($_FILES[$field], $field);
                    } elseif ($_FILES[$field]['error'] !== UPLOAD_ERR_NO_FILE) {
                        if ($field === 'lebenslauf') {
                            throw new Exception('Fehler beim Upload des Lebenslaufs');
                        }
                    }
                }
            } elseif ($field === 'lebenslauf') {
                throw new Exception('Lebenslauf ist erforderlich');
            }
        }
    }

    /**
     * Einzelne Datei verarbeiten
     */
    private function processFile($file, $field_name) {
        // Größe prüfen
        if ($file['size'] > $this->config['max_file_size']) {
            throw new Exception('Datei "' . $file['name'] . '" ist zu groß (max. 5MB)');
        }

        // Dateierweiterung prüfen
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->config['allowed_types'])) {
            throw new Exception('Dateityp "' . $extension . '" ist nicht erlaubt');
        }

        // MIME-Type prüfen
        $allowed_mimes = [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime_type, array_values($allowed_mimes))) {
            throw new Exception('Ungültiger MIME-Type für Datei "' . $file['name'] . '"');
        }

        // Sichere Dateinamen generieren
        $safe_filename = $this->generateSafeFilename($file['name'], $field_name);
        $destination = $this->config['upload_dir'] . $safe_filename;

        // Datei verschieben
        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            throw new Exception('Fehler beim Speichern der Datei "' . $file['name'] . '"');
        }

        $this->uploaded_files[] = [
            'original_name' => $file['name'],
            'safe_filename' => $safe_filename,
            'field' => $field_name,
            'path' => $destination,
            'size' => $file['size']
        ];
    }

    /**
     * Sichere Dateinamen generieren
     */
    private function generateSafeFilename($original_name, $field_name) {
        $extension = pathinfo($original_name, PATHINFO_EXTENSION);
        $timestamp = date('Y-m-d_H-i-s');
        $random = bin2hex(random_bytes(8));
        return $field_name . '_' . $timestamp . '_' . $random . '.' . $extension;
    }

    /**
     * Upload-Verzeichnis erstellen
     */
    private function createUploadDir() {
        if (!is_dir($this->config['upload_dir'])) {
            mkdir($this->config['upload_dir'], 0755, true);
        }

        // .htaccess für Sicherheit
        $htaccess = $this->config['upload_dir'] . '.htaccess';
        if (!file_exists($htaccess)) {
            file_put_contents($htaccess, "Options -Indexes\nDeny from all");
        }
    }

    /**
     * E-Mails versenden
     */
    private function sendEmails($data) {
        // Bewerber-Bestätigung
        $this->sendApplicantConfirmation($data);

        // HR-Benachrichtigung
        $this->sendHRNotification($data);
    }

    /**
     * Bestätigungsmail an Bewerber
     */
    private function sendApplicantConfirmation($data) {
        $subject = 'Bewerbungseingang bestätigt - Bau GmbH Franke';

        $message = $this->getApplicantEmailTemplate($data);

        $headers = [
            'From: ' . $this->config['from_name'] . ' <' . $this->config['from_email'] . '>',
            'Reply-To: ' . $this->config['hr_email'],
            'X-Mailer: PHP/' . phpversion(),
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8'
        ];

        if (!mail($data['email'], $subject, $message, implode("\r\n", $headers))) {
            error_log('Fehler beim Versenden der Bestätigungsmail an: ' . $data['email']);
        }
    }

    /**
     * Benachrichtigung an HR
     */
    private function sendHRNotification($data) {
        $subject = 'Neue Bewerbung eingegangen - ' . $data['position'];

        $message = $this->getHREmailTemplate($data);

        $headers = [
            'From: ' . $this->config['from_name'] . ' <' . $this->config['from_email'] . '>',
            'Reply-To: ' . $data['email'],
            'X-Mailer: PHP/' . phpversion(),
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8'
        ];

        if (!mail($this->config['hr_email'], $subject, $message, implode("\r\n", $headers))) {
            error_log('Fehler beim Versenden der HR-Benachrichtigung');
        }
    }

    /**
     * E-Mail-Template für Bewerber
     */
    private function getApplicantEmailTemplate($data) {
        $fuehrerschein_info = '';
        if ($data['fuehrerschein'] === 'ja' && !empty($data['fuehrerschein_klassen'])) {
            $fuehrerschein_info = 'Führerscheinklassen: ' . implode(', ', $data['fuehrerschein_klassen']);
        } elseif ($data['fuehrerschein'] === 'nein') {
            $fuehrerschein_info = 'Kein Führerschein vorhanden';
        }

        return '
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bewerbungseingang bestätigt</title>
    <style>
        body { font-family: "Inter", Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #006400; }
        .logo { color: #006400; font-size: 24px; font-weight: 700; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 16px; }
        .content { margin-bottom: 25px; }
        .info-box { background-color: #f0f8f0; border-left: 4px solid #006400; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        .btn { display: inline-block; background-color: #006400; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Bau GmbH Franke</div>
            <div class="subtitle">Ihr regionaler Baupartner seit 1991</div>
        </div>
        
        <div class="content">
            <h2>Vielen Dank für Ihre Bewerbung!</h2>
            
            <p>Sehr geehrte/r ' . $data['vorname'] . ' ' . $data['nachname'] . ',</p>
            
            <p>wir haben Ihre Bewerbung für die Position <strong>' . $data['position'] . '</strong> erhalten und bedanken uns für Ihr Interesse an unserem Unternehmen.</p>
            
            <div class="info-box">
                <h3>Ihre Bewerbungsdaten im Überblick:</h3>
                <ul>
                    <li><strong>Position:</strong> ' . $data['position'] . '</li>
                    <li><strong>E-Mail:</strong> ' . $data['email'] . '</li>
                    <li><strong>Telefon:</strong> ' . $data['telefon'] . '</li>
                    ' . ($data['verfuegbar_ab'] ? '<li><strong>Verfügbar ab:</strong> ' . $data['verfuegbar_ab'] . '</li>' : '') . '
                    ' . ($fuehrerschein_info ? '<li><strong>Führerschein:</strong> ' . $fuehrerschein_info . '</li>' : '') . '
                    <li><strong>Eingangsdatum:</strong> ' . date('d.m.Y H:i') . '</li>
                </ul>
            </div>
            
            <h3>Wie geht es weiter?</h3>
            <p>Wir prüfen Ihre Unterlagen sorgfältig und melden uns innerhalb von <strong>5 Werktagen</strong> bei Ihnen. Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.</p>
            
            <p>Bei Fragen zu Ihrer Bewerbung können Sie sich jederzeit an uns wenden:</p>
            <ul>
                <li><strong>Telefon:</strong> 035841-3190</li>
                <li><strong>E-Mail:</strong> bewerbungen@bau-franke.de</li>
            </ul>
        </div>
        
        <div class="footer">
            <p><strong>Bau GmbH Franke</strong><br>
            Hauptstraße 123<br>
            02779 Hainewalde<br>
            www.baufranke.de</p>
        </div>
    </div>
</body>
</html>';
    }

    /**
     * E-Mail-Template für HR
     */
    private function getHREmailTemplate($data) {
        $attachments_info = '';
        foreach ($this->uploaded_files as $file) {
            $attachments_info .= '- ' . $file['field'] . ': ' . $file['original_name'] . ' (' . number_format($file['size']/1024, 2) . ' KB)' . "\n";
        }

        $fuehrerschein_info = '';
        if ($data['fuehrerschein'] === 'ja' && !empty($data['fuehrerschein_klassen'])) {
            $fuehrerschein_info = implode(', ', $data['fuehrerschein_klassen']);
        } elseif ($data['fuehrerschein'] === 'nein') {
            $fuehrerschein_info = 'Nein';
        }

        return '
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neue Bewerbung</title>
    <style>
        body { font-family: "Inter", Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
        .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #006400; }
        .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .data-table th, .data-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .data-table th { background-color: #f8f9fa; font-weight: 600; }
        .attachments { background-color: #f0f8f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .message-box { background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Neue Bewerbung eingegangen</h1>
            <p>Position: <strong>' . $data['position'] . '</strong></p>
        </div>
        
        <div class="alert">
            <strong>Eingangsdatum:</strong> ' . date('d.m.Y H:i:s') . '
        </div>
        
        <table class="data-table">
            <tr><th>Name</th><td>' . $data['vorname'] . ' ' . $data['nachname'] . '</td></tr>
            <tr><th>E-Mail</th><td><a href="mailto:' . $data['email'] . '">' . $data['email'] . '</a></td></tr>
            <tr><th>Telefon</th><td><a href="tel:' . $data['telefon'] . '">' . $data['telefon'] . '</a></td></tr>
            ' . ($data['adresse'] ? '<tr><th>Adresse</th><td>' . $data['adresse'] . '</td></tr>' : '') . '
            <tr><th>Position</th><td>' . $data['position'] . '</td></tr>
            ' . ($data['verfuegbar_ab'] ? '<tr><th>Verfügbar ab</th><td>' . $data['verfuegbar_ab'] . '</td></tr>' : '') . '
            ' . ($data['gehaltsvorstellung'] ? '<tr><th>Gehaltsvorstellung</th><td>' . $data['gehaltsvorstellung'] . '</td></tr>' : '') . '
            ' . ($fuehrerschein_info ? '<tr><th>Führerschein</th><td>' . $fuehrerschein_info . '</td></tr>' : '') . '
        </table>
        
        ' . (!empty($this->uploaded_files) ? '
        <div class="attachments">
            <h3>Hochgeladene Dateien:</h3>
            <pre>' . $attachments_info . '</pre>
            <p><small>Dateipfad: ' . $this->config['upload_dir'] . '</small></p>
        </div>' : '') . '
        
        ' . ($data['nachricht'] ? '
        <div class="message-box">
            <h3>Nachricht des Bewerbers:</h3>
            <p>' . nl2br($data['nachricht']) . '</p>
        </div>' : '') . '
        
        <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
            <h3>Nächste Schritte:</h3>
            <ol>
                <li>Bewerbungsunterlagen prüfen (Upload-Ordner: ' . $this->config['upload_dir'] . ')</li>
                <li>Bewertung der Qualifikationen</li>
                <li>Kontaktaufnahme mit dem Bewerber innerhalb von 5 Werktagen</li>
            </ol>
        </div>
    </div>
</body>
</html>';
    }

    /**
     * Cleanup hochgeladener Dateien bei Fehlern
     */
    private function cleanup() {
        foreach ($this->uploaded_files as $file) {
            if (file_exists($file['path'])) {
                unlink($file['path']);
            }
        }
    }

    /**
     * Weiterleitung
     */
    private function redirect($url) {
        header('Location: ' . $url);
        exit;
    }
}

// Hauptverarbeitung
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $handler = new BewerbungsHandler($config);
    $handler->handleSubmission();
} else {
    // Direktzugriff verhindern
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}
