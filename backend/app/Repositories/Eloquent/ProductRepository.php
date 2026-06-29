<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ProductRepository implements ProductRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Product::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('color', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['color'])) {
            $query->where('color', $filters['color']);
        }

        if (isset($filters['low_stock']) && $filters['low_stock'] === true) {
            // Suppose low stock is defined as less than 100 meters
            $query->where('stock', '<', 100);
        }

        return $query->latest()->paginate($perPage);
    }

    public function getAllActive(): Collection
    {
        return Product::orderBy('name')->get();
    }

    public function findById(int $id): ?Product
    {
        return Product::find($id);
    }

    public function findByCode(string $code): ?Product
    {
        return Product::where('code', $code)->first();
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function update(int $id, array $data): Product
    {
        $product = Product::findOrFail($id);
        $product->update($data);
        return $product;
    }

    public function delete(int $id): bool
    {
        $product = Product::findOrFail($id);
        return $product->delete();
    }

    public function updateStock(int $id, float $quantity): Product
    {
        $product = Product::findOrFail($id);
        $product->stock += $quantity;
        $product->save();
        return $product;
    }
}
