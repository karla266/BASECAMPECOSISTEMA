<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    /**
     * Carga de productos uno a uno.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => 'required|string|unique:products,sku',
            'title' => 'required|string',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'meli_item_id' => 'nullable|string'
        ]);

        $product = DB::table('products')->insert($validated);
        
        Log::info("Producto {$validated['sku']} creado correctamente de manera individual.");
        
        return response()->json([
            'message' => 'Producto creado con éxito.',
            'product' => $validated
        ], 201);
    }

    /**
     * Importación masiva vía archivo CSV
     * (sku,title,price,stock,category,description,meli_item_id)
     */
    public function importCsv(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt'
        ]);

        $path = $request->file('file')->getRealPath();
        $data = array_map('str_getcsv', file($path));
        
        if (empty($data)) {
            return response()->json(['error' => 'Archivo CSV vacío.'], 400);
        }

        $header = array_shift($data); // Obtener headers
        $importedCount = 0;

        foreach ($data as $row) {
            // Prevenir fallas si la fila está mal formateada
            if (count($header) !== count($row)) continue;

            $productData = array_combine($header, $row);
            
            DB::table('products')->updateOrInsert(
                ['sku' => $productData['sku']],
                [
                    'title' => $productData['title'] ?? 'Sin Titulo',
                    'price' => $productData['price'] ?? 0,
                    'stock' => $productData['stock'] ?? 0,
                    'category' => $productData['category'] ?? 'general',
                    'description' => $productData['description'] ?? '',
                    'meli_item_id' => $productData['meli_item_id'] ?? null
                ]
            );
            $importedCount++;
        }

        return response()->json([
            'message' => "Importación masiva completada exitosamente.",
            'imported_records' => $importedCount
        ]);
    }
}
