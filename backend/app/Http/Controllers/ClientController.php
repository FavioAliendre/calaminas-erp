<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Repositories\Contracts\ClientRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClientController extends Controller
{
    public function __construct(
        protected ClientRepositoryInterface $clientRepository
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search']);
        $clients = $this->clientRepository->getPaginated($filters, intval($request->get('per_page', 15)));
        return ClientResource::collection($clients);
    }

    public function store(StoreClientRequest $request): JsonResponse
    {
        $client = $this->clientRepository->create($request->validated());
        return response()->json([
            'message' => 'Cliente creado exitosamente.',
            'data' => new ClientResource($client),
        ], 201);
    }

    public function show(int $id): ClientResource
    {
        $client = $this->clientRepository->findById($id);
        if (!$client) {
            abort(404, 'Cliente no encontrado.');
        }
        return new ClientResource($client);
    }

    public function update(UpdateClientRequest $request, int $id): JsonResponse
    {
        $client = $this->clientRepository->update($id, $request->validated());
        return response()->json([
            'message' => 'Cliente actualizado exitosamente.',
            'data' => new ClientResource($client),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->clientRepository->delete($id);
        return response()->json([
            'message' => 'Cliente eliminado exitosamente.'
        ]);
    }
}
