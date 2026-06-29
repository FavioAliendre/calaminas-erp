<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotation_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->decimal('length', 12, 2)->comment('Largo en metros de la calamina');
            $table->decimal('quantity', 12, 2)->comment('Cantidad de piezas');
            $table->decimal('unit_price', 12, 2)->comment('Precio unitario por metro');
            $table->decimal('subtotal', 12, 2)->comment('Subtotal (largo * cantidad * precio unitario)');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotation_details');
    }
};
