document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const displayElement = document.getElementById('search-query-display');
    
    if (query) {
        displayElement.innerText = query;
        fetchSearchResults(query);
    } else {
        displayElement.innerText = "Everything";
        fetchSearchResults("news"); // Default jika kosong
    }
});

async function fetchSearchResults(query) {
    const container = document.getElementById('search-results-grid');
    const headlineContainer = document.getElementById('search-headline-container');
    
    const API_KEY = '6efbc366-a3f6-4b0f-8161-7904491fcfbe'; 
    const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${API_KEY}&show-fields=thumbnail,trailText,headline&page-size=31`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const articles = data.response.results;

        if (articles && articles.length > 0) {
            // 1. Tampilkan Headline (Data Pertama)
            const topNews = articles[0];
            const topImg = topNews.fields?.thumbnail || '../assets/img/default.jpg';
            // Ubah Link ke detail.html milik sendiri
            const topLink = `detail.html?id=${encodeURIComponent(topNews.id)}`;
            
            headlineContainer.innerHTML = `
                <div class="news-card-big" style="cursor:pointer;" onclick="location.href='${topLink}'">
                    <img src="${topImg}" alt="Headline News">
                    <h2>${topNews.webTitle}</h2>
                    <p>${topNews.fields?.trailText || ''}</p>
                </div>
            `;

            // 2. Tampilkan Sisa Hasil (Grid 3 Kolom)
            container.innerHTML = '';
            articles.slice(1).forEach(article => {
                const img = article.fields?.thumbnail || '../assets/img/default.jpg';
                const articleLink = `detail.html?id=${encodeURIComponent(article.id)}`;
                
                const card = document.createElement('div');
                card.className = 'news-card';
                card.style.cursor = 'pointer';
                card.onclick = () => { location.href = articleLink; };
                
                card.innerHTML = `
                    <img src="${img}" alt="news">
                    <h4>${article.webTitle}</h4>
                    <p>${article.fields?.trailText ? article.fields.trailText.substring(0, 100) + '...' : ''}</p>
                    <a href="${articleLink}" style="font-weight:bold; color:#ed5858; text-decoration:none; margin-top:auto;">Read More →</a>
                `;
                container.appendChild(card);
            });
        } else {
            headlineContainer.innerHTML = '';
            container.innerHTML = '<div class="loading">No results found. Try another keyword.</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="loading">Error connecting to API. Please try again.</div>';
    }
}