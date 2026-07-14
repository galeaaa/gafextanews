// GLOBAL-NEWS.JS - GAFEXTA NEWS (PUSAT LOGIKA GLOBAL)

function getPathPrefix() {
    return '/';
}

function getGlobalCategoryIcon(cat) {
    const icons = {
        politics: 'fa-landmark', business: 'fa-briefcase', economy: 'fa-chart-line',
        technology: 'fa-microchip', culture: 'fa-palette', entertainment: 'fa-film',
        lifestyle: 'fa-heart', world: 'fa-globe', science: 'fa-flask',
        environment: 'fa-leaf', health: 'fa-heart-pulse', finance: 'fa-coins',
        crime: 'fa-gavel', law: 'fa-scale-balanced', education: 'fa-graduation-cap',
        fashion: 'fa-shirt', music: 'fa-music', travel: 'fa-plane',
        food: 'fa-utensils', sport: 'fa-futbol'
    };
    return icons[cat.toLowerCase()] || 'fa-newspaper';
}

// ============================================================
// LOGIKA 1: INTEGRASI SEARCH AUTOCOMPLETE GLOBAL
// ============================================================
function initGlobalSearch() {
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

        debounceTimer = setTimeout(() => fetchGlobalSearchSuggestions(query, autocomplete), 300);
    });

    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length >= 2) {
            autocomplete.classList.add('active');
        }
    });

    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !autocomplete.contains(e.target)) {
            autocomplete.classList.remove('active');
        }
    });

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = '/search?q=' + encodeURIComponent(query);
            }
        });
    }

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query) {
                window.location.href = '/search?q=' + encodeURIComponent(query);
            }
        }
    });
}

