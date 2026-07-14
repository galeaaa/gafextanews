<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Register - GafextaNews</title>
    <link rel="stylesheet" href="{{ asset('assets/css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/register.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>

<body class="login-page">
    <x-alert />

    <div class="login-wrapper">
        <div class="welcome-box">
            <h1>Join Us!</h1>
            <p>Create an account to get the latest news updates and personalize your experience.</p>
        </div>

        <div class="right-side">
            <div class="auth-header">
                <h2>Sign Up</h2>
            </div>

            <div class="glass-login-card">
                <form id="registerForm">
                    <input type="text" id="reg-name" placeholder="Username" required>
                    <input type="email" id="reg-email" placeholder="Email" required>
                    <input type="password" id="reg-pass" placeholder="Password" required>
                    <button type="submit">Sign Up</button>
                </form>
                
                <div class="social-login">
                    <p>Or register with</p>
                    <div class="icons">
                        <a href="/php/google_login.php" class="oauth-btn"><i class="fab fa-google"></i></a>
                        <a href="/php/fb_login.php" class="oauth-btn"><i class="fab fa-facebook"></i></a>
                        <a href="/php/x_login.php" class="oauth-btn"><i class="fa-brands fa-x-twitter"></i></a>
                    </div>
                </div>
                
                <p class="switch-auth">Already have an account? <a href="/login">Login</a></p>
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
