<?php
require_once 'config.php';

// Inisialisasi variabel untuk menampung data user
$user_data = [];

// STEP 1: Jika tidak ada parameter 'code', arahkan user ke Google Login
if (!isset($_GET['code'])) {
    $auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" . http_build_query([
        'client_id' => GOOGLE_CLIENT_ID,
        'redirect_uri' => GOOGLE_REDIRECT_URL,
        'response_type' => 'code',
        'scope' => 'email profile',
        'access_type' => 'online'
    ]);
    header("Location: " . $auth_url);
    exit();
}

// STEP 2: Jika ada parameter 'code', tukarkan dengan Access Token
$code = $_GET['code'];
$token_url = "https://oauth2.googleapis.com/token";
$post_data = [
    'code' => $code,
    'client_id' => GOOGLE_CLIENT_ID,
    'client_secret' => GOOGLE_CLIENT_SECRET,
    'redirect_uri' => GOOGLE_REDIRECT_URL,
    'grant_type' => 'authorization_code'
];

$ch = curl_init($token_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
$response = curl_exec($ch);
$data = json_decode($response, true);

if (isset($data['access_token'])) {
    // STEP 3: Ambil data profil user menggunakan Access Token
    $info_url = "https://www.googleapis.com/oauth2/v2/userinfo?access_token=" . $data['access_token'];
    $user_info = file_get_contents($info_url);
    $profile = json_decode($user_info, true);

    // Siapkan data untuk dikirim balik ke LocalStorage via auth.js
    $user_data = [
        'username' => $profile['name'],
        'email' => $profile['email'],
        'profile_pic' => $profile['picture'],
        'method' => 'google'
    ];

    // STEP 4: Kirim pesan ke auth.js di window utama, lalu tutup pop-up
    echo "<script>
        if (window.opener) {
            window.opener.postMessage({
                status: 'success',
                user: " . json_encode($user_data) . "
            }, '*');
            window.close();
        }
    </script>";
} else {
    echo "Login Gagal. Silahkan coba lagi.";
}
?>