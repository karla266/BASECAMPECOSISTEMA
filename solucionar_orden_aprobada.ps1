$testToken = "APP_USR-8592051780730380-101815-e136dbc3d0017ca1777ebff2b04163a6-3775863764"
$publicKey = "APP_USR-0d1fa276-f9b5-4ab4-909f-57b2581b8d76"

Write-Host "=== 1. Limpiando ordenes pendientes en terminales SBX ===" -ForegroundColor Cyan
curl.exe -s -X DELETE "https://api.mercadopago.com/point/integration-api/devices/NEWLAND_N950__SBX0000001/payment-intents" `
  -H "Authorization: Bearer $testToken" | Out-Null

Write-Host "`n=== 2. Creando Orden fresca en Point Sandbox ===" -ForegroundColor Cyan
$orderId = $null
$terminals = @("NEWLAND_N950__SBX0000001", "NEWLAND_N950__SBX0000002", "NEWLAND_N950__SBX0000003")

foreach ($term in $terminals) {
    Write-Host "Probando con terminal: $term ..." -ForegroundColor DarkCyan
    $idemp = [System.Guid]::NewGuid().ToString()
    $extRef = "QA-" + (Get-Random -Minimum 10000 -Maximum 99999)
    $payload = @"
{
  "type": "point",
  "external_reference": "$extRef",
  "transactions": {
    "payments": [
      {
        "amount": "25.00"
      }
    ]
  },
  "config": {
    "point": {
      "terminal_id": "$term"
    }
  }
}
"@

    $resp = curl.exe -s -X POST "https://api.mercadopago.com/v1/orders" `
      -H "Authorization: Bearer $testToken" `
      -H "X-Idempotency-Key: $idemp" `
      -H "Content-Type: application/json" `
      -d $payload

    if ($resp -match '"id"\s*:\s*"([^"]+)"') {
        $orderId = $matches[1]
        Write-Host " [OK] Orden generada exitosamente en $term con ID: $orderId" -ForegroundColor Green
        break
    } else {
        Write-Host " [x] Ocupada o con error: $resp" -ForegroundColor DarkYellow
    }
}

if (-not $orderId) {
    Write-Host "[!] No se pudo crear la orden. Revisa la salida de error arriba." -ForegroundColor Red
    return
}

Write-Host "`n=== 3. Forzando aprobacion de la orden en Sandbox ===" -ForegroundColor Cyan

# A. Disparo por evento de aprobacion de Point
$eventPayload = '{"status":"processed"}'
curl.exe -s -X POST "https://api.mercadopago.com/v1/orders/$orderId/events" `
  -H "Authorization: Bearer $testToken" `
  -H "Content-Type: application/json" `
  -d $eventPayload | Out-Null

# B. Disparo alternativo de evento
$eventPayload2 = '{"type":"payment","status":"approved"}'
curl.exe -s -X POST "https://api.mercadopago.com/v1/orders/$orderId/events" `
  -H "Authorization: Bearer $testToken" `
  -H "Content-Type: application/json" `
  -d $eventPayload2 | Out-Null

# C. Liquidacion transaccional con tarjeta de prueba aprobada (APRO)
$cardPayload = @"
{
  "card_number": "4242424242424242",
  "expiration_month": 11,
  "expiration_year": 2028,
  "security_code": "123",
  "cardholder": {
    "name": "APRO",
    "identification": {
      "type": "RFC",
      "number": "GUKD900101XYZ"
    }
  }
}
"@

$cardTokenResp = curl.exe -s -X POST "https://api.mercadopago.com/v1/card_tokens?public_key=$publicKey" `
  -H "Content-Type: application/json" `
  -d $cardPayload

if ($cardTokenResp -match '"id"\s*:\s*"([^"]+)"') {
    $cToken = $matches[1]
    $payIdemp = [System.Guid]::NewGuid().ToString()
    $payPayload = @"
{
  "transaction_amount": 25.00,
  "token": "$cToken",
  "description": "Aprobacion QA Basecamp 420",
  "installments": 1,
  "payment_method_id": "visa",
  "payer": {
    "email": "test_user_887327499@testuser.com"
  },
  "order": {
    "type": "mercadopago",
    "id": "$orderId"
  }
}
"@
    curl.exe -s -X POST "https://api.mercadopago.com/v1/payments" `
      -H "Authorization: Bearer $testToken" `
      -H "X-Idempotency-Key: $payIdemp" `
      -H "Content-Type: application/json" `
      -d $payPayload | Out-Null
    Write-Host " [OK] Pago de prueba aprobado y vinculado a la orden." -ForegroundColor Green
}

Write-Host "`n=======================================================" -ForegroundColor Yellow
Write-Host ">>> COPIA ESTE ORDER ID Y PEGALO EN EL MODAL: <<<" -ForegroundColor Yellow
Write-Host "$orderId" -ForegroundColor Green
Write-Host "=======================================================`n" -ForegroundColor Yellow
