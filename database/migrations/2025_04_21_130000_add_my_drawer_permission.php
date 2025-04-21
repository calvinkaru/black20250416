<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AddMyDrawerPermission extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create the 'my-drawer' permission
        Permission::firstOrCreate(['name' => 'my-drawer']);

        // Assign the permission to super-admin and admin roles
        $superAdminRole = Role::where('name', 'super-admin')->first();
        $adminRole = Role::where('name', 'admin')->first();
        $cashierRole = Role::where('name', 'cashier')->first();

        if ($superAdminRole) {
            $superAdminRole->givePermissionTo('my-drawer');
        }

        if ($adminRole) {
            $adminRole->givePermissionTo('my-drawer');
        }

        if ($cashierRole) {
            $cashierRole->givePermissionTo('my-drawer');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Find and delete the 'my-drawer' permission
        $permission = Permission::where('name', 'my-drawer')->first();
        
        if ($permission) {
            $permission->delete();
        }
    }
}
