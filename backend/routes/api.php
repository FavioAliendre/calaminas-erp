<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\DashboardController;

// Public Auth routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);

// Protected routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Auth info
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Clients CRUD
    Route::apiResource('clients', ClientController::class);

    // Products CRUD
    Route::apiResource('products', ProductController::class);

    // Purchases
    Route::get('/purchases', [PurchaseController::class, 'index']);
    Route::post('/purchases', [PurchaseController::class, 'store']);
    Route::get('/purchases/{id}', [PurchaseController::class, 'show']);

    // Inventory
    Route::get('/inventory/movements', [InventoryController::class, 'movements']);
    Route::post('/inventory/adjustments', [InventoryController::class, 'adjust']);
    Route::get('/inventory/reports/stock-status', [InventoryController::class, 'stockStatus']);

    // Quotations
    Route::apiResource('quotations', QuotationController::class);
    Route::patch('/quotations/{id}/status', [QuotationController::class, 'updateStatus']);
    Route::post('/quotations/{id}/convert', [QuotationController::class, 'convert']);
    Route::get('/quotations/{id}/pdf', [QuotationController::class, 'downloadPdf']);

    // Sales
    Route::get('/sales', [SaleController::class, 'index']);
    Route::post('/sales', [SaleController::class, 'store']);
    Route::get('/sales/{id}', [SaleController::class, 'show']);
    Route::get('/sales/{id}/pdf', [SaleController::class, 'downloadPdf']);
});
