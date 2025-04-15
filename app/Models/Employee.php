<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Userstamps;

class Employee extends Model
{
    use HasFactory;
    use SoftDeletes;
    use Userstamps;

    protected $fillable = [
        'name',
        'contact_number',
        'address',
        'joined_at',
        'salary',
        'salary_frequency',
        'role',
        'status',
        'gender',
        'balance',
        'created_by',
        'store_id'
    ];

    protected $casts = [
        'joined_at' => 'date',
    ];
}
