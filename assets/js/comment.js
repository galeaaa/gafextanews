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

    commentList.innerHTML = currentArticleComments.map(c => `
        <div class="comment-item" style="border-bottom: 1px solid #ddd; margin-bottom: 10px; padding-bottom: 10px;">
            <strong style="color: #ed5858;">${c.username}</strong>
            <small style="display: block; color: #777; font-size: 11px;">${c.date}</small>
            <p style="margin-top: 5px; color: #fff;">${c.text}</p>
        </div>
    `).join('');
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