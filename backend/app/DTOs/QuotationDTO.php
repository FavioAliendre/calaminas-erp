<?php

namespace App\DTOs;

class QuotationDTO
{
    public function __construct(
        public readonly string $date,
        public readonly ?int $client_id,
        public readonly string $client_name_snapshot,
        public readonly ?string $observations,
        public readonly array $items
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            date: $data['date'],
            client_id: $data['client_id'] ?? null,
            client_name_snapshot: $data['client_name_snapshot'],
            observations: $data['observations'] ?? null,
            items: $data['items'] ?? []
        );
    }

    public function toArray(): array
    {
        return [
            'date' => $this->date,
            'client_id' => $this->client_id,
            'client_name_snapshot' => $this->client_name_snapshot,
            'observations' => $this->observations,
        ];
    }
}
