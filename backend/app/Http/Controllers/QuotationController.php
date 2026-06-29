<?php

namespace App\Http\Controllers;

use App\DTOs\QuotationDTO;
use App\Http\Requests\StoreQuotationRequest;
use App\Http\Resources\QuotationResource;
use App\Http\Resources\SaleResource;
use App\Repositories\Contracts\QuotationRepositoryInterface;
use App\Services\QuotationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class QuotationController extends Controller
{
    public function __construct(
        protected QuotationRepositoryInterface $quotationRepository,
        protected QuotationService $quotationService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['status', 'search']);
        $quotations = $this->quotationRepository->getPaginated($filters, intval($request->get('per_page', 15)));
        return QuotationResource::collection($quotations);
    }

    public function store(StoreQuotationRequest $request): JsonResponse
    {
        $dto = QuotationDTO::fromArray($request->validated());
        $quotation = $this->quotationService->registerQuotation($dto->toArray(), $dto->items);

        return response()->json([
            'message' => 'Cotización creada exitosamente.',
            'data' => new QuotationResource($quotation),
        ], 201);
    }

    public function show(int $id): QuotationResource
    {
        $quotation = $this->quotationRepository->findById($id);
        if (!$quotation) {
            abort(404, 'Cotización no encontrada.');
        }
        return new QuotationResource($quotation);
    }

    public function update(StoreQuotationRequest $request, int $id): JsonResponse
    {
        // Simple implementation: delete old details and insert new ones inside a transaction
        $quotation = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $id) {
            $dto = QuotationDTO::fromArray($request->validated());
            $quot = $this->quotationRepository->findById($id);
            if (!$quot) {
                abort(404, 'Cotización no encontrada.');
            }

            if ($quot->status === 'converted') {
                abort(422, 'No se puede modificar una cotización que ya fue convertida a venta.');
            }

            // Update main fields
            $this->quotationRepository->update($id, $dto->toArray());

            // Delete old details
            $quot->details()->delete();

            // Insert new details
            $total = 0.00;
            foreach ($dto->items as $item) {
                $length = floatval($item['length']);
                $quantity = floatval($item['quantity']);
                $unitPrice = floatval($item['unit_price']);
                $subtotal = $length * $quantity * $unitPrice;

                $quot->details()->create([
                    'product_id' => $item['product_id'],
                    'length' => $length,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);

                $total += $subtotal;
            }

            $quot->total = $total;
            $quot->save();

            return $quot->load('details.product');
        });

        return response()->json([
            'message' => 'Cotización modificada exitosamente.',
            'data' => new QuotationResource($quotation),
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:approved,rejected,pending'],
        ]);

        $this->quotationRepository->updateStatus($id, $request->status);

        return response()->json([
            'message' => 'Estado de cotización actualizado exitosamente.'
        ]);
    }

    public function convert(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'advance_payment' => ['nullable', 'numeric', 'min:0'],
        ]);

        $sellerId = $request->user()->id;
        $advance = floatval($request->get('advance_payment', 0.00));

        $sale = $this->quotationService->convertToSale($id, $sellerId, $advance);

        return response()->json([
            'message' => 'Cotización convertida a venta de forma exitosa. Inventario descontado.',
            'data' => new SaleResource($sale),
        ]);
    }

    public function downloadPdf(int $id)
    {
        $quotation = $this->quotationRepository->findById($id);
        if (!$quotation) {
            abort(404, 'Cotización no encontrada.');
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.cotizacion', [
            'quotation' => $quotation
        ])->setPaper('a4', 'landscape');

        return $pdf->download("cotizacion_{$quotation->quotation_number}.pdf");
    }
}
