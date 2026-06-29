<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin Calaminas',
            'email' => 'admin@calaminas.com',
            'password' => Hash::make('admin123'),
        ]);
        $admin->assignRole('Administrador');

        $vendedor = User::create([
            'name' => 'Vendedor Calaminas',
            'email' => 'vendedor@calaminas.com',
            'password' => Hash::make('vendedor123'),
        ]);
        $vendedor->assignRole('Vendedor');
    }
}
