<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Setting;

class AddMyDrawerSettings extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add setting for showing/hiding the transactions table before closing
        $setting = Setting::firstOrCreate(
            ['meta_key' => 'my_drawer_show_table_before_closing'],
            [
                'meta_value' => 'false',
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the setting
        Setting::where('meta_key', 'my_drawer_show_table_before_closing')->delete();
    }
}
