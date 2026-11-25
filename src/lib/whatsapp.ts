/** Link que abre WhatsApp con el mensaje ya escrito. `phone`: indicativo + número, solo dígitos. */
export function whatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
