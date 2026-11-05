$testToken = "APP_USR-8592051780730380-101815-e136dbc3d0017ca1777ebff2b04163a6-3775863764"
$publicKey = "APP_USR-0d1fa276-f9b5-4ab4-909f-57b2581b8d76"

Write-Host "1. Creando orden fresca en Orders API..." -ForegroundColor Cyan

$idempotency = [System.Guid]::NewGuid().ToString()
$headers = @{
    "Authorization"     = "Bearer $testToken"
    "X-Idempotency-Key" = $idempotency
    "Content-Type"      = "application/json"
}

$orderBody = @{
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
    $order = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/orders" -Method Post -Headers $headers -Body $orderBody
    $orderId = $order.id
    Write-Host "   [OK] Orden generada: $orderId" -ForegroundColor Green

    Write-Host "`n2. Aprobando la orden mediante tarjeta de prueba (APRO)..." -ForegroundColor Cyan
    
    # Tokenizar tarjeta de aprobacion garantizada
    $cardBody = @{
        card_number      = "4242424242424242"
        expiration_month = 11
        expiration_year  = 2028
        security_code    = "123"
        cardholder       = @{
            name           = "APRO"
            identification = @{ type = "RFC"; number = "GUKD900101XYZ" }
        }
    } | ConvertTo-Json

    $tokenResp = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/card_tokens?public_key=$publicKey" -Method Post -ContentType "application/json" -Body $cardBody
    $cardToken = $tokenResp.id

    # Asociar pago aprobado a la orden recién creada
    $payBody = @{
        transaction_amount = 25.00
        token              = $cardToken
        description        = "Liquidacion QA Basecamp"
        installments       = 1
        payment_method_id  = "visa"
        payer              = @{ email = "test_user_887327499@testuser.com" }
        order              = @{ type = "mercadopago"; id = $orderId }
    } | ConvertTo-Json

    try {
        $payResp = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/payments" -Method Post -Headers @{
            Authorization       = "Bearer $testToken"
            "X-Idempotency-Key" = [System.Guid]::NewGuid().ToString()
            "Content-Type"      = "application/json"
        } -Body $payBody
        Write-Host "   [OK] Pago vinculado exitosamente. Estatus: $($payResp.status)" -ForegroundColor Green
    } catch {
        # Si el enlace directo por payments no aplica en SBX, forzar via simulador de eventos
        $simBody = @{ type = "payment"; status = "approved" } | ConvertTo-Json
        Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/orders/$orderId/events" -Method Post -Headers @{
            Authorization       = "Bearer $testToken"
            "X-Idempotency-Key" = [System.Guid]::NewGuid().ToString()
            "Content-Type"      = "application/json"
        } -Body $simBody | Out-Null
        Write-Host "   [OK] Estado aprobado inyectado a la orden." -ForegroundColor Green
    }

    Write-Host "`n=======================================================" -ForegroundColor Yellow
    Write-Host ">>> COPIA ESTE ORDER ID Y PÉGALO EN LA VENTANA: <<<" -ForegroundColor Yellow
    Write-Host "$orderId" -ForegroundColor Green
    Write-Host "=======================================================`n" -ForegroundColor Yellow

} catch {
    Write-Host "[!] Error creando orden:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host $sr.ReadToEnd() -ForegroundColor Yellow
    }
}
