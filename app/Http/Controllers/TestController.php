<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Transaction;
use App\Models\Contact;
use App\Models\ProductStock;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class TestController extends Controller
{
    /**
     * Test credit card payment processing.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function testCardPayment(Request $request)
    {
        // Log the request data
        Log::info('Test Card Payment Request', $request->all());

        $amountReceived = $request->input('amount_received', 0);
        $discount = $request->input('discount', 0);
        $total = $request->input('net_total', 100);
        $note = $request->input('note', 'Test payment');
        $profitAmount = $request->input('profit_amount', 20);
        $cartItems = $request->input('cartItems', []);
        $customerID = $request->input('contact_id', 1);
        $saleDate = $request->input('sale_date', now()->toDateString());
        $payments = $request->input('payments', []);
        $createdBy = 1; // Default admin user
        $order_type_id = $request->input('order_type_id', 1);
        $taxes = $request->input('taxes', []);

        DB::beginTransaction();
        try {
            // Create a test sale
            $sale = Sale::create([
                'store_id' => 1, // Default store
                'reference_id' => null,
                'sale_type' => 'sale',
                'contact_id' => $customerID,
                'order_type_id' => $order_type_id,
                'sale_date' => $saleDate,
                'total_amount' => $total,
                'discount' => $discount,
                'amount_received' => $amountReceived,
                'profit_amount' => $profitAmount,
                'status' => 'pending',
                'payment_status' => 'pending',
                'note' => $note,
                'created_by' => $createdBy,
            ]);

            // Process payments
            foreach ($payments as $payment) {
                $transactionData = [
                    'sales_id' => $sale->id,
                    'store_id' => $sale->store_id,
                    'contact_id' => $sale->contact_id,
                    'transaction_date' => $sale->sale_date,
                    'amount' => $payment['amount'],
                    'payment_method' => $payment['payment_method'],
                    'transaction_type' => 'sale', // Default transaction type
                ];

                // Check if the payment method is 'Credit'
                if ($payment['payment_method'] == 'Credit') {
                    Contact::where('id', $sale->contact_id)->decrement('balance', $payment['amount']);
                } 
                // Check if the payment method is 'Account'
                else if ($payment['payment_method'] == 'Account') {
                    $transactionData['transaction_type'] = 'account';
                    Contact::where('id', $sale->contact_id)->decrement('balance', $payment['amount']);
                }

                // Update the total amount received for all payment methods except Credit
                if ($payment['payment_method'] != 'Credit') {
                    $amountReceived += $payment['amount'];
                }

                // Create the transaction
                Transaction::create($transactionData);
            }

            // Update sale status
            if ($amountReceived >= $total) {
                $sale->payment_status = 'completed';
                $sale->status = 'completed';
            }

            $sale->amount_received = $amountReceived;
            $sale->save();

            // Process cart items (simplified for testing)
            foreach ($cartItems as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['id'],
                    'batch_id' => $item['batch_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'unit_cost' => $item['cost'],
                    'discount' => $item['discount'],
                    'sale_date' => $sale->sale_date,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Test card payment processed successfully',
                'sale_id' => $sale->id
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Test Card Payment Error', [
                'error_message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
