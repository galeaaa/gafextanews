<?php
include 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $email = mysqli_real_escape_string($conn, $data['email']);
    $password = $data['password']; // Jangan di-escape karena akan dicek lewat password_verify

    // 1. Cari user berdasarkan email saja
    $query = "SELECT * FROM users WHERE email = '$email'";
    $result = mysqli_query($conn, $query);

    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        
        // 2. Verifikasi password yang diinput dengan password terenkripsi di database
        if (password_verify($password, $user['password'])) {
            // Password cocok!
            unset($user['password']); // Hapus password dari array demi keamanan
            echo json_encode(["status" => "success", "user" => $user]);
        } else {
            // Password salah
            echo json_encode(["status" => "error", "message" => "Email atau Password salah!"]);
        }
    } else {
        // Email tidak ditemukan
        echo json_encode(["status" => "error", "message" => "Email atau Password salah!"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
}
?>