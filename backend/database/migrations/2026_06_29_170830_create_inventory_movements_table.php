<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained();
            $table->enum('type', ['purchase', 'sale', 'adjustment_in', 'adjustment_out', 'revert'])->index();
            $table->decimal('quantity', 12, 2)->comment('Cantidad de metros movidos (absoluta)');
            $table->string('reference_type')->nullable()->comment('Modelo asociado: PurchaseDetail, SaleDetail, etc.');
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->decimal('prev_stock', 12, 2)->comment('Stock anterior en metros');
            $table->decimal('new_stock', 12, 2)->comment('Nuevo stock en metros');
            $table->string('observation')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
