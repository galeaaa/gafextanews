// CATEGORY.JS - GAFEXTA NEWS (PERBAIKAN LENGKAP)
const API_KEY = '6efbc366-a3f6-4b0f-8161-7904491fcfbe';

// Map ikon kategori
const categoryIcons = {
    politics: 'fa-landmark',
    business: 'fa-briefcase',
    economy: 'fa-chart-line',
    technology: 'fa-microchip',
    culture: 'fa-palette',
    entertainment: 'fa-film',
    lifestyle: 'fa-heart',
    world: 'fa-globe',
    science: 'fa-flask',
    environment: 'fa-leaf',
    health: 'fa-heart-pulse',
    finance: 'fa-coins',
    crime: 'fa-gavel',
    law: 'fa-scale-balanced',
    education: 'fa-graduation-cap',
    fashion: 'fa-shirt',
    music: 'fa-music',
    travel: 'fa-plane',
    food: 'fa-utensils',
    sport: 'fa-futbol'
};

function getCategoryIcon(cat) {
    return categoryIcons[cat.toLowerCase()] || 'fa-newspaper';
}

let currentCategory = '';
let currentSort = 'latest';

async function initCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat') || 'news';
    currentCategory = category;

    // Update hero header
    const titleEl = document.getElementById('main-category-title');
    const iconEl = document.getElementById('category-hero-icon');
    const countEl = document.getElementById('category-article-count');

    if (titleEl) titleEl.innerText = category;
    if (iconEl) iconEl.innerHTML = '<i class="fas ' + getCategoryIcon(category) + '"></i>';

    // Update navbar active state
    setActiveNav();

    // Init search autocomplete
    initSearchAutocomplete();

    const container = document.getElementById('category-sliders-container');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; padding:20px;">Memuat konten...</div>';

    try {
        // Fetch untuk hitung jumlah artikel
        const countUrl = 'https://content.guardianapis.com/search?q=' + encodeURIComponent(category) + '&api-key=' + API_KEY + '&page-size=1';
        const countRes = await fetch(countUrl);
        const countData = await countRes.json();
        const totalArticles = countData.response ? countData.response.total : 0;
        if (countEl) countEl.innerText = totalArticles + ' articles \u00b7 Updated today';

        container.innerHTML = '';

        // Load sections
        await loadCategoryContent(category, container);

    } catch (err) {
        console.error('Gagal memuat konten:', err);
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#D13E4D;">Gagal memuat konten. Coba lagi nanti.</div>';
    }
}

async function loadCategoryContent(category, container) {
    container.innerHTML = '';

    // 1. LATEST IN CATEGORY (Slider)
    await createSliderRow('Latest in ' + category, category, container, 'latest');

    // 2. TOP STORIES (Grid 2 kolom)
    await createTopStoriesRow('Top Stories', category, container);

    // 3. TRENDING NOW (Grid 3 kolom)
    await createTrendingRow('Trending Now', category, container);

    // Init bookmark states setelah render
    setTimeout(initBookmarkStates, 500);
}

// ============================================================
// PERBAIKAN 1: SEARCH AUTOCOMPLETE
// ============================================================
function initSearchAutocomplete() {
    const searchInput = document.getElementById('search-input');
    const autocomplete = document.getElementById('search-autocomplete');
    const searchBtn = document.getElementById('search-btn');

    if (!searchInput || !autocomplete) return;

    let debounceTimer;

    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        clearTimeout(debounceTimer);

        if (query.length < 2) {
            autocomplete.classList.remove('active');
            return;
        }

        debounceTimer = setTimeout(() => fetchSearchSuggestions(query, autocomplete), 300);
    });

    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length >= 2) {
            autocomplete.classList.add('active');
        }
    });

    // Close autocomplete when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !autocomplete.contains(e.target)) {
            autocomplete.classList.remove('active');
        }
    });

    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = 'search.html?q=' + encodeURIComponent(query);
            }
        });
    }

    // Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query) {
                window.location.href = 'search.html?q=' + encodeURIComponent(query);
            }
        }
    });
}

