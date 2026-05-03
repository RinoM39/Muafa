<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ReservedSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // لإدارة الملفات
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    // 1. جلب الحجوزات (تم تنظيف الدالة من الكود المكرر)
    public function index()
    {
        $bookings = Booking::with('ratings')->latest()->get();
        return response()->json($bookings);
    }

    // 2. حفظ حجز جديد (تم التعديل بالكامل حسب المتطلبات)
    public function store(Request $request)
    {
        // [AUTHORIZATION] التأكد أن المستخدم "Creator" (role = 1)
        // ملاحظة: نفترض أنك تستخدم Auth Middleware في ملف Routes
        if (auth()->user()->role != 1) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك. فقط أصحاب المنشآت يمكنهم إضافة حجز.'
            ], 403);
        }

        // [VALIDATION] التحقق من البيانات
        $validator = Validator::make($request->all(), [
            'customer_name'    => 'required|string',
            'venue_name'       => 'required|string',
            'phone'            => 'required|string',
            'price'            => 'required|numeric',
            'duration_minutes' => 'required|integer',
            'description'      => 'nullable|string',
            'working_days'     => 'nullable|array',
            // الحقول الجديدة
            'opening_time'     => 'required|date_format:H:i',
            'closing_time'     => 'required|date_format:H:i|after:opening_time',
            'image'            => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // [IMAGE HANDLING] معالجة رفع الصورة
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('bookings', 'public');
            $data['image'] = $path;
        }

        // [STORE LOGIC] إنشاء السجل (تم حذف people_count تلقائياً لأنه ليس ضمن الـ validated)
        $booking = Booking::create($data);

        // [RESPONSE] التنسيق المطلوب
        return response()->json([
            'success' => true,
            'data' => [
                'id'           => $booking->id,
                'opening_time' => $booking->opening_time,
                'closing_time' => $booking->closing_time,
                'image_url'    => $booking->image ? asset('storage/' . $booking->image) : null,
                'venue_name'   => $booking->venue_name
            ]
        ], 201);
    }

    // 3. حجز موعد محدد (بقيت كما هي)
    public function reserve(Request $request)
    {
        $exists = ReservedSlot::where('booking_id', $request->booking_id)
            ->where('date', $request->date)
            ->where('time', $request->time)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'هذا الموعد محجوز مسبقاً!'], 422);
        }

        $reservation = ReservedSlot::create([
            'booking_id'     => $request->booking_id,
            'date'           => $request->date,
            'time'           => $request->time,
            'customer_email' => $request->customer_email,
            'customer_phone' => $request->customer_phone
        ]);

        return response()->json(['message' => 'تم تثبيت حجزك بنجاح!', 'data' => $reservation], 201);
    }

    // 4. جلب المواعيد المحجوزة (بقيت كما هي)
    public function getBookedSlots(Request $request)
    {
        try {
            if (!$request->has('venue_id') || !$request->has('date')) {
                return response()->json(['error' => 'Missing parameters'], 400);
            }

            $booked = ReservedSlot::where('booking_id', $request->venue_id)
                ->whereDate('date', $request->date)
                ->pluck('time')
                ->toArray();

            return response()->json($booked);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 5. تخزين التقييم (بقيت كما هي)
    public function storeRating(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'rating'     => 'required|integer|min:1|max:5',
            'notes'      => 'nullable|string'
        ]);

        $rating = \App\Models\Rating::create($validated);

        return response()->json([
            'message' => 'تم حفظ التقييم بنجاح',
            'data'    => $rating
        ], 201);
    }
}