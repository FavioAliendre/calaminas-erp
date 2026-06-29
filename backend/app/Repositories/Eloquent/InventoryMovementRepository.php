<?php

namespace App\Repositories\Eloquent;

use App\Models\InventoryMovement;
use App\Repositories\Contracts\InventoryMovementRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class InventoryMovementRepository implements InventoryMovementRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = InventoryMovement::query()->with(['product', 'reference']);

        if (!empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('created_at', [$filters['start_date'] . ' 00:00:00', $filters['end_date'] . ' 23:59:59']);
        }

        return $query->latest('id')->paginate($perPage);
    }

    public function logMovement(array $data): InventoryMovement
    {
        return InventoryMovement::create($data);
    }

    public function getKardexForProduct(int $productId): Collection
    {
        return InventoryMovement::where('product_id', $productId)
            ->oldest('id')
            ->get();
    }
}
