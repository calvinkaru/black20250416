<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create new permissions
        $newPermissions = [
            'order-types',
            'taxes',
            'my-drawer',
        ];

        foreach ($newPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign permissions to roles
        $superAdminRole = Role::where('name', 'super-admin')->first();
        $adminRole = Role::where('name', 'admin')->first();

        if ($superAdminRole) {
            $superAdminRole->givePermissionTo(Permission::all());
        }

        if ($adminRole) {
            $adminRole->givePermissionTo($newPermissions);
        }
    }
}
