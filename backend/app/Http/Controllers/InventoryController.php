<?php

namespace App\Http\Controllers;

use App\DTOs\InventoryAdjustmentDTO;
use App\Http\Requests\StoreAdjustmentRequest;
use App\Http\Resources\InventoryMovementResource;
use App\Repositories\Contracts\InventoryMovementRepositoryInterface;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InventoryController extends Controller
{
    public function __construct(
        protected InventoryMovementRepositoryInterface $movementRepository,
        protected InventoryService $inventoryService
    ) {}

    public function movements(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['product_id', 'type', 'start_date', 'end_date']);
        $movements = $this->movementRepository->getPaginated($filters, intval($request->get('per_page', 15)));
        return InventoryMovementResource::collection($movements);
    }

    public function adjust(StoreAdjustmentRequest $request): JsonResponse
    {
        $dto = InventoryAdjustmentDTO::fromArray($request->validated());
        $movement = $this->inventoryService->registerAdjustment($dto->toArray());

        return response()->json([
            'message' => 'Ajuste de inventario registrado exitosamente.',
            'data' => new InventoryMovementResource($movement->load('product')),
        ], 201);
    }

    public function stockStatus(): JsonResponse
    {
        $report = $this->inventoryService->getStockReport();
        return response()->json($report);
    }
}
