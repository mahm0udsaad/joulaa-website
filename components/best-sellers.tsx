import { supabase } from "@/lib/supabase";
import ProductSlider from "@/components/product-slider";

async function getBestSellers() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("isBestSeller", true)
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching best sellers:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return [];
  }
}

export default async function BestSellers({
  title,
  lng,
}: {
  title: string;
  lng: string;
}) {
  const products = await getBestSellers();

  return (
    <ProductSlider
      title={title}
      products={products}
      loading={false}
      lng={lng}
    />
  );
}
