<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Quotation;
use App\Models\Sale;
use App\Http\Resources\SaleResource;
use App\Http\Resources\QuotationResource;
use App\Http\Resources\ProductResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::today()->startOfMonth();

        // 1. Sales of the day
        $salesTodaySum = Sale::whereDate('date', $today)->sum('total');
        $salesTodayCount = Sale::whereDate('date', $today)->count();

        // 2. Sales of the month
        $salesMonthSum = Sale::whereBetween('date', [$startOfMonth, Carbon::today()->endOfMonth()])->sum('total');
        $salesMonthCount = Sale::whereBetween('date', [$startOfMonth, Carbon::today()->endOfMonth()])->count();

        // 3. Products with low stock (Threshold < 100 meters)
        $lowStockProducts = Product::where('stock', '<', 100.00)->get();
        $lowStockCount = $lowStockProducts->count();

        // 4. Recent Sales (Latest 5)
        $recentSales = Sale::with(['client', 'seller'])
            ->latest('id')
            ->limit(5)
            ->get();

        // 5. Recent Quotations (Latest 5)
        $recentQuotations = Quotation::with(['client'])
            ->latest('id')
            ->limit(5)
            ->get();

        // 6. Chart Data: Sales of the last 7 days
        $chartSalesLast7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateString = $date->toDateString();
            $label = $date->format('d/m');
            
            $daySum = Sale::whereDate('date', $dateString)->sum('total');
            
            $chartSalesLast7Days[] = [
                'date' => $dateString,
                'label' => $label,
                'total' => floatval($daySum),
            ];
        }

        // 7. Stock breakdown by color (e.g. Zinc, Red, Blue, etc.)
        $stockByColor = Product::select('color', DB::raw('SUM(stock) as total_stock'))
            ->groupBy('color')
            ->get()
            ->map(function ($item) {
                return [
                    'color' => $item->color ?: 'Sin color',
                    'stock' => floatval($item->total_stock),
                ];
            });

        return response()->json([
            'sales_today' => [
                'total' => floatval($salesTodaySum),
                'count' => $salesTodayCount,
            ],
            'sales_month' => [
                'total' => floatval($salesMonthSum),
                'count' => $salesMonthCount,
            ],
            'low_stock' => [
                'count' => $lowStockCount,
                'products' => ProductResource::collection($lowStockProducts->take(5)),
            ],
            'recent_sales' => SaleResource::collection($recentSales),
            'recent_quotations' => QuotationResource::collection($recentQuotations),
            'chart_sales' => $chartSalesLast7Days,
            'stock_by_color' => $stockByColor,
        ]);
    }
}
