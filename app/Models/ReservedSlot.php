<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservedSlot extends Model
{
    protected $fillable = ['booking_id', 'date', 'time', 'customer_email' , 'customer_phone'];
}
