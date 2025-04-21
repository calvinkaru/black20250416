<?php

namespace App\Http\Controllers;

use App\Models\OrderType;
use App\Models\Tax;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderTypeController extends Controller
{
    /**
     * Display a listing of the order types.
     */
    public function index()
    {
        $orderTypes = OrderType::with('taxes')->get();
        $taxes = Tax::where('is_active', true)->get();

        return Inertia::render('Settings/OrderTypes', [
            'orderTypes' => $orderTypes,
            'taxes' => $taxes,
            'pageLabel' => 'Order Types',
        ]);
    }

    /**
     * Store a newly created order type in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'description' => 'nullable|string',
            'taxes' => 'array',
        ]);

        // If this order type is being set as default, unset any existing default
        if ($validated['is_default'] ?? false) {
            OrderType::where('is_default', true)->update(['is_default' => false]);
        }

        $orderType = OrderType::create([
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
            'is_default' => $validated['is_default'] ?? false,
            'description' => $validated['description'] ?? null,
        ]);

        if (isset($validated['taxes']) && count($validated['taxes']) > 0) {
            $orderType->taxes()->attach($validated['taxes']);
        }

        return response()->json(['message' => 'Order type created successfully', 'orderType' => $orderType], 201);
    }

    /**
     * Update the specified order type in storage.
     */
    public function update(Request $request, OrderType $orderType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'description' => 'nullable|string',
            'taxes' => 'array',
        ]);

        // If this order type is being set as default, unset any existing default
        if (($validated['is_default'] ?? false) && !$orderType->is_default) {
            OrderType::where('is_default', true)->update(['is_default' => false]);
        }

        $orderType->update([
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
            'is_default' => $validated['is_default'] ?? false,
            'description' => $validated['description'] ?? null,
        ]);

        if (isset($validated['taxes'])) {
            $orderType->taxes()->sync($validated['taxes']);
        }

        return response()->json(['message' => 'Order type updated successfully', 'orderType' => $orderType], 200);
    }

    /**
     * Remove the specified order type from storage.
     */
    public function destroy(OrderType $orderType)
    {
        // Check if the order type is being used in any sales
        $salesCount = $orderType->sales()->count();
        if ($salesCount > 0) {
            return response()->json(['message' => 'Cannot delete order type as it is being used in sales'], 422);
        }

        $orderType->taxes()->detach();
        $orderType->delete();

        return response()->json(['message' => 'Order type deleted successfully'], 200);
    }

    /**
     * Get all active order types for dropdown.
     */
    public function getActiveOrderTypes()
    {
        $orderTypes = OrderType::where('is_active', true)
            ->with('taxes')
            ->get();

        return response()->json(['orderTypes' => $orderTypes], 200);
    }
}
