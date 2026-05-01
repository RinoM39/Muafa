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
        Schema::create('ratings', function (Blueprint $table) {
           $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->integer('rating')->unsigned(); // قيمة التقييم من 1 إلى 5
            $table->text('notes')->nullable();    // الملاحظات
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
