<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route; 
use App\Http\Controllers\Api\BookingController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::post('/reserve-slot', [BookingController::class, 'reserve']);
Route::get('/get-booked-slots', [BookingController::class, 'getBookedSlots']);
Route::post('/reserve', [App\Http\Controllers\Api\BookingController::class, 'reserve']);

