<?php
// kontakt-verarbeitung.php

// Headers für die AJAX-Antwort
header('Content-Type: application/json');

// Fehlermeldungen initialisieren
$response = [
    'success' => false,
    'message' => ''
];

// Überprüfen ob die Anfrage eine POST-Anfrage ist
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Ungültige Anfrage';
    echo json_encode($response);
    exit;
}

// Prüfen ob erforderliche Felder vorhanden sind
$requiredFields = ['name', 'email', 'betreff', 'nachricht', 'datenschutz'];
$missingFields = [];

foreach ($requiredFields as $field) {
    if (!isset($_POST[$field]) || empty($_POST[$field])) {
        $missingFields[] = $field;
    }
}

if (!empty($missingFields)) {
    $response['message'] = 'Bitte füllen Sie alle Pflichtfelder aus.';
    echo json_encode($response);
    exit;
}

// Daten bereinigen
$name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$telefon = isset($_POST['telefon']) ? filter_var($_POST['telefon'], FILTER_SANITIZE_STRING) : '';
$betreff = filter_var($_POST['betreff'], FILTER_SANITIZE_STRING);
$nachricht = filter_var($_POST['nachricht'], FILTER_SANITIZE_STRING);

// E-Mail-Adresse validieren
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['message'] = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    echo json_encode($response);
    exit;
}

// E-Mail-Empfänger (ersetzen Sie dies durch die tatsächliche E-Mail-Adresse)
$empfaenger = 'louis.riedel@me.com';

// E-Mail-Header
$headers = 'From: ' . $name . ' <' . $email . '>' . "\r\n";
$headers .= 'Reply-To: ' . $email . "\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion() . "\r\n";
$headers .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";

// E-Mail-Inhalt
$emailInhalt = "Neue Kontaktanfrage von Ihrer Website\n\n";
$emailInhalt .= "Name: " . $name . "\n";
$emailInhalt .= "E-Mail: " . $email . "\n";

if (!empty($telefon)) {
    $emailInhalt .= "Telefon: " . $telefon . "\n";
}

$emailInhalt .= "Betreff: " . $betreff . "\n\n";
$emailInhalt .= "Nachricht:\n" . $nachricht . "\n";

// E-Mail senden
$mailSuccess = mail($empfaenger, 'Kontaktanfrage: ' . $betreff, $emailInhalt, $headers);

if ($mailSuccess) {
    $response['success'] = true;
    $response['message'] = 'Vielen Dank für Ihre Anfrage! Wir werden uns in Kürze bei Ihnen melden.';
} else {
    $response['message'] = 'Beim Senden Ihrer Anfrage ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.';
}

// Antwort zurückgeben
echo json_encode($response);
?>