// GAFEXTA NEWS - SCRIPT FOR THE GUARDIAN API 
const API_KEY = '6efbc366-a3f6-4b0f-8161-7904491fcfbe'; 
const BASE_URL = `https://content.guardianapis.com/search?api-key=${API_KEY}&show-fields=thumbnail,trailText,bodyText&page-size=15`;

// ==================== USER MANAGEMENT SYSTEM (CONNECTED TO PHP API) ====================

// Check if user is logged in based on Session/LocalStorage token
function isUserLoggedIn() {
    return localStorage.getItem('user_token') !== null || sessionStorage.getItem('user_token') !== null;
}

// Protect page if required (Hanya jika user memaksa masuk ke profile.html tanpa login)
function protectPage() {
    const currentPath = window.location.pathname;
    if (!isUserLoggedIn() && currentPath.includes('profile.html')) {
        // Cek posisi path untuk redirect yang akurat
        if (currentPath.includes('/pages/')) {
            window.location.href = 'login.html';
        } else {
            window.location.href = 'pages/login.html';
        }
    }
}

// Logout user
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

// ==================== NEWS FUNCTIONS ====================

/**
 * 1. FUNGSI UTAMA LOAD DATA API THE GUARDIAN
 */
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
            }
        } else {
            handleError("Failed to load news from API.");
        }
    } catch (error) {
        console.error("Error:", error);
        handleError("Check your internet connection or API Key.");
    }
}

/**
 * Save article to reading history (Client side history)
 */
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

/**
 * 2. FUNGSI DETAIL ARTIKEL
 */
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

/**
 * 3. FUNGSI FILTER KATEGORI
 */
function filterCategory(category) {
    const headlineCont = document.getElementById('headline-container');
    if (headlineCont) headlineCont.innerHTML = `<p style="padding:20px;">Loading ${category} news...</p>`;
    fetchNews(category);
}

/**
 * 4. HELPER & RENDERING VIEW
 */
function generateDetailURL(article) {
    const articleId = encodeURIComponent(article.id || '');
    // Menyesuaikan relative path link detail dari index vs subpages
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
        headlineCont.innerHTML = `
            <div class="headline-box">
                <img src="${headline.fields?.thumbnail || 'https://via.placeholder.com/600x350'}" class="headline-img">
                <div class="headline-content">
                    <h2 style="margin-bottom: 10px; font-size: 1.8rem; color: #192853; cursor: pointer;" onclick="location.href='${generateDetailURL(headline)}'">${headline.webTitle}</h2>
                    <p style="margin-bottom: 15px; color: #444; line-height: 1.6;">${headline.fields?.trailText || ''}</p>
                    <a href="${generateDetailURL(headline)}" style="color: #D13E4D; font-weight: 800; text-decoration: none; text-transform: uppercase;">Read More →</a>
                </div>
            </div>
        `;
    }

    const latestCont = document.getElementById('latest-news-container');
    if (latestCont) {
        latestCont.innerHTML = '';
        articles.slice(1, 5).forEach(article => {
            latestCont.innerHTML += `
                <div class="article-item" style="cursor: pointer;" onclick="location.href='${generateDetailURL(article)}'">
                    <img src="${article.fields?.thumbnail || 'https://via.placeholder.com/150x100'}" alt="Thumbnail">
                    <div class="article-info">
                        <h4>${article.webTitle}</h4>
                        <div class="meta" style="margin-top: 5px; font-size: 0.8rem; color: #666;">
                            <i class="fa-regular fa-calendar"></i> ${new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
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
            sidebarCont.innerHTML += `
                <li style="margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px dashed #ddd; list-style: none;">
                    <a href="${generateDetailURL(article)}" style="text-decoration:none; color:#192853; font-weight: 600; font-size: 0.95rem; display: flex; gap: 10px;">
                        <span style="color: #D13E4D;">${index + 1}.</span>
                        <span>${article.webTitle}</span>
                    </a>
                </li>
            `;
        });
    }
}

// ==================== SEARCH FUNCTION ====================
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
                        searchResults.innerHTML += `
                            <div class="search-result-item" onclick="location.href='detail.html?id=${article.id}'" style="cursor: pointer;">
                                <img src="${article.fields?.thumbnail || 'https://via.placeholder.com/120x80'}" alt="Thumbnail">
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

// ==================== SETTINGS FUNCTIONS ====================
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

// ==================== DOM EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    protectPage();
    loadSettings();
    
    // Setup Dark Mode Toggle
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
    
    // Setup search input on navbar
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
    
    if (window.location.pathname.includes('search.html')) {
        performSearch();
    }
    
    // Jalankan API Guardian jika berada di Beranda (index.html)
    const isIndex = window.location.pathname === '/' || window.location.pathname.includes('index.html') || window.location.pathname === '';
    if (isIndex) {
        fetchNews();
    }
    
    // --- PENANGAN FORM LOGIN (MENEMBAK KE PHP) ---
    const loginForm = document.getElementById('loginForm'); // Sesuai ID HTML
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                // Menembak file proses login PHP milikmu
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
    
    // --- PENANGAN FORM REGISTER (MENEMBAK KE PHP) ---
    const registerForm = document.getElementById('registerForm'); // Sesuai ID HTML register.html
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Mengambil data berdasarkan perbaikan ID element asli di register.html
            const username = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-pass').value;
            
            if (!username || username.length < 3) {
                alert("Username minimal berukuran 3 karakter!");
                return;
            }
            
            try {
                // Menembak file proses pendaftaran PHP milikmu
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