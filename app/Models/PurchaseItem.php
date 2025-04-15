<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Userstamps;

class PurchaseItem extends Model
{
    use HasFactory;
    use SoftDeletes;
    use Userstamps;

    protected $fillable = [
        'purchase_id',
        'product_id',
        'batch_id',
        'quantity',
        'unit_price',
        'unit_cost',
        'discount',
        'description',
        'purchase_date',
    ];
}
