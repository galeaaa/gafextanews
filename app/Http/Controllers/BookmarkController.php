<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookmarkController extends Controller
{

    /**
     * List all bookmarks for the logged-in user.
     */
    public function index()
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $bookmarks = Bookmark::where('user_id', $userId)
            ->orderBy('saved_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'bookmarks' => $bookmarks]);
    }

    /**
     * Toggle bookmark state for an article.
     */
    public function toggle(Request $request)
    {
        $userId = Auth::id();
        $articleId = $request->input('article_id');
        $title = $request->input('title');
        $thumbnail = $request->input('thumbnail');
        $category = $request->input('category', 'News');

        if (!$articleId || !$title) {
            return response()->json(['success' => false, 'message' => 'Missing fields'], 400);
        }

        // Check if bookmark already exists
        $bookmark = Bookmark::where('user_id', $userId)
            ->where('article_id', $articleId)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            return response()->json(['success' => true, 'bookmarked' => false, 'message' => 'Removed from saved.']);
        } else {
            Bookmark::create([
                'user_id' => $userId,
                'article_id' => $articleId,
                'title' => $title,
                'thumbnail' => $thumbnail,
                'category' => $category,
            ]);
            return response()->json(['success' => true, 'bookmarked' => true, 'message' => 'Article saved!']);
        }
    }

    /**
     * Get all bookmarked article IDs for the current user.
     */
    public function getBookmarkedIds()
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['success' => true, 'ids' => []]);
        }

        $ids = Bookmark::where('user_id', $userId)
            ->pluck('article_id');

        return response()->json(['success' => true, 'ids' => $ids]);
    }
}
