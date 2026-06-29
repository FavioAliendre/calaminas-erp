<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'color', 'low_stock']);
        
        // If the request wants all items without pagination (e.g. for selectors)
        if ($request->boolean('all', false)) {
            $products = $this->productRepository->getAllActive();
            return ProductResource::collection($products);
        }

        $products = $this->productRepository->getPaginated($filters, intval($request->get('per_page', 15)));
        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productRepository->create($request->validated());
        return response()->json([
            'message' => 'Producto creado exitosamente.',
            'data' => new ProductResource($product),
        ], 201);
    }

    public function show(int $id): ProductResource
    {
        $product = $this->productRepository->findById($id);
        if (!$product) {
            abort(404, 'Producto no encontrado.');
        }
        return new ProductResource($product);
    }

    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = $this->productRepository->update($id, $request->validated());
        return response()->json([
            'message' => 'Producto actualizado exitosamente.',
            'data' => new ProductResource($product),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->productRepository->delete($id);
        return response()->json([
            'message' => 'Producto eliminado exitosamente.'
        ]);
    }
}
