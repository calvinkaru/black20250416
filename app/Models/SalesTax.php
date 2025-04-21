<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesTax extends Model
{
    protected $fillable = [
        'sale_id',
        'tax_id',
        'amount',
    ];

    /**
     * Get the sale that owns the tax.
     */
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * Get the tax that is applied.
     */
    public function tax()
    {
        return $this->belongsTo(Tax::class);
    }
}
