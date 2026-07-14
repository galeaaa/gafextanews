@extends('layouts.layout')

@section('title', 'Category - GafextaNews')

@section('styles')
    <link rel="stylesheet" href="{{ asset('assets/css/category.css') }}">
@endsection

@section('search-form')
    <input type="text" id="search-input" placeholder="Search news..." autocomplete="off">
    <button type="button" class="search-btn" id="search-btn">
        <i class="fas fa-search"></i>
    </button>
@endsection

@section('content')
    <main class="container">
        <section class="category-header">
            <div class="category-header-left">
                <div class="category-icon" id="category-hero-icon">
                    <i class="fas fa-newspaper"></i>
                </div>
                <div class="category-header-info">
                    <h1 id="main-category-title">Loading Category...</h1>
                    <div class="category-header-meta" id="category-article-count">
                        <i class="fas fa-circle-notch fa-spin"></i> Loading articles...
                    </div>
                </div>
            </div>
            
            <div class="category-sort-wrapper">
                <button class="category-sort-btn" onclick="toggleSort()">
                    <i class="fas fa-sliders-h"></i>
                    <span id="sort-label">Sort Latest</span>
                </button>
                <div class="sort-dropdown" id="sort-dropdown">
                    <div class="sort-dropdown-item" onclick="setSort('latest')">
                        <i class="fas fa-clock"></i> Latest
                    </div>
                    <div class="sort-dropdown-item" onclick="setSort('oldest')">
                        <i class="fas fa-history"></i> Oldest
                    </div>
                    <div class="sort-dropdown-divider"></div>
                    <div class="sort-dropdown-item" onclick="setSort('popular')">
                        <i class="fas fa-fire"></i> Popular
                    </div>
                </div>
            </div>
        </section>

        <div id="category-sliders-container" class="main-grid-wrapper"></div>
    </main>

    <!-- toast container -->
    <div id="category-toast" class="category-toast" style="position: fixed; bottom: 20px; right: 20px; background: #000; color: #fff; padding: 12px 20px; border: 2px solid #fff; border-radius: 4px; box-shadow: 4px 4px 0px #ff5e5e; z-index: 1000; opacity: 0; transform: translateY(16px); transition: all 0.3s ease; pointer-events: none;"></div>
@endsection

@section('scripts')
    <script src="{{ asset('assets/js/category.js') }}"></script>
@endsection
