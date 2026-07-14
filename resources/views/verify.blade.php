<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account - GafextaNews</title>
    <link rel="stylesheet" href="{{ asset('assets/css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/verify.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>

    <x-alert />

    <div class="container">
        <div class="left-panel">
            <h1>Verify!</h1>
            <p>Satu langkah lagi untuk bergabung dengan GafextaNews. Masukkan kode 6 digit yang telah dikirim ke email Anda untuk mengamankan akun Anda.</p>
        </div>

        <div class="right-panel">
            <h2>Enter OTP</h2>
            <form id="verifyForm">
                <div class="otp-inputs">
                    <input type="number" maxlength="1" required>
                    <input type="number" maxlength="1" required>
                    <input type="number" maxlength="1" required>
                    <input type="number" maxlength="1" required>
                    <input type="number" maxlength="1" required>
                    <input type="number" maxlength="1" required>
                </div>
                <button type="submit" class="verify-btn">Verify Account</button>
            </form>
            <div class="resend">
                Tidak menerima kode? <span id="resendBtn">Kirim Ulang</span>
            </div>
        </div>
    </div>

    <script>
        const inputs = document.querySelectorAll('.otp-inputs input');

        function showToast(message, type = 'error') {
            showAlert(message, type);
        }

        // Logic Input OTP (Auto Focus)
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length > 1) e.target.value = e.target.value.slice(0, 1);
                if (e.target.value && index < inputs.length - 1) inputs[index + 1].focus();
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) inputs[index - 1].focus();
            });
        });

        // Submit Form ke PHP
        document.getElementById('verifyForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const otp = Array.from(inputs).map(i => i.value).join('');

            fetch('/php/verify_process.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: otp })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    // Berhasil! Alihkan ke laman login (BUKAN langsung dashboard)
                    showToast("Verifikasi Berhasil! Mengalihkan ke laman login...", "success");
                    setTimeout(() => window.location.href = '/login', 2000);
                } else {
                    showToast(data.message);
                }
            })
            .catch(err => showToast("Koneksi bermasalah."));
        });
    </script>
    <script>
        @auth
            localStorage.setItem('currentUser', JSON.stringify({
                id: {{ Auth::user()->id }},
                username: "{{ Auth::user()->username }}",
                email: "{{ Auth::user()->email }}",
                is_verified: {{ Auth::user()->is_verified ? 1 : 0 }}
            }));
            localStorage.setItem('user_token', 'logged_in');
        @else
            localStorage.removeItem('currentUser');
            localStorage.removeItem('user_token');
        @endauth
    </script>
</body>
</html>
