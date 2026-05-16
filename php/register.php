<?php
header('Content-Type: application/json');
require_once 'config.php';

// Ambil data JSON dari auth.js
$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $name = $data['username'];
    $email = $data['email'];
    $pass = password_hash($data['password'], PASSWORD_DEFAULT);

    // 1. Cek apakah email sudah terdaftar di tabel users
    $checkEmail = $conn->prepare("SELECT email FROM users WHERE email = ?");
    $checkEmail->bind_param("s", $email);
    $checkEmail->execute();
    if ($checkEmail->get_result()->num_rows > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Email ini sudah terdaftar!']);
        exit;
    }

    // 2. Buat Kode OTP 6 Digit
    $otp = (string)rand(100000, 999999);

    // 3. Simpan OTP ke tabel
    $stmt = $conn->prepare("INSERT INTO otp_verifications (email, otp_code) VALUES (?, ?)");
    $stmt->bind_param("ss", $email, $otp);
    
    if ($stmt->execute()) {
        // Simpan data pendaftaran sementara ke session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['temp_user'] = [
            'name' => $name,
            'email' => $email,
            'password' => $pass
        ];

        echo json_encode([
            'status' => 'success', 
            'message' => 'Kode OTP berhasil dikirim!',
            'debug_otp' => $otp 
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan data OTP ke database.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Data pendaftaran tidak ditemukan.']);
}
?>