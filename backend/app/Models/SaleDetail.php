<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['sale_id', 'product_id', 'length', 'quantity', 'unit_price', 'subtotal'])]
class SaleDetail extends Model
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

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
