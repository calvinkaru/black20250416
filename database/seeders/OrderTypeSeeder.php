<?php

namespace Database\Seeders;

use App\Models\OrderType;
use Illuminate\Database\Seeder;

class OrderTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orderTypes = [
            [
                'name' => 'Dine In',
                'is_active' => true,
                'description' => 'For customers dining in the restaurant',
            ],
            [
                'name' => 'Takeaway',
                'is_active' => true,
                'description' => 'For customers taking food away',
            ],
            [
                'name' => 'Delivery',
                'is_active' => true,
                'description' => 'For food delivery orders',
            ],
        ];

        foreach ($orderTypes as $orderType) {
            OrderType::create($orderType);
        }
    }
}
