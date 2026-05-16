<?php
require_once 'config.php';

// Cek apakah parameter 'code' sudah diterima dari X
if (!isset($_GET['code'])) {
    // STEP 1: Arahkan user ke halaman login X (Twitter)
    // Catatan: X menggunakan OAuth 2.0. Pastikan di Developer Portal kamu memilih 'Web App'
    $state = bin2hex(random_bytes(16)); // Untuk keamanan CSRF
    
    $auth_url = "https://twitter.com/i/oauth2/authorize?" . http_build_query([
        'response_type' => 'code',
        'client_id'     => X_API_KEY,
        'redirect_uri'  => X_REDIRECT_URL,
        'scope'         => 'tweet.read users.read email',
        'state'         => $state,
        'code_challenge'=> 'challenge', // Sederhananya untuk testing localhost
        'code_challenge_method' => 'plain'
    ]);
    
    header("Location: " . $auth_url);
    exit();
}

// STEP 2: Jika user sudah login, X akan kirim 'code' ke sini
// Di sini kamu biasanya menukar 'code' dengan Access Token menggunakan cURL
// Untuk tahap awal agar window pop-up tertutup dan kembali ke dashboard:

$user_data = [
    'username' => 'User X', // Ini nantinya didapat dari API X
    'email' => 'user@x.com',
    'profile_pic' => '../assets/img/default-avatar.png',
    'method' => 'x'
];

echo "<script>
    if (window.opener) {
        window.opener.postMessage({
            status: 'success',
            user: " . json_encode($user_data) . "
        }, '*');
        window.close();
    }
</script>";
?>