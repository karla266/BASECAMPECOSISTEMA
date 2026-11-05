export interface MeliOrderItem {
  item: {
    id: string;
    seller_sku?: string;
  };
  quantity: number;
}

export interface MeliOrder {
  id: string;
  status: string;
  order_items?: MeliOrderItem[];
}

function authHeader(accessToken: string): string {
  return `Bearer ${accessToken}`;
}

export async function updateMeliStock(itemId: string, quantity: number, accessToken: string) {
  const response = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
    method: "PUT",
    headers: {
      Authorization: authHeader(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ available_quantity: quantity }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Mercado Libre stock update failed (${response.status}): ${detail}`);
  }

  return response.json();
}

export async function fetchMeliOrder(orderId: string, accessToken: string): Promise<MeliOrder> {
  const response = await fetch(`https://api.mercadolibre.com/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: authHeader(accessToken),
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Mercado Libre order fetch failed (${response.status}): ${detail}`);
  }

  return (await response.json()) as MeliOrder;
}
