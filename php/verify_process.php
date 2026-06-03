<?php
session_start();
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($_SESSION['temp_user'])) {
    echo json_encode(['status' => 'error', 'message' => 'Sesi kadaluarsa, silakan daftar ulang.']);
    exit;
}

$user_otp = $data['otp'];
$email = $_SESSION['temp_user']['email'];

// 1. Cek OTP di database + ambil waktu dibuatnya
$stmt = $conn->prepare("SELECT otp_code, created_at FROM otp_verifications 
                        WHERE email = ? ORDER BY created_at DESC LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if (!$row) {
    echo json_encode(['status' => 'error', 'message' => 'Kode OTP tidak ditemukan!']);
    exit;
}

// 2. Cek expired (10 menit = 600 detik)
$created_time = strtotime($row['created_at']);
$now = time();
if (($now - $created_time) > 600) {
    $conn->query("DELETE FROM otp_verifications WHERE email = '$email'");
    unset($_SESSION['temp_user']);
    echo json_encode(['status' => 'error', 'message' => 'Kode OTP sudah expired (10 menit). Silakan daftar ulang.']);
    exit;
}

// 3. Cek kecocokan OTP
if ($row['otp_code'] !== $user_otp) {
    echo json_encode(['status' => 'error', 'message' => 'Kode OTP salah!']);
    exit;
}

// 4. OTP cocok! Simpan user ke database
$name = $_SESSION['temp_user']['name'];
$pass = $_SESSION['temp_user']['password'];

$insert = $conn->prepare("INSERT INTO users (username, email, password, is_verified) VALUES (?, ?, ?, 1)");
$insert->bind_param("sss", $name, $email, $pass);

if ($insert->execute()) {
    $user_id = $conn->insert_id;
    
    // Hapus OTP & Session
    $conn->query("DELETE FROM otp_verifications WHERE email = '$email'");
    unset($_SESSION['temp_user']);
    
    // Return data user untuk auto login
    echo json_encode([
        'status' => 'success', 
        'message' => 'Verifikasi berhasil!',
        'user' => [
            'id' => $user_id,
            'username' => $name,
            'email' => $email
        ]
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan user ke database.']);
}
?>