async function fetchSearchSuggestions(query, autocompleteEl) {
    try {
        const url = 'https://content.guardianapis.com/search?q=' + encodeURIComponent(query) + '&api-key=' + API_KEY + '&show-fields=thumbnail&page-size=8';
        const response = await fetch(url);
        const data = await response.json();
        const articles = data.response.results || [];

        if (articles.length === 0) {
            autocompleteEl.innerHTML = `
                <div class="autocomplete-no-results">
                    <i class="fas fa-search"></i>
                    <div>No results found</div>
                </div>
            `;
            autocompleteEl.classList.add('active');
            return;
        }

        let html = '<div class="autocomplete-section">';
        articles.forEach(article => {
            const thumbnail = article.fields && article.fields.thumbnail ? article.fields.thumbnail : '';
            const icon = getCategoryIcon(article.sectionName || 'news');
            const date = new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

            html += `
                <a href="detail.html?id=${encodeURIComponent(article.id)}" class="autocomplete-item" onclick="document.getElementById('search-autocomplete').classList.remove('active')">
                    <div class="autocomplete-item-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div>
                        <div class="autocomplete-item-text">${highlightText(article.webTitle, query)}</div>
                        <div class="autocomplete-item-meta">${article.sectionName || 'News'} · ${date}</div>
                    </div>
                </a>
            `;
        });
        html += '</div>';

        // Add "Search for ..." option
        html += `
            <div class="autocomplete-section" style="border-top: 1px solid #eee;">
                <a href="search.html?q=${encodeURIComponent(query)}" class="autocomplete-item" style="color: #D13E4D;">
                    <div class="autocomplete-item-icon" style="background: #D13E4D; color: #fff;">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="autocomplete-item-text">Search for "${query}"</div>
                </a>
            </div>
        `;

        autocompleteEl.innerHTML = html;
        autocompleteEl.classList.add('active');

    } catch (err) {
        console.error('Search error:', err);
    }
}

function highlightText(text, query) {
    const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return text.replace(regex, '<span class="autocomplete-highlight">$1</span>');
}

// ============================================================
// PERBAIKAN 2: SORT DROPDOWN FUNCTIONAL
// ============================================================
function toggleSort() {
    const dropdown = document.getElementById('sort-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function setSort(sortType) {
    currentSort = sortType;
    const sortLabel = document.getElementById('sort-label');
    const dropdown = document.getElementById('sort-dropdown');

    const labels = {
        'latest': 'Sort Latest',
        'oldest': 'Sort Oldest',
        'popular': 'Sort Popular'
    };

    if (sortLabel) sortLabel.innerText = labels[sortType] || 'Sort Latest';
    if (dropdown) dropdown.classList.remove('active');

    // Reload content with new sort
    const container = document.getElementById('category-sliders-container');
    if (container && currentCategory) {
        container.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-circle-notch fa-spin"></i> Sorting...</div>';
        setTimeout(() => loadCategoryContent(currentCategory, container), 300);
    }

    showToast('Sorted by: ' + labels[sortType]);
}

// ============================================================
// PERBAIKAN 3: SHARE BUTTON
// ============================================================
function shareArticle(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url || window.location.href
        }).catch(err => console.log('Share cancelled'));
    } else {
        // Fallback: copy to clipboard
        const shareUrl = url || window.location.href;
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('Link copied to clipboard!');
        }).catch(() => {
            showToast('Failed to copy link');
        });
    }
}

function showToast(message) {
    const toast = document.getElementById('category-toast');
    if (!toast) return;

    toast.innerHTML = '<i class="fas fa-info-circle"></i> ' + message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(16px)';
    }, 3000);
}

