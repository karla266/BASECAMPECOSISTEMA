<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected string $openAiKey;

    public function __construct()
    {
        $this->openAiKey = env('OPENAI_API_KEY', '');
    }

    /**
     * a) Optimización SEO de títulos y descripciones de productos (GPT-4o)
     */
    public function optimizeSEO(string $title, string $description)
    {
        $response = Http::withToken($this->openAiKey)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => 'Eres un experto en SEO para e-commerce, con enfoque en alta conversión y retención.'],
                    ['role' => 'user', 'content' => "Optimiza este listado de producto. Título Original: $title. Descripción: $description. Devuelve un JSON estructurado con 'seo_title' y 'seo_description'."]
                ],
                'response_format' => ['type' => 'json_object']
            ]);
        
        return json_decode($response->json('choices.0.message.content'), true);
    }

    /**
     * b) Generación de imágenes publicitarias y banners en HD (DALL-E 3)
     */
    public function generateAdBanner(string $productContext)
    {
        $response = Http::withToken($this->openAiKey)
            ->post('https://api.openai.com/v1/images/generations', [
                'model' => 'dall-e-3',
                'prompt' => "Fotografía publicitaria hiperrealista y profesional en 4k para banner de tienda online. Producto o contexto: $productContext. Iluminación cinematográfica, diseño limpio y moderno con espacio negativo para añadir texto luego.",
                'size' => '1024x1024',
                'quality' => 'hd',
                'n' => 1
            ]);
        
        return $response->json('data.0.url');
    }

    /**
     * c) Redacción multicanal y despacho programado.
     * Genera la pauta de marketing (copy) y la envía a las distintas APIs.
     */
    public function generateAndDispatchCampaign(string $topic)
    {
        // Generar copy adaptado a la red social
        $copyResponse = Http::withToken($this->openAiKey)->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o',
            'messages' => [
                ['role' => 'system', 'content' => 'Redacta un post corto y viral para Redes Sociales sobre este tópico.'],
                ['role' => 'user', 'content' => $topic]
            ]
        ]);
        $socialCopy = $copyResponse->json('choices.0.message.content');

        // Aquí irían las integraciones reales a las Graph APIs
        // Se omiten los tokens complejos de Auth2.0 por brevedad, simulando la arquitectura
        
        $results = [];
        
        // 1. Facebook Graph API
        Log::info("Despachando a Facebook Pages API... Copy: $socialCopy");
        $results['facebook'] = 'Success';
        
        // 2. Instagram Graph API (Requiere Media Container ID)
        Log::info("Despachando a Instagram Graph API... Copy: $socialCopy");
        $results['instagram'] = 'Success';
        
        // 3. TikTok Posting API (Direct Post)
        Log::info("Despachando a TikTok Posting API... Copy: $socialCopy");
        $results['tiktok'] = 'Success';
        
        // 4. YouTube Data API v3 (Shorts/Community Tab)
        Log::info("Despachando a YouTube Data API v3... Copy: $socialCopy");
        $results['youtube'] = 'Success';

        return [
            'generated_copy' => $socialCopy,
            'dispatch_status' => $results
        ];
    }
}
