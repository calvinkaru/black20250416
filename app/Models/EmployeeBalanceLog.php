<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Userstamps;

class EmployeeBalanceLog extends Model
{
    use HasFactory, SoftDeletes, Userstamps;
    protected $fillable = [
        'employee_id',     // ID of the employee
        'amount',          // Balance update amount
        'description',          // Reason for the update
        'store_id',        // ID of the associated store
        'created_by',      // ID of the user who created the record
        'log_date',
    ];
}
