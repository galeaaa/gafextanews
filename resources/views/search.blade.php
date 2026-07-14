@extends('layouts.layout')

@section('title', 'Search Results - GafextaNews')

@section('styles')
    <link rel="stylesheet" href="{{ asset('assets/css/search.css') }}">
@endsection

@section('search-form')
    <input type="text" id="search-input" placeholder="Search news..." autocomplete="off">
    <button type="button" class="search-btn" id="search-btn">
        <i class="fas fa-search"></i>
    </button>
@endsection

@section('content')
    <main class="container">
        <div class="search-info-bar" id="search-info-bar">
            <div>
                <h2 class="search-header-text">
                    "<span class="search-query-highlight" id="search-query-display">...</span>" — 
                    <span class="search-results-count" id="results-count">Loading...</span>
                </h2>
            </div>
        </div>

        <div class="search-filters">
            <button class="filter-chip active" data-filter="all">
                <i class="fas fa-check"></i> All
            </button>
            <button class="filter-chip" data-filter="latest">
                <i class="fas fa-clock"></i> Latest
            </button>
            <button class="filter-chip" data-filter="most-read">
                <i class="fas fa-fire"></i> Most Read
            </button>
            <button class="filter-chip" data-filter="this-week">
                <i class="fas fa-calendar-week"></i> This week
            </button>
        </div>

        <div id="search-headline-container">
            <div class="loading">Searching for top match...</div>
        </div>

        <div class="latest-articles">
            <h3 class="more-articles-label">MORE ARTICLES</h3>
            <div id="search-results-grid" class="search-results-grid">
                <div class="loading">Loading results...</div>
            </div>
        </div>
    </main>

    <div id="category-toast" class="category-toast" style="position: fixed; bottom: 20px; right: 20px; background: #000; color: #fff; padding: 12px 20px; border: 2px solid #fff; border-radius: 4px; box-shadow: 4px 4px 0px #ff5e5e; z-index: 1000; opacity: 0; transform: translateY(16px); transition: all 0.3s ease; pointer-events: none;"></div>
@endsection

@section('scripts')
    <script src="{{ asset('assets/js/search.js') }}"></script>
@endsection
