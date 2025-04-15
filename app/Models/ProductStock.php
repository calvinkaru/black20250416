<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Userstamps;

class ProductStock extends Model
{
    use HasFactory;
    use SoftDeletes;
    use Userstamps;

    protected $fillable = [
        'store_id',         // Foreign key for the store
        'batch_id',         // Foreign key for the product batch
        'quantity',         // Quantity of stock available
        'product_id',
    ];

}
