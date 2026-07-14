// ============================================
// GAFEXTA COMMENT SYSTEM - DATABASE MYSQL
// ============================================

// ============================================
// FETCH DATA DARI DATABASE MYSQL
// ============================================
async function fetchComments(articleId) {
    try {
        const response = await fetch('/api/comments?news_id=' + encodeURIComponent(articleId));
        if (!response.ok) throw new Error('Network response not ok');
        return await response.json();
    } catch (e) {
        console.error('Gagal fetch komentar:', e);
        return [];
    }
}

// ============================================
// UPDATE COMMENT COUNT BADGE
// ============================================
function updateCommentCount(count) {
    const badge = document.getElementById('comment-count');
    if (badge) {
        badge.textContent = count + ' komentar';
    }
}

// ============================================
// LOAD COMMENTS
// ============================================
async function loadComments(articleId) {
    const commentList = document.getElementById('comment-list');
    if (!commentList) return;

    const currentArticleComments = await fetchComments(articleId);

    updateCommentCount(currentArticleComments.length);

    if (currentArticleComments.length === 0) {
        commentList.innerHTML = `
            <div class="comment-empty-state">
                <i class="far fa-comment-dots"></i>
                <p>Belum ada komentar. Jadilah yang pertama!</p>
            </div>
        `;
        return;
    }

    commentList.innerHTML = currentArticleComments.map(c => {
        const avatarDisplay = c.profile_pic 
            ? `<img src="${c.profile_pic}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`
            : (c.username ? c.username.charAt(0).toUpperCase() : '?');
        
        return `
        <div class="comment-item" style="display: flex; gap: 15px; margin-bottom: 20px; align-items: flex-start;">
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
            <div class="comment-body">
                <strong style="color: #ed5858; font-size: 1.1rem; font-weight: 900;">${c.username}</strong>
                <small style="display: block; color: #777; font-size: 11px;">${c.date}</small>
                <p style="margin-top: 5px; color: #000; font-weight: 500; line-height: 1.4;">${c.text}</p>
            </div>
        </div>
    `}).join('');
}

// ============================================
// POST COMMENT
// ============================================
async function postComment(articleId) {
    const commentInput = document.getElementById('comment-input');
    const text = commentInput.value.trim();

    if (!text) {
        showAlert("Komentar tidak boleh kosong!");
        return;
    }

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    try {
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({
                news_id: articleId,
                comment_text: text
            })
        });

        const result = await response.json();
        if (response.status === 200 || result.status === 'success') {
            commentInput.value = '';
            await loadComments(articleId);
            showAlert("Komentar berhasil dikirim!");
        } else {
            showAlert(result.message || "Gagal mengirim komentar.");
        }
    } catch (e) {
        console.error('Error posting comment:', e);
        showAlert("Gagal mengirim komentar. Silakan coba lagi.");
    }
}

// ============================================
// AUTO REFRESH SETIAP 5 DETIK
// ============================================
function startAutoRefresh(articleId) {
    setInterval(() => {
        loadComments(articleId);
    }, 5000);
}