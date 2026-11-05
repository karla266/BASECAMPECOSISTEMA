$testToken = "APP_USR-8592051780730380-101815-e136dbc3d0017ca1777ebff2b04163a6-3775863764"
$idempotencyKey = [System.Guid]::NewGuid().ToString()

$headers = @{
    "Authorization" = "Bearer $testToken"
    "X-Idempotency-Key" = $idempotencyKey
    "Content-Type" = "application/json"
}

# 1. Crear la orden de prueba en Point (terminal virtual SBX0000001)
$orderBody = @{
    type = "point"
    external_reference = "TEST-ORD-" + (Get-Random -Minimum 1000 -Maximum 9999)
    transactions = @{
        payments = @(
            @{
                amount = "25.00"
            }
        )
    }
    config = @{
        point = @{
            terminal_id = "NEWLAND_N950__SBX0000001"
        }
    }
} | ConvertTo-Json -Depth 5

Write-Host "Generando orden de prueba en Sandbox..." -ForegroundColor Cyan

try {
    $orderResp = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/orders" -Method Post -Headers $headers -Body $orderBody
    $orderId = $orderResp.id
    Write-Host "[OK] Orden creada con ID: $orderId" -ForegroundColor Green

    # 2. Simular pago aprobado (processed)
    Write-Host "Simulando pago como procesado (processed)..." -ForegroundColor Cyan
    $simHeaders = @{
        "Authorization" = "Bearer $testToken"
        "Content-Type" = "application/json"
    }
    $simBody = @{
        status = "processed"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/orders/$orderId/events" -Method Post -Headers $simHeaders -Body $simBody
        Write-Host "[OK] Estado de orden simulado como procesado exitosamente." -ForegroundColor Green
    } catch {
        # Respaldo de endpoint de simulación
        Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/orders/$orderId/status" -Method Post -Headers $simHeaders -Body $simBody
        Write-Host "[OK] Estado simulado exitosamente." -ForegroundColor Green
    }

    Write-Host "`n=======================================================" -ForegroundColor Yellow
    Write-Host ">>> COPIA ESTE ORDER ID Y PÉGALO EN EL MODAL: <<<" -ForegroundColor Yellow
    Write-Host "$orderId" -ForegroundColor Green
    Write-Host "=======================================================`n" -ForegroundColor Yellow

} catch {
    Write-Host "[!] Error al generar la orden:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        if ($stream) {
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Host $reader.ReadToEnd() -ForegroundColor Yellow
        }
    }
}
