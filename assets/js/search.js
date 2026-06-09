// ============================================================
// SEARCH.JS - GAFEXTA NEWS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const displayElement = document.getElementById('search-query-display');
    
    if (query) {
        displayElement.innerText = query;
        fetchSearchResults(query);
    } else {
        displayElement.innerText = "Everything";
        fetchSearchResults("news");
    }

    // Setup auto-complete untuk search input di header
    setupSearchAutocomplete();
    
    // Setup filter chips
    setupFilterChips();
});

// ============================================================
// FILTER CHIPS
// ============================================================

function setupFilterChips() {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            const filterType = chip.dataset.filter;
            sortSearchResults(filterType);
        });
    });
}

let currentArticles = [];

function sortSearchResults(type) {
    if (!currentArticles || currentArticles.length === 0) return;
    
    let sorted = [...currentArticles];
    
    switch(type) {
        case 'latest':
            sorted.sort((a, b) => new Date(b.webPublicationDate) - new Date(a.webPublicationDate));
            break;
        case 'most-read':
            sorted.sort(() => Math.random() - 0.5);
            break;
        case 'this-week':
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            sorted = sorted.filter(a => new Date(a.webPublicationDate) >= oneWeekAgo);
            break;
        default:
            break;
    }
    
    renderSearchResults(sorted);
}

// ============================================================
// FETCH & RENDER SEARCH RESULTS
// ============================================================

