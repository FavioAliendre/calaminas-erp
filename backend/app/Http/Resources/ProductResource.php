<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'color' => $this->color,
            'thickness' => $this->thickness,
            'purchase_unit' => $this->purchase_unit,
            'sale_unit' => $this->sale_unit,
            'meters_per_ton' => $this->meters_per_ton,
            'stock' => $this->stock,
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
