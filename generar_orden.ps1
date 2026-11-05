$token = $testToken
if (-not $token -or -not $token.StartsWith("TEST-")) {
    $token = (Read-Host "Pega el Access Token de la pestaña 'Prueba' (debe iniciar con TEST-)").Trim(" `'`"")
}

$headers = @{
    "Authorization" = "Bearer $token"
    "X-Idempotency-Key" = [System.Guid]::NewGuid().ToString()
    "Content-Type" = "application/json"
}

$orderBody = @{
    type = "point"
    external_reference = "TEST-" + (Get-Random -Minimum 1000 -Maximum 9999)
    transactions = @{
        payments = @(
            @{ amount = "25.00" }
        )
    }
    config = @{
        point = @{ terminal_id = "NEWLAND_N950__SBX0000001" }
    }
} | ConvertTo-Json -Depth 5

Write-Host "Creando orden en Sandbox..." -ForegroundColor Cyan

try {
    $resp = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/orders" -Method Post -Headers $headers -Body $orderBody
    $orderId = $resp.id
    Write-Host "[OK] Orden creada: $orderId" -ForegroundColor Green

    # Simular estado pagado
    $simBody = @{ status = "processed" } | ConvertTo-Json
    Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/orders/$orderId/events" -Method Post -Headers @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" } -Body $simBody
    Write-Host "[OK] Pago simulado como exitoso." -ForegroundColor Green

    Write-Host "`n=======================================================" -ForegroundColor Yellow
    Write-Host "COPIA ESTE ORDER ID Y PEGALO EN EL MODAL:" -ForegroundColor Yellow
    Write-Host $orderId -ForegroundColor Green
    Write-Host "=======================================================`n" -ForegroundColor Yellow
} catch {
    Write-Host "[!] Probando con endpoint alternativo de Point..." -ForegroundColor Yellow
    try {
        $pBody = @{ amount = 500 } | ConvertTo-Json
        $pResp = Invoke-RestMethod -Uri "https://api.mercadopago.com/point/integration-api/devices/NEWLAND_N950__SBX0000001/payment-intents" -Method Post -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } -Body $pBody
        
        Write-Host "`n=======================================================" -ForegroundColor Yellow
        Write-Host "COPIA ESTE ORDER ID Y PEGALO EN EL MODAL:" -ForegroundColor Yellow
        Write-Host $pResp.id -ForegroundColor Green
        Write-Host "=======================================================`n" -ForegroundColor Yellow
    } catch {
        Write-Host "[!] Error:" $_.Exception.Message -ForegroundColor Red
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            if ($stream) {
                $reader = New-Object System.IO.StreamReader($stream)
                Write-Host $reader.ReadToEnd() -ForegroundColor Yellow
            }
        }
    }
}
