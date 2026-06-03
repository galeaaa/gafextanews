<?php
header('Content-Type: application/json');
require_once 'config.php';

// Load PHPMailer manual (tanpa Composer)
require_once 'PHPMailer.php';
require_once 'SMTP.php';
require_once 'Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Ambil data JSON dari frontend
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['status' => 'error', 'message' => 'Data pendaftaran tidak ditemukan.']);
    exit;
}

$name = $data['username'];
$email = $data['email'];
$password = $data['password'];

// ========== 0. CEK USERNAME SUDAH TERDAFTAR ==========
$checkUsername = $conn->prepare("SELECT username FROM users WHERE username = ?");
$checkUsername->bind_param("s", $name);
$checkUsername->execute();
if ($checkUsername->get_result()->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Username ini sudah digunakan!']);
    exit;
}

// ========== 1. VALIDASI PASSWORD (BACKEND) ==========
$passwordErrors = [];

if (strlen($password) < 8) {
    $passwordErrors[] = "Password minimal 8 karakter";
}
if (!preg_match('/[A-Z]/', $password)) {
    $passwordErrors[] = "Password harus ada huruf besar (A-Z)";
}
if (!preg_match('/[a-z]/', $password)) {
    $passwordErrors[] = "Password harus ada huruf kecil (a-z)";
}
if (!preg_match('/[0-9]/', $password)) {
    $passwordErrors[] = "Password harus ada angka (0-9)";
}
if (!preg_match('/[^A-Za-z0-9]/', $password)) {
    $passwordErrors[] = "Password harus ada simbol (!@#$%^&* dll)";
}

if (!empty($passwordErrors)) {
    echo json_encode([
        'status' => 'error', 
        'message' => "Password tidak memenuhi syarat:\n• " . implode("\n• ", $passwordErrors)
    ]);
    exit;
}

$pass = password_hash($password, PASSWORD_DEFAULT);

// ========== 2. CEK EMAIL SUDAH TERDAFTAR ==========
$checkEmail = $conn->prepare("SELECT email FROM users WHERE email = ?");
$checkEmail->bind_param("s", $email);
$checkEmail->execute();
if ($checkEmail->get_result()->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Email ini sudah terdaftar!']);
    exit;
}

// ========== 3. BUAT OTP ==========
$otp = (string)rand(100000, 999999);

// ========== 4. SIMPAN OTP KE DATABASE ==========
$stmt = $conn->prepare("INSERT INTO otp_verifications (email, otp_code) VALUES (?, ?)");
$stmt->bind_param("ss", $email, $otp);

if (!$stmt->execute()) {
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan data OTP ke database.']);
    exit;
}

// ========== 5. KIRIM OTP KE EMAIL VIA PHPMAILER ==========
$mail = new PHPMailer(true);

try {
    // Konfigurasi SMTP Gmail
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    
    $mail->Username = 'likesuninthesky00@gmail.com';      // Email pengirim (Gmail)
    $mail->Password = 'ejhrxmaremnjlxot';      // App Password Gmail (16 karakter)
    
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Pengirim & Penerima
    $mail->setFrom('likesuninthesky00@gmail.com', 'GafextaNews');  // GANTI juga ini
    $mail->addAddress($email, $name);

    // Konten Email
    $mail->isHTML(true);
    $mail->Subject = 'Kode Verifikasi GafextaNews';
    $mail->Body = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #D13E4D;'>Verifikasi Akun GafextaNews</h2>
            <p>Halo <b>$name</b>,</p>
            <p>Gunakan kode OTP berikut untuk menyelesaikan pendaftaran:</p>
            <div style='background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; 
                        font-weight: bold; letter-spacing: 10px; color: #192853; border-radius: 8px;'>
                $otp
            </div>
            <p style='color: #666; font-size: 14px;'>Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
            <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;'>
            <p style='color: #999; font-size: 12px;'>Jika kamu tidak meminta kode ini, abaikan email ini.</p>
        </div>
    ";
    $mail->AltBody = "Kode verifikasi GafextaNews: $otp";

    $mail->send();

    // Simpan data sementara ke session
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
        'message' => 'Kode verifikasi telah dikirim ke email Anda!'
    ]);

} catch (Exception $e) {
    // Hapus OTP dari DB kalo gagal kirim email
    $conn->query("DELETE FROM otp_verifications WHERE email = '$email'");
    
    echo json_encode([
        'status' => 'error', 
        'message' => 'Gagal mengirim email verifikasi. Coba lagi nanti.'
    ]);
}
?>