// ============================================================
// CONTENT CREATION FUNCTIONS
// ============================================================
async function createSliderRow(title, query, targetContainer, type) {
    try {
        let orderBy = 'newest';
        if (currentSort === 'oldest') orderBy = 'oldest';
        if (currentSort === 'popular') orderBy = 'relevance';

        const url = 'https://content.guardianapis.com/search?q=' + encodeURIComponent(query) + '&api-key=' + API_KEY + '&show-fields=thumbnail,trailText&page-size=15&order-by=' + orderBy;
        const response = await fetch(url);
        const data = await response.json();
        const articles = data.response.results || [];

        const sliderId = 'slider-' + Math.random().toString(36).substr(2, 9);

        const rowDiv = document.createElement('div');
        rowDiv.className = 'cat-row';
        rowDiv.innerHTML = `
            <div class="section-header">
                <div class="section-title">${title}</div>
                <a href="search.html?q=${encodeURIComponent(query)}" class="section-see-all">See all <i class="fas fa-arrow-right"></i></a>
            </div>
            <button class="nav-btn left" onclick="scrollSlider('${sliderId}', -470)">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="netflix-slider" id="${sliderId}">
                ${articles.map(article => createCardHTML(article)).join('')}
            </div>
            <button class="nav-btn right" onclick="scrollSlider('${sliderId}', 470)">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        targetContainer.appendChild(rowDiv);
    } catch (err) {
        console.error('Gagal memuat slider:', err);
    }
}

async function createTopStoriesRow(title, query, targetContainer) {
    try {
        let orderBy = 'newest';
        if (currentSort === 'oldest') orderBy = 'oldest';
        if (currentSort === 'popular') orderBy = 'relevance';

        const url = 'https://content.guardianapis.com/search?q=' + encodeURIComponent(query + ' headline') + '&api-key=' + API_KEY + '&show-fields=thumbnail,trailText&page-size=6&order-by=' + orderBy;
        const response = await fetch(url);
        const data = await response.json();
        const articles = data.response.results || [];

        if (articles.length === 0) return;

        const mainArticle = articles[0];
        const subArticles = articles.slice(1, 3);
        const sideArticles = articles.slice(3, 6);

        const rowDiv = document.createElement('div');
        rowDiv.className = 'cat-row';
        rowDiv.innerHTML = `
            <div class="section-header">
                <div class="section-title">${title}</div>
                <a href="search.html?q=${encodeURIComponent(query + ' headline')}" class="section-see-all">See all <i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="top-stories-grid">
                <div class="top-stories-left">
                    <div class="top-stories-main" onclick="location.href='detail.html?id=${encodeURIComponent(mainArticle.id)}'">
                        <img src="${mainArticle.fields ? mainArticle.fields.thumbnail : 'https://via.placeholder.com/400x200'}" alt="${mainArticle.webTitle}" onerror="this.src='https://via.placeholder.com/400x200'">
                        <div class="top-stories-main-content">
                            <span class="cat-card-badge">${mainArticle.sectionName || 'News'}</span>
                            <h4>${mainArticle.webTitle}</h4>
                            <div class="cat-card-footer">
                                <span class="cat-card-date"><i class="far fa-calendar"></i> ${new Date(mainArticle.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                <div class="card-actions">
                                    <button class="cat-card-share" onclick="event.stopPropagation(); shareArticle('${mainArticle.webTitle.replace(/'/g, "\\'")}', 'detail.html?id=${encodeURIComponent(mainArticle.id)}')">
                                        <i class="fas fa-share-alt"></i>
                                    </button>
                                    <button class="cat-card-bookmark" onclick="event.stopPropagation(); toggleBookmark(this, '${mainArticle.id}', '${mainArticle.webTitle.replace(/'/g, "\\'")}', '${mainArticle.fields ? mainArticle.fields.thumbnail : ''}', '${mainArticle.sectionName || 'News'}')">
                                        <i class="far fa-bookmark"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${subArticles.map(article => `
                        <div class="top-stories-sub" onclick="location.href='detail.html?id=${encodeURIComponent(article.id)}'">
                            <img src="${article.fields ? article.fields.thumbnail : 'https://via.placeholder.com/80x60'}" alt="${article.webTitle}" onerror="this.src='https://via.placeholder.com/80x60'">
                            <div class="top-stories-sub-content">
                                <h5>${article.webTitle}</h5>
                                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px;">
                                    <span class="cat-card-date"><i class="far fa-calendar"></i> ${new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                    <div class="card-actions">
                                        <button class="cat-card-share" onclick="event.stopPropagation(); shareArticle('${article.webTitle.replace(/'/g, "\\'")}', 'detail.html?id=${encodeURIComponent(article.id)}')">
                                            <i class="fas fa-share-alt"></i>
                                        </button>
                                        <button class="cat-card-bookmark" onclick="event.stopPropagation(); toggleBookmark(this, '${article.id}', '${article.webTitle.replace(/'/g, "\\'")}', '${article.fields ? article.fields.thumbnail : ''}', '${article.sectionName || 'News'}')">
                                            <i class="far fa-bookmark"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="top-stories-right">
                    ${sideArticles.map(article => `
                        <div class="top-stories-right-item" onclick="location.href='detail.html?id=${encodeURIComponent(article.id)}'">
                            <h5>${article.webTitle}</h5>
                            <p>${article.fields && article.fields.trailText ? article.fields.trailText.substring(0, 80) : ''}...</p>
                            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px;">
                                <span class="cat-card-date"><i class="far fa-calendar"></i> ${new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                <div class="card-actions">
                                    <button class="cat-card-share" onclick="event.stopPropagation(); shareArticle('${article.webTitle.replace(/'/g, "\\'")}', 'detail.html?id=${encodeURIComponent(article.id)}')">
                                        <i class="fas fa-share-alt"></i>
                                    </button>
                                    <button class="cat-card-bookmark" onclick="event.stopPropagation(); toggleBookmark(this, '${article.id}', '${article.webTitle.replace(/'/g, "\\'")}', '${article.fields ? article.fields.thumbnail : ''}', '${article.sectionName || 'News'}')">
                                        <i class="far fa-bookmark"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        targetContainer.appendChild(rowDiv);
    } catch (err) {
        console.error('Gagal memuat top stories:', err);
    }
}

async function createTrendingRow(title, query, targetContainer) {
    try {
        let orderBy = 'relevance';
        if (currentSort === 'latest') orderBy = 'newest';
        if (currentSort === 'oldest') orderBy = 'oldest';

        const url = 'https://content.guardianapis.com/search?q=' + encodeURIComponent(query + ' popular') + '&api-key=' + API_KEY + '&show-fields=thumbnail,trailText&page-size=6&order-by=' + orderBy;
        const response = await fetch(url);
        const data = await response.json();
        const articles = data.response.results || [];

        if (articles.length === 0) return;

        const rowDiv = document.createElement('div');
        rowDiv.className = 'cat-row';
        rowDiv.innerHTML = `
            <div class="section-header">
                <div class="section-title">${title}</div>
                <a href="search.html?q=${encodeURIComponent(query + ' popular')}" class="section-see-all">See all <i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="trending-grid">
                ${articles.map(article => `
                    <div class="trending-card" onclick="location.href='detail.html?id=${encodeURIComponent(article.id)}'">
                        <img src="${article.fields ? article.fields.thumbnail : 'https://via.placeholder.com/300x160'}" alt="${article.webTitle}" onerror="this.src='https://via.placeholder.com/300x160'">
                        <div class="trending-card-content">
                            <span class="cat-card-badge">${article.sectionName || 'News'}</span>
                            <h4>${article.webTitle}</h4>
                            <div class="cat-card-footer">
                                <span class="cat-card-date"><i class="far fa-calendar"></i> ${new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                <div class="card-actions">
                                    <button class="cat-card-share" onclick="event.stopPropagation(); shareArticle('${article.webTitle.replace(/'/g, "\\'")}', 'detail.html?id=${encodeURIComponent(article.id)}')">
                                        <i class="fas fa-share-alt"></i>
                                    </button>
                                    <button class="cat-card-bookmark" onclick="event.stopPropagation(); toggleBookmark(this, '${article.id}', '${article.webTitle.replace(/'/g, "\\'")}', '${article.fields ? article.fields.thumbnail : ''}', '${article.sectionName || 'News'}')">
                                        <i class="far fa-bookmark"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        targetContainer.appendChild(rowDiv);
    } catch (err) {
        console.error('Gagal memuat trending:', err);
    }
}

