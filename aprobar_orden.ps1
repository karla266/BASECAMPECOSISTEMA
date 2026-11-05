$testToken = "APP_USR-8592051780730380-101815-e136dbc3d0017ca1777ebff2b04163a6-3775863764"
$orderId = "ORDTST01MGDPNB9ZERDXZFKJ64B9CPJ7"

$headers = @{
    "Authorization"     = "Bearer $testToken"
    "X-Idempotency-Key" = [System.Guid]::NewGuid().ToString()
    "Content-Type"      = "application/json"
}

Write-Host "1. Consultando estado actual de la orden $orderId..." -ForegroundColor Cyan
try {
    $ord = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/orders/$orderId" -Headers @{ "Authorization" = "Bearer $testToken" }
    Write-Host "   -> Estado actual: $($ord.status)" -ForegroundColor Yellow
} catch {
    Write-Host "   [!] Error consultando orden: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Enviando evento de cobro aprobado..." -ForegroundColor Cyan

$attempts = @(
    @{ url = "https://api.mercadopago.com/v1/orders/$orderId/events"; body = @{ status = "processed" } },
    @{ url = "https://api.mercadopago.com/v1/orders/$orderId/events"; body = @{ type = "payment"; status = "approved" } },
    @{ url = "https://api.mercadopago.com/v1/orders/$orderId/status"; body = @{ status = "processed" } }
)

foreach ($att in $attempts) {
    try {
        $json = $att.body | ConvertTo-Json
        $headers["X-Idempotency-Key"] = [System.Guid]::NewGuid().ToString()
        $resp = Invoke-RestMethod -Uri $att.url -Method Post -Headers $headers -Body $json
        Write-Host "   [OK] Solicitud aceptada en $($att.url)" -ForegroundColor Green
        break
    } catch {
        if ($_.Exception.Response) {
            $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "   [x] Respuesta servidor: $($sr.ReadToEnd())" -ForegroundColor DarkYellow
        }
    }
}

Write-Host "`n3. Verificando estado final..." -ForegroundColor Cyan
try {
    $check = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/orders/$orderId" -Headers @{ "Authorization" = "Bearer $testToken" }
    Write-Host "   -> Estado resultante: $($check.status)" -ForegroundColor Green
} catch {
    Write-Host "   [!] Error verificando orden" -ForegroundColor Red
}
