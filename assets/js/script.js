// GAFEXTA NEWS - SCRIPT FOR THE GUARDIAN API 
const API_KEY = '6efbc366-a3f6-4b0f-8161-7904491fcfbe'; 
const BASE_URL = `https://content.guardianapis.com/search?api-key=${API_KEY}&show-fields=thumbnail,trailText,bodyText&page-size=15`;

/**
 * 1. FUNGSI UTAMA LOAD DATA
 * Mendukung pencarian query dan filter kategori
 */
async function fetchNews(query = '') {
    try {
        let url = BASE_URL;
        
        // Jika ada query (pencarian/kategori), ubah URL endpoint
        if (query) {
            url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${API_KEY}&show-fields=thumbnail,trailText&page-size=15`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.response && data.response.status === "ok") {
            const urlParams = new URLSearchParams(window.location.search);
            const articleId = urlParams.get('id');

            // Cek apakah user sedang di halaman detail atau index
            if (articleId && window.location.pathname.includes('detail.html')) {
                fetchArticleDetail(articleId);
            } else {
                displayNews(data.response.results);
            }
        } else {
            handleError("Gagal memuat berita.");
        }
    } catch (error) {
        console.error("Error:", error);
        handleError("Periksa koneksi internet atau API Key kamu.");
    }
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
                    .map(p => `<p style="margin-bottom: 25px; line-height: 1.8; display: block;">${p}</p>`)
                    .join('');
            }
        }
    } catch (error) {
        console.error("Error loading detail:", error);
    }
}

/**
 * 3. FUNGSI FILTER & SEARCH
 */
function filterCategory(category) {
    const headlineCont = document.getElementById('headline-container');
    if (headlineCont) headlineCont.innerHTML = `<p style="padding:20px;">Memuat berita ${category}...</p>`;
    fetchNews(category);
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-profile input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // Mengarahkan ke halaman search dengan query
                window.location.href = `pages/search.html?q=${encodeURIComponent(searchInput.value)}`;
            }
        });
    }
});

/**
 * 4. HELPER & DISPLAY
 */
function generateDetailURL(article) {
    const articleId = encodeURIComponent(article.id || '');
    // Di index.html, file detail ada di folder pages/
    return `pages/detail.html?id=${articleId}`;
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
                            <i class="fa-regular fa-calendar"></i> ${new Date(article.webPublicationDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
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

fetchNews();