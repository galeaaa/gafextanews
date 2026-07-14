<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtpVerification extends Model
{
    use HasFactory;

    protected $table = 'otp_verifications';

    const UPDATED_AT = null;

    protected $fillable = [
        'email',
        'otp_code',
    ];
}
