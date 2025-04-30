"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function addProduct(product: {
  name: string
  brand: string
  description: string
  price: number
  cost: number
  profitMargin: number
  discount: number
  category: string
  stock_quantity: number
  image_urls: string[]
  colors?: { name: string; hex_value: string }[]
  variants?: { key: string; value: string }[]
  isFeatured?: boolean
  isNewArrival?: boolean
  isBestSeller?: boolean
  isDailyOffer?: boolean
  newArrivalHeroSection?: boolean
}) {
  try {
    const timestamp = new Date().toISOString()

    const newProduct = {
      ...product,
      rating: 0,
      reviews: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const { data, error } = await supabase.from("products").insert([newProduct]).select()

    if (error) {
      console.error("Supabase insert error:", error)
      throw error
    }

    if (data && data.length > 0) {
      return { success: true, data: data[0] }
    } else {
      throw new Error("No data returned from insert operation")
    }
  } catch (error) {
    console.error("Failed to add product:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to add product" }
  } finally {
    revalidatePath("/admin/products")
  }
}
