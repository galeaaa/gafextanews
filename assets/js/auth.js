// --- FUNGSI NOTIFIKASI ---
function showAlert(message) {
    const alertBox = document.getElementById('customAlert');
    const alertMsg = document.getElementById('alertMessage');
    if (alertBox && alertMsg) {
        alertMsg.innerText = message;
        alertBox.style.display = 'flex';
    }
}

function closeAlert() {
    const alertBox = document.getElementById('customAlert');
    if (alertBox) alertBox.style.display = 'none';
}

// --- LOGIKA OAUTH INTEGRATION ---
document.querySelectorAll('.oauth-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const url = this.getAttribute('href');
        
        const width = 500, height = 600;
        const left = (window.innerWidth / 2) - (width / 2);
        const top = (window.innerHeight / 2) - (height / 2);
        
        window.open(url, 'OAuthLogin', `width=${width},height=${height},top=${top},left=${left}`);
    });
});

window.addEventListener('message', function(event) {
    if (event.data.status === 'success') {
        const user = event.data.user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        showAlert("Login Sosial Media Berhasil!");
        
        setTimeout(() => {
            const savedPage = sessionStorage.getItem('lastVisitedPage');
            window.location.href = savedPage ? savedPage : "../index.html";
        }, 1500);
    }
});

// --- FUNGSI LOGIN MANUAL (DATABASE) ---
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;

    fetch('../php/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            showAlert("Login Berhasil!");
            setTimeout(() => {
                const savedPage = sessionStorage.getItem('lastVisitedPage');
                window.location.href = savedPage ? savedPage : "../index.html";
            }, 1500);
        } else {
            showAlert(data.message || "Email atau Password salah!");
        }
    })
    .catch(err => {
        console.error(err);
        showAlert("Terjadi kesalahan koneksi database.");
    });
});

// --- FUNGSI REGISTER MANUAL (DATABASE + OTP) ---
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-pass').value;

    fetch('../php/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    })
    .then(async res => {
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch (err) {
            throw new Error(text); // Tangkap error PHP jika ada
        }
    })
    .then(data => {
        if(data.status === 'success') {
            showAlert(data.message);
            sessionStorage.setItem('email_to_verify', email);
            setTimeout(() => {
                window.location.href = "verify.html";
            }, 2000);
        } else {
            showAlert(data.message);
        }
    })
    .catch(err => {
        console.error("Error Detail:", err);
        showAlert("Gagal menghubungi server pendaftaran.");
    });
});

function isUserLoggedIn() { return localStorage.getItem('currentUser') !== null; }

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user_token');
    localStorage.removeItem('newsHistory');
     
    window.location.href = '../index.html';
}