<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\Contracts\ClientRepositoryInterface::class,
            \App\Repositories\Eloquent\ClientRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\ProductRepositoryInterface::class,
            \App\Repositories\Eloquent\ProductRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\PurchaseRepositoryInterface::class,
            \App\Repositories\Eloquent\PurchaseRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\QuotationRepositoryInterface::class,
            \App\Repositories\Eloquent\QuotationRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\SaleRepositoryInterface::class,
            \App\Repositories\Eloquent\SaleRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\InventoryMovementRepositoryInterface::class,
            \App\Repositories\Eloquent\InventoryMovementRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
