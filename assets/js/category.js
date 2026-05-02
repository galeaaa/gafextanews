// category.js
const API_KEY = '6efbc366-a3f6-4b0f-8161-7904491fcfbe';

async function initCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('cat') || 'news';

    const titleEl = document.getElementById('main-category-title');
    if(titleEl) titleEl.innerText = category;

    const container = document.getElementById('category-sliders-container');
    if(!container) return;
    
    container.innerHTML = '<div style="text-align:center; padding:20px;">Memuat konten...</div>'; 

    const rowTypes = [
        { title: "Latest in " + category, query: category },
        { title: "Top Stories", query: category + " headline" },
        { title: "Trending Now", query: category + " popular" }
    ];

    container.innerHTML = ''; 
    for (const row of rowTypes) {
        await createSliderRow(row.title, row.query, container);
    }
}

async function createSliderRow(title, query, targetContainer) {
    try {
        const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${API_KEY}&show-fields=thumbnail&page-size=15`;
        const response = await fetch(url);
        const data = await response.json();
        const articles = data.response.results;

        const sliderId = 'slider-' + Math.random().toString(36).substr(2, 9);

        const rowDiv = document.createElement('div');
        rowDiv.className = 'cat-row';
        rowDiv.innerHTML = `
            <h3>${title}</h3>
            <button class="nav-btn left" onclick="scrollSlider('${sliderId}', -470)">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="netflix-slider" id="${sliderId}">
                ${articles.map(article => `
                    <div class="cat-card" onclick="location.href='detail.html?id=${encodeURIComponent(article.id)}'">
                        <img src="${article.fields?.thumbnail || 'https://via.placeholder.com/250x150'}" alt="img">
                        <h4>${article.webTitle}</h4>
                    </div>
                `).join('')}
            </div>
            <button class="nav-btn right" onclick="scrollSlider('${sliderId}', 470)">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        targetContainer.appendChild(rowDiv);
    } catch (err) {
        console.error("Gagal memuat row:", err);
    }
}

function scrollSlider(id, distance) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollBy({ left: distance, behavior: 'smooth' });
    }
}

document.addEventListener('DOMContentLoaded', initCategoryPage);