<?php

namespace App\Repositories\Eloquent;

use App\Models\Purchase;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class PurchaseRepository implements PurchaseRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Purchase::query()->with(['details.product']);

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('purchase_date', [$filters['start_date'], $filters['end_date']]);
        }

        if (!empty($filters['provider'])) {
            $query->where('provider_name', 'like', "%{$filters['provider']}%");
        }

        return $query->latest('purchase_date')->latest('id')->paginate($perPage);
    }

    public function findById(int $id): ?Purchase
    {
        return Purchase::with(['details.product'])->find($id);
    }

    public function create(array $data): Purchase
    {
        return Purchase::create($data);
    }
}
