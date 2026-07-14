<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'users';

    const UPDATED_AT = null;

    protected $fillable = [
        'username',
        'email',
        'password',
        'is_verified',
        'bio',
        'gender',
        'birthdate',
        'occupation',
        'hobbies',
        'profile_pic',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
        ];
    }
}
