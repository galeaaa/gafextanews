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
    
    const url = `/api/news?q=${encodeURIComponent(query)}&page-size=31`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const articles = data.response.results;
        currentArticles = articles || [];

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
    const topImg = topNews.fields?.thumbnail || '/assets/img/default.jpg';
    const topLink = `/detail?id=${encodeURIComponent(topNews.id)}`;
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
        const img = article.fields?.thumbnail || '/assets/img/default.jpg';
        const articleLink = `/detail?id=${encodeURIComponent(article.id)}`;
        const articleDate = new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        const articleReadTime = Math.ceil((article.fields?.trailText?.length || 200) / 200) + ' min';
        const excerpt = article.fields?.trailText ? article.fields.trailText.substring(0, 120) + '...' : '';
        const safeTitle = article.webTitle.replace(/'/g, "\\'");
        
        const card = document.createElement('div');
        card.className = 'news-card';
        
        card.innerHTML = `
            <img class="card-thumbnail" src="${img}" alt="news" onclick="location.href='${articleLink}'" style="cursor: pointer;">
            <div class="card-content">
                <span class="card-category">${article.sectionName || 'News'}</span>
                <h4 onclick="location.href='${articleLink}'" style="cursor: pointer;">${article.webTitle}</h4>
                <p>${excerpt}</p>
                <div class="card-footer">
                    <div class="card-meta">
                        <span><i class="far fa-calendar"></i> ${articleDate}</span>
                        <span><i class="far fa-clock"></i> ${articleReadTime}</span>
                    </div>
                    <div class="card-actions">
                        <button class="cat-card-bookmark save-btn" data-id="${article.id}" data-title="${safeTitle}" data-thumbnail="${img}" data-category="${article.sectionName || 'News'}" title="Save">
                            <i class="far fa-bookmark"></i>
                        </button>
                        <button class="cat-card-share share-btn" data-title="${safeTitle}" data-url="/detail?id=${encodeURIComponent(article.id)}" title="Share">
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
                <a href="/category?cat=politics" class="suggestion-chip">Politics</a>
                <a href="/category?cat=technology" class="suggestion-chip">Technology</a>
                <a href="/category?cat=business" class="suggestion-chip">Business</a>
                <a href="/category?cat=world" class="suggestion-chip">World</a>
                <a href="/category?cat=health" class="suggestion-chip">Health</a>
            </div>
        </div>
    `;
}