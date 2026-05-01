<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ReservedSlot; 
use Illuminate\Http\Request;

class BookingController extends Controller {
    // لجلب الحجوزات وعرضها بالكروت
    public function index() {
        return response()->json(Booking::latest()->get());

        $bookings = Booking::with('ratings')->latest()->get();

        return response()->json($bookings);
    }

    // لحفظ حجز جديد
    public function store(Request $request) {
       // أضفنا 'nullable' مؤقتاً للتأكد أن الزر سيعمل حتى لو لم تصل الأيام
    $validated = $request->validate([
        'customer_name'    => 'required|string',
        'venue_name'       => 'required|string',
        'phone'            => 'required|string',
        'price'            => 'required|numeric',
        'duration_minutes' => 'required|integer',
        'people_count'     => 'required|integer',
        'description'      => 'nullable|string',
        'working_days'     => 'nullable|array', // تأكد أنها مصفوفة
    ]);

    $booking = Booking::create($validated);

    return response()->json([
        'message' => 'Created successfully',
        'data' => $booking
    ], 201);
    }

// 3. حجز موعد محدد (من واجهة الزبون بالـ Modal)
    public function reserve(Request $request) {
        // التحقق من أن الموعد غير محجوز مسبقاً لهذا المكان في نفس اليوم والوقت
        $exists = ReservedSlot::where('booking_id', $request->booking_id)
                              ->where('date', $request->date)
                              ->where('time', $request->time)
                              ->exists();

        if ($exists) {
            return response()->json(['message' => 'هذا الموعد محجوز مسبقاً!'], 422);
        }

        // إذا كان متاحاً، يتم الحجز
        $reservation = ReservedSlot::create([
            'booking_id'     => $request->booking_id,
            'date'           => $request->date,
            'time'           => $request->time,
            'customer_email' => $request->customer_email,
            'customer_phone' => $request->customer_phone
        ]);

        return response()->json(['message' => 'تم تثبيت حجزك بنجاح!', 'data' => $reservation], 201);
    }


public function getBookedSlots(Request $request) {
    try {
        // 1. التحقق من وصول البيانات لمنع الانهيار
        if (!$request->has('venue_id') || !$request->has('date')) {
            return response()->json(['error' => 'Missing parameters'], 400);
        }

        // 2. الاستعلام من الجدول الصحيح (ReservedSlot) 
        // وليس من جدول (Booking) لأن جدول الملاعب لا يحتوي على مواعيد محجوزة
        $booked = ReservedSlot::where('booking_id', $request->venue_id) // الربط مع ID المكان
                         ->whereDate('date', $request->date)         // فلترة حسب التاريخ
                         ->pluck('time')                             // جلب عمود الوقت فقط
                         ->toArray();
                         
        return response()->json($booked); 

    } catch (\Exception $e) {
        // إرجاع رسالة الخطأ الحقيقية بدلاً من صفحة 500 HTML
        return response()->json([
            'error' => 'Server Error',
            'message' => $e->getMessage()
        ], 500);
    }
}

// دالة تخزين التقييم
    public function storeRating(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'rating'     => 'required|integer|min:1|max:5',
            'notes'      => 'nullable|string'
        ]);

        $rating = \App\Models\Rating::create([
            'booking_id' => $validated['booking_id'],
            'rating'     => $validated['rating'],
            'notes'      => $validated['notes'],
        ]);

        return response()->json([
            'message' => 'تم حفظ التقييم بنجاح',
            'data'    => $rating
        ], 201);
    }

    

}