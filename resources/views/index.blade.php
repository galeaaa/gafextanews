@extends('layouts.layout')

@section('title', 'GafextaNews - Your Trusted News Portal')

@section('active-home', 'active')
@section('home-link-text', 'For You')

@section('styles')
    <link rel="stylesheet" href="{{ asset('assets/css/dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/auth.css') }}">
@endsection

@section('search-form')
    <input type="text" id="search-input" placeholder="Search news..." autocomplete="off">
    <button type="button" class="search-btn" id="search-btn">
        <i class="fas fa-search"></i>
    </button>
@endsection

@section('content')
    <!-- BREAKING NEWS TICKER -->
    <div class="breaking-news-bar">
        <span class="breaking-badge">Breaking</span>
        <div class="ticker-wrapper">
            <div class="ticker-track" id="ticker-track">
                <span class="ticker-item">Loading latest headlines...</span>
            </div>
        </div>
    </div>

    <main class="container">
        <section class="headline-section">
            <div id="headline-container" class="headline-big">
                <div class="loading">Loading Top Stories...</div>
            </div>

            <!-- Comments section -->
            <div class="comments-section-collapsible" id="comments-section">
                <div class="comments-header" onclick="handleCommentsClick()">
                    <div class="comments-header-left">
                        <i class="far fa-comment-dots"></i>
                        <span class="comments-label">Comments</span>
                        <span class="comments-count-badge" id="comments-count">0</span>
                    </div>
                    <div class="comments-header-right">
                        <i class="fas fa-chevron-down" id="comments-toggle-icon"></i>
                    </div>
                </div>
                <div class="comments-body" id="comments-body">
                    <div class="comments-list" id="comments-list">
                        <div class="comments-empty-state" id="comments-empty">
                            <i class="far fa-comments"></i>
                            <p>No comments yet. Be the first to share your thoughts!</p>
                        </div>
                    </div>
                    <div class="comments-input-area">
                        <div class="comments-input-wrapper">
                            <input type="text" id="comment-input" placeholder="Write a message..." autocomplete="off">
                            <button class="comment-send-btn" onclick="handleCommentSubmit()">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="latest-articles">
            <h3>LATEST ARTICLES</h3>
            <div id="latest-news-container">
                <div class="loading">Loading articles list...</div>
            </div>
        </section>

        <aside class="sidebar">
            <div class="popular-section sidebar-box">
                <h3>MOST POPULAR</h3>
                <ol id="sidebar-news-container"></ol>
            </div>
        </aside>

        <div class="category-section full-width-category">
            <h3>POPULAR CATEGORIES</h3>
            <div class="tags">
                <span onclick="location.href='/category?cat=world'"><i class="fas fa-globe cat-icon"></i> World</span>
                <span onclick="location.href='/category?cat=politics'"><i class="fas fa-landmark cat-icon"></i> Politics</span>
                <span onclick="location.href='/category?cat=science'"><i class="fas fa-flask cat-icon"></i> Science</span>
                <span onclick="location.href='/category?cat=environment'"><i class="fas fa-leaf cat-icon"></i> Environment</span>
                <span onclick="location.href='/category?cat=health'"><i class="fas fa-heart-pulse cat-icon"></i> Health</span>
                <span onclick="location.href='/category?cat=business'"><i class="fas fa-briefcase cat-icon"></i> Business</span>
                <span onclick="location.href='/category?cat=finance'"><i class="fas fa-coins cat-icon"></i> Finance</span>
                <span onclick="location.href='/category?cat=culture'"><i class="fas fa-palette cat-icon"></i> Culture</span>
                <span onclick="location.href='/category?cat=technology'"><i class="fas fa-microchip cat-icon"></i> Technology</span>
                <span onclick="location.href='/category?cat=crime'"><i class="fas fa-gavel cat-icon"></i> Crime</span>
                <span onclick="location.href='/category?cat=lifestyle'"><i class="fas fa-heart cat-icon"></i> Lifestyle</span>
                <span onclick="location.href='/category?cat=law'"><i class="fas fa-scale-balanced cat-icon"></i> Law</span>
                <span onclick="location.href='/category?cat=education'"><i class="fas fa-graduation-cap cat-icon"></i> Education</span>
                <span onclick="location.href='/category?cat=fashion'"><i class="fas fa-shirt cat-icon"></i> Fashion</span>
                <span onclick="location.href='/category?cat=music'"><i class="fas fa-music cat-icon"></i> Music</span>
                <span onclick="location.href='/category?cat=travel'"><i class="fas fa-plane cat-icon"></i> Travel</span>
                <span onclick="location.href='/category?cat=food'"><i class="fas fa-utensils cat-icon"></i> Food</span>
                <span onclick="location.href='/category?cat=sport'"><i class="fas fa-futbol cat-icon"></i> Sport</span>
            </div>
        </div>
    </main>
@endsection

