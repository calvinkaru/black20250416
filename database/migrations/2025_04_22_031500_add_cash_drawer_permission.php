<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AddCashDrawerPermission extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create the cash-drawer permission
        Permission::create(['name' => 'cash-drawer']);
        
        // Assign the permission to the admin role
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo('cash-drawer');
        }
        
        // Assign the permission to the manager role
        $managerRole = Role::where('name', 'manager')->first();
        if ($managerRole) {
            $managerRole->givePermissionTo('cash-drawer');
        }
        
        // Assign the permission to the cashier role
        $cashierRole = Role::where('name', 'cashier')->first();
        if ($cashierRole) {
            $cashierRole->givePermissionTo('cash-drawer');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the permission
        $permission = Permission::where('name', 'cash-drawer')->first();
        if ($permission) {
            $permission->delete();
        }
    }
}
