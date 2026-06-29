<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'purchase_id' => $this->purchase_id,
            'product_id' => $this->product_id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'tons' => $this->tons,
            'unit_cost' => $this->unit_cost,
            'total_cost' => $this->total_cost,
            'meters_added' => $this->meters_added,
        ];
    }
}
