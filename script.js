// GAFEXTA NEWS - SCRIPT FOR THE GUARDIAN API 
const API_KEY = '6efbc366-a3f6-4b0f-8161-7904491fcfbe'; 
const BASE_URL = `https://content.guardianapis.com/search?api-key=${API_KEY}&show-fields=thumbnail,trailText&page-size=15`;

async function fetchNews() {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();

        // Di Guardian, datanya ada di dalam response.results
        if (data.response && data.response.status === "ok") {
            displayNews(data.response.results);
        } else {
            document.getElementById('headline-container').innerHTML = `Gagal memuat berita.`;
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('headline-container').innerHTML = "Periksa koneksi internet atau API Key kamu.";
    }
}

// PERBAIKAN: Hanya mengirim ID berita agar URL tidak terlalu panjang
function generateDetailURL(article) {
    const articleId = encodeURIComponent(article.id || '');
    return `detail.html?id=${articleId}`;
}

function displayNews(articles) {
    if (!articles || articles.length === 0) return;

    // 1. Headline Utama (Index 0)
    const headline = articles[0];
    const headlineCont = document.getElementById('headline-container');
    if (headlineCont) {
        headlineCont.innerHTML = `
            <div class="headline-box">
                <img src="${headline.fields?.thumbnail || 'https://via.placeholder.com/600x350'}" class="headline-img">
                <div class="headline-content">
                    <h2>${headline.webTitle}</h2>
                    <p>${headline.fields?.trailText || ''}</p>
                    <a href="${generateDetailURL(headline)}" style="color: #D13E4D; font-weight: bold; text-decoration: none;">Baca Selengkapnya (Full) →</a>
                </div>
            </div>
        `;
    }

    // 2. Artikel Terbaru (Index 1-4)
    const latestCont = document.getElementById('latest-news-container');
    if (latestCont) {
        latestCont.innerHTML = '';
        articles.slice(1, 5).forEach(article => {
            latestCont.innerHTML += `
                <div class="article-item" style="display: flex; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                    <img src="${article.fields?.thumbnail || 'https://via.placeholder.com/150x100'}" style="width: 110px; height: 85px; object-fit: cover; border-radius: 8px; border: 2px solid #000;">
                    <div>
                        <h4 style="margin: 0;"><a href="${generateDetailURL(article)}" style="text-decoration:none; color:#192853;">${article.webTitle}</a></h4>
                        <small style="color: #666;">${new Date(article.webPublicationDate).toLocaleDateString('id-ID')}</small>
                    </div>
                </div>
            `;
        });
    }

    // 3. Terpopuler Sidebar (Index 5-10)
    const sidebarCont = document.getElementById('sidebar-news-container');
    if (sidebarCont) {
        sidebarCont.innerHTML = '';
        articles.slice(5, 11).forEach(article => {
            sidebarCont.innerHTML += `
                <li style="margin-bottom: 15px; color: #192853;">
                    <a href="${generateDetailURL(article)}" style="text-decoration:none; color:inherit; font-weight: 500;">
                        ${article.webTitle}
                    </a>
                </li>
            `;
        });
    }
}

fetchNews();