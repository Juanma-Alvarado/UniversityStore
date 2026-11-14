import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/products";

export const metadata = {
  title: "Productos · UniversityStore",
};

export default async function ProductosPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-24">
      <h1 className="mb-10 font-display text-4xl font-black">Productos</h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-foreground-soft">Todavía no hay productos cargados.</p>
      )}
    </main>
  );
}
