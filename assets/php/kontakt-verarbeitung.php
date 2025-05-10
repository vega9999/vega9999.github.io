<?php
// kontakt-verarbeitung.php

header('Content-Type: application/json');

$response = [
    'success' => false,
    'message' => ''
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Ungültige Anfrage';
    echo json_encode($response);
    exit;
}

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

$name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$telefon = isset($_POST['telefon']) ? filter_var($_POST['telefon'], FILTER_SANITIZE_STRING) : '';
$betreff = filter_var($_POST['betreff'], FILTER_SANITIZE_STRING);
$nachricht = filter_var($_POST['nachricht'], FILTER_SANITIZE_STRING);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['message'] = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    echo json_encode($response);
    exit;
}

$empfaenger = 'info@holz-metall-riedel.de';

$headers = 'From: ' . $name . ' <' . $email . '>' . "\r\n";
$headers .= 'Reply-To: ' . $email . "\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion() . "\r\n";
$headers .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";

$emailInhalt = "Neue Kontaktanfrage für Holz Metall Riedel\n\n";
$emailInhalt .= "Name: " . $name . "\n";
$emailInhalt .= "E-Mail: " . $email . "\n";

if (!empty($telefon)) {
    $emailInhalt .= "Telefon: " . $telefon . "\n";
}

$emailInhalt .= "Betreff: " . $betreff . "\n\n";
$emailInhalt .= "Nachricht:\n" . $nachricht . "\n";

$mailSuccess = mail($empfaenger, 'Kontaktanfrage: ' . $betreff, $emailInhalt, $headers);

if ($mailSuccess) {
    $response['success'] = true;
    $response['message'] = 'Vielen Dank für Ihre Anfrage! Wir werden uns in Kürze bei Ihnen melden.';
} else {
    $response['message'] = 'Beim Senden Ihrer Anfrage ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.';
}

echo json_encode($response);
?>