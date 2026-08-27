<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class InventoryOrchestrator
{
    protected SicarService $sicar;
    protected MercadoLibreService $meli;

    public function __construct(SicarService $sicar, MercadoLibreService $meli)
    {
        $this->sicar = $sicar;
        $this->meli = $meli;
    }

    /**
     * Motor de sincronización tripartito.
     * Recibe eventos de cambios de stock y propaga a los demás canales.
     */
    public function syncStock(string $sku, int $newStock, string $sourceOrigin)
    {
        Log::info("Iniciando sincronización de stock OMNICANAL para $sku desde $sourceOrigin. Nuevo stock: $newStock");

        // 1. Actualizar DB Central (Matriz) si el origen no fue directo a la DB
        DB::table('products')->where('sku', $sku)->update(['stock' => $newStock]);

        // 2. Propagar a SICAR POS si el origen no fue el POS Físico
        if ($sourceOrigin !== 'SICAR') {
            $this->sicar->updateStock($sku, $newStock);
        }
        
        // 3. Propagar a Mercado Libre si el origen no fue MELI Webhook
        if ($sourceOrigin !== 'MELI') {
            $product = DB::table('products')->where('sku', $sku)->first();
            if ($product && !empty($product->meli_item_id)) {
                $this->meli->updateAvailableQuantity($product->meli_item_id, $newStock);
            }
        }
        
        // 4. Propagar a E-Commerce Web Front (Ej: Invalida Caché de Next.js o emite evento WebSockets)
        if ($sourceOrigin !== 'WEB') {
            Log::info("Notificando a Node.js Frontend vía webhook interno para invalidar ISR de $sku.");
            // Lógica de purga de caché web...
        }

        return true;
    }
}
