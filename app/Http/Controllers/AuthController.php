<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\OtpVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Handle manual registration (sends OTP)
     */
    public function register(Request $request)
    {
        $username = $request->input('username');
        $email = $request->input('email');
        $password = $request->input('password');

        if (!$username || !$email || !$password) {
            return response()->json(['status' => 'error', 'message' => 'Data pendaftaran tidak lengkap.']);
        }

        // 1. Cek username
        if (User::where('username', $username)->exists()) {
            return response()->json(['status' => 'error', 'message' => 'Username ini sudah digunakan!']);
        }

        // 2. Validasi password
        $passwordErrors = [];
        if (strlen($password) < 8) {
            $passwordErrors[] = "Password minimal 8 karakter";
        }
        if (!preg_match('/[A-Z]/', $password)) {
            $passwordErrors[] = "Password harus ada huruf besar (A-Z)";
        }
        if (!preg_match('/[a-z]/', $password)) {
            $passwordErrors[] = "Password harus ada huruf kecil (a-z)";
        }
        if (!preg_match('/[0-9]/', $password)) {
            $passwordErrors[] = "Password harus ada angka (0-9)";
        }
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $passwordErrors[] = "Password harus ada simbol (!@#$%^&* dll)";
        }

        if (!empty($passwordErrors)) {
            return response()->json([
                'status' => 'error', 
                'message' => "Password tidak memenuhi syarat:\n• " . implode("\n• ", $passwordErrors)
            ]);
        }

        // 3. Cek email
        if (User::where('email', $email)->exists()) {
            return response()->json(['status' => 'error', 'message' => 'Email ini sudah terdaftar!']);
        }

        // 4. Buat OTP
        $otp = (string)rand(100000, 999999);

        // 5. Simpan OTP ke database
        OtpVerification::create([
            'email' => $email,
            'otp_code' => $otp
        ]);

        // 6. Kirim OTP ke email via Laravel Mailer
        try {
            $htmlContent = "
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #D13E4D;'>Verifikasi Akun GafextaNews</h2>
                    <p>Halo <b>$username</b>,</p>
                    <p>Gunakan kode OTP berikut untuk menyelesaikan pendaftaran:</p>
                    <div style='background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; 
                                font-weight: bold; letter-spacing: 10px; color: #192853; border-radius: 8px;'>
                        $otp
                    </div>
                    <p style='color: #666; font-size: 14px;'>Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
                    <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;'>
                    <p style='color: #999; font-size: 12px;'>Jika kamu tidak meminta kode ini, abaikan email ini.</p>
                </div>
            ";

            Mail::html($htmlContent, function ($message) use ($email, $username) {
                $message->to($email, $username)
                        ->subject('Kode Verifikasi GafextaNews');
            });

            // Simpan sementara user ke session
            Session::put('temp_user', [
                'name' => $username,
                'email' => $email,
                'password' => Hash::make($password)
            ]);

            return response()->json([
                'status' => 'success', 
                'message' => 'Kode verifikasi telah dikirim ke email Anda!'
            ]);

        } catch (\Exception $e) {
            // Hapus OTP dari DB jika gagal kirim email
            OtpVerification::where('email', $email)->delete();
            return response()->json([
                'status' => 'error', 
                'message' => 'Gagal mengirim email verifikasi. ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Handle OTP verification
     */
    public function verifyOtp(Request $request)
    {
        $user_otp = $request->input('otp');
        $temp_user = Session::get('temp_user');

        if (!$user_otp || !$temp_user) {
            return response()->json(['status' => 'error', 'message' => 'Sesi kadaluarsa, silakan daftar ulang.']);
        }

        $email = $temp_user['email'];

        // 1. Cek OTP terbaru
        $verification = OtpVerification::where('email', $email)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$verification) {
            return response()->json(['status' => 'error', 'message' => 'Kode OTP tidak ditemukan!']);
        }

        // 2. Cek expired (10 menit)
        $created_time = strtotime($verification->created_at);
        if ((time() - $created_time) > 600) {
            OtpVerification::where('email', $email)->delete();
            Session::forget('temp_user');
            return response()->json(['status' => 'error', 'message' => 'Kode OTP sudah expired (10 menit). Silakan daftar ulang.']);
        }

        // 3. Cek kecocokan OTP
        if ($verification->otp_code !== $user_otp) {
            return response()->json(['status' => 'error', 'message' => 'Kode OTP salah!']);
        }

        // 4. Simpan ke database
        try {
            $user = User::create([
                'username' => $temp_user['name'],
                'email' => $email,
                'password' => $temp_user['password'],
                'is_verified' => 1
            ]);

            // Bersihkan OTP & Session
            OtpVerification::where('email', $email)->delete();
            Session::forget('temp_user');

            return response()->json([
                'status' => 'success', 
                'message' => 'Verifikasi berhasil!'
            ]);

        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Gagal menyimpan user ke database: ' . $e->getMessage()]);
        }
    }

    /**
     * Handle manual login (creates session)
     */
    public function login(Request $request)
    {
        $email = $request->input('email');
        $password = $request->input('password');

        if (!$email || !$password) {
            return response()->json(['status' => 'error', 'message' => 'Email dan password tidak boleh kosong.']);
        }

        if (Auth::attempt(['email' => $email, 'password' => $password])) {
            $user = Auth::user();
            return response()->json([
                'status' => 'success',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'is_verified' => $user->is_verified
                ]
            ]);
        }

        return response()->json(['status' => 'error', 'message' => 'Email atau Password salah!']);
    }

    /**
     * Handle Google OAuth Login
     */
    public function handleGoogle(Request $request)
    {
        $redirect_uri = $request->getSchemeAndHttpHost() . '/php/google_login.php';

        if (!$request->has('code')) {
            $auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" . http_build_query([
                'client_id' => env('GOOGLE_CLIENT_ID'),
                'redirect_uri' => $redirect_uri,
                'response_type' => 'code',
                'scope' => 'email profile',
                'access_type' => 'online'
            ]);
            return redirect($auth_url);
        }

        // Callback
        $code = $request->query('code');
        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => env('GOOGLE_CLIENT_ID'),
            'client_secret' => env('GOOGLE_CLIENT_SECRET'),
            'redirect_uri' => $redirect_uri,
            'grant_type' => 'authorization_code'
        ]);

        if ($response->successful()) {
            $token_data = $response->json();
            $access_token = $token_data['access_token'];

            $user_info_response = Http::get("https://www.googleapis.com/oauth2/v2/userinfo?access_token={$access_token}");
            
            if ($user_info_response->successful()) {
                $profile = $user_info_response->json();
                $email = $profile['email'];
                $name = $profile['name'];

                $user = User::where('email', $email)->first();
                if (!$user) {
                    $user = User::create([
                        'username' => $name,
                        'email' => $email,
                        'password' => Hash::make(Str::random(16)),
                        'is_verified' => 1
                    ]);
                }

                Auth::login($user);

                return view('components.oauth-callback', [
                    'status' => 'success',
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                        'profile_pic' => $profile['picture'] ?? null
                    ]
                ]);
            }
        }

        return "Google login failed. Please try again.";
    }

    /**
     * Handle Facebook OAuth Login
     */
    public function handleFacebook(Request $request)
    {
        $redirect_uri = $request->getSchemeAndHttpHost() . '/php/fb_login.php';

        if (!$request->has('code')) {
            $fb_url = "https://www.facebook.com/v18.0/dialog/oauth?" . http_build_query([
                'client_id' => env('FACEBOOK_APP_ID'),
                'redirect_uri' => $redirect_uri,
                'scope' => 'email'
            ]);
            return redirect($fb_url);
        }

        // Callback
        $code = $request->query('code');
        $response = Http::get('https://graph.facebook.com/v18.0/oauth/access_token', [
            'client_id' => env('FACEBOOK_APP_ID'),
            'client_secret' => env('FACEBOOK_APP_SECRET'),
            'redirect_uri' => $redirect_uri,
            'code' => $code
        ]);

        if ($response->successful()) {
            $token_data = $response->json();
            $access_token = $token_data['access_token'];

            $user_profile_response = Http::get("https://graph.facebook.com/me", [
                'fields' => 'name,email,picture',
                'access_token' => $access_token
            ]);

            if ($user_profile_response->successful()) {
                $profile = $user_profile_response->json();
                $email = $profile['email'] ?? ('fb_' . $profile['id'] . '@example.com');
                $name = $profile['name'];
                $profile_pic = $profile['picture']['data']['url'] ?? null;

                $user = User::where('email', $email)->first();
                if (!$user) {
                    $user = User::create([
                        'username' => $name,
                        'email' => $email,
                        'password' => Hash::make(Str::random(16)),
                        'is_verified' => 1
                    ]);
                }

                Auth::login($user);

                return view('components.oauth-callback', [
                    'status' => 'success',
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                        'profile_pic' => $profile_pic
                    ]
                ]);
            }
        }

        return "Facebook login failed. Please try again.";
    }

    /**
     * Handle X (Twitter) OAuth Login
     */
    public function handleX(Request $request)
    {
        $redirect_uri = $request->getSchemeAndHttpHost() . '/php/x_login.php';

        if (!$request->has('code')) {
            $state = bin2hex(random_bytes(16));
            $auth_url = "https://twitter.com/i/oauth2/authorize?" . http_build_query([
                'response_type' => 'code',
                'client_id'     => env('X_CLIENT_ID'),
                'redirect_uri'  => $redirect_uri,
                'scope'         => 'tweet.read users.read email',
                'state'         => $state,
                'code_challenge'=> 'challenge',
                'code_challenge_method' => 'plain'
            ]);
            return redirect($auth_url);
        }

        // Callback
        $code = $request->query('code');
        $response = Http::asForm()
            ->withBasicAuth(env('X_CLIENT_ID'), env('X_CLIENT_SECRET'))
            ->post('https://api.twitter.com/2/oauth2/token', [
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => $redirect_uri,
                'code_verifier' => 'challenge'
            ]);

        if ($response->successful()) {
            $token_data = $response->json();
            $access_token = $token_data['access_token'];

            $profile_response = Http::withToken($access_token)
                ->get('https://api.twitter.com/2/users/me', [
                    'user.fields' => 'profile_image_url,username,name'
                ]);

            if ($profile_response->successful()) {
                $profile = $profile_response->json()['data'];
                $username = $profile['username'];
                $name = $profile['name'] ?? $username;
                $email = $username . '@x.com'; // Fallback email since X might not always provide email easily

                $user = User::where('email', $email)->first();
                if (!$user) {
                    $user = User::create([
                        'username' => $name,
                        'email' => $email,
                        'password' => Hash::make(Str::random(16)),
                        'is_verified' => 1
                    ]);
                }

                Auth::login($user);

                return view('components.oauth-callback', [
                    'status' => 'success',
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                        'profile_pic' => $profile['profile_image_url'] ?? null
                    ]
                ]);
            }
        }

        return "X login failed. Please try again.";
    }

    /**
     * Clear session & localStorage, then redirect
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response('
            <script>
                localStorage.removeItem("currentUser");
                localStorage.removeItem("user_token");
                window.location.href = "/login";
            </script>
        ');
    }
}
