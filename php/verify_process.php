<?php
session_start();
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data && isset($_SESSION['temp_user'])) {
    $user_otp = $data['otp'];
    $email = $_SESSION['temp_user']['email'];

    // 1. Cek OTP di database
    $stmt = $conn->prepare("SELECT otp_code FROM otp_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if ($row && $row['otp_code'] === $user_otp) {
        // 2. OTP Cocok! Pindahkan data dari session ke tabel users utama
        $name = $_SESSION['temp_user']['name'];
        $pass = $_SESSION['temp_user']['password'];

        $insert = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $insert->bind_param("sss", $name, $email, $pass);
        
        if ($insert->execute()) {
            // 3. Hapus OTP & Session setelah berhasil
            $conn->query("DELETE FROM otp_verifications WHERE email = '$email'");
            unset($_SESSION['temp_user']);
            
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan user ke database.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Kode OTP salah atau tidak valid!']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Sesi kadaluarsa, silakan daftar ulang.']);
}
?>