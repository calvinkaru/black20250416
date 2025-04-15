<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Userstamps;

class CashLog extends Model
{
    use HasFactory;
    use SoftDeletes;
    use Userstamps;

    protected $fillable = [
        'transaction_date',
        'transaction_type',
        'contact_id',
        'reference_id',
        'amount',
        'source',
        'description',
        'store_id',
        'created_by',
    ];
}
