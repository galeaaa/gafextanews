<?php
require_once 'config.php';

if (!isset($_GET['code'])) {
    // Redirect ke Facebook
    $fb_url = "https://www.facebook.com/v18.0/dialog/oauth?" . http_build_query([
        'client_id' => FB_APP_ID,
        'redirect_uri' => FB_REDIRECT_URL,
        'scope' => 'email'
    ]);
    header("Location: " . $fb_url);
    exit();
}

// Jika ada code, tukar dengan token
$code = $_GET['code'];
$token_url = "https://graph.facebook.com/v18.0/oauth/access_token?" . http_build_query([
    'client_id' => FB_APP_ID,
    'client_secret' => FB_APP_SECRET,
    'redirect_uri' => FB_REDIRECT_URL,
    'code' => $code
]);

$response = file_get_contents($token_url);
$params = json_decode($response, true);

if (isset($params['access_token'])) {
    // Ambil info user
    $info_url = "https://graph.facebook.com/me?fields=name,email,picture&access_token=" . $params['access_token'];
    $user_profile = json_decode(file_get_contents($info_url), true);

    $user_data = [
        'username' => $user_profile['name'],
        'email' => $user_profile['email'] ?? '',
        'profile_pic' => $user_profile['picture']['data']['url'],
        'method' => 'facebook'
    ];

    // Kirim ke auth.js
    echo "<script>
        window.opener.postMessage({status: 'success', user: " . json_encode($user_data) . "}, '*');
        window.close();
    </script>";
}
?>