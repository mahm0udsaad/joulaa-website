import { supabase } from "@/lib/supabase"
import ProductSlider from "@/components/product-slider"

async function getFeaturedProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("isFeatured", true)
      .order("id", { ascending: false })

    if (error) {
      console.error("Error fetching featured products:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return []
  }
}

export default async function FeaturedProducts({ title, lng }: { title: string; lng: string }) {
  const products = await getFeaturedProducts()

  return <ProductSlider title={title} products={products} loading={false} lng={lng} />
}
