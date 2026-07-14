// CATEGORY.JS - GAFEXTA NEWS (SIMPLIFIED & UNIFIED LAYOUT)

const categoryIcons = {
    politics: 'fa-landmark', business: 'fa-briefcase', economy: 'fa-chart-line',
    technology: 'fa-microchip', culture: 'fa-palette', entertainment: 'fa-film',
    lifestyle: 'fa-heart', world: 'fa-globe', science: 'fa-flask',
    environment: 'fa-leaf', health: 'fa-heart-pulse', finance: 'fa-coins',
    crime: 'fa-gavel', law: 'fa-scale-balanced', education: 'fa-graduation-cap',
    fashion: 'fa-shirt', music: 'fa-music', travel: 'fa-plane',
    food: 'fa-utensils', sport: 'fa-futbol'
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

    const titleEl = document.getElementById('main-category-title');
    const iconEl = document.getElementById('category-hero-icon');
    const countEl = document.getElementById('category-article-count');

    if (titleEl) titleEl.innerText = category;
    if (iconEl) iconEl.innerHTML = '<i class="fas ' + getCategoryIcon(category) + '"></i>';

    setActiveNav();

    const container = document.getElementById('category-sliders-container');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; padding:40px;"><i class="fas fa-circle-notch fa-spin fa-2x"></i><br><br>Memuat konten...</div>';

    try {
        const countUrl = '/api/news?q=' + encodeURIComponent(category) + '&page-size=1';
        const countRes = await fetch(countUrl);
        const countData = await countRes.json();
        const totalArticles = countData.response ? countData.response.total : 0;
        if (countEl) countEl.innerText = totalArticles + ' articles \u00b7 Updated today';

        await loadCategoryContent(category, container);

    } catch (err) {
        console.error('Gagal memuat konten:', err);
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#D13E4D;">Gagal memuat konten. Coba lagi nanti.</div>';
    }
}

async function loadCategoryContent(category, container) {
    try {
        let orderBy = 'newest';
        if (currentSort === 'oldest') orderBy = 'oldest';
        if (currentSort === 'popular') orderBy = 'relevance';

        // Fetch 19 articles (1 featured + 18 for grid)
        const url = `/api/news?q=${encodeURIComponent(category)}&page-size=19&order-by=${orderBy}`;
        const response = await fetch(url);
        const data = await response.json();
        const articles = data.response.results || [];

        if (articles.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:40px;">No articles found in this category.</div>';
            return;
        }

        container.innerHTML = '';

        // 1. Render Featured Article at the top
        const featured = articles[0];
        const featuredHtml = createFeaturedHTML(featured);
        container.innerHTML += featuredHtml;

        // 2. Render remaining articles in a 3-column grid
        const gridArticles = articles.slice(1);
        if (gridArticles.length > 0) {
            let gridHtml = '<div class="category-grid-3col">';
            gridHtml += gridArticles.map(article => createCardHTML(article)).join('');
            gridHtml += '</div>';
            container.innerHTML += gridHtml;
        }

        // Sync bookmarks on load
        if (typeof syncAllBookmarksOnLoad === 'function') {
            syncAllBookmarksOnLoad();
        }

    } catch (err) {
        console.error('Failed to load category content:', err);
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#D13E4D;">Gagal memuat konten. Coba lagi nanti.</div>';
    }
}

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

    const container = document.getElementById('category-sliders-container');
    if (container && currentCategory) {
        container.innerHTML = '<div style="text-align:center; padding:40px;"><i class="fas fa-circle-notch fa-spin fa-2x"></i><br><br>Sorting...</div>';
        setTimeout(() => loadCategoryContent(currentCategory, container), 300);
    }

    if (typeof globalShowToast === 'function') {
        globalShowToast('Sorted by: ' + labels[sortType]);
    }
}

function createFeaturedHTML(article) {
    const thumbnail = article.fields && article.fields.thumbnail ? article.fields.thumbnail : 'https://via.placeholder.com/600x380';
    const trailText = article.fields && article.fields.trailText ? article.fields.trailText : 'Read the latest updates on this topic.';
    const date = new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const articleUrl = '/detail?id=' + encodeURIComponent(article.id);
    const titleEscaped = article.webTitle.replace(/'/g, "\\'").replace(/"/g, '\\"');
    
    return `
        <div class="featured-article">
            <div class="featured-img-wrapper" onclick="location.href='${articleUrl}'" style="cursor: pointer;">
                <img src="${thumbnail}" alt="${titleEscaped}" onerror="this.src='https://via.placeholder.com/600x380'">
            </div>
            <div class="featured-content">
                <span class="cat-card-badge">${article.sectionName || 'News'}</span>
                <h2 onclick="location.href='${articleUrl}'" style="cursor: pointer;">${article.webTitle}</h2>
                <p>${trailText}</p>
                <div class="featured-footer">
                    <span class="cat-card-date"><i class="far fa-calendar"></i> ${date}</span>
                    <div class="card-actions">
                        <button class="cat-card-share" data-title="${titleEscaped}" data-url="${article.id}">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                        <button class="cat-card-bookmark" data-id="${article.id}" data-title="${titleEscaped}" data-thumbnail="${thumbnail}" data-category="${article.sectionName || 'News'}">
                            <i class="far fa-bookmark"></i> Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createCardHTML(article) {
    const readTime = Math.floor(Math.random() * 8) + 2;
    const articleUrl = '/detail?id=' + encodeURIComponent(article.id);
    const thumbnail = article.fields && article.fields.thumbnail ? article.fields.thumbnail : 'https://via.placeholder.com/250x150';
    const date = new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const titleEscaped = article.webTitle.replace(/'/g, "\\'").replace(/"/g, '\\"');
    
    return `
        <div class="cat-card">
            <div class="cat-card-img-wrapper" onclick="location.href='${articleUrl}'" style="cursor: pointer;">
                <img src="${thumbnail}" alt="${titleEscaped}" onerror="this.src='https://via.placeholder.com/250x150'">
                <span class="cat-card-read-time">${readTime} min</span>
            </div>
            <span class="cat-card-badge">${article.sectionName || 'News'}</span>
            <h4 onclick="location.href='${articleUrl}'" style="cursor: pointer;">${article.webTitle}</h4>
            <div class="cat-card-footer">
                <span class="cat-card-date"><i class="far fa-calendar"></i> ${date}</span>
                <div class="card-actions">
                    <button class="cat-card-share" data-title="${titleEscaped}" data-url="${article.id}">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="cat-card-bookmark" data-id="${article.id}" data-title="${titleEscaped}" data-thumbnail="${thumbnail}" data-category="${article.sectionName || 'News'}">
                        <i class="far fa-bookmark"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
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

document.addEventListener('DOMContentLoaded', () => {
    initCategoryPage();
});