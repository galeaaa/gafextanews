<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class GuardianNewsService
{
    protected $apiKey;
    protected $baseUrl = 'https://content.guardianapis.com';

    public function __construct()
    {
        $this->apiKey = config('services.guardian.key');
    }

    /**
     * Fetch lists of news based on search query, section/category, sort order, etc.
     */
    public function fetchNewsList(array $params = [])
    {
        $cacheKey = 'guardian_news_list_' . md5(serialize($params));

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($params) {
            $queryParams = array_merge([
                'api-key' => $this->apiKey,
                'show-fields' => 'thumbnail,trailText,bodyText',
            ], $params);

            // Clean empty parameters
            $queryParams = array_filter($queryParams, function ($value) {
                return $value !== null && $value !== '';
            });

            $response = Http::get("{$this->baseUrl}/search", $queryParams);

            if ($response->successful()) {
                return $response->json();
            }

            return ['response' => ['status' => 'error', 'results' => [], 'total' => 0]];
        });
    }

    /**
     * Fetch detail of a single article by its Guardian ID.
     */
    public function fetchArticleDetail($id)
    {
        $cacheKey = 'guardian_article_' . md5($id);

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($id) {
            $response = Http::get("{$this->baseUrl}/{$id}", [
                'api-key' => $this->apiKey,
                'show-fields' => 'thumbnail,body,webPublicationDate,byline,sectionName,bodyText',
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return ['response' => ['status' => 'error', 'content' => null]];
        });
    }

    /**
     * Fetch recommendations / related articles based on a section.
     */
    public function fetchRecommendations($sectionId, $pageSize = 20)
    {
        $cacheKey = 'guardian_recommendations_' . md5($sectionId . '_' . $pageSize);

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($sectionId, $pageSize) {
            $queryParams = [
                'api-key' => $this->apiKey,
                'show-fields' => 'thumbnail,webPublicationDate,sectionName',
                'page-size' => $pageSize,
            ];

            if ($sectionId) {
                $queryParams['section'] = $sectionId;
            }

            $response = Http::get("{$this->baseUrl}/search", $queryParams);

            if ($response->successful()) {
                return $response->json();
            }

            return ['response' => ['status' => 'error', 'results' => [], 'total' => 0]];
        });
    }
}
