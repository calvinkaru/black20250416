<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tax extends Model
{
    protected $fillable = [
        'name',
        'type',
        'rate',
        'is_active',
        'description',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * The order types that belong to the tax.
     */
    public function orderTypes(): BelongsToMany
    {
        return $this->belongsToMany(OrderType::class, 'order_type_tax');
    }
}
