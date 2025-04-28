import { supabase } from "@/lib/supabase";
import ProductDetailsClient from "@/components/product-details-client";

export default async function ProductPage({
  params: paramsPromise,
}: {
  params: Promise<{ lng: string; id: string }>;
}) {
  const { lng, id: productId } = await paramsPromise;

  // Fetch product
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-red-500 mb-6">
          {error?.message || "This product could not be found."}
        </p>
      </div>
    );
  }

  // Fetch similar products
  // First try to get products from same category
  let { data: similarProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", product.category_id)
    .neq("id", productId)
    .limit(4);

  // If no products found in same category, get any products
  if (!similarProducts?.length) {
    const { data: anyProducts } = await supabase
      .from("products")
      .select("*")
      .neq("id", productId)
      .limit(4);
    similarProducts = anyProducts;
  }

  return (
    <ProductDetailsClient
      product={product}
      similarProducts={similarProducts || []}
      lng={lng}
    />
  );
}
