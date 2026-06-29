<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color')->nullable();
            $table->decimal('thickness', 10, 3)->comment('Espesor en mm');
            $table->string('purchase_unit')->default('TON');
            $table->string('sale_unit')->default('M');
            $table->decimal('meters_per_ton', 12, 2)->comment('Equivalencia: 1 Tonelada = X metros');
            $table->decimal('stock', 12, 2)->default(0.00)->comment('Stock actual en metros');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
