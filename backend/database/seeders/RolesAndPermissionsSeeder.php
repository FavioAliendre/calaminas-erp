<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Users
            'manage-users',

            // Clients
            'view-clients',
            'create-clients',
            'edit-clients',
            'delete-clients',

            // Products
            'view-products',
            'create-products',
            'edit-products',
            'delete-products',

            // Purchases
            'view-purchases',
            'create-purchases',

            // Inventory
            'view-inventory',
            'adjust-inventory',

            // Quotations
            'view-quotations',
            'create-quotations',
            'edit-quotations',
            'delete-quotations',
            'convert-quotations',

            // Sales
            'view-sales',
            'create-sales',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Reset cached roles and permissions again to ensure the newly created permissions are loaded
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles and assign created permissions

        // Vendedor permissions
        $vendedorRole = Role::firstOrCreate(['name' => 'Vendedor', 'guard_name' => 'web']);
        $vendedorRole->syncPermissions([
            'view-clients',
            'create-clients',
            'edit-clients',
            'view-products',
            'view-inventory',
            'view-quotations',
            'create-quotations',
            'edit-quotations',
            'convert-quotations',
            'view-sales',
            'create-sales',
        ]);

        // Administrador permissions (Super Admin bypass can also be used, or assign all)
        $adminRole = Role::firstOrCreate(['name' => 'Administrador', 'guard_name' => 'web']);
        $adminRole->syncPermissions(Permission::all());
    }
}
