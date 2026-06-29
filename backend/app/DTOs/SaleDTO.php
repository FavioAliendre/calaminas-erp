<?php

namespace App\DTOs;

class SaleDTO
{
    public function __construct(
        public readonly string $date,
        public readonly ?int $client_id,
        public readonly string $client_name_snapshot,
        public readonly int $user_id,
        public readonly float $advance_payment,
        public readonly ?string $observations,
        public readonly ?int $quotation_id,
        public readonly array $items
    ) {}

    public static function fromArray(array $data, int $userId): self
    {
        return new self(
            date: $data['date'],
            client_id: $data['client_id'] ?? null,
            client_name_snapshot: $data['client_name_snapshot'],
            user_id: $userId,
            advance_payment: floatval($data['advance_payment'] ?? 0.00),
            observations: $data['observations'] ?? null,
            quotation_id: $data['quotation_id'] ?? null,
            items: $data['items'] ?? []
        );
    }

    public function toArray(): array
    {
        return [
            'date' => $this->date,
            'client_id' => $this->client_id,
            'client_name_snapshot' => $this->client_name_snapshot,
            'user_id' => $this->user_id,
            'advance_payment' => $this->advance_payment,
            'observations' => $this->observations,
            'quotation_id' => $this->quotation_id,
        ];
    }
}
