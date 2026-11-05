$testToken = "APP_USR-8592051780730380-101815-e136dbc3d0017ca1777ebff2b04163a6-3775863764"
$headers = @{
    "Authorization" = "Bearer $testToken"
    "Content-Type"  = "application/json"
}

Write-Host "=== 1. Buscando órdenes existentes en la cuenta de prueba ===" -ForegroundColor Cyan
$targetOrderId = $null

try {
    $search = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/orders/search" -Headers $headers -Method Get
    if ($search.results -and $search.results.Count -gt 0) {
        foreach ($ord in $search.results) {
            Write-Host "   Orden encontrada: $($ord.id) | Estatus actual: $($ord.status)" -ForegroundColor DarkCyan
            if ($ord.status -eq "processed") {
                $targetOrderId = $ord.id
                Write-Host "   [!] Ya existe una orden previamente aprobada." -ForegroundColor Green
                break
            } elseif ($ord.status -in @("created", "at_terminal", "action_required")) {
                $targetOrderId = $ord.id
            }
        }
    }
} catch {
    Write-Host "   [i] Búsqueda no disponible o sin órdenes previas." -ForegroundColor DarkGray
}

# 2. Si no hay orden reutilizable, crear una nueva limpiando cualquier conflicto
if (-not $targetOrderId) {
    Write-Host "`n=== 2. Creando nueva orden en Sandbox ===" -ForegroundColor Cyan
    $headers["X-Idempotency-Key"] = [System.Guid]::NewGuid().ToString()

    $orderPayload = @{
        type                = "point"
        external_reference  = "QA-" + (Get-Random -Minimum 10000 -Maximum 99999)
        transactions        = @{
            payments = @(
                @{ amount = "25.00" }
            )
        }
        config              = @{
            point = @{
                terminal_id = "NEWLAND_N950__SBX0000001"
            }
        }
    } | ConvertTo-Json -Depth 5

    try {
        $newOrder = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/orders" -Method Post -Headers $headers -Body $orderPayload
        $targetOrderId = $newOrder.id
        Write-Host "   [OK] Nueva orden creada: $targetOrderId" -ForegroundColor Green
    } catch {
        # Si da 409 (conflicto por orden pendiente en la terminal), cancelar la orden bloqueada
        Write-Host "   [!] Conflicto en terminal. Intentando liberar..." -ForegroundColor Yellow
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errJson = $reader.ReadToEnd()
            if ($errJson -match '"id"\s*:\s*"([^"]+)"') {
                $targetOrderId = $matches[1]
                Write-Host "   [OK] Recuperado ID de orden activa: $targetOrderId" -ForegroundColor Green
            }
        } catch {}
    }
}

if (-not $targetOrderId) {
    Write-Host "[!] No se pudo obtener ni generar un Order ID." -ForegroundColor Red
    return
}

# 3. Forzar el estado aprobado oficial mediante el simulador de eventos de MP
Write-Host "`n=== 3. Inyectando evento de cobro aprobado (processed) ===" -ForegroundColor Cyan
$eventHeaders = @{
    "Authorization"     = "Bearer $testToken"
    "X-Idempotency-Key" = [System.Guid]::NewGuid().ToString()
    "Content-Type"      = "application/json"
}

$eventPayload = @{
    status              = "processed"
    payment_method_type = "credit_card"
    payment_method_id   = "visa"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/orders/$targetOrderId/events" -Method Post -Headers $eventHeaders -Body $eventPayload
    Write-Host "   [OK] Evento enviado. Esperando 10 segundos a que Mercado Pago asiente el estado..." -ForegroundColor Green
    Start-Sleep -Seconds 10
} catch {
    Write-Host "   [!] Nota en evento: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. Validar el estado final
Write-Host "`n=== 4. Confirmando estatus final en Mercado Pago ===" -ForegroundColor Cyan
try {
    $check = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/orders/$targetOrderId" -Headers @{ "Authorization" = "Bearer $testToken" }
    Write-Host "   -> Estatus confirmado: $($check.status)" -ForegroundColor Green
} catch {
    Write-Host "   [i] Verificación final omitida." -ForegroundColor DarkGray
}

Write-Host "`n=======================================================" -ForegroundColor Yellow
Write-Host ">>> COPIA ESTE ORDER ID Y PÉGALO EN EL MODAL: <<<" -ForegroundColor Yellow
Write-Host "$targetOrderId" -ForegroundColor Green
Write-Host "=======================================================`n" -ForegroundColor Yellow
