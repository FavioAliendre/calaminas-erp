<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'purchase_date' => $this->purchase_date?->toDateString(),
            'provider_name' => $this->provider_name,
            'invoice_number' => $this->invoice_number,
            'observation' => $this->observation,
            'total_cost' => $this->total_cost,
            'details' => PurchaseDetailResource::collection($this->whenLoaded('details')),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
