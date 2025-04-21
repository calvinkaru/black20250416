<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderType extends Model
{
    protected $fillable = [
        'name',
        'is_active',
        'is_default',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    /**
     * The taxes that belong to the order type.
     */
    public function taxes(): BelongsToMany
    {
        return $this->belongsToMany(Tax::class, 'order_type_tax');
    }

    /**
     * Get the sales for the order type.
     */
    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
}
