<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tenant;

class TenantSettingsController extends Controller
{
    /**
     * Actualizar la plantilla visual de un tenant dinámicamente.
     */
    public function updateTemplate(Request $request, string $tenantId)
    {
        $validated = $request->validate([
            'template' => 'required|string|in:smokeshop-dark,adventure-outdoor,service-minimal'
        ]);

        $tenant = Tenant::findOrFail($tenantId);
        
        // Actualizamos en la data JSON manejada por stancl/tenancy
        $tenant->update([
            'template' => $validated['template']
        ]);

        return response()->json([
            'message' => 'Plantilla SaaS actualizada exitosamente.',
            'tenant_id' => $tenant->id,
            'active_template' => $tenant->template
        ]);
    }
}
