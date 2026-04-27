// 1. Fungsi Proses Login
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Simulasi: Cek email & pass sederhana
    if(email && password.length >= 5) {
        const user = {
            email: email,
            username: email.split('@')[0], // Ambil nama depan email sebagai username
            isLoggedIn: true
        };

        // Simpan ke LocalStorage
        localStorage.setItem('user_gafexta', JSON.stringify(user));
        
        alert("Login Berhasil!");
        // Arahkan kembali ke halaman sebelumnya (berita tadi)
        window.location.href = document.referrer || "../index.html";
    } else {
        alert("Password minimal 5 karakter!");
    }
});

// 2. Fungsi Cek Status Login (Panggil di detail.html)
function isUserLoggedIn() {
    return localStorage.getItem('user_gafexta') !== null;
}

// 3. Fungsi Logout
function logout() {
    localStorage.removeItem('user_gafexta');
    location.reload();
}