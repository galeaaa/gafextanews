// GAFEXTA NEWS - SCRIPT FOR THE GUARDIAN API 
const API_KEY = '6efbc366-a3f6-4b0f-8161-7904491fcfbe'; 
const BASE_URL = `https://content.guardianapis.com/search?api-key=${API_KEY}&show-fields=thumbnail,trailText,bodyText&page-size=15`;

// ==================== USER MANAGEMENT SYSTEM (CONNECTED TO PHP API) ====================

function isUserLoggedIn() {
    return localStorage.getItem('user_token') !== null || sessionStorage.getItem('user_token') !== null;
}

function protectPage() {
    const currentPath = window.location.pathname;
    if (!isUserLoggedIn() && currentPath.includes('profile.html')) {
        if (currentPath.includes('/pages/')) {
            window.location.href = 'login.html';
        } else {
            window.location.href = 'pages/login.html';
        }
    }
}

function logoutUser() {
    localStorage.removeItem('user_token');
    sessionStorage.removeItem('user_token');

    const currentPath = window.location.pathname;
    if (currentPath.includes('/pages/')) {
        window.location.href = 'login.html';
    } else {
        window.location.href = 'pages/login.html';
    }
}

// ==================== COMMENTS SECTION - OPSI B ====================

// PERBAIKAN: Track apakah user sudah buka berita
let hasOpenedArticle = false;
let currentArticleId = null;

// PERBAIKAN: Cek dulu apakah user sudah buka berita sebelum bisa lihat komen
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

// PERBAIKAN: Load comments count dari storage untuk artikel saat ini
function loadCommentsCount(articleId) {
    const comments = JSON.parse(localStorage.getItem('comments_' + articleId)) || [];
    const countBadge = document.getElementById('comments-count');
    if (countBadge) {
        countBadge.textContent = comments.length;
    }
    return comments;
}

