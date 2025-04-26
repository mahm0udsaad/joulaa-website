import { supabase } from "@/lib/supabase"
import ProductSlider from "@/components/product-slider"

async function getTrendingProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or("isBestSeller.eq.true,isFeatured.eq.true")
      .order("id", { ascending: false })

    if (error) {
      console.error("Error fetching trending products:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching trending products:", error)
    return []
  }
}

export default async function TrendingProducts({ title, lng }: { title: string; lng: string }) {
  const products = await getTrendingProducts()

  return <ProductSlider title={title} products={products} loading={false} lng={lng} />
}
