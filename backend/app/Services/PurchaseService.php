<?php

namespace App\Services;

use App\Models\Purchase;
use App\Repositories\Contracts\InventoryMovementRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    public function __construct(
        protected PurchaseRepositoryInterface $purchaseRepository,
        protected ProductRepositoryInterface $productRepository,
        protected InventoryMovementRepositoryInterface $movementRepository
    ) {}

    public function registerPurchase(array $data, array $items): Purchase
    {
        return DB::transaction(function () use ($data, $items) {
            // 1. Create Purchase record first with a temp total_cost
            $purchase = $this->purchaseRepository->create([
                'purchase_date' => $data['purchase_date'],
                'provider_name' => $data['provider_name'],
                'invoice_number' => $data['invoice_number'] ?? null,
                'observation' => $data['observation'] ?? null,
                'total_cost' => 0.00,
            ]);

            $totalCost = 0.00;

            // 2. Process each purchased item
            foreach ($items as $item) {
                $product = $this->productRepository->findById($item['product_id']);
                if (!$product) {
                    throw new \InvalidArgumentException("Producto ID {$item['product_id']} no existe.");
                }

                $tons = floatval($item['tons']);
                $unitCost = floatval($item['unit_cost']);
                $itemTotalCost = $tons * $unitCost;
                
                // Rule: Stock en metros = Toneladas compradas * Metros por tonelada
                $metersAdded = $tons * $product->meters_per_ton;

                // Create detail
                $purchase->details()->create([
                    'product_id' => $product->id,
                    'tons' => $tons,
                    'unit_cost' => $unitCost,
                    'total_cost' => $itemTotalCost,
                    'meters_added' => $metersAdded,
                ]);

                // Update product stock in meters
                $prevStock = $product->stock;
                $updatedProduct = $this->productRepository->updateStock($product->id, $metersAdded);
                $newStock = $updatedProduct->stock;

                // Log Kardex movement
                $this->movementRepository->logMovement([
                    'product_id' => $product->id,
                    'type' => 'purchase',
                    'quantity' => $metersAdded,
                    'reference_type' => 'App\Models\PurchaseDetail',
                    'reference_id' => $purchase->details->last()->id ?? $purchase->id,
                    'prev_stock' => $prevStock,
                    'new_stock' => $newStock,
                    'observation' => "Ingreso por compra - Factura/Nota: " . ($purchase->invoice_number ?? 'S/N'),
                ]);

                $totalCost += $itemTotalCost;
            }

            // 3. Update total cost of purchase
            $purchase->total_cost = $totalCost;
            $purchase->save();

            return $purchase->load('details.product');
        });
    }
}
