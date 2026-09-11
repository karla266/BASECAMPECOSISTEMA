export async function updateMeliStock(itemId: string, quantity: number, accessToken: string) {
  const response = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ available_quantity: quantity }),
  });

  return response.json();
}