async function fetchGlobalSearchSuggestions(query, autocompleteEl) {
    try {
        const url = '/api/news?q=' + encodeURIComponent(query) + '&page-size=8';
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
            const icon = getGlobalCategoryIcon(article.sectionName || 'news');
            const date = new Date(article.webPublicationDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
            const highlightedTitle = article.webTitle.replace(regex, '<span class="autocomplete-highlight">$1</span>');

            html += `
                <a href="/detail?id=${encodeURIComponent(article.id)}" class="autocomplete-item" onclick="document.getElementById('search-autocomplete').classList.remove('active')">
                    <div class="autocomplete-item-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div>
                        <div class="autocomplete-item-text">${highlightedTitle}</div>
                        <div class="autocomplete-item-meta">${article.sectionName || 'News'} · ${date}</div>
                    </div>
                </a>
            `;
        });
        html += '</div>';

        html += `
            <div class="autocomplete-section" style="border-top: 1px solid #eee;">
                <a href="/search?q=${encodeURIComponent(query)}" class="autocomplete-item" style="color: #D13E4D;">
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
        console.error('Global Search error:', err);
    }
}

// ============================================================
// LOGIKA 2: INTEGRASI SAVE DAN SHARE GLOBAL (EVENT DELEGATION)
// ============================================================
function initGlobalSaveShare() {
    document.addEventListener('click', function(e) {
        // Deteksi klik pada tombol share
        const shareBtn = e.target.closest('.cat-card-share, .share-btn, .article-action-btn[onclick*="shareArticle"]');
        if (shareBtn) {
            e.preventDefault();
            e.stopPropagation();
            const title = shareBtn.getAttribute('data-title');
            const url = shareBtn.getAttribute('data-url') || shareBtn.getAttribute('data-id');
            globalShareArticle(title, url);
        }

        // Deteksi klik pada tombol bookmark/save
        const bookmarkBtn = e.target.closest('.cat-card-bookmark, .save-btn, .article-action-btn[onclick*="toggleBookmark"]');
        if (bookmarkBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = bookmarkBtn.getAttribute('data-id');
            const title = bookmarkBtn.getAttribute('data-title');
            const thumbnail = bookmarkBtn.getAttribute('data-thumbnail') || '';
            const category = bookmarkBtn.getAttribute('data-category') || 'News';
            globalToggleBookmark(id, title, thumbnail, category);
        }
    });

    // Sinkronisasi tombol bookmarks saat pertama kali dimuat
    syncAllBookmarksOnLoad();
}

function globalShareArticle(title, url) {
    let detailUrl;
    if (url) {
        if (url.includes('detail.html')) {
            detailUrl = url.replace(/.*detail\.html/, '/detail');
        } else if (url.startsWith('/')) {
            detailUrl = url;
        } else {
            detailUrl = '/detail?id=' + encodeURIComponent(url);
        }
    } else {
        detailUrl = window.location.pathname + window.location.search;
    }
    const fullUrl = window.location.origin + (detailUrl.startsWith('/') ? '' : '/') + detailUrl;

    if (navigator.share) {
        navigator.share({
            title: title,
            url: fullUrl
        }).catch(err => console.log('Share cancelled'));
    } else {
        navigator.clipboard.writeText(fullUrl).then(() => {
            globalShowToast('Link copied to clipboard!');
        }).catch(() => {
            globalShowToast('Failed to copy link');
        });
    }
}

async function globalToggleBookmark(articleId, title, thumbnail, category) {
    if (localStorage.getItem('user_token') === null) {
        showAlert("Please login first to bookmark articles.");
        return;
    }

    try {
        const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
        const csrfToken = csrfTokenMeta ? csrfTokenMeta.getAttribute('content') : '';

        const response = await fetch('/api/bookmarks/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({
                article_id: articleId,
                title: title,
                thumbnail: thumbnail,
                category: category
            })
        });

        const result = await response.json();
        if (result.success) {
            globalShowToast(result.message);
            syncGlobalBookmarkUI(articleId, result.bookmarked);
        } else {
            showAlert(result.message || "Failed to toggle bookmark.");
        }
    } catch (err) {
        console.error('Bookmark error:', err);
        showAlert("Failed to connect to the server.");
    }
}

function syncGlobalBookmarkUI(articleId, isSaved) {
    const encodedId = encodeURIComponent(articleId);
    
    // Select all category / search bookmark buttons
    const buttons = document.querySelectorAll(`
        .cat-card-bookmark[data-id="${articleId}"], 
        .cat-card-bookmark[data-id="${articleId.replace(/'/g, "\\'").replace(/"/g, '\\"')}"]
    `);
    
    buttons.forEach(btn => {
        if (isSaved) {
            btn.classList.add('saved');
            btn.innerHTML = '<i class="fas fa-bookmark"></i>';
        } else {
            btn.classList.remove('saved');
            btn.innerHTML = '<i class="far fa-bookmark"></i>';
        }
    });

    // Handle dashboard / detail page buttons
    const targetBtns = [
        document.getElementById(`bookmark-btn-${encodedId}`),
        document.getElementById(`bookmark-btn-grid-${encodedId}`)
    ];
    targetBtns.forEach(btn => {
        if (btn) {
            if (isSaved) {
                btn.classList.add('bookmarked');
                btn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
            } else {
                btn.classList.remove('bookmarked');
                btn.innerHTML = '<i class="fas fa-bookmark"></i> Save';
            }
        }
    });
}

async function syncAllBookmarksOnLoad() {
    if (localStorage.getItem('user_token') === null) {
        // Clear saved UI elements just in case
        document.querySelectorAll('.cat-card-bookmark').forEach(btn => {
            btn.classList.remove('saved');
            btn.innerHTML = '<i class="far fa-bookmark"></i>';
        });
        document.querySelectorAll('[id^="bookmark-btn-"], [id^="bookmark-btn-grid-"]').forEach(btn => {
            btn.classList.remove('bookmarked');
            btn.innerHTML = '<i class="fas fa-bookmark"></i> Save';
        });
        return;
    }

    try {
        const response = await fetch('/api/bookmarks/ids');
        const data = await response.json();
        if (data.success) {
            const savedIds = data.ids || [];
            
            // Sync category / search / global cards
            document.querySelectorAll('.cat-card-bookmark').forEach(btn => {
                const id = btn.getAttribute('data-id');
                if (id) {
                    const isSaved = savedIds.includes(id);
                    if (isSaved) {
                        btn.classList.add('saved');
                        btn.innerHTML = '<i class="fas fa-bookmark"></i>';
                    } else {
                        btn.classList.remove('saved');
                        btn.innerHTML = '<i class="far fa-bookmark"></i>';
                    }
                }
            });

            // Sync dashboard / detail page buttons
            document.querySelectorAll('[id^="bookmark-btn-"], [id^="bookmark-btn-grid-"]').forEach(btn => {
                const idPrefix = btn.id.startsWith('bookmark-btn-grid-') ? 'bookmark-btn-grid-' : 'bookmark-btn-';
                const encodedId = btn.id.substring(idPrefix.length);
                const articleId = decodeURIComponent(encodedId);
                
                const isSaved = savedIds.includes(articleId);
                if (isSaved) {
                    btn.classList.add('bookmarked');
                    btn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
                } else {
                    btn.classList.remove('bookmarked');
                    btn.innerHTML = '<i class="fas fa-bookmark"></i> Save';
                }
            });
        }
    } catch (err) {
        console.error('Failed to sync bookmarks:', err);
    }
}

function globalShowToast(message) {
    const toast = document.getElementById('bookmark-toast') || 
                  document.getElementById('category-toast') || 
                  document.getElementById('global-toast');
                  
    if (!toast) return;

    const msgSpan = document.getElementById('bookmark-toast-msg');
    if (msgSpan) {
        msgSpan.textContent = message;
    } else {
        toast.innerHTML = '<i class="fas fa-info-circle"></i> ' + message;
    }

    if (toast.classList.contains('bookmark-toast')) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    } else {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(16px)';
        }, 2500);
    }
}

function applyGlobalLanguage() {
    const lang = localStorage.getItem('language') || 'en';
    
    // 1. Navbar Links
    const navLinks = document.querySelectorAll('.top-nav nav a.nav-link');
    navLinks.forEach(link => {
        if (!link.dataset.originalText) {
            link.dataset.originalText = link.textContent.trim();
        }
        link.textContent = link.dataset.originalText;
    });

    // 2. Search Placeholder
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        if (!searchInput.dataset.originalPlaceholder) {
            searchInput.dataset.originalPlaceholder = searchInput.placeholder;
        }
        searchInput.placeholder = searchInput.dataset.originalPlaceholder;
    }

    // 3. Logout / Login / Profile Links
    const logoutLink = document.querySelector('.top-nav a[href="/logout"]');
    if (logoutLink) {
        if (!logoutLink.dataset.originalHtml) {
            logoutLink.dataset.originalHtml = logoutLink.innerHTML;
        }
        logoutLink.innerHTML = logoutLink.dataset.originalHtml;
    }
    const loginLink = document.querySelector('.top-nav a[href="/login"]');
    if (loginLink) {
        if (!loginLink.dataset.originalHtml) {
            loginLink.dataset.originalHtml = loginLink.innerHTML;
        }
        loginLink.innerHTML = loginLink.dataset.originalHtml;
    }
    const profileLink = document.querySelector('.top-nav a[href="/profile"], .top-nav a.profile-link');
    if (profileLink) {
        if (!profileLink.dataset.originalHtml) {
            profileLink.dataset.originalHtml = profileLink.innerHTML;
        }
        profileLink.innerHTML = profileLink.dataset.originalHtml;
    }

    // 4. Headers (h3)
    const headers = document.querySelectorAll('h3');
    headers.forEach(h3 => {
        if (!h3.dataset.originalText) {
            h3.dataset.originalText = h3.textContent.trim();
        }
        h3.textContent = h3.dataset.originalText;
    });

    if (lang === 'id') {
        const navTranslations = {
            'For You': 'Untuk Anda',
            'Politics': 'Politik',
            'Business': 'Bisnis',
            'Economy': 'Ekonomi',
            'Technology': 'Teknologi',
            'Culture': 'Budaya',
            'Entertainment': 'Hiburan',
            'Lifestyle': 'Gaya Hidup'
        };
        navLinks.forEach(link => {
            const originalText = link.dataset.originalText;
            if (navTranslations[originalText]) {
                link.textContent = navTranslations[originalText];
            }
        });

        if (searchInput) {
            searchInput.placeholder = 'Cari berita...';
        }

        if (logoutLink) {
            logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Keluar';
        }

        if (loginLink) {
            loginLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Masuk';
        }

        if (profileLink) {
            const username = profileLink.textContent.trim();
            if (username && username !== 'Profile' && username !== 'Profil') {
                // Keep username
            } else {
                profileLink.innerHTML = '<i class="fas fa-user-circle"></i> Profil';
            }
        }

        const headerTranslations = {
            'LATEST ARTICLES': 'ARTIKEL TERBARU',
            'MOST POPULAR': 'PALING POPULER',
            'POPULAR CATEGORIES': 'KATEGORI POPULER',
            'Komentar': 'Komentar',
            'Recommended': 'Rekomendasi',
            'Read Also': 'Baca Juga'
        };
        headers.forEach(h3 => {
            const originalText = h3.dataset.originalText;
            for (let enKey in headerTranslations) {
                if (originalText.toUpperCase() === enKey.toUpperCase()) {
                    h3.textContent = headerTranslations[enKey];
                }
            }
        });
    } else if (lang === 'es') {
        const navTranslations = {
            'For You': 'Para Ti',
            'Politics': 'Política',
            'Business': 'Negocios',
            'Economy': 'Economía',
            'Technology': 'Tecnología',
            'Culture': 'Cultura',
            'Entertainment': 'Entretenimiento',
            'Lifestyle': 'Estilo de Vida'
        };
        navLinks.forEach(link => {
            const originalText = link.dataset.originalText;
            if (navTranslations[originalText]) {
                link.textContent = navTranslations[originalText];
            }
        });

        if (searchInput) {
            searchInput.placeholder = 'Buscar noticias...';
        }

        if (logoutLink) {
            logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar sesión';
        }

        if (loginLink) {
            loginLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar sesión';
        }

        if (profileLink) {
            const username = profileLink.textContent.trim();
            if (username && username !== 'Profile' && username !== 'Perfil') {
                // Keep username
            } else {
                profileLink.innerHTML = '<i class="fas fa-user-circle"></i> Perfil';
            }
        }

        const headerTranslations = {
            'LATEST ARTICLES': 'ÚLTIMOS ARTÍCULOS',
            'MOST POPULAR': 'MÁS POPULAR',
            'POPULAR CATEGORIES': 'CATEGORÍAS POPULARES',
            'Komentar': 'Comentarios',
            'Recommended': 'Recomendado',
            'Read Also': 'Leer También'
        };
        headers.forEach(h3 => {
            const originalText = h3.dataset.originalText;
            for (let enKey in headerTranslations) {
                if (originalText.toUpperCase() === enKey.toUpperCase()) {
                    h3.textContent = headerTranslations[enKey];
                }
            }
        });
    }
}

function applyGlobalDarkMode() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function initSimulatedNotifications() {
    const settings = JSON.parse(localStorage.getItem('notificationSettings')) || {
        breaking: true,
        favorite: true,
        comment: true,
        system: true,
        email: false,
        daily: true
    };

    if (settings.breaking) {
        setTimeout(() => {
            showNotificationToast('Breaking News', 'New development reported in international sports updates.', 'fa-bolt');
        }, 12000);
    }

    if (settings.system) {
        setTimeout(() => {
            showNotificationToast('System Update', 'Gafexta News performance has been optimized for your browser.', 'fa-cogs');
        }, 35000);
    }
}

function showNotificationToast(title, body, iconClass) {
    let notifToast = document.getElementById('notif-toast-simulated');
    if (!notifToast) {
        notifToast = document.createElement('div');
        notifToast.id = 'notif-toast-simulated';
        notifToast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #ffffff;
            border: 3px solid #000000;
            border-radius: 16px;
            box-shadow: 6px 6px 0px #000000;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 320px;
            z-index: 100000;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;
        document.body.appendChild(notifToast);
    }

    notifToast.innerHTML = `
        <div style="width: 40px; height: 40px; background: #fce8ea; border: 2px solid #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #ed5858;">
            <i class="fas ${iconClass}" style="font-size: 18px;"></i>
        </div>
        <div>
            <div style="font-weight: 800; font-size: 13px; margin-bottom: 2px;">${title}</div>
            <div style="font-size: 11px; color: #555; line-height: 1.3;">${body}</div>
        </div>
    `;

    setTimeout(() => {
        notifToast.style.opacity = '1';
        notifToast.style.transform = 'translateY(0)';
    }, 100);

    setTimeout(() => {
        notifToast.style.opacity = '0';
        notifToast.style.transform = 'translateY(20px)';
    }, 6000);
}

document.addEventListener('DOMContentLoaded', () => {
    initGlobalSearch();
    initGlobalSaveShare();
    applyGlobalDarkMode();
    applyGlobalLanguage();
    initSimulatedNotifications();
});

window.addEventListener('pageshow', () => {
    applyGlobalLanguage();
});