<?php

namespace App\Http\Controllers;

use App\Models\Cheque;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\SaleItem;
use App\Models\Contact;
use App\Models\Sale;
use App\Models\Transaction;
use App\Models\Expense;
use App\Models\Setting;
use App\Models\Store;
use App\Models\SalaryRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
class DashboardController extends Controller
{
    public function index()
    {
        $version = config('version.version');
        $imageUrl = '';
        if (app()->environment('production')) $imageUrl = 'public/';

        $settings = Setting::whereIn('meta_key', ['shop_logo', 'misc_settings'])->get();
        $settingArray = $settings->pluck('meta_value', 'meta_key')->all();
        $settingArray['shop_logo'] = $imageUrl . $settingArray['shop_logo'];
        $store_id = session('store_id', Auth::user()->store_id);
        $store_name = Store::where('id', $store_id)->value('name');

        if (isset($settingArray['misc_settings'])) {
            $miscSettings = json_decode($settingArray['misc_settings'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $settingArray = array_merge($settingArray, $miscSettings);
            }
        }

        $cheque_alert = isset($settingArray['cheque_alert']) ? (int)$settingArray['cheque_alert'] : 2;
        $pending_cheque_count = Cheque::where('status', 'pending')->count();

        $cheque_alert_count = Cheque::where('status', 'pending')
            ->where('cheque_date', '<=', now()->addDays($cheque_alert))
            ->count();

        $data['totalItems'] = number_format(Product::count());
        $data['soldItems'] = number_format(SaleItem::sum('quantity'));
        $data['totalQuantities'] = number_format(ProductStock::sum('quantity'));
        $data['cheque_alert_count'] = $cheque_alert_count;
        $data['pending_cheque_count'] = $pending_cheque_count;

        $totalValuation = ProductStock::join('product_batches', 'product_stocks.batch_id', '=', 'product_batches.id')
            ->select(DB::raw('SUM(product_stocks.quantity * product_batches.cost) as total_valuation'))
            ->value('total_valuation');

        $countLowStockItems = ProductStock::join('product_batches', 'product_stocks.batch_id', '=', 'product_batches.id')
            ->join('products', 'product_batches.product_id', '=', 'products.id')
            ->where('product_batches.is_active', 1)
            ->where('product_stocks.quantity', '<=', DB::raw('products.alert_quantity'))
            ->count();

        $outOfStockItems = ProductStock::join('product_batches', 'product_stocks.batch_id', '=', 'product_batches.id')
            ->join('products', 'product_batches.product_id', '=', 'products.id')
            ->where('product_batches.is_active', 1)
            ->where('products.is_stock_managed', 1)
            ->where('product_stocks.quantity', '<=', 0)
            ->count();

        $customerBalance = Contact::customers()->sum('balance');
        $data['totalValuation'] = number_format($totalValuation);
        $data['customerBalance'] = number_format($customerBalance);
        $data['lowStock'] = number_format($countLowStockItems);
        $data['outOfStock'] = number_format($outOfStockItems);

        // Render the 'Dashboard' component with data
        return Inertia::render('Dashboard/Dashboard', [
            'pageLabel' => 'Dashboard',
            'data' => $data,
            'logo' => $settingArray['shop_logo'],
            'version' => $version,
            'store_name' => $store_name
        ]);
    }

    public function getDashboardSummary(Request $request)
    {
        $startDate = $request->start_date;
        $endDate = $request->end_date;

        $data['total_sales'] = Sale::whereBetween('sale_date', [$startDate, $endDate])->sum('total_amount');
        $data['cash_in'] = Transaction::where('payment_method', 'cash')->whereBetween('transaction_date', [$startDate, $endDate])->sum('amount');
        $data['expenses'] = Expense::whereBetween('expense_date', [$startDate, $endDate])->sum('amount');
        $data['salary_expense'] = SalaryRecord::DateFilter($startDate, $endDate)->sum('net_salary');
        $data['expenses'] += $data['salary_expense'];
        
        // Add the payment method values
        $data['cash'] = Transaction::where('payment_method', 'cash')->whereBetween('transaction_date', [$startDate, $endDate])->where('amount', '>', 0)->sum('amount');
        $data['cheque'] = Transaction::where('payment_method', 'cheque')->whereBetween('transaction_date', [$startDate, $endDate])->where('amount', '>', 0)->sum('amount');
        $data['credit'] = Transaction::where('payment_method', 'credit')->whereBetween('transaction_date', [$startDate, $endDate])->where('amount', '>', 0)->sum('amount');
        $data['card'] = Transaction::where('payment_method', 'card')->whereBetween('transaction_date', [$startDate, $endDate])->where('amount', '>', 0)->sum('amount');
        
        return response()->json([
            'summary' => $data,
        ], 200);
    }

    public function getOrderTypeSummary(Request $request)
    {
        // Get the filters from the request
        $filters = $request->only(['start_date', 'end_date']);

        // Order Type Totals Query
        $orderTypeTotalsQuery = \App\Models\Sale::query();
        $orderTypeTotalsQuery->select(
            'order_types.id as order_type_id',
            'order_types.name as order_type_name',
            DB::raw('COUNT(sales.id) as total_sales'),
            DB::raw('SUM(sales.total_amount) as total_amount')
        )
            ->join('order_types', 'sales.order_type_id', '=', 'order_types.id')
            ->groupBy('order_types.id', 'order_types.name')
            ->orderBy('order_types.name');

        // Apply filters if provided
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $orderTypeTotalsQuery->whereBetween('sales.sale_date', [$filters['start_date'], $filters['end_date']]);
        }

        $orderTypeTotals = $orderTypeTotalsQuery->get();

        return response()->json([
            'order_type_totals' => $orderTypeTotals,
        ]);
    }

