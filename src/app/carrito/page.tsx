import { CartView } from "@/components/cart-view";
import { isWompiConfigured } from "@/lib/wompi";

export const metadata = {
  title: "Tu carrito",
  robots: { index: false },
};

// Con las llaves de Wompi se cobra en línea; sin ellas (pagos en pausa) el
// pedido se registra y se envía por WhatsApp a cada emprendimiento.
export default function CarritoPage() {
  return <CartView checkoutMode={isWompiConfigured() ? "wompi" : "whatsapp"} />;
}
