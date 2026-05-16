<?php
// config.php

// --- KONFIGURASI GOOGLE ---
define('GOOGLE_CLIENT_ID', '909231334449-jktj976v9n3p8pcikj0q8ipv0giodj4s.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', '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');
define('GOOGLE_REDIRECT_URL', 'http://localhost');

// --- KONFIGURASI FACEBOOK ---
define('FB_APP_ID', '1249833040280049');
define('FB_APP_SECRET', 'a896dd339e994ba687fad29512112ed4');
define('FB_REDIRECT_URL', 'http://localhost/gafextaNews/php/fb_login.php');

// --- KONFIGURASI X (TWITTER) ---
define('X_API_KEY', 't7CyzimRJhmzfTLGXHwaNTTdh');
define('X_API_SECRET', '6VEpGM9OzTfTLcvMmfIPauASAJzY08WTJsIqQJ2lbSqWJvs4tc');
define('X_REDIRECT_URL', 'http://localhost/gafextaNews/php/x_login.php');

// Database Config
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'gafexta_news'); // Disesuaikan dengan screenshot phpMyAdmin kamu

// --- BUAT KONEKSI DATABASE ---
$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if (!$conn) {
    die("Koneksi gagal: " . mysqli_connect_error());
}
?>