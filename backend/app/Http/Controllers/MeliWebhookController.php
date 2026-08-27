<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\InventoryOrchestrator;
use App\Services\MercadoLibreService;
use App\Services\AlegraService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MeliWebhookController extends Controller
{
    protected InventoryOrchestrator $orchestrator;
    protected MercadoLibreService $meli;
    protected AlegraService $alegra;

    public function __construct(
        InventoryOrchestrator $orchestrator, 
        MercadoLibreService $meli,
        AlegraService $alegra
    ) {
        $this->orchestrator = $orchestrator;
        $this->meli = $meli;
        $this->alegra = $alegra;
    }

    public function handleOrderV2(Request $request)
    {
        $topic = $request->input('topic');
        
        // Atender exclusively a "orders_v2" según requerimiento de Módulo 3
        if ($topic === 'orders_v2') {
            $resourceUrl = $request->input('resource');
            
            Log::info("Webhook MELI recibido (orders_v2). Recurso: $resourceUrl");
            
            // 1. Obtener detalles completos de la orden
            $orderData = $this->meli->getResource($resourceUrl);
            
            // 2. Procesar ítems y descontar stock
            if (isset($orderData['order_items'])) {
                foreach ($orderData['order_items'] as $item) {
                    $sku = $item['item']['seller_sku'] ?? null;
                    $quantitySold = $item['quantity'];
                    
                    if ($sku) {
                        // Leer stock actual desde la Matriz
                        $currentStock = DB::table('products')->where('sku', $sku)->value('stock') ?? 0;
                        $newStock = $currentStock - $quantitySold;
                        
                        // Disparar sincronización tripartita (Excluyendo propagar a MELI de regreso)
                        $this->orchestrator->syncStock($sku, $newStock, 'MELI');
                    }
                }
                
                // 3. Sincronización Automática con Contabilidad Alegra
                $this->alegra->syncMeliOrder($orderData);
            }

            return response()->json(['message' => 'Webhook procesado y sincronizado correctamente.']);
        }

        return response()->json(['message' => 'Tópico no manejado'], 200);
    }
}
