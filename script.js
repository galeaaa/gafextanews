const API_KEY = '8c97dbca51744510a5554b63be5c4c17'; // API Key kamu
const BASE_URL = `https://newsapi.org/v2/top-headlines?language=en&apiKey=${API_KEY}`;

async function fetchNews() {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();

        // Cek status response dari API
        if (data.status === "ok") {
            displayNews(data.articles);
        } else {
            console.error("API Error:", data.message);
            document.getElementById('headline-container').innerHTML = `Gagal memuat: ${data.message}`;
        }
    } catch (error) {
        console.error("Gagal mengambil berita:", error);
        document.getElementById('headline-container').innerHTML = "Gagal memuat berita. Periksa koneksi atau API Key.";
    }
}

function displayNews(articles) {
    // 1. Validasi: Jika artikel kosong, berhenti di sini agar tidak error
    if (!articles || articles.length === 0) {
        document.getElementById('headline-container').innerHTML = "Tidak ada berita ditemukan.";
        return;
    }

    // 2. Tampilkan Headline Utama (Indeks 0)
    const headline = articles[0];
    const headlineCont = document.getElementById('headline-container');
    
    if (headlineCont && headline) {
        headlineCont.innerHTML = `
            <div class="headline-box">
                <img src="${headline.urlToImage || 'https://via.placeholder.com/600x350'}" class="headline-img">
                <div class="headline-content">
                    <h2>${headline.title || 'Tanpa Judul'}</h2>
                    <p>${headline.description || 'Deskripsi tidak tersedia untuk berita ini.'}</p>
                    <a href="${headline.url}" target="_blank" style="color: #930500; font-weight: bold; text-decoration: none;">Baca Selengkapnya →</a>
                </div>
            </div>
        `;
    }

    // 3. Tampilkan Daftar Artikel Terbaru (Indeks 1 s/d 4)
    const latestCont = document.getElementById('latest-news-container');
    if (latestCont) {
        latestCont.innerHTML = ''; // Bersihkan kontainer
        const latestArticles = articles.slice(1, 5);

        latestArticles.forEach(article => {
            latestCont.innerHTML += `
                <div class="article-item" style="display: flex; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                    <img src="${article.urlToImage || 'https://via.placeholder.com/150x100'}" style="width: 110px; height: 85px; object-fit: cover; border-radius: 8px;">
                    <div>
                        <h4 style="margin: 0;"><a href="${article.url}" target="_blank" style="text-decoration:none; color:#192853;">${article.title}</a></h4>
                        <small style="color: #666;">${new Date(article.publishedAt).toLocaleDateString('id-ID')}</small>
                    </div>
                </div>
            `;
        });
    }

    // 4. Tampilkan Berita Populer di Sidebar (Indeks 5 s/d 9)
    const sidebarCont = document.getElementById('sidebar-news-container');
    if (sidebarCont) {
        sidebarCont.innerHTML = '';
        const sidebarArticles = articles.slice(5, 10);

        sidebarArticles.forEach((article, index) => {
            sidebarCont.innerHTML += `
                <li style="margin-bottom: 15px; list-style-position: inside; color: #192853;">
                    <a href="${article.url}" target="_blank" style="text-decoration:none; color:inherit; font-weight: 500;">
                        ${article.title}
                    </a>
                </li>
            `;
        });
    }
}

// Jalankan fungsi saat halaman selesai dimuat
fetchNews();