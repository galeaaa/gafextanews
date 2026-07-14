@extends('layouts.layout')

@section('title', 'GafextaNews - News Detail')

@section('styles')
    <link rel="stylesheet" href="{{ asset('assets/css/detail.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/auth.css') }}">
    <style>
        .comment-display-area { color: #000 !important; }
        .comment-item p { color: #000 !important; margin: 5px 0; }
        .news-body-text iframe,
        .news-body-text video,
        .news-body-text embed,
        .news-body-text object {
            max-width: 100% !important;
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 16/9;
            border-radius: 12px;
            border: 2px solid #000;
            display: block;
            margin: 20px 0;
        }
        .news-body-text figure {
            max-width: 100% !important;
            margin: 20px 0;
        }
        .news-body-text img {
            max-width: 100% !important;
            height: auto !important;
            border-radius: 12px;
            border: 2px solid #000;
            display: block;
        }
    </style>
@endsection

@section('search-form')
    <input type="text" id="search-input" placeholder="Search news..." autocomplete="off">
    <button type="button" class="search-btn" id="search-btn">
        <i class="fas fa-search"></i>
    </button>
@endsection

@section('content')
    <main class="detail-wrapper">
        <div class="left-column">
            <div class="main-content-card">
                <div class="header-article">
                    <h1 id="detail-title">Loading News...</h1>
                    <div class="meta-info-bar" id="detail-meta-bar">
                        <span class="category-badge" id="detail-category">
                            <i class="fas fa-tag"></i> <span id="detail-category-text">News</span>
                        </span>
                        <span class="meta-date" id="detail-date">
                            <i class="far fa-calendar-alt"></i> <span id="detail-date-text">Loading...</span>
                        </span>
                        <span class="meta-reading-time">
                            <i class="far fa-clock"></i> 5 min read
                        </span>
                        <span class="meta-author" id="detail-author" style="display: none;">
                            <i class="far fa-user"></i> <span id="detail-author-text"></span>
                        </span>
                        <button class="share-btn" onclick="shareCurrentArticle()">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                    </div>
                </div>

                <img id="detail-image" class="main-featured-image" src="" alt="Featured Image">

                <article class="news-body-text" id="detail-content">
                </article>

                <div class="comment-box">
                    <h3>
                        <i class="fa fa-comments"></i> 
                        Komentar
                        <span class="comment-count-badge" id="comment-count">0 komentar</span>
                    </h3>
                    <div id="comment-form-container">
                        <div class="comment-login-prompt">
                            <p>Have an opinion? Please login first to post a comment.</p>
                            <button class="btn-comment-action" onclick="showLoginModal()" style="background:#ed5858; color:white; border:3px solid #000; padding:12px 25px; border-radius:12px; font-weight:900; cursor:pointer;">Write Comment</button>
                        </div>
                    </div>
                    <div id="comment-list" class="comment-display-area">
                        <div class="comment-empty-state">
                            <i class="far fa-comment-dots"></i>
                            <p>Belum ada komentar. Jadilah yang pertama!</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="more-news-grid-container">
                <div class="section-header-bar">
                    <h3 class="grid-section-title">Read Also</h3>
                </div>
                <div class="news-scroll-grid" id="bottom-news-grid">
                </div>
            </div>
        </div>

        <aside class="detail-sidebar">
            <div class="sidebar-sticky-box">
                <h3 class="sidebar-title">Recommended</h3>
                <div id="recommendation-list">
                </div>
            </div>
        </aside>
    </main>
@endsection

@section('modals')
    <div id="category-toast" class="category-toast" style="position: fixed; bottom: 20px; right: 20px; background: #000; color: #fff; padding: 12px 20px; border: 2px solid #fff; border-radius: 4px; box-shadow: 4px 4px 0px #ff5e5e; z-index: 1000; opacity: 0; transform: translateY(16px); transition: all 0.3s ease; pointer-events: none;"></div>

    <div id="customAlert" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <p id="alertMessage"></p>
            <button onclick="closeAlert()">OK</button>
        </div>
    </div>

    <div id="loginModal" class="modal-overlay">
        <div class="modal-content">
            <i class="fa fa-lock fa-4x" style="color: #ed5858; margin-bottom:20px;"></i>
            <h2 style="margin-bottom: 15px; font-weight: 900;">Login Required!</h2>
            <p style="font-weight: 600; color: white;">Commenting features are only available for registered Gafexta News users.</p>
            <div class="modal-btns" style="margin-top:30px; display:flex; gap:15px; justify-content:center;">
                <button onclick="saveAndGoToLogin()" style="background:#ed5858; color:white; border:2px solid #000; padding:10px 20px; border-radius:10px; cursor:pointer; font-weight: bold;">Login Now</button>
                <button onclick="closeModal()" style="background:white; color:black; border:2px solid #000; padding:10px 20px; border-radius:10px; cursor:pointer;">Maybe Later</button>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ asset('assets/js/auth.js') }}"></script>
    <script src="{{ asset('assets/js/comment.js') }}"></script>
    <script src="{{ asset('assets/js/script.js') }}"></script>
    <script>
        const params = new URLSearchParams(window.location.search);
        const articleId = params.get('id');
        let displayedArticleIds = [];
        let currentArticle = null;

        async function fetchContent() {
            if (!articleId) return;
            displayedArticleIds.push(articleId);
            try {
                const detailUrl = '/api/news/detail?id=' + encodeURIComponent(articleId);
                const resDetail = await fetch(detailUrl);
                const dataDetail = await resDetail.json();
                const art = dataDetail.response.content;
                currentArticle = art;

                document.getElementById('detail-title').innerText = art.webTitle;
                document.getElementById('detail-image').src = art.fields?.thumbnail || 'https://via.placeholder.com/800x450';

                const categoryName = art.sectionName || 'News';
                document.getElementById('detail-category-text').innerText = categoryName;
                const catColors = getCategoryColor(categoryName);
                document.getElementById('detail-category').style.background = catColors.bg;
                document.getElementById('detail-category').style.color = catColors.text;
                document.getElementById('detail-category').style.borderColor = catColors.border;

                const pubDate = new Date(art.webPublicationDate);
                document.getElementById('detail-date-text').innerText = pubDate.toLocaleDateString('en-US', {
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric'
                });

                if (art.fields?.byline) {
                    document.getElementById('detail-author').style.display = 'inline-flex';
                    document.getElementById('detail-author-text').innerText = art.fields.byline;
                }

                let bodyContent = art.fields?.body || '<p>Failed to load news content.</p>';
                bodyContent = bodyContent.replace(/<iframe/g, '<div class="video-wrapper"><iframe');
                bodyContent = bodyContent.replace(/<\/iframe>/g, '</iframe></div>');
                document.getElementById('detail-content').innerHTML = bodyContent;

                // Bind main share button
                const mainShareBtn = document.querySelector('.meta-info-bar .share-btn');
                if (mainShareBtn) {
                    mainShareBtn.classList.add('cat-card-share');
                    mainShareBtn.setAttribute('data-title', art.webTitle.replace(/'/g, "\\'"));
                    mainShareBtn.setAttribute('data-url', '/detail?id=' + encodeURIComponent(art.id));
                }

                saveToHistory(art);
                await fetchRecommendations();
                await fetchBottomGrid();
                renderCommentSection();
            } catch (err) { 
                console.error(err); 
            }
        }

        function getCategoryColor(category) {
            const colors = {
                'Politics': { bg: '#e3f2fd', text: '#1565c0', border: '#90caf9' },
                'World': { bg: '#f3e5f5', text: '#6a1b9a', border: '#ce93d8' },
                'Sport': { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
                'Business': { bg: '#fff3e0', text: '#e65100', border: '#ffcc80' },
                'Technology': { bg: '#e0f7fa', text: '#00838f', border: '#80deea' },
                'Culture': { bg: '#fce4ec', text: '#c2185b', border: '#f48fb1' },
                'Entertainment': { bg: '#f3e5f5', text: '#7b1fa2', border: '#ce93d8' },
                'Lifestyle': { bg: '#e8f5e9', text: '#388e3c', border: '#a5d6a7' },
                'Economy': { bg: '#fff8e1', text: '#f57f17', border: '#ffe082' },
                'Science': { bg: '#e3f2fd', text: '#1565c0', border: '#90caf9' },
                'Health': { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
                'Education': { bg: '#e0f2f1', text: '#00695c', border: '#80cbc4' },
                'Travel': { bg: '#e1f5fe', text: '#0277bd', border: '#81d4fa' },
                'Food': { bg: '#fff3e0', text: '#ef6c00', border: '#ffcc80' },
                'Fashion': { bg: '#fce4ec', text: '#ad1457', border: '#f48fb1' },
                'Music': { bg: '#f3e5f5', text: '#6a1b9a', border: '#ce93d8' },
                'Art and Design': { bg: '#f3e5f5', text: '#7b1fa2', border: '#ce93d8' },
                'Football': { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
                'UK news': { bg: '#e3f2fd', text: '#1565c0', border: '#90caf9' },
                'US news': { bg: '#e3f2fd', text: '#1565c0', border: '#90caf9' },
                'Environment': { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
                'Crime': { bg: '#ffebee', text: '#c62828', border: '#ef9a9a' },
                'Law': { bg: '#e3f2fd', text: '#1565c0', border: '#90caf9' },
                'Finance': { bg: '#fff8e1', text: '#f57f17', border: '#ffe082' },
                'Opinion': { bg: '#fff3e0', text: '#e65100', border: '#ffcc80' },
                'Australia news': { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' }
            };
            return colors[category] || { bg: '#fdf2f2', text: '#ed5858', border: '#f8c5ca' };
        }

        function saveToHistory(art) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const historyKey = currentUser && currentUser.id ? 'newsHistory_' + currentUser.id : 'newsHistory';
            let history = JSON.parse(localStorage.getItem(historyKey)) || [];
            history = history.filter(item => item.id !== art.id);
            history.unshift({
                id: art.id,
                title: art.webTitle,
                thumbnail: art.fields?.thumbnail || 'https://via.placeholder.com/65',
                category: art.sectionName || 'News',
                timeRead: new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
            });
            if (history.length > 20) history.pop();
            localStorage.setItem(historyKey, JSON.stringify(history));
        }

        async function fetchRecommendations() {
            const section = currentArticle ? currentArticle.sectionId : '';
            const recUrl = '/api/news/recommendations?section=' + encodeURIComponent(section) + '&page-size=10';
            const resRec = await fetch(recUrl);
            const dataRec = await resRec.json();
            const side = document.getElementById('recommendation-list');
            side.innerHTML = ''; 
            let count = 0;

            dataRec.response.results.forEach(item => {
                if (!displayedArticleIds.includes(item.id) && count < 5) {
                    displayedArticleIds.push(item.id);
                    const categoryName = item.sectionName || 'News';
                    const catColors = getCategoryColor(categoryName);
                    const pubDate = new Date(item.webPublicationDate);
                    const formattedDate = pubDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                    const hasImage = item.fields?.thumbnail && item.fields.thumbnail.startsWith('http');
                    const isBookmarked = isArticleBookmarked(item.id);
                    const encodedId = encodeURIComponent(item.id);
                    const safeTitle = item.webTitle.replace(/'/g, "\\'");

                    side.innerHTML += `
                        <div class="rec-card-wrapper">
                            <a href="/detail?id=${encodedId}" class="rec-card">
                                <div class="rec-image-wrapper">
                                    ${hasImage ? `<img src="${item.fields.thumbnail}" alt="thumb">` : `<i class="fas fa-newspaper no-image-icon"></i>`}
                                </div>
                                <div class="rec-content">
                                    <span class="rec-category-badge" style="background: ${catColors.bg}; color: ${catColors.text}; border: 1px solid ${catColors.border};">
                                        ${categoryName}
                                    </span>
                                    <span class="rec-title">${item.webTitle}</span>
                                    <span class="rec-meta">
                                        <i class="far fa-calendar"></i> ${formattedDate}
                                    </span>
                                </div>
                            </a>
                            <div class="rec-actions">
                                <button class="rec-action-btn cat-card-bookmark ${isBookmarked ? 'saved' : ''}" 
                                        id="bookmark-btn-${encodedId}"
                                        data-id="${item.id}" data-title="${safeTitle}" data-thumbnail="${item.fields?.thumbnail || ''}" data-category="${categoryName}">
                                    <i class="fas fa-bookmark"></i> ${isBookmarked ? 'Saved' : 'Save'}
                                </button>
                                <button class="rec-action-btn cat-card-share" data-title="${safeTitle}" data-url="/detail?id=${encodedId}">
                                    <i class="fas fa-share-alt"></i> Share
                                </button>
                            </div>
                        </div>
                    `;
                    count++;
                }
            });
        }

        async function fetchBottomGrid() {
            const section = currentArticle ? currentArticle.sectionId : '';
            const gridUrl = '/api/news/recommendations?section=' + encodeURIComponent(section) + '&page-size=20';
            const resGrid = await fetch(gridUrl);
            const dataGrid = await resGrid.json();
            const gridCont = document.getElementById('bottom-news-grid');
            gridCont.innerHTML = '';
            let count = 0;

            dataGrid.response.results.forEach(item => {
                if (!displayedArticleIds.includes(item.id) && count < 12) {
                    const categoryName = item.sectionName || 'News';
                    const catColors = getCategoryColor(categoryName);
                    const pubDate = new Date(item.webPublicationDate);
                    const formattedDate = pubDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                    const hasImage = item.fields?.thumbnail && item.fields.thumbnail.startsWith('http');
                    const isBookmarked = isArticleBookmarked(item.id);
                    const encodedId = encodeURIComponent(item.id);
                    const safeTitle = item.webTitle.replace(/'/g, "\\'");

                    gridCont.innerHTML += `
                        <div class="grid-news-card-wrapper">
                            <div class="grid-news-card">
                                <div class="card-image-wrapper" onclick="location.href='/detail?id=${encodedId}'" style="cursor: pointer;">
                                    ${hasImage ? `<img src="${item.fields.thumbnail}" alt="news">` : `<i class="fas fa-newspaper no-image-icon"></i>`}
                                </div>
                                <span class="card-category-badge" style="background: ${catColors.bg}; color: ${catColors.text}; border: 1px solid ${catColors.border};">
                                    ${categoryName}
                                </span>
                                <h4 onclick="location.href='/detail?id=${encodedId}'" style="cursor: pointer;">${item.webTitle}</h4>
                                <span class="card-meta">
                                    <i class="far fa-calendar"></i> ${formattedDate}
                                </span>
                            </div>
                            <div class="grid-card-actions">
                                <button class="grid-action-btn cat-card-bookmark ${isBookmarked ? 'saved' : ''}" 
                                        id="bookmark-btn-grid-${encodedId}"
                                        data-id="${item.id}" data-title="${safeTitle}" data-thumbnail="${item.fields?.thumbnail || ''}" data-category="${categoryName}">
                                    <i class="fas fa-bookmark"></i> ${isBookmarked ? 'Saved' : 'Save'}
                                </button>
                                <button class="grid-action-btn cat-card-share" data-title="${safeTitle}" data-url="/detail?id=${encodedId}">
                                    <i class="fas fa-share-alt"></i> Share
                                </button>
                            </div>
                        </div>
                    `;
                    count++;
                }
            });
        }

        async function renderCommentSection() {
            const container = document.getElementById('comment-form-container');
            if (isUserLoggedIn()) {
                container.innerHTML = `
                    <div class="comment-form-wrapper">
                        <textarea id="comment-input" placeholder="Tulis pendapatmu di sini..." maxlength="500"></textarea>
                        <div class="comment-char-count">0 / 500</div>
                        <button class="btn-kirim" onclick="postComment(articleId)">Kirim Komentar</button>
                    </div>
                `;
                const textarea = document.getElementById('comment-input');
                const charCount = container.querySelector('.comment-char-count');
                textarea.addEventListener('input', function() {
                    charCount.textContent = this.value.length + ' / 500';
                });
            }
            await loadComments(articleId);
            startAutoRefresh(articleId);
        }

        function showAlert(message) {
            const alertModal = document.getElementById('customAlert');
            const alertMessage = document.getElementById('alertMessage');
            alertMessage.textContent = message;
            alertModal.classList.add('active');
        }

        function closeAlert() {
            document.getElementById('customAlert').classList.remove('active');
        }

        function saveAndGoToLogin() {
            sessionStorage.setItem('lastVisitedPage', window.location.href);
            window.location.href = '/login';
        }

        function showLoginModal() { 
            if (isUserLoggedIn()) {
                renderCommentSection();
            } else {
                document.getElementById('loginModal').classList.add('active');
            }
        }

        function closeModal() { 
            document.getElementById('loginModal').classList.remove('active'); 
        }

        document.addEventListener('DOMContentLoaded', () => {
            fetchContent();
        });
    </script>
@endsection
