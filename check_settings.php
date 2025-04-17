<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Check if balance_due_padding exists
$setting = \App\Models\Setting::where('meta_key', 'balance_due_padding')->first();
echo "Balance Due Padding Setting: ";
var_dump($setting);

// Check if spacer_row_padding exists
$setting = \App\Models\Setting::where('meta_key', 'spacer_row_padding')->first();
echo "Spacer Row Padding Setting: ";
var_dump($setting);

// List all settings
echo "\nAll Settings:\n";
$settings = \App\Models\Setting::all();
foreach ($settings as $setting) {
    echo $setting->meta_key . " => " . $setting->meta_value . "\n";
}
