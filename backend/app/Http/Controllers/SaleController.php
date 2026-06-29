<?php

namespace App\Http\Controllers;

use App\DTOs\SaleDTO;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Resources\SaleResource;
use App\Repositories\Contracts\SaleRepositoryInterface;
use App\Services\SaleService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SaleController extends Controller
{
    public function __construct(
        protected SaleRepositoryInterface $saleRepository,
        protected SaleService $saleService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['status', 'search', 'start_date', 'end_date']);
        $sales = $this->saleRepository->getPaginated($filters, intval($request->get('per_page', 15)));
        return SaleResource::collection($sales);
    }

    public function store(StoreSaleRequest $request): JsonResponse
    {
        $sellerId = $request->user()->id;
        $dto = SaleDTO::fromArray($request->validated(), $sellerId);
        $sale = $this->saleService->registerSale($dto->toArray(), $dto->items);

        return response()->json([
            'message' => 'Venta registrada exitosamente y stock descontado.',
            'data' => new SaleResource($sale),
        ], 201);
    }

    public function show(int $id): SaleResource
    {
        $sale = $this->saleRepository->findById($id);
        if (!$sale) {
            abort(404, 'Registro de venta no encontrado.');
        }
        return new SaleResource($sale);
    }

    public function downloadPdf(int $id)
    {
        $sale = $this->saleRepository->findById($id);
        if (!$sale) {
            abort(404, 'Venta no encontrada.');
        }

        // Set paper size to A4
        $pdf = Pdf::loadView('pdf.nota_venta', [
            'sale' => $sale
        ])->setPaper('a4', 'portrait');

        return $pdf->download("nota_venta_{$sale->sale_number}.pdf");
    }
}
