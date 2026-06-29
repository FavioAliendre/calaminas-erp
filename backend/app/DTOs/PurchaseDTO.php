<?php

namespace App\DTOs;

class PurchaseDTO
{
    public function __construct(
        public readonly string $purchase_date,
        public readonly string $provider_name,
        public readonly ?string $invoice_number,
        public readonly ?string $observation,
        public readonly array $items
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            purchase_date: $data['purchase_date'],
            provider_name: $data['provider_name'],
            invoice_number: $data['invoice_number'] ?? null,
            observation: $data['observation'] ?? null,
            items: $data['items'] ?? []
        );
    }

    public function toArray(): array
    {
        return [
            'purchase_date' => $this->purchase_date,
            'provider_name' => $this->provider_name,
            'invoice_number' => $this->invoice_number,
            'observation' => $this->observation,
        ];
    }
}
