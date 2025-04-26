import { supabase } from "@/lib/supabase"
import ProductSlider from "@/components/product-slider"

async function getNewArrivals() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("isNewArrival", true)
      .order("id", { ascending: false })

    if (error) {
      console.error("Error fetching new arrivals:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching new arrivals:", error)
    return []
  }
}

export default async function NewArrivals({ title, lng }: { title: string; lng: string }) {
  const products = await getNewArrivals()

  return <ProductSlider title={title} products={products} loading={false} lng={lng} />
}
