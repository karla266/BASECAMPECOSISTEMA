<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MercadoLibreService
{
    protected string $accessToken;

    public function __construct()
    {
        $this->accessToken = env('MELI_ACCESS_TOKEN', 'APP_USR-xxxx');
    }

    public function updateAvailableQuantity(string $meliItemId, int $quantity)
    {
        $response = Http::withToken($this->accessToken)
            ->put("https://api.mercadolibre.com/items/{$meliItemId}", [
                'available_quantity' => $quantity
            ]);

        if ($response->successful()) {
            Log::info("[MELI API] Stock actualizado correctamente para el item {$meliItemId}.");
            return true;
        }

        Log::error("[MELI API] Error al actualizar stock: " . $response->body());
        return false;
    }

    public function getResource(string $resourceUrl)
    {
        // El webhook envía una ruta relativa en $resourceUrl (e.g. /orders/2000000)
        $response = Http::withToken($this->accessToken)
            ->get("https://api.mercadolibre.com{$resourceUrl}");

        return $response->json();
    }
}
