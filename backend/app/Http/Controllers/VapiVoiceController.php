<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class VapiVoiceController extends Controller
{
    /**
     * Atendiendo Webhooks de Voz IA de Vapi.ai (Twilio trunk)
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->all();
        
        // Interceptar la llamada a función (Tool Call) de la IA
        if (isset($payload['message']['type']) && $payload['message']['type'] === 'tool-calls') {
            $toolCalls = $payload['message']['toolCalls'];
            
            foreach ($toolCalls as $call) {
                // Ejecución de la herramienta evaluateLeadQualification
                if ($call['function']['name'] === 'evaluateLeadQualification') {
                    $args = json_decode($call['function']['arguments'], true);
                    
                    // Analizar intención, presupuesto y urgencia
                    $score = $this->calculateScore($args);
                    
                    Log::info("Lead Evaluado por IA. Score: $score", $args);
                    
                    if ($score >= 80) {
                        // Enviar alerta urgente al equipo humano por WhatsApp Cloud API
                        $this->sendWhatsAppAlert($args, $score);
                        
                        // Responder al LLM para transferir inmediatamente (Equivalente TwiML bridgeCallToOperator)
                        return response()->json([
                            'results' => [[
                                'toolCallId' => $call['id'],
                                'result' => [
                                    'action' => 'bridgeCallToOperator',
                                    'transferNumber' => env('OPERATOR_PHONE_NUMBER'),
                                    'message' => 'El lead es altamente calificado. Transfiriendo llamada a un humano ahora.'
                                ]
                            ]]
                        ]);
                    }

                    // Score menor, dejar que la IA continúe sola
                    return response()->json([
                        'results' => [[
                            'toolCallId' => $call['id'],
                            'result' => [
                                'action' => 'continueConversation',
                                'message' => "El lead tiene score $score. Responde amablemente y recaba datos de contacto."
                            ]
                        ]]
                    ]);
                }
            }
        }
        
        return response()->json(['status' => 'ok']);
    }

    private function calculateScore(array $args): int
    {
        $score = 0;
        
        $intent = strtolower($args['intent'] ?? '');
        $urgency = strtolower($args['urgency'] ?? '');
        $budget = (float)($args['budget'] ?? 0);

        if (in_array($intent, ['buy', 'purchase', 'hire'])) $score += 40;
        if ($budget >= 500) $score += 30; // Presupuesto alto
        if ($urgency === 'high') $score += 30; // Urgencia alta
        
        return $score;
    }

    private function sendWhatsAppAlert(array $data, int $score)
    {
        $token = env('WHATSAPP_CLOUD_TOKEN');
        $phoneId = env('WHATSAPP_PHONE_ID');
        $salesPhone = env('SALES_TEAM_PHONE');

        Http::withToken($token)
            ->post("https://graph.facebook.com/v17.0/{$phoneId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $salesPhone,
                'type' => 'text',
                'text' => [
                    'body' => "🔥 *LEAD CALIENTE* (Score: {$score})\n\n" .
                              "La IA está transfiriendo un prospecto calificado.\n" .
                              "Intención: {$data['intent']}\n" .
                              "Presupuesto aprox: $" . ($data['budget'] ?? 'N/A')
                ]
            ]);
    }
}
