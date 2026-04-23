<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reserved_slots', function (Blueprint $table) {
        $table->id();
        $table->foreignId('booking_id')->constrained()->onDelete('cascade'); // ربط مع جدول الأماكن
        $table->date('date'); // اليوم
        $table->string('time'); // الوقت (مثلاً 08:00)
        $table->string('customer_email'); // إيميل الشخص الذي حجز الموعد
        $table->integer('customer_phone')->nullable(); // رقم هاتف الشخص الذي حجز الموعد
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reserved_slots');
    }
};
