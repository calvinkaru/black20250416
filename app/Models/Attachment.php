<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    protected $fillable = [
        'path',
        'file_name',
        'attachment_type',
        'size',
        'alt_text',
        'title',
        'description',
    ];
}