function createCardHTML(article) {
    const readTime = Math.floor(Math.random() * 8) + 2;
    const articleUrl = 'detail.html?id=' + encodeURIComponent(article.id);
    return `
        <div class="cat-card" onclick="location.href='${articleUrl}'">
            <div class="cat-card-img-wrapper">
                <img src="${article.fields ? article.fields.thumbnail : 'https://via.placeholder.com/250x150'}" alt="${article.webTitle}" onerror="this.src='https://via.placeholder.com/250x150'">
                <span class="cat-card-read-time">${readTime} min</span>
            </div>
            <span class="cat-card-badge">${article.sectionName || 'News'}</span>
            <h4>${article.webTitle}</h4>
            <div class="cat-card-footer">
                <span class="cat-card-date"><i class="far fa-calendar"></i> ${new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                <div class="card-actions">
                    <button class="cat-card-share" onclick="event.stopPropagation(); shareArticle('${article.webTitle.replace(/'/g, "\\'")}', '${articleUrl}')">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="cat-card-bookmark" onclick="event.stopPropagation(); toggleBookmark(this, '${article.id}', '${article.webTitle.replace(/'/g, "\\'")}', '${article.fields ? article.fields.thumbnail : ''}', '${article.sectionName || 'News'}')">
                        <i class="far fa-bookmark"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function scrollSlider(id, distance) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollBy({ left: distance, behavior: 'smooth' });
    }
}

function setActiveNav() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentCat = urlParams.get('cat') || '';
    const navLinks = document.querySelectorAll('.top-nav nav a.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href') || '';
        if (href.includes('cat=' + currentCat)) {
            link.classList.add('active');
        }
    });
}

function isArticleBookmarked(articleId) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles')) || [];
    return bookmarks.some(b => b.id === articleId);
}

function toggleBookmark(btn, articleId, title, thumbnail, category) {
    if (!localStorage.getItem('user_token')) {
        alert('Please login to save articles');
        return;
    }

    let bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles')) || [];
    const existingIndex = bookmarks.findIndex(b => b.id === articleId);

    if (existingIndex !== -1) {
        bookmarks.splice(existingIndex, 1);
        btn.classList.remove('saved');
        btn.innerHTML = '<i class="far fa-bookmark"></i>';
        showToast('Removed from bookmarks');
    } else {
        bookmarks.unshift({
            id: articleId,
            title: title,
            thumbnail: thumbnail,
            category: category,
            savedAt: new Date().toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        });
        btn.classList.add('saved');
        btn.innerHTML = '<i class="fas fa-bookmark"></i>';
        showToast('Saved to bookmarks');
    }

    if (bookmarks.length > 50) bookmarks.pop();
    localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarks));
}

function initBookmarkStates() {
    document.querySelectorAll('.cat-card-bookmark').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick) {
            const match = onclick.match(/toggleBookmark\(this, '([^']+)'/);
            if (match && isArticleBookmarked(match[1])) {
                btn.classList.add('saved');
                btn.innerHTML = '<i class="fas fa-bookmark"></i>';
            }
        }
    });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    initCategoryPage();
});