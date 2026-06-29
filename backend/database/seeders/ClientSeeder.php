<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            [
                'name' => 'Constructora Altiplano S.R.L.',
                'nit_ci' => '1020304021',
                'phone' => '71234567',
                'address' => 'Av. Blanco Galindo Km 5, Cochabamba',
                'email' => 'contacto@altiplano.com',
            ],
            [
                'name' => 'Distribuidora Ferretera El Triunfo',
                'nit_ci' => '876543210',
                'phone' => '22456789',
                'address' => 'Zona 12 de Octubre, El Alto, La Paz',
                'email' => 'ventas@eltriunfo.com',
            ],
            [
                'name' => 'Juan Carlos Perez Zambrana',
                'nit_ci' => '4859603 LP',
                'phone' => '68954712',
                'address' => 'Calle Tarija Nro. 245, Oruro',
                'email' => 'juan.perez@gmail.com',
            ],
        ];

        foreach ($clients as $client) {
            Client::create($client);
        }
    }
}
