<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuotationItem extends Model
{
    public function quotation() {
        return $this->belongsTo(Quotation::class);
    }
    
    public function product() {
        return $this->belongsTo(Product::class);
    }
}
