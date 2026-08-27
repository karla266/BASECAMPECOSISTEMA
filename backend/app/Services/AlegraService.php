<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AlegraService
{
    protected string $baseUrl = 'https://api.alegra.com/api/v1';
    protected string $token;

    public function __construct()
    {
        $this->token = base64_encode(env('ALEGRA_EMAIL') . ':' . env('ALEGRA_TOKEN'));
    }

    /**
     * Emisión estricta de CFDI 4.0 a través de la API de Alegra México.
     */
    public function emitirCFDI(array $invoiceData)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . $this->token,
            'Content-Type' => 'application/json'
        ])->post("{$this->baseUrl}/invoices", $invoiceData);

        if ($response->successful()) {
            Log::info("CFDI 4.0 Emitido correctamente con Total: " . ($invoiceData['total'] ?? 'N/A'));
            return $response->json();
        }

        Log::error('Error emitiendo CFDI 4.0 en Alegra: ' . $response->body());
        throw new \Exception('Error de facturación electrónica Alegra.');
    }

    /**
     * Sincronización automática de facturación para ventas de Mercado Libre.
     */
    public function syncMeliOrder(array $orderData)
    {
        Log::info("Sincronizando orden de Mercado Libre hacia Alegra para Facturación Automática.");

        $invoiceItems = array_map(function($item) {
            return [
                'id' => 1, // En producción se busca dinámicamente el ID del producto en Alegra usando el SKU
                'price' => $item['unit_price'],
                'quantity' => $item['quantity'],
            ];
        }, $orderData['order_items']);

        $invoice = [
            'date' => date('Y-m-d'),
            'dueDate' => date('Y-m-d'),
            'client' => ['id' => 1], // ID del cliente mostrador global
            'items' => $invoiceItems,
            'costCenter' => $this->getCostCenterId('CC-103'), // Centro de costos: The Trip
            'stamp' => [
                'generateStamp' => true // Obligar timbrado CFDI 4.0
            ]
        ];

        return $this->emitirCFDI($invoice);
    }

    /**
     * Asignación de Centros de Costos Obligatorios
     */
    protected function getCostCenterId(string $code)
    {
        $centers = [
            'CC-101' => 101, // Matriz (Grupo Basecamp 420)
            'CC-102' => 102, // Basecamp 420 Adventure
            'CC-103' => 103, // The Trip Smokeshop
            'CC-104' => 104, // Cima Digital
            'CC-105' => 105, // Papelería Madera
            'CC-106' => 106, // Club Trepacerros
            'CC-201' => 201, // Inquilinos / Aliados SaaS
        ];
        
        return $centers[$code] ?? 101; // Default a Matriz
    }
}
