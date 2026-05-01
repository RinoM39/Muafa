<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route; 
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::post('/reserve-slot', [BookingController::class, 'reserve']);
Route::get('/get-booked-slots', [BookingController::class, 'getBookedSlots']);
Route::post('/reserve', [App\Http\Controllers\Api\BookingController::class, 'reserve']);

// مسارات عامة (فقط تسجيل الدخول)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// مسارات محمية (يجب تسجيل الدخول أولاً)
Route::middleware('auth:sanctum')->group(function () {

    // 1. رؤية قائمة الحجوزات (مسموح للكل: 0, 1, 2)
    Route::get('/bookings', [BookingController::class, 'index'])->middleware('role:0,1,2');

    // 2. عملية الحجز الفعلي (مسموح فقط لليوزر العادي 0 والأدمن 2)
    // منعنا الرول 1 (المركز الطبي) من الحجز هنا
    Route::post('/reserve', [BookingController::class, 'reserve'])->middleware('role:0,2');

    // 3. إنشاء حجز جديد (مسموح فقط للمركز الطبي 1 والأدمن 2)
    // منعنا الرول 0 (اليوزر العادي) من الإنشاء هنا
    Route::post('/bookings', [BookingController::class, 'store'])->middleware('role:1,2');

});

Route::post('/ratings', [App\Http\Controllers\Api\BookingController::class, 'storeRating']);
