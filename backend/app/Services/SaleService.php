<?php

namespace App\Services;

use App\Models\Sale;
use App\Repositories\Contracts\InventoryMovementRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\SaleRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleService
{
    public function __construct(
        protected SaleRepositoryInterface $saleRepository,
        protected ProductRepositoryInterface $productRepository,
        protected InventoryMovementRepositoryInterface $movementRepository
    ) {}

    public function registerSale(array $data, array $items): Sale
    {
        return DB::transaction(function () use ($data, $items) {
            // 1. Generate unique sale number (VTA-XXXX) if not present
            $saleNumber = $data['sale_number'] ?? $this->generateSaleNumber();

            // 2. We will first validate stock for all items
            $validatedItems = [];
            foreach ($items as $index => $item) {
                $product = $this->productRepository->findById($item['product_id']);
                if (!$product) {
                    throw new \InvalidArgumentException("Producto ID {$item['product_id']} no existe.");
                }

                $length = floatval($item['length']);
                $quantity = floatval($item['quantity']);
                $unitPrice = floatval($item['unit_price']);
                
                // Rule: Cantidad vendida en metros = Largo * Cantidad (cantidad de piezas)
                $metersSold = $length * $quantity;

                if ($product->stock < $metersSold) {
                    throw ValidationException::withMessages([
                        "items.{$index}.quantity" => "Stock insuficiente para el producto '{$product->name}'. Solicitado: {$metersSold}m, Disponible: {$product->stock}m."
                    ]);
                }

                $subtotal = $metersSold * $unitPrice;
                $validatedItems[] = [
                    'product' => $product,
                    'length' => $length,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                    'meters_sold' => $metersSold,
                ];
            }

            // 3. Create Sale record
            $advance = floatval($data['advance_payment'] ?? 0.00);
            $total = collect($validatedItems)->sum('subtotal');
            $balance = $total - $advance;
            
            // Set status
            $status = $balance > 0.00 ? 'pending_balance' : 'paid';

            $sale = $this->saleRepository->create([
                'sale_number' => $saleNumber,
                'date' => $data['date'],
                'client_id' => $data['client_id'] ?? null,
                'client_name_snapshot' => $data['client_name_snapshot'],
                'user_id' => $data['user_id'], // Seller ID
                'advance_payment' => $advance,
                'total' => $total,
                'balance' => $balance,
                'status' => $status,
                'observations' => $data['observations'] ?? null,
                'quotation_id' => $data['quotation_id'] ?? null,
            ]);

            // 4. Save details and update stock
            foreach ($validatedItems as $item) {
                $product = $item['product'];
                $metersSold = $item['meters_sold'];

                // Create sale detail record
                $detail = $sale->details()->create([
                    'product_id' => $product->id,
                    'length' => $item['length'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['subtotal'],
                ]);

                // Deduct stock (negative parameter to updateStock)
                $prevStock = $product->stock;
                $updatedProduct = $this->productRepository->updateStock($product->id, -$metersSold);
                $newStock = $updatedProduct->stock;

                // Log Kardex movement
                $this->movementRepository->logMovement([
                    'product_id' => $product->id,
                    'type' => 'sale',
                    'quantity' => $metersSold,
                    'reference_type' => 'App\Models\SaleDetail',
                    'reference_id' => $detail->id,
                    'prev_stock' => $prevStock,
                    'new_stock' => $newStock,
                    'observation' => "Venta registrada - Código: {$sale->sale_number}",
                ]);
            }

            return $sale->load('details.product', 'client', 'seller');
        });
    }

    protected function generateSaleNumber(): string
    {
        $lastSale = Sale::orderBy('id', 'desc')->first();
        if (!$lastSale) {
            return 'VTA-0001';
        }
        $lastNum = intval(substr($lastSale->sale_number, 4));
        return 'VTA-' . str_pad($lastNum + 1, 4, '0', STR_PAD_LEFT);
    }
}
