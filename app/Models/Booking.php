<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    // هذه الخاصية تسمح للارافيل باستقبال البيانات وحفظها في قاعدة البيانات
    protected $fillable = [
        'customer_name', 
        'venue_name', 
        'phone', 
        'people_count', 
        'price', 
        'duration_minutes', 
        'description',
        'working_days'
    ];

protected $casts = [
    'working_days' => 'array',
     ];

    // علاقة بين الحجز والأماكن المحجوزة
    public function reservedSlots()
    {
        return $this->hasMany(ReservedSlot::class);
    }

}