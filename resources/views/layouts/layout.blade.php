<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'GafextaNews - Your Trusted News Portal')</title>
    <link rel="stylesheet" href="{{ asset('assets/css/style.css') }}">
    @yield('styles')
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>

    <!-- HEADER & NAVBAR -->
    <header>
        <div class="top-nav">
            <div class="logo-area">
                <a href="/">
                    <img src="{{ asset('assets/img/Logo.jpg') }}" alt="GafextaNews Logo" style="height: 60px; width: auto; object-fit: contain;">
                </a>
            </div>
            <nav>
                <a href="/" class="nav-link @yield('active-home')">@yield('home-link-text', 'For You')</a>
                <a href="/category?cat=politics" class="nav-link @yield('active-politics')">Politics</a>
                <a href="/category?cat=business" class="nav-link @yield('active-business')">Business</a>
                <a href="/category?cat=economy" class="nav-link @yield('active-economy')">Economy</a>
                <a href="/category?cat=technology" class="nav-link @yield('active-technology')">Technology</a>
                <a href="/category?cat=culture" class="nav-link @yield('active-culture')">Culture</a>
                <a href="/category?cat=entertainment" class="nav-link @yield('active-entertainment')">Entertainment</a>
                <a href="/category?cat=lifestyle" class="nav-link @yield('active-lifestyle')">Lifestyle</a>
            </nav>
            <div class="search-profile" style="display: flex; align-items: center; gap: 15px;">
                <div class="search-wrapper" id="search-wrapper">
                    @yield('search-form')
                    <div class="search-autocomplete" id="search-autocomplete"></div>
                </div>
                @auth
                <a href="/profile" class="profile-link" id="nav-profile-link" @yield('profile-style')>
                    @if(Auth::user()->profile_pic)
                        <img src="{{ Auth::user()->profile_pic }}" id="nav-profile-img" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 5px; border: 1px solid #000;">
                    @else
                        <i class="fas fa-user-circle" id="nav-profile-icon"></i>
                    @endif
                    <span id="nav-profile-username">{{ Auth::user()->username }}</span>
                </a>
                <a href="/logout" class="profile-link" style="color: #ef4444; text-decoration: none;">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
                @else
                <a href="/login" class="profile-link" @yield('profile-style')>
                    <i class="fas fa-user-circle"></i> Login
                </a>
                @endauth
            </div>
        </div>
    </header>

    @yield('content')

    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h4>Quick Navigation</h4>
                <ul>
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">Contact</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Reader Services</h4>
                <ul>
                    <li><a href="#">Sitemap</a></li>
                    <li><a href="#">FAQ</a></li>
                    <li><a href="#">Newsletter</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Social Media</h4>
                <div class="social-icons">
                    <i class="fab fa-facebook"></i>
                    <i class="fab fa-twitter"></i>
                    <i class="fab fa-instagram"></i>
                    <i class="fab fa-youtube"></i>
                </div>
            </div>
        </div>
        <p class="copyright">&copy; 2026 Gafexta News. All Rights Reserved.</p>
    </footer>

    @yield('modals')

    <x-alert />
    <script>
        @auth
            localStorage.setItem('currentUser', JSON.stringify({
                id: {{ Auth::user()->id }},
                username: {!! json_encode(Auth::user()->username) !!},
                email: {!! json_encode(Auth::user()->email) !!},
                is_verified: {{ Auth::user()->is_verified ? 1 : 0 }},
                bio: {!! json_encode(Auth::user()->bio ?? '-') !!},
                gender: {!! json_encode(Auth::user()->gender ?? '-') !!},
                birthdate: {!! json_encode(Auth::user()->birthdate ?? '') !!},
                occupation: {!! json_encode(Auth::user()->occupation ?? '-') !!},
                hobbies: {!! json_encode(Auth::user()->hobbies ?? '-') !!},
                profilePic: {!! json_encode(Auth::user()->profile_pic) !!},
                joinDate: {!! json_encode(Auth::user()->created_at ? Auth::user()->created_at->format('F d, Y') : '-') !!}
            }));
            localStorage.setItem('user_token', 'logged_in');
        @else
            localStorage.removeItem('currentUser');
            localStorage.removeItem('user_token');
        @endauth

        function updateNavbarFromStorage() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                const navUsername = document.getElementById('nav-profile-username');
                if (navUsername) {
                    navUsername.textContent = currentUser.username;
                }
                const navProfileLink = document.getElementById('nav-profile-link');
                if (navProfileLink) {
                    if (currentUser.profilePic) {
                        let img = document.getElementById('nav-profile-img');
                        if (!img) {
                            img = document.createElement('img');
                            img.id = 'nav-profile-img';
                            img.style.width = '24px';
                            img.style.height = '24px';
                            img.style.borderRadius = '50%';
                            img.style.objectFit = 'cover';
                            img.style.verticalAlign = 'middle';
                            img.style.marginRight = '5px';
                            img.style.border = '1px solid #000';
                            
                            const icon = document.getElementById('nav-profile-icon') || navProfileLink.querySelector('.fa-user-circle');
                            if (icon) {
                                icon.replaceWith(img);
                            } else {
                                const oldImg = navProfileLink.querySelector('img');
                                if (oldImg) oldImg.replaceWith(img);
                            }
                        }
                        img.src = currentUser.profilePic;
                    } else {
                        let icon = document.getElementById('nav-profile-icon') || navProfileLink.querySelector('.fa-user-circle');
                        if (!icon) {
                            icon = document.createElement('i');
                            icon.className = 'fas fa-user-circle';
                            icon.id = 'nav-profile-icon';
                            icon.style.marginRight = '5px';
                            const img = document.getElementById('nav-profile-img');
                            if (img) img.replaceWith(icon);
                        }
                    }
                }
            }
        }

        function updateActiveNavbarLink() {
            const urlParams = new URLSearchParams(window.location.search);
            const catParam = urlParams.get('cat') || '';
            const path = window.location.pathname;

            const navLinks = document.querySelectorAll('.top-nav nav a.nav-link');
            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href') || '';
                
                if (path.includes('/category') && catParam) {
                    if (href.toLowerCase().includes('cat=' + catParam.toLowerCase())) {
                        link.classList.add('active');
                    }
                } else if (path === '/' || path.endsWith('/index.html') || path === '') {
                    if (href === '/' || href.endsWith('/index.html')) {
                        link.classList.add('active');
                    }
                }
            });
        }

        function initNavbar() {
            updateNavbarFromStorage();
            updateActiveNavbarLink();
        }

        document.addEventListener('DOMContentLoaded', initNavbar);
        window.addEventListener('pageshow', initNavbar);
    </script>
    <script src="{{ asset('assets/js/global-news.js') }}"></script>
    @yield('scripts')
</body>
</html>
