<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('sale_number')->unique()->index();
            $table->date('date')->index();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->string('client_name_snapshot');
            $table->foreignId('user_id')->constrained(); // El vendedor
            $table->decimal('advance_payment', 12, 2)->default(0.00)->comment('Anticipo pagado');
            $table->decimal('total', 12, 2)->default(0.00);
            $table->decimal('balance', 12, 2)->default(0.00)->comment('Saldo restante (total - anticipo)');
            $table->enum('status', ['pending_balance', 'paid'])->default('paid');
            $table->text('observations')->nullable();
            $table->foreignId('quotation_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
