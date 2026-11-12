export type ConversionEventName =
  | 'cta_click'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'purchase_confirmed'
  | 'b2b_lead_submitted'
  | 'pilot_registered';

export function trackConversionEvent(
  eventName: ConversionEventName,
  payload: Record<string, unknown> = {}
) {
  if (typeof window === 'undefined') return;
  const eventData = {
    event: eventName,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    ...payload,
  };

  const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(eventData);
}
