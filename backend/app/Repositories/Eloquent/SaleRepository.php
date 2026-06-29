<?php

namespace App\Repositories\Eloquent;

use App\Models\Sale;
use App\Repositories\Contracts\SaleRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class SaleRepository implements SaleRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Sale::query()->with(['client', 'seller', 'details.product']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('sale_number', 'like', "%{$search}%")
                  ->orWhere('client_name_snapshot', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('date', [$filters['start_date'], $filters['end_date']]);
        }

        return $query->latest('date')->latest('id')->paginate($perPage);
    }

    public function findById(int $id): ?Sale
    {
        return Sale::with(['client', 'seller', 'details.product'])->find($id);
    }

    public function findByNumber(string $number): ?Sale
    {
        return Sale::with(['client', 'seller', 'details.product'])->where('sale_number', $number)->first();
    }

    public function create(array $data): Sale
    {
        return Sale::create($data);
    }
}
