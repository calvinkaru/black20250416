<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CollectionController extends Controller
{
    public function index()
    {
        // Fetch data from the Collection model
        $collections = Collection::select('id', 'name', 'collection_type', 'description', 'display_limit', 'created_at')->get();
        
        // Render the Inertia view with the collections data
        return Inertia::render('Collection/Collection', [
            'collections' => $collections,
            'pageLabel'=>'Collections',
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|unique:collections,name', // 'name' must be unique
            'collection_type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'display_limit' => 'nullable|integer|min:1',
        ]);
        $validatedData['slug'] = Str::slug($request->input('name'));
        
        // Set default display limit if not provided
        if (!isset($validatedData['display_limit'])) {
            $validatedData['display_limit'] = 20; // Default to 20 items
        }

        // 4. Save the data to the database
        Collection::create($validatedData);

        return redirect()->route('collection')->with('success', 'Collection created successfully!');
    }

    public function update(Request $request, $id)
    {
        $collection = Collection::findOrFail($id);
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:collections,name,' . $id,
            'collection_type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'slug' => 'nullable|string|max:255|unique:collections,slug,' . $id,
            'display_limit' => 'nullable|integer|min:1',
        ]);
        $validatedData['slug'] = Str::slug($validatedData['name']);
        
        // Set default display limit if not provided
        if (!isset($validatedData['display_limit'])) {
            $validatedData['display_limit'] = 20; // Default to 20 items
        }
        
        // 2. Update the data in the database
        $collection->update($validatedData);

        return redirect()->route('collection')->with('success', 'Collection updated successfully!');
    }
}
