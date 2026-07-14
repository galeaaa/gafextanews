<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Login - GafextaNews</title>
    <link rel="stylesheet" href="{{ asset('assets/css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/auth.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>

<x-alert />

<body class="login-page">
    <div class="login-wrapper">
        <div class="welcome-box">
            <h1>Welcome!</h1>
            <p>Sign in to join the conversation and share your thoughts.</p>
        </div>

        <div class="right-side">
            <div class="auth-header">
                <h2>Login</h2>
            </div>

            <div class="glass-login-card">
                <form id="loginForm">
                    <input type="email" id="login-email" placeholder="Email" required>
                    <input type="password" id="login-pass" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
                
                <div class="social-login">
                    <p>Or login with</p>
                    <div class="icons">
                        <a href="/php/google_login.php" class="oauth-btn"><i class="fab fa-google"></i></a>
                        <a href="/php/fb_login.php" class="oauth-btn"><i class="fab fa-facebook"></i></a>
                        <a href="/php/x_login.php" class="oauth-btn"><i class="fa-brands fa-x-twitter"></i></a>
                    </div>
                </div>
                
                <p class="switch-auth">New here? <a href="/register">Sign Up</a></p>
            </div>
        </div>
    </div>
    <script>
        @auth
            localStorage.setItem('currentUser', JSON.stringify({
                id: {{ Auth::user()->id }},
                username: "{{ Auth::user()->username }}",
                email: "{{ Auth::user()->email }}",
                is_verified: {{ Auth::user()->is_verified ? 1 : 0 }}
            }));
            localStorage.setItem('user_token', 'logged_in');
        @else
            localStorage.removeItem('currentUser');
            localStorage.removeItem('user_token');
        @endauth
    </script>
    <script src="{{ asset('assets/js/auth.js') }}"></script>
</body>
</html>
