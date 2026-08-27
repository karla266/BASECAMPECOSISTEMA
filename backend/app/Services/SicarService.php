<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class SicarService
{
    // Simulador de integración con API de Sicar POS (Sistema de Punto de Venta Local)
    
    public function updateStock(string $sku, int $quantity)
    {
        // Aquí iría el cliente SOAP o REST a la IP local de Sicar (vía túnel)
        Log::info("[SICAR POS API] Stock actualizado para $sku a $quantity piezas.");
        
        return true;
    }
}
