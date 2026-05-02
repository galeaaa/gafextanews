// Fungsi untuk memunculkan notifikasi custom
function showAlert(message) {
    const alertBox = document.getElementById('customAlert');
    const alertMsg = document.getElementById('alertMessage');
    if (alertBox && alertMsg) {
        alertMsg.innerText = message;
        alertBox.style.display = 'flex';
    }
}

// Fungsi untuk menutup notifikasi custom
function closeAlert() {
    const alertBox = document.getElementById('customAlert');
    if (alertBox) {
        alertBox.style.display = 'none';
    }
}

// --- FUNGSI LOGIN ---
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;

    const db = JSON.parse(localStorage.getItem('gafexta_db')) || [];
    const userFound = db.find(u => u.email === email && u.password === password);

    if(userFound) {
        localStorage.setItem('currentUser', JSON.stringify(userFound));
        showAlert("Login Berhasil!");
        
        setTimeout(() => {
            // PERBAIKAN: Cek sessionStorage terlebih dahulu, baru referrer
            const savedPage = sessionStorage.getItem('lastVisitedPage');
            const prevPage = document.referrer;
            
            if (savedPage) {
                window.location.href = savedPage;
                sessionStorage.removeItem('lastVisitedPage');
            } else if (prevPage && !prevPage.includes('login.html') && !prevPage.includes('register.html') && prevPage !== "") {
                window.location.href = prevPage;
            } else {
                window.location.href = "../index.html";
            }
        }, 1500);
    } else {
        showAlert("Email atau Password salah!");
    }
});

// --- FUNGSI REGISTER ---
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-pass').value;

    let db = JSON.parse(localStorage.getItem('gafexta_db')) || [];

    // Cek apakah email sudah terdaftar
    const isExist = db.some(user => user.email === email);

    if(isExist) {
        showAlert("Email ini sudah terdaftar!");
    } else {
        // Simpan user baru
        const newUser = { username, email, password };
        db.push(newUser);
        localStorage.setItem('gafexta_db', JSON.stringify(db));
        
        // Langsung set sebagai currentUser agar otomatis login setelah daftar
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        showAlert("Akun berhasil dibuat!");

        setTimeout(() => {
            // PERBAIKAN: Logika pengalihan yang sama untuk Register
            const savedPage = sessionStorage.getItem('lastVisitedPage');
            const prevPage = document.referrer;
            
            if (savedPage) {
                window.location.href = savedPage;
                sessionStorage.removeItem('lastVisitedPage');
            } else if (prevPage && !prevPage.includes('login.html') && !prevPage.includes('register.html') && prevPage !== "") {
                window.location.href = prevPage;
            } else {
                window.location.href = "../index.html";
            }
        }, 1500);
    }
});

// Fungsi Cek Status Login
function isUserLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Fungsi Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}