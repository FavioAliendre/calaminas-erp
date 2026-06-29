<?php

namespace App\Http\Controllers;

use App\DTOs\PurchaseDTO;
use App\Http\Requests\StorePurchaseRequest;
use App\Http\Resources\PurchaseResource;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use App\Services\PurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PurchaseController extends Controller
{
    public function __construct(
        protected PurchaseRepositoryInterface $purchaseRepository,
        protected PurchaseService $purchaseService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['start_date', 'end_date', 'provider']);
        $purchases = $this->purchaseRepository->getPaginated($filters, intval($request->get('per_page', 15)));
        return PurchaseResource::collection($purchases);
    }

    public function store(StorePurchaseRequest $request): JsonResponse
    {
        $dto = PurchaseDTO::fromArray($request->validated());
        $purchase = $this->purchaseService->registerPurchase($dto->toArray(), $dto->items);

        return response()->json([
            'message' => 'Compra registrada exitosamente y stock actualizado.',
            'data' => new PurchaseResource($purchase),
        ], 201);
    }

    public function show(int $id): PurchaseResource
    {
        $purchase = $this->purchaseRepository->findById($id);
        if (!$purchase) {
            abort(404, 'Registro de compra no encontrado.');
        }
        return new PurchaseResource($purchase);
    }
}