    public function getSoldItemsSummary(Request $request)
    {
        // Get the filters from the request
        $filters = $request->only(['start_date', 'end_date']);

        // Top Sold Items Query
        $topSoldItemsQuery = SaleItem::query();
        $topSoldItemsQuery->select(
            'products.name as product_name',
            DB::raw('SUM(sale_items.quantity) as total_quantity')
        )
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->groupBy('products.name')
            ->orderByDesc(DB::raw('SUM(sale_items.quantity)'))
            ->limit(5);  // Top 5 sold items

        // Apply filters if provided
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $topSoldItemsQuery->whereBetween('sales.sale_date', [$filters['start_date'], $filters['end_date']]);
        }

        $topSoldItems = $topSoldItemsQuery->get();

        // Top Profit Items Query
        $topProfitItemsQuery = SaleItem::query();
        $topProfitItemsQuery->select(
            'products.name as product_name',
            DB::raw('SUM(((unit_price - sale_items.discount - unit_cost) * sale_items.quantity)) as total_profit')
        )
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->groupBy('products.name')
            ->orderByDesc(DB::raw('SUM(((unit_price - sale_items.discount - unit_cost) * sale_items.quantity))'))
            ->limit(5);  // Top 5 profit items

        // Apply filters if provided
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $topProfitItemsQuery->whereBetween('sales.sale_date', [$filters['start_date'], $filters['end_date']]);
        }

        $topProfitItems = $topProfitItemsQuery->get();

        // Top Gross Items Query
        $topGrossItemsQuery = SaleItem::query();
        $topGrossItemsQuery->select(
            'products.name as product_name',
            DB::raw('SUM((unit_price - sale_items.discount) * sale_items.quantity) as total_gross')
        )
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->groupBy('products.name')
            ->orderByDesc(DB::raw('SUM(unit_price * sale_items.quantity)'))
            ->limit(5);  // Top 5 gross items

        // Apply filters if provided
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $topGrossItemsQuery->whereBetween('sales.sale_date', [$filters['start_date'], $filters['end_date']]);
        }

        $topGrossItems = $topGrossItemsQuery->get();

        return response()->json([
            'top_sold_items' => $topSoldItems,
            'top_profit_items' => $topProfitItems,
            'top_gross_items' => $topGrossItems,
        ]);
    }
}
