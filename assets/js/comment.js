// ============================================
// GAFEXTA COMMENT SYSTEM - FIREBASE REALTIME
// ============================================

const firebaseConfig = {
    databaseURL: "https://gafexta-news-26222-default-rtdb.firebaseio.com"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = typeof firebase !== 'undefined' ? firebase.database() : null;
const commentsRef = db ? db.ref('comments') : null;

// ============================================
// ENCODE ARTICLE ID BIAR AMAN BUAT FIREBASE
// ============================================
function encodeArticleId(articleId) {
    // Ganti karakter yang gak boleh di Firebase jadi safe character
    return btoa(articleId).replace(/[.=]/g, '_');
}

// ============================================
// FETCH DATA DARI FIREBASE
// ============================================
async function fetchComments() {
    if (!commentsRef) {
        console.warn('Firebase not available, fallback to localStorage');
        return JSON.parse(localStorage.getItem('gafexta_comments')) || {};
    }
    
    try {
        const snapshot = await commentsRef.once('value');
        return snapshot.val() || {};
    } catch (e) {
        console.warn('Gagal fetch dari Firebase, fallback ke local:', e);
        return JSON.parse(localStorage.getItem('gafexta_comments')) || {};
    }
}

// ============================================
// SAVE DATA KE FIREBASE
// ============================================
async function saveComments(allComments) {
    if (!commentsRef) {
        console.warn('Firebase not available, fallback to localStorage');
        localStorage.setItem('gafexta_comments', JSON.stringify(allComments));
        return false;
    }
    
    try {
        await commentsRef.set(allComments);
        return true;
    } catch (e) {
        console.warn('Gagal save ke Firebase, fallback ke local:', e);
        localStorage.setItem('gafexta_comments', JSON.stringify(allComments));
        return false;
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

    const safeId = encodeArticleId(articleId);
    const allComments = await fetchComments();
    const currentArticleComments = allComments[safeId] || [];

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

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    commentList.innerHTML = currentArticleComments.map(c => {
        const isMe = currentUser && currentUser.username === c.username;
        const hasPhoto = isMe && currentUser.profilePic;
        
        const avatarDisplay = hasPhoto 
            ? `<img src="${currentUser.profilePic}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`
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

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showAlert("Silakan login terlebih dahulu!");
        return;
    }

    const safeId = encodeArticleId(articleId);
    const allComments = await fetchComments();

    if (!allComments[safeId]) {
        allComments[safeId] = [];
    }

    const newComment = {
        username: currentUser.username,
        text: text,
        date: new Date().toLocaleString('id-ID')
    };

    allComments[safeId].unshift(newComment);
    
    await saveComments(allComments);

    commentInput.value = '';
    await loadComments(articleId);
    showAlert("Komentar berhasil dikirim!");
}

// ============================================
// AUTO REFRESH SETIAP 5 DETIK
// ============================================
function startAutoRefresh(articleId) {
    setInterval(() => {
        loadComments(articleId);
    }, 5000);
}