@section('modals')
    <!-- Alert Modal -->
    <div id="customAlert" class="modal-overlay" style="display: none;">
        <div class="modal-box">
            <div class="modal-icon-alert"><i class="fas fa-exclamation-circle"></i></div>
            <p id="alertMessage" class="modal-text"></p>
            <button onclick="closeAlert()" class="modal-btn-primary">OK</button>
        </div>
    </div>

    <!-- Login Required Modal (khusus comment) -->
    <div id="loginModal" class="modal-overlay" style="display: none;">
        <div class="modal-box">
            <div class="modal-icon-login"><i class="fas fa-lock"></i></div>
            <h2 class="modal-title">Login Required</h2>
            <p class="modal-text">Have an opinion? Please login first to post a comment.</p>
            <div class="modal-actions">
                <button onclick="saveAndGoToLogin()" class="modal-btn-primary">Login Now</button>
                <button onclick="closeModal()" class="modal-btn-secondary">Maybe Later</button>
            </div>
        </div>
    </div>

    <!-- Bookmark Toast -->
    <div id="bookmark-toast" class="bookmark-toast">
        <i class="fas fa-bookmark"></i> <span id="bookmark-toast-msg">Article saved!</span>
    </div>
@endsection

@section('scripts')
    <script src="{{ asset('assets/js/auth.js') }}"></script>
    <script src="{{ asset('assets/js/comment.js') }}"></script>
    <script src="{{ asset('assets/js/script.js') }}"></script>
    <script>

        function handleCommentsClick() {
            if (!hasOpenedArticle) {
                showAlert("Please click on a news article first to view its comments.");
                return;
            }
            toggleCommentsSection();
        }

        function toggleCommentsSection() {
            const commentsSection = document.getElementById('comments-section');
            const toggleIcon = document.getElementById('comments-toggle-icon');
            if (commentsSection.classList.contains('expanded')) {
                commentsSection.classList.remove('expanded');
                toggleIcon.style.transform = 'rotate(0deg)';
            } else {
                commentsSection.classList.add('expanded');
                toggleIcon.style.transform = 'rotate(180deg)';
            }
        }

        function loadCommentsCount(articleId) {
            const comments = JSON.parse(localStorage.getItem('comments_' + articleId)) || [];
            const countBadge = document.getElementById('comments-count');
            if (countBadge) countBadge.textContent = comments.length;
            return comments;
        }

        function loadCommentsList(articleId) {
            const comments = JSON.parse(localStorage.getItem('comments_' + articleId)) || [];
            const commentsList = document.getElementById('comments-list');
            const emptyState = document.getElementById('comments-empty');
            if (!commentsList) return;
            commentsList.querySelectorAll('.comment-item').forEach(item => item.remove());
            if (comments.length === 0) {
                if (emptyState) emptyState.style.display = 'flex';
            } else {
                if (emptyState) emptyState.style.display = 'none';
                comments.forEach(comment => {
                    const commentEl = document.createElement('div');
                    commentEl.className = 'comment-item';
                    commentEl.innerHTML = `
                        <div class="comment-avatar"><i class="fas fa-user-circle"></i></div>
                        <div class="comment-content">
                            <div class="comment-author">${comment.author}</div>
                            <div class="comment-text">${comment.text}</div>
                            <div class="comment-meta">
                                <span>${comment.time}</span>
                                <span class="comment-reply-btn">Reply</span>
                            </div>
                        </div>`;
                    commentsList.appendChild(commentEl);
                });
            }
        }

        function handleCommentSubmit() {
            if (!isUserLoggedIn()) {
                document.getElementById('loginModal').style.display = 'flex';
                return;
            }
            const input = document.getElementById('comment-input');
            const text = input.value.trim();
            if (!text) return;
            const emptyState = document.getElementById('comments-empty');
            if (emptyState) emptyState.style.display = 'none';
            const commentsList = document.getElementById('comments-list');
            const newComment = document.createElement('div');
            newComment.className = 'comment-item';
            newComment.innerHTML = `
                <div class="comment-avatar"><i class="fas fa-user-circle"></i></div>
                <div class="comment-content">
                    <div class="comment-author">You</div>
                    <div class="comment-text">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                    <div class="comment-meta"><span>Just now</span><span class="comment-reply-btn">Reply</span></div>
                </div>`;
            commentsList.appendChild(newComment);
            input.value = '';
            const countBadge = document.getElementById('comments-count');
            countBadge.textContent = (parseInt(countBadge.textContent) || 0) + 1;
            const articleId = currentArticleId || 'headline';
            let savedComments = JSON.parse(localStorage.getItem('comments_' + articleId)) || [];
            savedComments.push({ author: 'You', text: text.replace(/</g, '&lt;').replace(/>/g, '&gt;'), time: 'Just now' });
            localStorage.setItem('comments_' + articleId, JSON.stringify(savedComments));
            commentsList.scrollTop = commentsList.scrollHeight;
        }

        function markArticleOpened(articleId) {
            hasOpenedArticle = true;
            currentArticleId = articleId || 'headline';
            loadCommentsCount(currentArticleId);
            loadCommentsList(currentArticleId);
        }

        document.addEventListener('DOMContentLoaded', function() {
            const commentInput = document.getElementById('comment-input');
            if (commentInput) {
                commentInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') handleCommentSubmit();
                });
            }
        });

        function saveAndGoToLogin() {
            sessionStorage.setItem('lastVisitedPage', window.location.href);
            window.location.href = '/login';
        }
        function closeModal() { document.getElementById('loginModal').style.display = 'none'; }
        function closeAlert() { document.getElementById('customAlert').style.display = 'none'; }
        function showAlert(message) {
            document.getElementById('alertMessage').innerText = message;
            document.getElementById('customAlert').style.display = 'flex';
        }
    </script>
@endsection
