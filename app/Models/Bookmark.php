<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bookmark extends Model
{
    use HasFactory;

    protected $table = 'bookmarks';

    const CREATED_AT = 'saved_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'article_id',
        'title',
        'thumbnail',
        'category',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
