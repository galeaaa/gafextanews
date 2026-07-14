<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class ProfileController extends Controller
{

    /**
     * Update user profile information.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $username = $request->input('username');
        $bio = $request->input('bio');
        $gender = $request->input('gender');
        $birthdate = $request->input('birthdate');
        $occupation = $request->input('occupation');
        $hobbies = $request->input('hobbies');

        if (!$username) {
            return response()->json(['status' => 'error', 'message' => 'Username cannot be empty!']);
        }

        if (strlen($username) < 3) {
            return response()->json(['status' => 'error', 'message' => 'Username must be at least 3 characters!']);
        }

        // Check unique username except current user
        if (User::where('username', $username)->where('id', '!=', $user->id)->exists()) {
            return response()->json(['status' => 'error', 'message' => 'Username already taken! Please choose another.']);
        }

        $user->username = $username;
        $user->bio = $bio;
        $user->gender = $gender;
        $user->birthdate = $birthdate ? $birthdate : null;
        $user->occupation = $occupation;
        $user->hobbies = $hobbies;
        
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully!',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'is_verified' => $user->is_verified ? 1 : 0,
                'bio' => $user->bio ?? '-',
                'gender' => $user->gender ?? '-',
                'birthdate' => $user->birthdate ?? '',
                'occupation' => $user->occupation ?? '-',
                'hobbies' => $user->hobbies ?? '-',
                'profilePic' => $user->profile_pic,
                'joinDate' => $user->created_at ? $user->created_at->format('F d, Y') : '-'
            ]
        ]);
    }

    /**
     * Update user avatar (base64 image URL).
     */
    public function updateAvatar(Request $request)
    {
        $user = Auth::user();
        $profilePicBase64 = $request->input('profile_pic');

        if (!$profilePicBase64) {
            return response()->json(['status' => 'error', 'message' => 'No image data provided.']);
        }

        $user->profile_pic = $profilePicBase64;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile picture updated successfully!',
            'profile_pic' => $user->profile_pic
        ]);
    }

    /**
     * Delete account and cascade delete bookmarks & comments.
     */
    public function deleteAccount(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        // 1. Logout and invalidate session first (sets session user_id to null)
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // 2. Now safely delete the user from DB (cascade deletes bookmarks & comments)
        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Account deleted successfully!'
        ]);
    }
}
