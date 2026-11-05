$token = (Get-Content .env.production | Select-String "MP_ACCESS_TOKEN=").Line.Split("=")[1].Trim(" `'`"")
$deviceId = "NEWLAND_N950__N950NCBA01630764"

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    amount = 100
    description = "Prueba Basecamp 420"
} | ConvertTo-Json

Write-Host "Enviando cobro de prueba de $1.00 MXN a la terminal..." -ForegroundColor Cyan

try {
    $resp = Invoke-RestMethod -Uri "https://api.mercadopago.com/point/integration-api/devices/$deviceId/payment-intents" -Method Post -Headers $headers -Body $body
    Write-Host "[OK] ¡Orden enviada con éxito! Revisa la pantalla de la terminal." -ForegroundColor Green
    $resp | ConvertTo-Json -Depth 3
} catch {
    Write-Host "[!] Error al despachar a terminal:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        if ($stream) {
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Host $reader.ReadToEnd() -ForegroundColor Yellow
        }
    }
}
