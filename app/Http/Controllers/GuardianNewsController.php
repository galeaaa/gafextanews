<?php

namespace App\Http\Controllers;

use App\Services\GuardianNewsService;
use Illuminate\Http\Request;

class GuardianNewsController extends Controller
{
    protected $newsService;

    public function __construct(GuardianNewsService $newsService)
    {
        $this->newsService = $newsService;
    }

    /**
     * Search and list news endpoint.
     */
    public function search(Request $request)
    {
        $params = [
            'q' => $request->query('q'),
            'section' => $request->query('section'),
            'page-size' => $request->query('page-size'),
            'order-by' => $request->query('order-by'),
        ];

        $results = $this->newsService->fetchNewsList($params);

        return response()->json($results);
    }

    /**
     * Article detail endpoint.
     */
    public function detail(Request $request)
    {
        $id = $request->query('id');

        if (!$id) {
            return response()->json(['response' => ['status' => 'error', 'message' => 'Missing article ID']], 400);
        }

        $result = $this->newsService->fetchArticleDetail($id);

        return response()->json($result);
    }

    /**
     * Recommendations endpoint.
     */
    public function recommendations(Request $request)
    {
        $section = $request->query('section');
        $pageSize = $request->query('page-size', 20);

        $results = $this->newsService->fetchRecommendations($section, $pageSize);

        return response()->json($results);
    }
}
