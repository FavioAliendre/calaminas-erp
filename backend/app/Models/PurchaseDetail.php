<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['purchase_id', 'product_id', 'tons', 'unit_cost', 'total_cost', 'meters_added'])]
class PurchaseDetail extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'tons' => 'float',
            'unit_cost' => 'float',
            'total_cost' => 'float',
            'meters_added' => 'float',
        ];
    }

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
