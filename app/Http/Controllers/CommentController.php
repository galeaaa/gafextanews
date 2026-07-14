<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Get comments for a specific article.
     */
    public function index(Request $request)
    {
        $newsId = $request->query('news_id');

        if (!$newsId) {
            return response()->json(['status' => 'error', 'message' => 'Missing news_id parameter.'], 400);
        }

        $comments = Comment::where('news_id', $newsId)
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedComments = $comments->map(function ($comment) {
            $profilePic = null;
            if ($comment->user_id) {
                $user = User::find($comment->user_id);
                if ($user) {
                    $profilePic = $user->profile_pic;
                }
            } else {
                $user = User::where('username', $comment->username)->first();
                if ($user) {
                    $profilePic = $user->profile_pic;
                }
            }

            return [
                'username' => $comment->username,
                'text' => $comment->comment_text,
                'date' => $comment->created_at ? $comment->created_at->timezone('Asia/Jakarta')->format('d/m/Y H:i') : 'Just now',
                'profile_pic' => $profilePic
            ];
        });

        return response()->json($formattedComments);
    }

    /**
     * Store a new comment.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Silakan login terlebih dahulu!'], 401);
        }

        $newsId = $request->input('news_id');
        $commentText = $request->input('comment_text');

        if (!$newsId || !$commentText) {
            return response()->json(['status' => 'error', 'message' => 'Komentar tidak boleh kosong!'], 400);
        }

        $comment = Comment::create([
            'news_id' => $newsId,
            'user_id' => $user->id,
            'username' => $user->username,
            'comment_text' => $commentText
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Komentar berhasil dikirim!',
            'comment' => [
                'username' => $comment->username,
                'text' => $comment->comment_text,
                'date' => $comment->created_at ? $comment->created_at->timezone('Asia/Jakarta')->format('d/m/Y H:i') : 'Just now',
                'profile_pic' => $user->profile_pic
            ]
        ]);
    }
}
