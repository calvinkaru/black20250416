<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Userstamps;

class Cheque extends Model
{
    use SoftDeletes;
    use Userstamps;

    protected $fillable = [
        'cheque_number',
        'cheque_date',
        'name',
        'amount',
        'issued_date',
        'bank',
        'status',
        'remark',
        'direction',
        'store_id',
        'created_by',
    ];
}
