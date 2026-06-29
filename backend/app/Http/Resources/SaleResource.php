<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sale_number' => $this->sale_number,
            'date' => $this->date?->toDateString(),
            'client_id' => $this->client_id,
            'client' => new ClientResource($this->whenLoaded('client')),
            'client_name_snapshot' => $this->client_name_snapshot,
            'user_id' => $this->user_id,
            'seller' => new UserResource($this->whenLoaded('seller')),
            'advance_payment' => $this->advance_payment,
            'total' => $this->total,
            'balance' => $this->balance,
            'status' => $this->status,
            'observations' => $this->observations,
            'quotation_id' => $this->quotation_id,
            'details' => SaleDetailResource::collection($this->whenLoaded('details')),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
