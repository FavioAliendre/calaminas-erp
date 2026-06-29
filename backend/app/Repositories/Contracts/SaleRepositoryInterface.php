<?php

namespace App\Repositories\Contracts;

use App\Models\Sale;
use Illuminate\Pagination\LengthAwarePaginator;

interface SaleRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;
    public function findById(int $id): ?Sale;
    public function findByNumber(string $number): ?Sale;
    public function create(array $data): Sale;
}
