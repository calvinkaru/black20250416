<?php

namespace App\Http\Controllers;

use App\Models\Tax;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxController extends Controller
{
    /**
     * Display a listing of the taxes.
     */
    public function index()
    {
        $taxes = Tax::all();

        return Inertia::render('Settings/Taxes', [
            'taxes' => $taxes,
            'pageLabel' => 'Taxes',
        ]);
    }

    /**
     * Store a newly created tax in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'rate' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $tax = Tax::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'rate' => $validated['rate'],
            'is_active' => $validated['is_active'] ?? true,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json(['message' => 'Tax created successfully', 'tax' => $tax], 201);
    }

    /**
     * Update the specified tax in storage.
     */
    public function update(Request $request, Tax $tax)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'rate' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $tax->update([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'rate' => $validated['rate'],
            'is_active' => $validated['is_active'] ?? true,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json(['message' => 'Tax updated successfully', 'tax' => $tax], 200);
    }

    /**
     * Remove the specified tax from storage.
     */
    public function destroy(Tax $tax)
    {
        // Check if the tax is being used in any order types
        $orderTypesCount = $tax->orderTypes()->count();
        if ($orderTypesCount > 0) {
            return response()->json(['message' => 'Cannot delete tax as it is being used in order types'], 422);
        }

        $tax->delete();

        return response()->json(['message' => 'Tax deleted successfully'], 200);
    }

    /**
     * Get all active taxes for dropdown.
     */
    public function getActiveTaxes()
    {
        $taxes = Tax::where('is_active', true)->get();

        return response()->json(['taxes' => $taxes], 200);
    }
}
