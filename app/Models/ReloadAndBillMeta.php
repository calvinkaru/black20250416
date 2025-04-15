<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReloadAndBillMeta extends Model
{
    protected $fillable = [
        'sale_item_id',          // Foreign key for the sale item
        'transaction_type',      // Transaction type (e.g., recharge, utility bill)
        'account_number',        // Account number for the transaction (e.g., mobile number, utility account)
        'commission',            // Primary commission earned
        'additional_commission', // Additional commission (bonus/incentive)
        'description',           // Optional description
    ];
}
