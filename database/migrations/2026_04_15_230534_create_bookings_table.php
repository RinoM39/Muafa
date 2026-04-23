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
    Schema::create('bookings', function (Blueprint $table) {
        $table->id();
        $table->string('customer_name')->nullable(); // الاسم
        $table->string('venue_name')->nullable();    // المكان
        $table->string('phone')->nullable();         // الهاتف
        $table->integer('people_count')->default(1); 
        $table->decimal('price', 15, 2)->default(0); // السعر الموحد
        $table->integer('duration_minutes')->default(1);    
        $table->text('description')->nullable();
        $table->json('working_days')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');

        
    }
};
