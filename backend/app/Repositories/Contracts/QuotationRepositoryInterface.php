<?php

namespace App\Repositories\Contracts;

use App\Models\Quotation;
use Illuminate\Pagination\LengthAwarePaginator;

interface QuotationRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;
    public function findById(int $id): ?Quotation;
    public function findByNumber(string $number): ?Quotation;
    public function create(array $data): Quotation;
    public function update(int $id, array $data): Quotation;
    public function updateStatus(int $id, string $status): bool;
}