async function fetchSearchResults(query) {
    const container = document.getElementById('search-results-grid');
    const headlineContainer = document.getElementById('search-headline-container');
    
    const API_KEY = '6efbc366-a3f6-4b0f-8161-7904491fcfbe'; 
    const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${API_KEY}&show-fields=thumbnail,trailText,headline&page-size=31`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const articles = data.response.results;
        currentArticles = articles || [];
        
        storeSearchArticles(articles);

        const countElement = document.getElementById('results-count');
        if (countElement) {
            countElement.innerText = `${articles ? articles.length : 0} results found`;
        }

        if (articles && articles.length > 0) {
            renderSearchResults(articles);
        } else {
            renderEmptyState(query);
        }
    } catch (error) {
        console.error('Error:', error);
        headlineContainer.innerHTML = '';
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-exclamation-circle"></i></div><h3>Error connecting to API</h3><p>Please try again later.</p></div>';
    }
}

function renderSearchResults(articles) {
    const container = document.getElementById('search-results-grid');
    const headlineContainer = document.getElementById('search-headline-container');
    
    const topNews = articles[0];
    const topImg = topNews.fields?.thumbnail || '../assets/img/default.jpg';
    const topLink = `detail.html?id=${encodeURIComponent(topNews.id)}`;
    const topDate = new Date(topNews.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const readTime = Math.ceil((topNews.fields?.trailText?.length || 200) / 200) + ' min';
    
    headlineContainer.innerHTML = `
        <div class="news-card-big" style="cursor:pointer;" onclick="location.href='${topLink}'">
            <img class="hero-image" src="${topImg}" alt="Headline News">
            <div class="hero-content">
                <span class="hero-category">${topNews.sectionName || 'News'}</span>
                <h2>${topNews.webTitle}</h2>
                <p>${topNews.fields?.trailText || ''}</p>
                <div class="hero-meta">
                    <span><i class="far fa-calendar"></i> ${topDate}</span>
                    <span><i class="far fa-clock"></i> ${readTime}</span>
                    <span class="read-link">Read <i class="fas fa-arrow-right"></i></span>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = '';
    articles.slice(1).forEach(article => {
        const img = article.fields?.thumbnail || '../assets/img/default.jpg';
        const articleLink = `detail.html?id=${encodeURIComponent(article.id)}`;
        const articleDate = new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        const articleReadTime = Math.ceil((article.fields?.trailText?.length || 200) / 200) + ' min';
        const excerpt = article.fields?.trailText ? article.fields.trailText.substring(0, 120) + '...' : '';
        
        const card = document.createElement('div');
        card.className = 'news-card';
        card.onclick = () => { location.href = articleLink; };
        
        card.innerHTML = `
            <img class="card-thumbnail" src="${img}" alt="news">
            <div class="card-content">
                <span class="card-category">${article.sectionName || 'News'}</span>
                <h4>${article.webTitle}</h4>
                <p>${excerpt}</p>
                <div class="card-footer">
                    <div class="card-meta">
                        <span><i class="far fa-calendar"></i> ${articleDate}</span>
                        <span><i class="far fa-clock"></i> ${articleReadTime}</span>
                    </div>
                    <div class="card-actions">
                        <button class="save-btn" onclick="event.stopPropagation(); toggleSave(this, '${article.id}')" title="Save">
                            <i class="far fa-bookmark"></i>
                        </button>
                        <button class="share-btn" onclick="event.stopPropagation(); shareArticle('${article.webTitle}', '${articleLink}')" title="Share">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderEmptyState(query) {
    const container = document.getElementById('search-results-grid');
    const headlineContainer = document.getElementById('search-headline-container');
    
    headlineContainer.innerHTML = '';
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">
                <i class="fas fa-search"></i>
            </div>
            <h3>No results found for "${query}"</h3>
            <p>Try different keywords, or explore popular categories:</p>
            <div class="empty-state-suggestions">
                <a href="category.html?cat=politics" class="suggestion-chip">Politics</a>
                <a href="category.html?cat=technology" class="suggestion-chip">Technology</a>
                <a href="category.html?cat=business" class="suggestion-chip">Business</a>
                <a href="category.html?cat=world" class="suggestion-chip">World</a>
                <a href="category.html?cat=health" class="suggestion-chip">Health</a>
            </div>
        </div>
    `;
}

// ============================================================
// SAVE & SHARE FUNCTIONS
// ============================================================

function toggleSave(btn, articleId) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (btn.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        let saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');
        if (!saved.includes(articleId)) {
            saved.push(articleId);
            localStorage.setItem('savedArticles', JSON.stringify(saved));
        }
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        let saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');
        saved = saved.filter(id => id !== articleId);
        localStorage.setItem('savedArticles', JSON.stringify(saved));
    }
}

function shareArticle(title, url) {
    const fullUrl = window.location.origin + '/' + url;
    if (navigator.share) {
        navigator.share({
            title: title,
            url: fullUrl
        }).catch(err => console.log('Share cancelled'));
    } else {
        navigator.clipboard.writeText(fullUrl).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

// ============================================================
// AUTO-COMPLETE FUNCTIONALITY (SAMA PERSIS DASHBOARD)
// ============================================================

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
let currentSearchArticles = [];

function setupSearchAutocomplete() {
    const searchInput = document.getElementById('search-input');
    const searchWrapper = document.getElementById('search-wrapper');
    
    if (!searchInput) return;

    let dropdown = document.getElementById('search-dropdown');
    if (!dropdown && searchWrapper) {
        dropdown = document.createElement('div');
        dropdown.id = 'search-dropdown';
        dropdown.className = 'search-dropdown';
        searchWrapper.appendChild(dropdown);
    }

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length >= 2) {
            searchTimeout = setTimeout(() => {
                renderSearchDropdown(query, dropdown);
            }, 300);
        } else {
            dropdown.classList.remove('active');
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        }
    });

    searchInput.addEventListener('focus', () => {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            renderSearchDropdown(query, dropdown);
        }
    });

    document.addEventListener('click', (e) => {
        if (searchWrapper && !searchWrapper.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight-match">$1</span>');
}

function renderSearchDropdown(query, dropdown) {
    if (!dropdown) return;
    
    const lowerQuery = query.toLowerCase();
    let html = '';

    // 1. Cari Kategori yang match
    const matchedCategories = searchCategories.filter(cat => 
        cat.name.toLowerCase().includes(lowerQuery)
    );

    if (matchedCategories.length > 0) {
        html += `
            <div class="dropdown-section">
                <div class="dropdown-section-title">
                    <i class="fas fa-folder"></i> Category
                </div>
        `;
        matchedCategories.forEach(cat => {
            html += `
                <a href="category.html?cat=${cat.id}" class="dropdown-item">
                    <div class="dropdown-item-icon">
                        <i class="fas ${cat.icon}"></i>
                    </div>
                    <div class="dropdown-item-content">
                        <div class="dropdown-item-text">${highlightMatch(cat.name, query)}</div>
                    </div>
                </a>
            `;
        });
        html += '</div>';
    }

    // 2. Cari Artikel yang match
    const matchedArticles = currentSearchArticles.filter(article => 
        article.webTitle.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    if (matchedArticles.length > 0) {
        html += `
            <div class="dropdown-section">
                <div class="dropdown-section-title">
                    <i class="fas fa-newspaper"></i> Related Articles
                </div>
        `;
        matchedArticles.forEach(article => {
            const thumbnail = article.fields?.thumbnail;
            const hasImage = thumbnail && thumbnail.startsWith('http');
            const articleDate = new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            html += `
                <a href="detail.html?id=${encodeURIComponent(article.id)}" class="dropdown-item">
                    <div class="dropdown-item-icon" style="${hasImage ? `background-image: url('${thumbnail}'); background-size: cover;` : ''}">
                        ${!hasImage ? '<i class="fas fa-newspaper"></i>' : ''}
                    </div>
                    <div class="dropdown-item-content">
                        <div class="dropdown-item-text">${highlightMatch(article.webTitle, query)}</div>
                        <div class="dropdown-item-meta">${article.sectionName || 'News'} • ${articleDate}</div>
                    </div>
                </a>
            `;
        });
        html += '</div>';
    }

    // 3. Jika tidak ada hasil
    if (matchedCategories.length === 0 && matchedArticles.length === 0) {
        html += `
            <div class="dropdown-no-results">
                <i class="fas fa-search"></i>
                <div>No results found for "<strong>${query}</strong>"</div>
                <div style="font-size: 11px; margin-top: 4px;">Press Enter to search</div>
            </div>
        `;
    }

    // 4. Tombol "Search all results"
    html += `
        <div class="dropdown-footer">
            <a href="search.html?q=${encodeURIComponent(query)}">
                <i class="fas fa-search"></i> Search all results for "${query}"
            </a>
        </div>
    `;

    dropdown.innerHTML = html;
    dropdown.classList.add('active');
}

function storeSearchArticles(articles) {
    currentSearchArticles = articles || [];
}