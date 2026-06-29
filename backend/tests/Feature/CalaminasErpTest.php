<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Product;
use App\Models\User;
use App\Services\PurchaseService;
use App\Services\SaleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalaminasErpTest extends TestCase
{
    use RefreshDatabase;

    protected PurchaseService $purchaseService;
    protected SaleService $saleService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->purchaseService = $this->app->make(PurchaseService::class);
        $this->saleService = $this->app->make(SaleService::class);
    }

    public function test_purchase_conversion_adds_stock_in_meters()
    {
        // 1. Create a product with 500 meters per ton conversion rate
        $product = Product::create([
            'code' => 'CAL-TEST',
            'name' => 'Calamina Test',
            'thickness' => 0.35,
            'purchase_unit' => 'TON',
            'sale_unit' => 'M',
            'meters_per_ton' => 500.00,
            'stock' => 0.00,
        ]);

        // 2. Register a purchase of 2 Tons
        $purchaseData = [
            'purchase_date' => now()->toDateString(),
            'provider_name' => 'Proveedor de Prueba',
            'invoice_number' => 'FAC-123',
        ];

        $items = [
            [
                'product_id' => $product->id,
                'tons' => 2.00, // 2 Tons
                'unit_cost' => 1200.00, // Bs. 1200 per Ton
            ]
        ];

        $purchase = $this->purchaseService->registerPurchase($purchaseData, $items);

        // 3. Verify stock is updated to 1000 meters (2 Tons * 500 meters/Ton)
        $product->refresh();
        $this->assertEquals(1000.00, $product->stock);

        // Verify purchase totals
        $this->assertEquals(2400.00, $purchase->total_cost);

        // Verify Kardex entry
        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->id,
            'type' => 'purchase',
            'quantity' => 1000.00,
            'prev_stock' => 0.00,
            'new_stock' => 1000.00,
        ]);
    }

    public function test_sale_deducts_stock_in_meters()
    {
        $seller = User::create([
            'name' => 'Vendedor',
            'email' => 'vendedor@test.com',
            'password' => bcrypt('password'),
        ]);

        $client = Client::create([
            'name' => 'Cliente de Prueba',
            'nit_ci' => '1234567',
        ]);

        // 1. Create a product with 1000 meters stock
        $product = Product::create([
            'code' => 'CAL-TEST-2',
            'name' => 'Calamina Test 2',
            'thickness' => 0.35,
            'purchase_unit' => 'TON',
            'sale_unit' => 'M',
            'meters_per_ton' => 500.00,
            'stock' => 1000.00,
        ]);

        // 2. Register a sale of 5 pieces of 6 meters length (30 meters total)
        $saleData = [
            'date' => now()->toDateString(),
            'client_id' => $client->id,
            'client_name_snapshot' => $client->name,
            'user_id' => $seller->id,
            'advance_payment' => 100.00,
            'observations' => 'Ninguna',
        ];

        $items = [
            [
                'product_id' => $product->id,
                'length' => 6.00, // 6 meters long
                'quantity' => 5.00, // 5 sheets
                'unit_price' => 25.00, // Bs. 25 per meter
            ]
        ];

        $sale = $this->saleService->registerSale($saleData, $items);

        // 3. Verify stock is updated to 970 meters (1000 - 30)
        $product->refresh();
        $this->assertEquals(970.00, $product->stock);

        // Verify sale totals
        // total = 6m * 5pcs * Bs.25 = Bs. 750
        // balance = total - advance = 750 - 100 = Bs. 650
        $this->assertEquals(750.00, $sale->total);
        $this->assertEquals(650.00, $sale->balance);
        $this->assertEquals('pending_balance', $sale->status);

        // Verify Kardex entry
        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->id,
            'type' => 'sale',
            'quantity' => 30.00,
            'prev_stock' => 1000.00,
            'new_stock' => 970.00,
        ]);
    }

    public function test_sale_validation_throws_exception_on_insufficient_stock()
    {
        $seller = User::create([
            'name' => 'Vendedor',
            'email' => 'vendedor@test.com',
            'password' => bcrypt('password'),
        ]);

        // Create product with only 10 meters stock
        $product = Product::create([
            'code' => 'CAL-TEST-3',
            'name' => 'Calamina Test 3',
            'thickness' => 0.35,
            'purchase_unit' => 'TON',
            'sale_unit' => 'M',
            'meters_per_ton' => 500.00,
            'stock' => 10.00,
        ]);

        $saleData = [
            'date' => now()->toDateString(),
            'client_name_snapshot' => 'Comprador Anonimo',
            'user_id' => $seller->id,
        ];

        // Attempting to sell 2 pieces of 6 meters (12 meters total)
        $items = [
            [
                'product_id' => $product->id,
                'length' => 6.00,
                'quantity' => 2.00,
                'unit_price' => 25.00,
            ]
        ];

        $this->expectException(\Illuminate\Validation\ValidationException::class);
        
        $this->saleService->registerSale($saleData, $items);
    }
}
