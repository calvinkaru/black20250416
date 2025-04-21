<?php

namespace Database\Seeders;

use App\Models\OrderType;
use App\Models\Tax;
use Illuminate\Database\Seeder;

class OrderTypeTaxSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Link Dine In with Service Charge
        $dineIn = OrderType::where('name', 'Dine In')->first();
        $serviceCharge = Tax::where('name', 'Service Charge')->first();
        $vat = Tax::where('name', 'VAT')->first();

        if ($dineIn && $serviceCharge) {
            $dineIn->taxes()->attach($serviceCharge->id);
        }

        if ($dineIn && $vat) {
            $dineIn->taxes()->attach($vat->id);
        }

        // Link Delivery with Delivery Fee
        $delivery = OrderType::where('name', 'Delivery')->first();
        $deliveryFee = Tax::where('name', 'Delivery Fee')->first();

        if ($delivery && $deliveryFee) {
            $delivery->taxes()->attach($deliveryFee->id);
        }

        if ($delivery && $vat) {
            $delivery->taxes()->attach($vat->id);
        }

        // Link Takeaway with VAT only
        $takeaway = OrderType::where('name', 'Takeaway')->first();

        if ($takeaway && $vat) {
            $takeaway->taxes()->attach($vat->id);
        }
    }
}
