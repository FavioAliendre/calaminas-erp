<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->decimal('tons', 10, 3)->comment('Toneladas compradas');
            $table->decimal('unit_cost', 12, 2)->comment('Costo por tonelada');
            $table->decimal('total_cost', 12, 2)->comment('Costo total (toneladas * costo unitario)');
            $table->decimal('meters_added', 12, 2)->comment('Equivalente en metros ingresados');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_details');
    }
};
