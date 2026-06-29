<?php

namespace App\DTOs;

class InventoryAdjustmentDTO
{
    public function __construct(
        public readonly int $product_id,
        public readonly string $type,
        public readonly float $quantity,
        public readonly ?string $observation
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            product_id: intval($data['product_id']),
            type: $data['type'],
            quantity: floatval($data['quantity']),
            observation: $data['observation'] ?? null
        );
    }

    public function toArray(): array
    {
        return [
            'product_id' => $this->product_id,
            'type' => $this->type,
            'quantity' => $this->quantity,
            'observation' => $this->observation,
        ];
    }
}
