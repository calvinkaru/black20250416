<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Contact;

class ContactSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Inserting a walk-in customer record
        Contact::create([
            'name' => 'Guest',     // Name of the walk-in customer
            'email' => null,                // Email is null for walk-in customers
            'phone' => null,                // Phone is null for walk-in customers
            'address' => null,              // Address is null for walk-in customers
            'balance' => 0.00,              // Default balance
            'loyalty_points' => null,       // No loyalty points for walk-in customers
            'type' => 'customer',              // Type set to 'guest'
        ]);
    }
}
