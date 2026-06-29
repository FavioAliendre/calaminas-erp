<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuotationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quotation_number' => $this->quotation_number,
            'date' => $this->date?->toDateString(),
            'client_id' => $this->client_id,
            'client' => new ClientResource($this->whenLoaded('client')),
            'client_name_snapshot' => $this->client_name_snapshot,
            'observations' => $this->observations,
            'status' => $this->status,
            'total' => $this->total,
            'details' => QuotationDetailResource::collection($this->whenLoaded('details')),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
