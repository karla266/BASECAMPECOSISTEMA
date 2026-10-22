import { parseOrderNotification } from '@/lib/mercadolibreOrders';

describe('parseOrderNotification', () => {
  it('parsea una notificación orders_v2 válida', () => {
    const result = parseOrderNotification({
      topic: 'orders_v2',
      resource: '/orders/1234567890',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.notification.orderId).toBe('1234567890');
      expect(result.notification.topic).toBe('orders_v2');
      expect(result.notification.resource).toBe('/orders/1234567890');
    }
  });

  it('extrae el id aunque el resource tenga más segmentos', () => {
    const result = parseOrderNotification({
      topic: 'orders_v2',
      resource: 'https://api.mercadolibre.com/orders/99',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.notification.orderId).toBe('99');
  });

  it('rechaza topics no soportados', () => {
    const result = parseOrderNotification({ topic: 'items', resource: '/items/1' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('topic no soportado');
  });

  it('rechaza resource ausente', () => {
    const result = parseOrderNotification({ topic: 'orders_v2' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('resource');
  });

  it('rechaza resource sin id', () => {
    const result = parseOrderNotification({ topic: 'orders_v2', resource: '/orders/' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('id de orden');
  });

  it('rechaza cuerpos que no son objetos', () => {
    expect(parseOrderNotification(null).ok).toBe(false);
    expect(parseOrderNotification('texto').ok).toBe(false);
    expect(parseOrderNotification(42).ok).toBe(false);
  });
});
