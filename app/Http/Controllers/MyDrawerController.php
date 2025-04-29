<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\CashLog;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class MyDrawerController extends Controller
{
    /**
     * Display the My Drawer page for cashiers
     */
    public function index()
    {
        // Get today's date
        $today = Carbon::today()->toDateString();
        
        // Get the current user's ID and store ID
        $user_id = Auth::id();
        $store_id = Auth::user()->store_id;
        
        // Get today's cash logs for the current user
        $cashLogs = CashLog::where('transaction_date', $today)
            ->where('created_by', $user_id)
            ->where('store_id', $store_id)
            ->select(
                'id',
                'transaction_date',
                'description',
                'amount',
                'source',
                'transaction_type'
            )
            ->orderBy('created_at', 'asc')
            ->get();
        
        // Check if there's an opening balance for today
        $hasOpeningBalance = $cashLogs->contains(function ($log) {
            return $log->source === 'deposit' && $log->description && str_contains($log->description, 'Opening Cashier Balance');
        });
        
        // Check if there's a closing balance for today
        $hasClosingBalance = $cashLogs->contains(function ($log) {
            return $log->source === 'withdrawal' && $log->description && str_contains($log->description, 'Closing Cashier Balance');
        });
        
        // Check if there's a temporary closing for today
        $hasTempClosing = $cashLogs->contains(function ($log) {
            return $log->source === 'withdrawal' && $log->description && str_contains($log->description, 'Temporary Closing');
        });
        
        // Get the latest log to determine the current state
        $latestLog = $cashLogs->sortByDesc('id')->first();
        $isCurrentlyOpen = $hasOpeningBalance && 
                          (!$hasTempClosing || 
                           ($hasTempClosing && $latestLog && !str_contains($latestLog->description, 'Temporary Closing')));
        
        // Filter out closing cashier balance for the main table
        $filteredLogs = $cashLogs->filter(function ($log) {
            return !str_contains($log->description, 'Closing Cashier Balance');
        })->values();
        
        // Calculate total cash in and cash out (excluding closing balance)
        $totalCashIn = $filteredLogs->sum(function ($log) {
            return $log->amount > 0 ? $log->amount : 0;
        });
        
        $totalCashOut = $filteredLogs->sum(function ($log) {
            return $log->amount < 0 ? abs($log->amount) : 0;
        });
        
        // Calculate current balance
        $currentBalance = $totalCashIn - $totalCashOut;
        
        // Get setting for showing/hiding table before closing
        $showTableBeforeClosing = Setting::where('meta_key', 'my_drawer_show_table_before_closing')->first();
        $showTableBeforeClosingSetting = $showTableBeforeClosing ? ($showTableBeforeClosing->meta_value === 'true') : false;
        
        return Inertia::render('MyDrawer/Index', [
            'logs' => $cashLogs,
            'hasOpeningBalance' => $hasOpeningBalance,
            'hasClosingBalance' => $hasClosingBalance,
            'hasTempClosing' => $hasTempClosing,
            'isCurrentlyOpen' => $isCurrentlyOpen,
            'totalCashIn' => $totalCashIn,
            'totalCashOut' => $totalCashOut,
            'currentBalance' => $currentBalance,
            'showTableBeforeClosing' => $showTableBeforeClosingSetting,
            'pageLabel' => 'My Drawer',
        ]);
    }
    
    /**
     * Store a cash log entry for the drawer
     */
    public function storeCashLog(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01', // Ensure amount is a positive number
            'transaction_type' => 'required|in:open_cashier,deposit,withdrawal,close_cashier,temp_close_cashier',
            'description' => 'nullable|string|max:255',
            'denominations' => 'nullable|array',
        ]);
        
        $amount = $request->amount;
        $description = $request->description;
        $source = '';
        $actualTransactionType = '';
        
        // Set the appropriate values based on transaction type
        if ($request->transaction_type === 'open_cashier') {
            $amount = abs($amount); // Opening cashier balance should be positive
            $actualTransactionType = 'cash_in';
            $source = 'deposit';
            $description = $description ?: "Opening Cashier Balance - " . Carbon::now()->format('h:mm A');
        } elseif ($request->transaction_type === 'deposit') {
            $amount = abs($amount);
            $actualTransactionType = 'cash_in';
            $source = 'deposit';
            $description = $description ?: "Deposit - " . Carbon::now()->format('h:mm A');
        } elseif ($request->transaction_type === 'withdrawal') {
            $amount = -abs($amount);
            $actualTransactionType = 'cash_out';
            $source = 'withdrawal';
            $description = $description ?: "Withdrawal - " . Carbon::now()->format('h:mm A');
        } elseif ($request->transaction_type === 'close_cashier') {
            // Store the actual counted amount as a negative value to be consistent with withdrawals
            $amount = -abs($amount);
            $actualTransactionType = 'cash_out';
            $source = 'withdrawal';
            $description = $description ?: "Closing Cashier Balance - " . Carbon::now()->format('h:mm A');
        } elseif ($request->transaction_type === 'temp_close_cashier') {
            $amount = -abs($amount); // Temporary closing cashier balance as negative cash out
            $actualTransactionType = 'cash_out';
            $source = 'withdrawal';
            $description = $description ?: "Temporary Closing - " . Carbon::now()->format('h:mm A');
        }
        
        // Create a new CashLog entry
        $cashLog = new CashLog();
        $cashLog->description = $description;
        $cashLog->amount = $amount;
        $cashLog->transaction_date = Carbon::today()->toDateString();
        $cashLog->transaction_type = $actualTransactionType;
        $cashLog->store_id = Auth::user()->store_id;
        $cashLog->source = $source;
        
        // Save denominations as JSON in the description if provided
        if ($request->transaction_type === 'close_cashier' && isset($request->denominations) && !empty($request->denominations)) {
            $cashLog->description = $description . ' | Denominations: ' . json_encode($request->denominations);
        }
        
        // Save the cash log
        $cashLog->save();
        
        // Return a success response
        return response()->json([
            'message' => "Transaction added successfully",
            'cashLog' => $cashLog,
        ], 200);
    }
    
    /**
     * Get My Drawer settings
     */
    public function getSettings()
    {
        $settings = [
            'my_drawer_show_table_before_closing' => Setting::where('meta_key', 'my_drawer_show_table_before_closing')->first()->meta_value ?? 'false',
            'drawer_coin_denominations' => Setting::where('meta_key', 'drawer_coin_denominations')->first()->meta_value ?? null,
            'drawer_note_denominations' => Setting::where('meta_key', 'drawer_note_denominations')->first()->meta_value ?? null
        ];
        
        return response()->json([
            'settings' => $settings
        ], 200);
    }
    
    /**
     * Update My Drawer settings
     */
    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'meta_key' => 'required|string',
            'meta_value' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $meta_key = $request->meta_key;
        $meta_value = $request->meta_value;
        
        // Update or create the setting
        Setting::updateOrCreate(
            ['meta_key' => $meta_key],
            ['meta_value' => $meta_value]
        );
        
        return response()->json([
            'message' => 'Setting updated successfully'
        ], 200);
    }
}
