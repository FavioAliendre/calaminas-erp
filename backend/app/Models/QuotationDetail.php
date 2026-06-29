<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['quotation_id', 'product_id', 'length', 'quantity', 'unit_price', 'subtotal'])]
class QuotationDetail extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'length' => 'float',
            'quantity' => 'float',
            'unit_price' => 'float',
            'subtotal' => 'float',
        ];
    }

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
