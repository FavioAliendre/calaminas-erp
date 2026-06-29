<?php

namespace App\Repositories\Contracts;

use App\Models\Purchase;
use Illuminate\Pagination\LengthAwarePaginator;

interface PurchaseRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;
    public function findById(int $id): ?Purchase;
    public function create(array $data): Purchase;
}
