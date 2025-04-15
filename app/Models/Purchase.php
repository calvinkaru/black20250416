<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Userstamps;

class Purchase extends Model
{
    use HasFactory;
    use SoftDeletes;
    use Userstamps;

    protected $fillable = [
        'store_id',
        'contact_id',
        'purchase_date',
        'total_amount', //Net total (total after discount)
        'discount',
        'amount_paid',
        'payment_status',
        'status',
        'reference_no',
        'note',
        'profit_amount',
    ];

    public function transactions()
    {
        return $this->hasMany(PurchaseTransaction::class, 'purchase_id');
    }

}
