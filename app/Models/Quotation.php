<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Userstamps;

class Quotation extends Model
{
    use SoftDeletes;
    use Userstamps;
    
    public function contact() {
        return $this->belongsTo(Contact::class);
    }
    
    public function items() {
        return $this->hasMany(QuotationItem::class);
    }

    public function quotationItems()
    {
        return $this->hasMany(QuotationItem::class);
    }
}
