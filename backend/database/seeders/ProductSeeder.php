<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'code' => 'CAL-GALV-035-OND',
                'name' => 'Calamina Galvanizada Ondulada C-28',
                'description' => 'Calamina galvanizada ondulada de alta resistencia, espesor 0.35mm, ideal para techado residencial y comercial.',
                'color' => 'Zinc/Plateado',
                'thickness' => 0.350,
                'purchase_unit' => 'TON',
                'sale_unit' => 'M',
                'meters_per_ton' => 512.80,
                'stock' => 0.00,
            ],
            [
                'code' => 'CAL-GALV-045-TRAP',
                'name' => 'Calamina Galvanizada Trapezoidal C-25',
                'description' => 'Calamina trapezoidal industrial, mayor resistencia estructural, espesor 0.45mm.',
                'color' => 'Zinc/Plateado',
                'thickness' => 0.450,
                'purchase_unit' => 'TON',
                'sale_unit' => 'M',
                'meters_per_ton' => 395.50,
                'stock' => 0.00,
            ],
            [
                'code' => 'CAL-ROJA-035-OND',
                'name' => 'Calamina Prepintada Roja Ondulada C-28',
                'description' => 'Calamina prepintada color rojo teja, acabado estético superior, espesor 0.35mm.',
                'color' => 'Rojo',
                'thickness' => 0.350,
                'purchase_unit' => 'TON',
                'sale_unit' => 'M',
                'meters_per_ton' => 512.80,
                'stock' => 0.00,
            ],
            [
                'code' => 'CAL-AZUL-035-TRAP',
                'name' => 'Calamina Prepintada Azul Trapezoidal C-28',
                'description' => 'Calamina trapezoidal de color azul prepintada al horno, espesor 0.35mm.',
                'color' => 'Azul',
                'thickness' => 0.350,
                'purchase_unit' => 'TON',
                'sale_unit' => 'M',
                'meters_per_ton' => 512.80,
                'stock' => 0.00,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
