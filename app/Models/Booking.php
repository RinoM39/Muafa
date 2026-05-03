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
        'opening_time',
        'closing_time',
        'image',
        'user_id', 
        'price', 
        'duration_minutes', 
        'description',
        'working_days'
    ];

protected $casts = [
    'working_days' => 'array',
     ];

      protected $appends = ['average_rating', 'ratings_count'];
    // علاقة بين الحجز والأماكن المحجوزة
    public function reservedSlots()
    {
        return $this->hasMany(ReservedSlot::class);
    }

    // دالة للحصول على رابط الصورة الكامل
public function getImageUrlAttribute()
{
    return $this->image ? asset('storage/' . $this->image) : null;
}

    // علاقة الحجز مع التقييمات
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    // حساب متوسط التقييمات وإرجاعه كرقم عشري
    public function getAverageRatingAttribute()
    {
        $avg = $this->ratings()->avg('rating');
        return $avg ? round($avg, 1) : 0.0;
    }

    // عدد الأشخاص الذين قاموا بالتقييم
    public function getRatingsCountAttribute()
    {
        return $this->ratings()->count();
    }


    
}