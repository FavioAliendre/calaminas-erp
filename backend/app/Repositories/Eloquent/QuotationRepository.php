<?php

namespace App\Repositories\Eloquent;

use App\Models\Quotation;
use App\Repositories\Contracts\QuotationRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class QuotationRepository implements QuotationRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Quotation::query()->with(['client', 'details.product']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('quotation_number', 'like', "%{$search}%")
                  ->orWhere('client_name_snapshot', 'like', "%{$search}%");
            });
        }

        return $query->latest('date')->latest('id')->paginate($perPage);
    }

    public function findById(int $id): ?Quotation
    {
        return Quotation::with(['client', 'details.product'])->find($id);
    }

    public function findByNumber(string $number): ?Quotation
    {
        return Quotation::with(['client', 'details.product'])->where('quotation_number', $number)->first();
    }

    public function create(array $data): Quotation
    {
        return Quotation::create($data);
    }

    public function update(int $id, array $data): Quotation
    {
        $quotation = Quotation::findOrFail($id);
        $quotation->update($data);
        return $quotation;
    }

    public function updateStatus(int $id, string $status): bool
    {
        $quotation = Quotation::findOrFail($id);
        $quotation->status = $status;
        return $quotation->save();
    }
}
