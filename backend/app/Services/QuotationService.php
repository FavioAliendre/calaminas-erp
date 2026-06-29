<?php

namespace App\Services;

use App\Models\Quotation;
use App\Repositories\Contracts\QuotationRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QuotationService
{
    public function __construct(
        protected QuotationRepositoryInterface $quotationRepository,
        protected SaleService $saleService
    ) {}

    public function registerQuotation(array $data, array $items): Quotation
    {
        return DB::transaction(function () use ($data, $items) {
            $quotationNumber = $data['quotation_number'] ?? $this->generateQuotationNumber();

            // Create quotation with initial total 0
            $quotation = $this->quotationRepository->create([
                'quotation_number' => $quotationNumber,
                'date' => $data['date'],
                'client_id' => $data['client_id'] ?? null,
                'client_name_snapshot' => $data['client_name_snapshot'],
                'observations' => $data['observations'] ?? null,
                'status' => 'pending',
                'total' => 0.00,
            ]);

            $total = 0.00;

            foreach ($items as $item) {
                $length = floatval($item['length']);
                $quantity = floatval($item['quantity']);
                $unitPrice = floatval($item['unit_price']);
                
                // Subtotal = Largo * Cantidad * Precio Unitario
                $subtotal = $length * $quantity * $unitPrice;

                $quotation->details()->create([
                    'product_id' => $item['product_id'],
                    'length' => $length,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);

                $total += $subtotal;
            }

            $quotation->total = $total;
            $quotation->save();

            return $quotation->load('details.product');
        });
    }

    public function convertToSale(int $id, int $sellerId, float $advancePayment = 0.00): \App\Models\Sale
    {
        return DB::transaction(function () use ($id, $sellerId, $advancePayment) {
            $quotation = $this->quotationRepository->findById($id);
            if (!$quotation) {
                throw new \InvalidArgumentException("La cotización no existe.");
            }

            if ($quotation->status === 'converted') {
                throw ValidationException::withMessages([
                    'status' => 'Esta cotización ya ha sido convertida a venta previamente.'
                ]);
            }

            // Update status
            $this->quotationRepository->updateStatus($quotation->id, 'converted');

            // Formulate data for the SaleService
            $saleData = [
                'date' => now()->toDateString(),
                'client_id' => $quotation->client_id,
                'client_name_snapshot' => $quotation->client_name_snapshot,
                'user_id' => $sellerId,
                'advance_payment' => $advancePayment,
                'observations' => "Convertida automáticamente desde Cotización Nro: {$quotation->quotation_number}",
                'quotation_id' => $quotation->id,
            ];

            $saleItems = [];
            foreach ($quotation->details as $detail) {
                $saleItems[] = [
                    'product_id' => $detail->product_id,
                    'length' => $detail->length,
                    'quantity' => $detail->quantity,
                    'unit_price' => $detail->unit_price,
                ];
            }

            // Register sale (which checks stock, updates inventory and Kardex)
            return $this->saleService->registerSale($saleData, $saleItems);
        });
    }

    protected function generateQuotationNumber(): string
    {
        $lastQuo = Quotation::orderBy('id', 'desc')->first();
        if (!$lastQuo) {
            return 'COT-0001';
        }
        $lastNum = intval(substr($lastQuo->quotation_number, 4));
        return 'COT-' . str_pad($lastNum + 1, 4, '0', STR_PAD_LEFT);
    }
}
