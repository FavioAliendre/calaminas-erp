<?php

namespace App\Repositories\Contracts;

use App\Models\InventoryMovement;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface InventoryMovementRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;
    public function logMovement(array $data): InventoryMovement;
    public function getKardexForProduct(int $productId): Collection;
}
