<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GuardianNewsController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CommentController;

// Home page
Route::get('/', function () {
    return view('index');
})->name('home');

Route::get('/index.html', function () {
    return redirect()->route('home');
});

// Category page
Route::get('/category', function () {
    return view('category');
})->name('category');

Route::get('/pages/category.html', function () {
    return view('category');
});

// Detail page
Route::get('/detail', function () {
    return view('detail');
})->name('detail');

Route::get('/pages/detail.html', function () {
    return view('detail');
});

// Login page
Route::get('/login', function () {
    return view('login');
})->name('login');

Route::get('/pages/login.html', function () {
    return view('login');
});

// Profile page (Protected)
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', function () {
        return view('profile');
    })->name('profile');

    Route::get('/pages/profile.html', function () {
        return view('profile');
    });
});

// Register page
Route::get('/register', function () {
    return view('register');
})->name('register');

Route::get('/pages/register.html', function () {
    return view('register');
});

// Search page
Route::get('/search', function () {
    return view('search');
})->name('search');

Route::get('/pages/search.html', function () {
    return view('search');
});

// Verify page
Route::get('/verify', function () {
    return view('verify');
})->name('verify');

Route::get('/pages/verify.html', function () {
    return view('verify');
});

// Authentication APIs
Route::post('/php/register.php', [AuthController::class, 'register']);
Route::post('/php/verify_process.php', [AuthController::class, 'verifyOtp']);
Route::post('/php/login.php', [AuthController::class, 'login']);
Route::get('/php/google_login.php', [AuthController::class, 'handleGoogle']);
Route::get('/php/fb_login.php', [AuthController::class, 'handleFacebook']);
Route::get('/php/x_login.php', [AuthController::class, 'handleX']);
Route::get('/logout', [AuthController::class, 'logout'])->name('logout');

// Guardian News proxy routes
Route::get('/api/news', [GuardianNewsController::class, 'search']);
Route::get('/api/news/detail', [GuardianNewsController::class, 'detail']);
Route::get('/api/news/recommendations', [GuardianNewsController::class, 'recommendations']);

// Bookmark public routes
Route::get('/api/bookmarks/ids', [BookmarkController::class, 'getBookmarkedIds']);

// Protected routes (Requires Auth)
Route::middleware(['auth'])->group(function () {
    Route::post('/api/profile/update', [ProfileController::class, 'updateProfile']);
    Route::post('/api/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::post('/api/account/delete', [ProfileController::class, 'deleteAccount']);
    Route::post('/api/comments', [CommentController::class, 'store']);
    Route::get('/api/bookmarks', [BookmarkController::class, 'index']);
    Route::post('/api/bookmarks/toggle', [BookmarkController::class, 'toggle']);
});

// Comment routes (Public)
Route::get('/api/comments', [CommentController::class, 'index']);
