// assets/js/comment.js

function handleCommentClick() {
    // Mengecek apakah ada user yang sedang login di localStorage
    const currentUser = localStorage.getItem('currentUser'); 

    if (!currentUser) {
        // GANTI ALERT LAMA: Menampilkan Custom Modal Pop-up
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    } else {
        // Jika sudah login, arahkan ke detail berita untuk menulis komentar
        const commentForm = document.getElementById('comment-form');
        if (commentForm) {
            commentForm.scrollIntoView({ behavior: 'smooth' });
            document.getElementById('write-comment-input')?.focus();
        } else {
            // Jika diklik dari dashboard, buka berita pertama/terbaru
            window.location.href = 'pages/detail.html';
        }
    }
}

// Fungsi untuk menutup modal
function closeModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Fungsi tambahan untuk mengaktifkan form jika sudah login
function enableCommentForm() {
    const commentArea = document.querySelector('.comment-input-area');
    if (commentArea) {
        commentArea.style.display = 'block';
    }
}

// Menutup modal jika user klik area luar kotak modal
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target == modal) {
        closeModal();
    }
}