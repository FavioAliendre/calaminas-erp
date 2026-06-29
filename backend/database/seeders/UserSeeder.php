<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@calaminas.com'],
            [
                'name' => 'Admin Calaminas',
                'password' => Hash::make('admin123'),
            ]
        );
        if (!$admin->hasRole('Administrador')) {
            $admin->assignRole('Administrador');
        }
 
        $vendedor = User::firstOrCreate(
            ['email' => 'vendedor@calaminas.com'],
            [
                'name' => 'Vendedor Calaminas',
                'password' => Hash::make('vendedor123'),
            ]
        );
        if (!$vendedor->hasRole('Vendedor')) {
            $vendedor->assignRole('Vendedor');
        }
    }
}
