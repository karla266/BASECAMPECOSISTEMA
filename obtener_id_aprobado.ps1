$testToken = "APP_USR-8592051780730380-101815-e136dbc3d0017ca1777ebff2b04163a6-3775863764"
$publicKey = "APP_USR-0d1fa276-f9b5-4ab4-909f-57b2581b8d76"

Write-Host "1. Buscando pagos aprobados existentes en Sandbox..." -ForegroundColor Cyan

$approvedOrderId = $null
$approvedPaymentId = $null

try {
    $search = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=10" -Headers @{ Authorization = "Bearer $testToken" }
    foreach ($p in $search.results) {
        if ($p.status -eq "approved") {
            $approvedPaymentId = $p.id
            if ($p.order -and $p.order.id) {
                $approvedOrderId = $p.order.id
            }
            Write-Host "   [OK] Encontrado pago aprobado existente ID: $approvedPaymentId" -ForegroundColor Green
            break
        }
    }
} catch {
    Write-Host "   [i] No se recuperaron pagos previos." -ForegroundColor DarkGray
}

# Si no hay pagos aprobados, generar uno nuevo garantizado en Sandbox
if (-not $approvedOrderId -and -not $approvedPaymentId) {
    Write-Host "`n2. Generando pago de prueba con estatus APROBADO..." -ForegroundColor Cyan
    try {
        # Tokenizar tarjeta de prueba de aprobacion inmediata (APRO)
        $cardBody = @{
            card_number      = "4242424242424242"
            expiration_month = 11
            expiration_year  = 2028
            security_code    = "123"
            cardholder       = @{
                name           = "APRO"
                identification = @{
                    type   = "RFC"
                    number = "GUKD900101XYZ"
                }
            }
        } | ConvertTo-Json

        $tokenResp = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/card_tokens?public_key=$publicKey" -Method Post -ContentType "application/json" -Body $cardBody
        $cardToken = $tokenResp.id

        # Crear el pago aprobado
        $payBody = @{
            transaction_amount = 100.00
            token              = $cardToken
            description        = "Prueba Calidad Basecamp 420"
            installments       = 1
            payment_method_id  = "visa"
            payer              = @{
                email = "test_user_887327499@testuser.com"
            }
        } | ConvertTo-Json

        $idempotency = [System.Guid]::NewGuid().ToString()
        $payResp = Invoke-RestMethod -Uri "https://api.mercadopago.com/v1/payments" -Method Post -Headers @{
            Authorization       = "Bearer $testToken"
            "X-Idempotency-Key" = $idempotency
            "Content-Type"      = "application/json"
        } -Body $payBody

        $approvedPaymentId = $payResp.id
        if ($payResp.order -and $payResp.order.id) {
            $approvedOrderId = $payResp.order.id
        }
        Write-Host "   [OK] Pago generado exitosamente con estatus: $($payResp.status)" -ForegroundColor Green
    } catch {
        Write-Host "   [!] Error al generar pago:" $_.Exception.Message -ForegroundColor Red
        if ($_.Exception.Response) {
            $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host $sr.ReadToEnd() -ForegroundColor Yellow
        }
    }
}

Write-Host "`n=======================================================" -ForegroundColor Yellow
if ($approvedOrderId) {
    Write-Host ">>> OPCION PRINCIPAL (Order ID):" -ForegroundColor Cyan
    Write-Host "$approvedOrderId" -ForegroundColor Green
}
if ($approvedPaymentId) {
    Write-Host ">>> OPCION ALTERNATIVA (Payment ID):" -ForegroundColor Cyan
    Write-Host "$approvedPaymentId" -ForegroundColor Green
}
Write-Host "=======================================================`n" -ForegroundColor Yellow
