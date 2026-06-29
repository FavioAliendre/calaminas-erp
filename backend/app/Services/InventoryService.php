<?php

namespace App\Services;

use App\Models\InventoryMovement;
use App\Repositories\Contracts\InventoryMovementRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository,
        protected InventoryMovementRepositoryInterface $movementRepository
    ) {}

    public function registerAdjustment(array $data): InventoryMovement
    {
        return DB::transaction(function () use ($data) {
            $product = $this->productRepository->findById($data['product_id']);
            if (!$product) {
                throw new \InvalidArgumentException("El producto seleccionado no existe.");
            }

            $type = $data['type']; // adjustment_in or adjustment_out
            $quantity = floatval($data['quantity']);
            $observation = $data['observation'] ?? '';

            if ($quantity <= 0) {
                throw ValidationException::withMessages([
                    'quantity' => 'La cantidad debe ser mayor a cero.'
                ]);
            }

            $prevStock = $product->stock;
            $delta = $type === 'adjustment_in' ? $quantity : -$quantity;

            if ($type === 'adjustment_out' && $product->stock < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => "No se puede realizar el ajuste de salida. Stock insuficiente. Stock actual: {$product->stock}m, Solicitado: {$quantity}m."
                ]);
            }

            // Update stock
            $updatedProduct = $this->productRepository->updateStock($product->id, $delta);
            $newStock = $updatedProduct->stock;

            // Log movement
            return $this->movementRepository->logMovement([
                'product_id' => $product->id,
                'type' => $type,
                'quantity' => $quantity,
                'reference_type' => null,
                'reference_id' => null,
                'prev_stock' => $prevStock,
                'new_stock' => $newStock,
                'observation' => $observation ?: ($type === 'adjustment_in' ? 'Ingreso manual' : 'Salida manual'),
            ]);
        });
    }

    public function getStockReport(): array
    {
        // Get low stock alert products
        $products = $this->productRepository->getAllActive();
        
        $lowStockProducts = $products->filter(function ($p) {
            return $p->stock < 100.00; // Low stock alert threshold
        })->values();

        $totalValue = $products->sum(function ($p) {
            // Note: Since we don't have purchase price on product, we value the stock
            // based on thickness or dummy valuation. For this report, we will return 
            // the simple list and total stock in meters.
            return $p->stock;
        });

        return [
            'total_stock_meters' => $totalValue,
            'total_products_count' => $products->count(),
            'low_stock_count' => $lowStockProducts->count(),
            'low_stock_products' => $lowStockProducts,
        ];
    }
}