// PERBAIKAN: Load comments list dari storage
function loadCommentsList(articleId) {
    const comments = JSON.parse(localStorage.getItem('comments_' + articleId)) || [];
    const commentsList = document.getElementById('comments-list');
    const emptyState = document.getElementById('comments-empty');

    if (!commentsList) return;

    // Clear existing comments (keep empty state)
    const existingItems = commentsList.querySelectorAll('.comment-item');
    existingItems.forEach(item => item.remove());

    if (comments.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        comments.forEach(comment => {
            const commentEl = document.createElement('div');
            commentEl.className = 'comment-item';
            commentEl.innerHTML = `
                <div class="comment-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="comment-content">
                    <div class="comment-author">${comment.author}</div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-meta">
                        <span>${comment.time}</span>
                        <span class="comment-reply-btn">Reply</span>
                    </div>
                </div>
            `;
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

    // Sembunyikan empty state
    const emptyState = document.getElementById('comments-empty');
    if (emptyState) emptyState.style.display = 'none';

    // Add new comment to DOM
    const commentsList = document.getElementById('comments-list');
    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    newComment.innerHTML = `
        <div class="comment-avatar">
            <i class="fas fa-user-circle"></i>
        </div>
        <div class="comment-content">
            <div class="comment-author">You</div>
            <div class="comment-text">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <div class="comment-meta">
                <span>Just now</span>
                <span class="comment-reply-btn">Reply</span>
            </div>
        </div>
    `;
    commentsList.appendChild(newComment);
    input.value = '';

    // Update count badge
    const countBadge = document.getElementById('comments-count');
    const currentCount = parseInt(countBadge.textContent) || 0;
    countBadge.textContent = currentCount + 1;

    // Save to localStorage
    const articleId = currentArticleId || 'headline';
    let savedComments = JSON.parse(localStorage.getItem('comments_' + articleId)) || [];
    savedComments.push({
        author: 'You',
        text: text.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
        time: 'Just now'
    });
    localStorage.setItem('comments_' + articleId, JSON.stringify(savedComments));

    // Scroll to bottom
    commentsList.scrollTop = commentsList.scrollHeight;
}

// PERBAIKAN: Set article as opened when clicking on headline
function markArticleOpened(articleId) {
    hasOpenedArticle = true;
    currentArticleId = articleId || 'headline';
    loadCommentsCount(currentArticleId);
    loadCommentsList(currentArticleId);
}



// ==================== NEWS FUNCTIONS ====================

async function fetchNews(query = '') {
    try {
        let url = BASE_URL;
        if (query) {
            url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${API_KEY}&show-fields=thumbnail,trailText&page-size=15`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.response && data.response.status === "ok") {
            const urlParams = new URLSearchParams(window.location.search);
            const articleId = urlParams.get('id');

            if (articleId && window.location.pathname.includes('detail.html')) {
                fetchArticleDetail(articleId);
            } else {
                displayNews(data.response.results);
                populateTicker(data.response.results);
                storeArticlesForAutocomplete(data.response.results);
            }
        } else {
            handleError("Failed to load news from API.");
        }
    } catch (error) {
        console.error("Error:", error);
        handleError("Check your internet connection or API Key.");
    }
}

function saveToReadingHistory(articleId, article) {
    if (!article) return;
    let history = JSON.parse(localStorage.getItem('newsHistory')) || [];
    const existingIndex = history.findIndex(item => item.id === articleId);

    const historyItem = {
        id: articleId,
        title: article.webTitle,
        thumbnail: article.fields?.thumbnail || 'https://via.placeholder.com/65',
        category: article.sectionName || 'News',
        timeRead: new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
    };

    if (existingIndex !== -1) history.splice(existingIndex, 1);
    history.unshift(historyItem);
    if (history.length > 20) history.pop();

    localStorage.setItem('newsHistory', JSON.stringify(history));
}

async function fetchArticleDetail(id) {
    try {
        const detailUrl = `https://content.guardianapis.com/${id}?api-key=${API_KEY}&show-fields=thumbnail,bodyText`;
        const response = await fetch(detailUrl);
        const data = await response.json();
        const article = data.response.content;

        if (article) {
            const titleEl = document.getElementById('detail-title');
            const imgEl = document.getElementById('detail-image');
            const contentEl = document.getElementById('news-content');

            if (titleEl) titleEl.innerText = article.webTitle;
            if (imgEl) imgEl.src = article.fields?.thumbnail || 'https://via.placeholder.com/800x450';

            if (contentEl) {
                const rawText = article.fields?.bodyText || '';
                contentEl.innerHTML = rawText
                    .split('\n')
                    .map(p => p.trim())
                    .filter(p => p.length > 0)
                    .map(p => `<p>${p}</p>`)
                    .join('');
            }

            const articleData = {
                id: id,
                webTitle: article.webTitle,
                fields: { thumbnail: article.fields?.thumbnail },
                sectionName: article.sectionName
            };
            saveToReadingHistory(id, articleData);
        }
    } catch (error) {
        console.error("Error loading detail:", error);
    }
}

function filterCategory(category) {
    const headlineCont = document.getElementById('headline-container');
    if (headlineCont) headlineCont.innerHTML = `<p style="padding:20px;">Loading ${category} news...</p>`;
    fetchNews(category);
}

function generateDetailURL(article) {
    const articleId = encodeURIComponent(article.id || '');
    const prefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';
    return `${prefix}detail.html?id=${articleId}`;
}

function handleError(message) {
    const headlineCont = document.getElementById('headline-container');
    if (headlineCont) headlineCont.innerHTML = `<div style="padding:20px; color:#D13E4D;">${message}</div>`;
}

function displayNews(articles) {
    if (!articles || articles.length === 0) return;

    const headline = articles[0];
    const headlineCont = document.getElementById('headline-container');

    if (headlineCont) {
        const headlineDate = new Date(headline.webPublicationDate);
        const formattedDate = headlineDate.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });

        headlineCont.innerHTML = `
            <div class="headline-box">
                <img src="${headline.fields?.thumbnail || 'https://via.placeholder.com/600x350'}" class="headline-img" onerror="this.src='https://via.placeholder.com/600x350?text=No+Image'">
                <div class="headline-content">
                    <span class="headline-category-badge">${headline.sectionName || 'News'}</span>
                    <h2 onclick="markArticleOpened('${headline.id}'); location.href='${generateDetailURL(headline)}'" style="cursor: pointer;">${headline.webTitle}</h2>
                    <div class="headline-meta">
                        <span><i class="far fa-calendar"></i> ${formattedDate}</span>
                        <span><i class="far fa-clock"></i> 3 min read</span>
                    </div>
                    <p class="headline-excerpt">${headline.fields?.trailText || ''}</p>
                    <a href="${generateDetailURL(headline)}" class="headline-read-more">Read Full Story →</a>
                </div>
            </div>
        `;
    }

    const latestCont = document.getElementById('latest-news-container');
    if (latestCont) {
        latestCont.innerHTML = '';
        articles.slice(1, 5).forEach(article => {
            const thumbnail = article.fields?.thumbnail;
            const hasValidImage = thumbnail && thumbnail.startsWith('http');
            const categoryLabel = article.sectionName || 'News';
            const articleId = encodeURIComponent(article.id || '');
            const isBookmarked = isArticleBookmarked(article.id);

            latestCont.innerHTML += `
                <div class="article-item">
                    ${hasValidImage 
                        ? `<img src="${thumbnail}" alt="Thumbnail" style="cursor:pointer;" onclick="location.href='${generateDetailURL(article)}'" onerror="this.style.display='none'; this.parentElement.querySelector('.article-info').style.marginTop='0';">` 
                        : `<div class="no-thumbnail" style="width:100%; height:100px; background:linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); display:flex; align-items:center; justify-content:center; color:#666; font-size:0.8rem; border-radius:8px; margin-bottom:10px;">No Image</div>`
                    }
                    <div class="article-info">
                        <span class="article-category-badge">${categoryLabel}</span>
                        <h4 style="cursor:pointer; color:#000;" onclick="location.href='${generateDetailURL(article)}'">${article.webTitle}</h4>
                        <div class="meta" style="margin-top: 5px; font-size: 0.8rem; color: #666;">
                            <i class="fa-regular fa-calendar"></i> ${new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div class="article-actions">
                            <div class="article-action-group">
                                <button class="article-action-btn ${isBookmarked ? 'bookmarked' : ''}" 
                                        id="bookmark-btn-${articleId}"
                                        onclick="toggleBookmark(event, '${article.id}', '${article.webTitle.replace(/'/g, "\'")}', '${thumbnail || ''}', '${categoryLabel}')">
                                    <i class="fas fa-bookmark"></i> ${isBookmarked ? 'Saved' : 'Save'}
                                </button>
                                <button class="article-action-btn" onclick="shareArticle(event, '${generateDetailURL(article)}', '${article.webTitle.replace(/'/g, "\'")}')">
                                    <i class="fas fa-share-alt"></i> Share
                                </button>
                            </div>
                            <a href="${generateDetailURL(article)}" class="article-read-more">Read →</a>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    const sidebarCont = document.getElementById('sidebar-news-container');
    if (sidebarCont) {
        sidebarCont.innerHTML = '';
        articles.slice(5, 11).forEach((article, index) => {
            const thumbnail = article.fields?.thumbnail;
            const hasImage = thumbnail && thumbnail.startsWith('http');
            const articleDate = new Date(article.webPublicationDate);
            const formattedDate = articleDate.toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'short' 
            });

            sidebarCont.innerHTML += `
                <a href="${generateDetailURL(article)}" class="popular-item">
                    <span class="popular-number">${index + 1}</span>
                    ${hasImage ? `<img src="${thumbnail}" class="popular-thumb" alt="" onerror="this.style.display='none'">` : ''}
                    <div class="popular-content">
                        <span class="popular-category-badge">${article.sectionName || 'News'}</span>
                        <div class="popular-title">${article.webTitle}</div>
                        <div class="popular-date">
                            <i class="far fa-calendar"></i> ${formattedDate}
                        </div>
                    </div>
                </a>
            `;
        });
    }
}

function populateTicker(articles) {
    const tickerTrack = document.getElementById('ticker-track');
    if (!tickerTrack || !articles || articles.length === 0) return;

    const tickerArticles = articles.slice(0, 8);

    const buildItems = () => tickerArticles.map(a => 
        `<span class="ticker-item">${a.webTitle}</span>`
    ).join('');

    tickerTrack.innerHTML = buildItems() + buildItems();
}

function setActiveNav() {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const navLinks = document.querySelectorAll('.top-nav nav a.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href');

        if (linkPath && linkPath.includes('index.html') && 
            (currentPath.endsWith('index.html') || currentPath === '/' || currentPath === '')) {
            link.classList.add('active');
            return;
        }

        if (linkPath && linkPath.includes('category.html')) {
            const linkParams = new URLSearchParams(linkPath.split('?')[1] || '');
            const currentParams = new URLSearchParams(currentSearch);
            if (linkParams.get('cat') && linkParams.get('cat') === currentParams.get('cat')) {
                link.classList.add('active');
            }
        }
    });
}

function isArticleBookmarked(articleId) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles')) || [];
    return bookmarks.some(b => b.id === articleId);
}

function toggleBookmark(event, articleId, title, thumbnail, category) {
    event.stopPropagation();

    if (!isUserLoggedIn()) {
        document.getElementById('loginModal').style.display = 'flex';
        return;
    }

    let bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles')) || [];
    const existingIndex = bookmarks.findIndex(b => b.id === articleId);

    const encodedId = encodeURIComponent(articleId);
    const btn = document.getElementById(`bookmark-btn-${encodedId}`);

    if (existingIndex !== -1) {
        bookmarks.splice(existingIndex, 1);
        if (btn) {
            btn.classList.remove('bookmarked');
            btn.innerHTML = '<i class="fas fa-bookmark"></i> Save';
        }
        showBookmarkToast('Article removed from saved.');
    } else {
        bookmarks.unshift({
            id: articleId,
            title: title,
            thumbnail: thumbnail,
            category: category,
            savedAt: new Date().toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        });
        if (btn) {
            btn.classList.add('bookmarked');
            btn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
        }
        showBookmarkToast('Article saved!');
    }

    if (bookmarks.length > 50) bookmarks.pop();
    localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarks));
}

function showBookmarkToast(message) {
    const toast = document.getElementById('bookmark-toast');
    const msg = document.getElementById('bookmark-toast-msg');
    if (!toast) return;
    if (msg) msg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function shareArticle(event, url, title) {
    event.stopPropagation();

    if (!isUserLoggedIn()) {
        document.getElementById('loginModal').style.display = 'flex';
        return;
    }

    const fullUrl = window.location.origin + '/' + url;

    if (navigator.share) {
        navigator.share({ title: title, url: fullUrl }).catch(() => {});
    } else {
        navigator.clipboard.writeText(fullUrl).then(() => {
            showBookmarkToast('Link copied to clipboard!');
        }).catch(() => {
            showBookmarkToast('Could not copy link.');
        });
    }
}

async function performSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (query) {
        const searchTitle = document.getElementById('search-title');
        const searchResults = document.getElementById('search-results');
        if (searchTitle) searchTitle.innerText = `Search Results for "${query}"`;

        try {
            const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${API_KEY}&show-fields=thumbnail,trailText&page-size=20`;
            const response = await fetch(url);
            const data = await response.json();

            if (searchResults) {
                if (data.response.results.length === 0) {
                    searchResults.innerHTML = '<p style="text-align:center; padding:40px;">No results found.</p>';
                } else {
                    searchResults.innerHTML = '';
                    data.response.results.forEach(article => {
                        const thumbnail = article.fields?.thumbnail;
                        const hasValidImage = thumbnail && thumbnail.startsWith('http');

                        searchResults.innerHTML += `
                            <div class="search-result-item" onclick="location.href='detail.html?id=${article.id}'" style="cursor: pointer;">
                                ${hasValidImage 
                                    ? `<img src="${thumbnail}" alt="Thumbnail" onerror="this.style.display='none';">` 
                                    : `<div class="no-thumbnail" style="width:120px; height:80px; background:linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); display:flex; align-items:center; justify-content:center; color:#666; font-size:0.7rem; border-radius:8px; flex-shrink:0;">No Image</div>`
                                }
                                <div class="search-result-content">
                                    <h3>${article.webTitle}</h3>
                                    <p>${article.fields?.trailText?.substring(0, 150) || ''}...</p>
                                    <div class="meta">
                                        <span>${article.sectionName || 'News'}</span>
                                        <span>${new Date(article.webPublicationDate).toLocaleDateString('en-US')}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                }
            }
        } catch (error) {
            console.error("Search error:", error);
            if (searchResults) searchResults.innerHTML = '<p style="text-align:center; padding:40px;">Error loading search results.</p>';
        }
    }
}

function loadSettings() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const fontSize = localStorage.getItem('fontSize') || 'medium';

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) darkModeToggle.checked = darkMode;

    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
    applyFontSize(fontSize);
}

function applyFontSize(size) {
    const sizes = { small: '14px', medium: '16px', large: '18px', xlarge: '20px' };
    document.documentElement.style.fontSize = sizes[size] || '16px';
}

const searchCategories = [
    { id: 'politics', name: 'Politics', icon: 'fa-landmark' },
    { id: 'business', name: 'Business', icon: 'fa-briefcase' },
    { id: 'economy', name: 'Economy', icon: 'fa-chart-line' },
    { id: 'technology', name: 'Technology', icon: 'fa-microchip' },
    { id: 'culture', name: 'Culture', icon: 'fa-palette' },
    { id: 'entertainment', name: 'Entertainment', icon: 'fa-film' },
    { id: 'lifestyle', name: 'Lifestyle', icon: 'fa-heart' },
    { id: 'world', name: 'World', icon: 'fa-globe' },
    { id: 'science', name: 'Science', icon: 'fa-flask' },
    { id: 'environment', name: 'Environment', icon: 'fa-leaf' },
    { id: 'health', name: 'Health', icon: 'fa-heart-pulse' },
    { id: 'finance', name: 'Finance', icon: 'fa-coins' },
    { id: 'crime', name: 'Crime', icon: 'fa-gavel' },
    { id: 'law', name: 'Law', icon: 'fa-scale-balanced' },
    { id: 'education', name: 'Education', icon: 'fa-graduation-cap' },
    { id: 'fashion', name: 'Fashion', icon: 'fa-shirt' },
    { id: 'music', name: 'Music', icon: 'fa-music' },
    { id: 'travel', name: 'Travel', icon: 'fa-plane' },
    { id: 'food', name: 'Food', icon: 'fa-utensils' },
    { id: 'sport', name: 'Sport', icon: 'fa-futbol' }
];

let searchTimeout;
let currentArticlesForAutocomplete = [];

function storeArticlesForAutocomplete(articles) {
    currentArticlesForAutocomplete = articles || [];
}

function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="autocomplete-highlight">$1</span>');
}

function renderAutocomplete(query) {
    const dropdown = document.getElementById('search-autocomplete');
    if (!dropdown) return;

    const lowerQuery = query.toLowerCase();
    let html = '';

    const matchedCategories = searchCategories.filter(cat => 
        cat.name.toLowerCase().includes(lowerQuery)
    );

    if (matchedCategories.length > 0) {
        html += `
            <div class="autocomplete-section">
                <div class="autocomplete-section-title">
                    <i class="fas fa-folder"></i> Category
                </div>
        `;
        matchedCategories.forEach(cat => {
            html += `
                <a href="pages/category.html?cat=${cat.id}" class="autocomplete-item">
                    <div class="autocomplete-item-icon">
                        <i class="fas ${cat.icon}"></i>
                    </div>
                    <div>
                        <div class="autocomplete-item-text">${highlightMatch(cat.name, query)}</div>
                    </div>
                </a>
            `;
        });
        html += '</div>';
    }

    const matchedArticles = currentArticlesForAutocomplete.filter(article => 
        article.webTitle.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    if (matchedArticles.length > 0) {
        html += `
            <div class="autocomplete-section">
                <div class="autocomplete-section-title">
                    <i class="fas fa-newspaper"></i> Related Articles
                </div>
        `;
        matchedArticles.forEach(article => {
            const thumbnail = article.fields?.thumbnail;
            const hasImage = thumbnail && thumbnail.startsWith('http');
            html += `
                <a href="${generateDetailURL(article)}" class="autocomplete-item">
                    <div class="autocomplete-item-icon" style="${hasImage ? `background-image: url('${thumbnail}'); background-size: cover;` : ''}">
                        ${!hasImage ? '<i class="fas fa-newspaper"></i>' : ''}
                    </div>
                    <div>
                        <div class="autocomplete-item-text">${highlightMatch(article.webTitle, query)}</div>
                        <div class="autocomplete-item-meta">${article.sectionName || 'News'} • ${new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
                    </div>
                </a>
            `;
        });
        html += '</div>';
    }

    if (matchedCategories.length === 0 && matchedArticles.length === 0) {
        html += `
            <div class="autocomplete-no-results">
                <i class="fas fa-search"></i>
                <div>No results found for "<strong>${query}</strong>"</div>
                <div style="font-size: 11px; margin-top: 4px;">Press Enter to search</div>
            </div>
        `;
    }

    html += `
        <div class="autocomplete-section" style="background: #f8f9fa; border-top: 2px solid #eee;">
            <a href="pages/search.html?q=${encodeURIComponent(query)}" class="autocomplete-item" style="justify-content: center; color: #ed5858; font-weight: 700;">
                <i class="fas fa-search"></i> Search all results for "${query}"
            </a>
        </div>
    `;

    dropdown.innerHTML = html;
    dropdown.classList.add('active');
}

function setupAutocomplete() {
    const searchInput = document.getElementById('search-input');
    const searchWrapper = document.getElementById('search-wrapper');
    const searchBtn = document.getElementById('search-btn');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length >= 2) {
            searchTimeout = setTimeout(() => {
                renderAutocomplete(query);
            }, 300);
        } else {
            const dropdown = document.getElementById('search-autocomplete');
            if (dropdown) dropdown.classList.remove('active');
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `pages/search.html?q=${encodeURIComponent(query)}`;
            }
        }
    });

    searchInput.addEventListener('focus', () => {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            renderAutocomplete(query);
        }
    });

    document.addEventListener('click', (e) => {
        if (searchWrapper && !searchWrapper.contains(e.target)) {
            const dropdown = document.getElementById('search-autocomplete');
            if (dropdown) dropdown.classList.remove('active');
        }
    });

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `pages/search.html?q=${encodeURIComponent(query)}`;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    protectPage();
    loadSettings();
    setActiveNav();

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            localStorage.setItem('darkMode', this.checked);
            if (this.checked) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        });
    }

    setupAutocomplete();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const prefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';
                window.location.href = `${prefix}search.html?q=${encodeURIComponent(searchInput.value)}`;
            }
        });
    }

    // PERBAIKAN: Setup comment input Enter key
    const commentInput = document.getElementById('comment-input');
    if (commentInput) {
        commentInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleCommentSubmit();
            }
        });
    }

    if (window.location.pathname.includes('search.html')) {
        performSearch();
    }

    const isIndex = window.location.pathname === '/' || window.location.pathname.includes('index.html') || window.location.pathname === '';
    if (isIndex) {
        fetchNews();
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('../php/login_process.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
                });
                const result = await response.json();

                if (result.success) {
                    localStorage.setItem('user_token', 'loggedIn');
                    window.location.href = '../index.html';
                } else {
                    alert(result.message);
                }
            } catch (err) {
                console.error(err);
                alert("Gagal terhubung ke server login PHP.");
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-pass').value;

            if (!username || username.length < 3) {
                alert("Username minimal berukuran 3 karakter!");
                return;
            }

            try {
                const response = await fetch('../php/register_process.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
                });
                const result = await response.json();

                if (result.success) {
                    alert("Pendaftaran Berhasil!");
                    localStorage.setItem('user_token', 'loggedIn');
                    window.location.href = '../index.html';
                } else {
                    alert(result.message);
                }
            } catch (err) {
                console.error(err);
                alert("Gagal menghubungi server pendaftaran PHP.");
            }
        });
    }
});