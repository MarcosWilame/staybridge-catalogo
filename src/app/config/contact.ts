export const WHATSAPP_PHONE = '5588997993046';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}`;

export function getWhatsAppUrl(message?: string) {
  if (!message) return WHATSAPP_URL;

  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message?: string) {
  window.open(getWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
}
