<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Userstamps;

class SaleItem extends Model
{
    use HasFactory;
    use SoftDeletes;
    use Userstamps;

    protected $fillable = [
        'sale_id',      // Sale ID without foreign key constraint
        'product_id',   // Product ID without foreign key constraint
        'batch_id',     // Batch ID without foreign key constraint
        'quantity',     // Quantity sold
        'unit_price',   // Sale price per unit
        'unit_cost',    // Cost price per unit
        'discount',     // Discount applied to this item
        'sale_date',
        'description',
        'note',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
}
