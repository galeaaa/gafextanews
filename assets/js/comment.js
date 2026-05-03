// Fungsi untuk memuat komentar berdasarkan ID artikel
function loadComments(articleId) {
    const commentList = document.getElementById('comment-list');
    if (!commentList) return;

    const allComments = JSON.parse(localStorage.getItem('gafexta_comments')) || {};
    const currentArticleComments = allComments[articleId] || [];

    if (currentArticleComments.length === 0) {
        commentList.innerHTML = '<p class="no-comment">Belum ada komentar. Jadilah yang pertama!</p>';
        return;
    }

    // Ambil data user yang sedang login untuk referensi foto terbaru
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    commentList.innerHTML = currentArticleComments.map(c => {
        // Cek apakah user yang komen adalah user saat ini, jika ya gunakan fotonya
        const isMe = currentUser && currentUser.username === c.username;
        const hasPhoto = isMe && currentUser.profilePic;
        
        const avatarDisplay = hasPhoto 
            ? `<img src="${currentUser.profilePic}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`
            : (c.username ? c.username.charAt(0).toUpperCase() : '?');
        
        return `
        <div class="comment-item" style="display: flex; gap: 15px; margin-bottom: 20px; align-items: flex-start;">
            <!-- Avatar Circle -->
            <div class="comment-avatar" style="
                width: 45px; 
                height: 45px; 
                background: #ed5858; 
                border: 2px solid #000; 
                border-radius: 50%; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                color: white; 
                font-weight: bold; 
                font-size: 1.2rem;
                flex-shrink: 0;
                box-shadow: 3px 3px 0px #000;
                overflow: hidden;
            ">
                ${avatarDisplay}
            </div>

            <!-- Comment Content -->
            <div class="comment-body">
                <strong style="color: #ed5858; font-size: 1.1rem; font-weight: 900;">${c.username}</strong>
                <small style="display: block; color: #777; font-size: 11px;">${c.date}</small>
                <p style="margin-top: 5px; color: #000; font-weight: 500; line-height: 1.4;">${c.text}</p>
            </div>
        </div>
    `}).join('');
}

// Fungsi untuk mengirim komentar
function postComment(articleId) {
    const commentInput = document.getElementById('comment-input');
    const text = commentInput.value.trim();

    if (!text) {
        showAlert("Komentar tidak boleh kosong!");
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allComments = JSON.parse(localStorage.getItem('gafexta_comments')) || {};

    if (!allComments[articleId]) {
        allComments[articleId] = [];
    }

    const newComment = {
        username: currentUser.username,
        text: text,
        date: new Date().toLocaleString('id-ID')
    };

    allComments[articleId].unshift(newComment); // Tambah ke paling atas
    localStorage.setItem('gafexta_comments', JSON.stringify(allComments));

    commentInput.value = ''; // Kosongkan input
    loadComments(articleId); // Refresh daftar komentar
    showAlert("Komentar berhasil dikirim!");
}