<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SubscriptionController extends Controller
{
    /**
     * Gestor de Suscripciones Recurrentes B2B (/preapproval) para el cobro mensual a las Marcas Aliadas.
     * Utiliza la API de Preapproval de Mercado Pago.
     */
    public function createSaaSSubscription(Request $request)
    {
        $request->validate([
            'tenant_id' => 'required|string',
            'plan_title' => 'required|string',
            'amount' => 'required|numeric',
            'payer_email' => 'required|email'
        ]);

        $accessToken = env('MP_ACCESS_TOKEN');

        $payload = [
            'reason' => 'Suscripción B2B E-commerce - ' . $request->plan_title,
            'auto_recurring' => [
                'frequency' => 1,
                'frequency_type' => 'months',
                'transaction_amount' => $request->amount,
                'currency_id' => 'MXN'
            ],
            'back_url' => 'https://basecamp420.com/b2b/success',
            'payer_email' => $request->payer_email,
            'status' => 'pending'
        ];

        $response = Http::withToken($accessToken)
            ->post('https://api.mercadopago.com/preapproval', $payload);

        if ($response->successful()) {
            $data = $response->json();
            
            // Asignar al centro de costos de aliados en DB
            Log::info("Suscripción generada (CC-201) para tenant {$request->tenant_id}: {$data['init_point']}");
            
            return response()->json([
                'init_point' => $data['init_point'],
                'preapproval_id' => $data['id']
            ]);
        }

        Log::error('Fallo al generar preapproval B2B: ' . $response->body());
        return response()->json(['error' => 'No se pudo crear la suscripción recurrente.'], 500);
    }
}
