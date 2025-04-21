<?php

namespace Database\Seeders;

use App\Models\Tax;
use Illuminate\Database\Seeder;

class TaxSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $taxes = [
            [
                'name' => 'Service Charge',
                'type' => 'percentage',
                'rate' => 10.00,
                'is_active' => true,
                'description' => 'Service charge for dine-in customers',
            ],
            [
                'name' => 'Delivery Fee',
                'type' => 'fixed',
                'rate' => 100.00,
                'is_active' => true,
                'description' => 'Fixed delivery fee for delivery orders',
            ],
            [
                'name' => 'VAT',
                'type' => 'percentage',
                'rate' => 15.00,
                'is_active' => true,
                'description' => 'Value Added Tax',
            ],
        ];

        foreach ($taxes as $tax) {
            Tax::create($tax);
        }
    }
}
