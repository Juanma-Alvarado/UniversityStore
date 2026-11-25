import { CartView } from "@/components/cart-view";

export const metadata = {
  title: "Tu carrito",
  robots: { index: false },
};

export default function CarritoPage() {
  return <CartView />;
}
