import { Suspense } from "react"
import { redirect } from "next/navigation"
import CheckoutClient  from "./checkout-client"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers'

interface CheckoutPageProps {
  params: Promise<{ lng: string }>;
}

export default async function CheckoutPage({ params: paramsPromise }: CheckoutPageProps) {
  const { lng } = await paramsPromise;
  
  // Get the current user
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) {
    redirect('/auth/sign-in')
  }

  // Get user's shipping information
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get active cart
  const { data: carts } = await supabase
    .from('carts')
    .select('id, created_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (!carts || carts.length === 0) {
    redirect('/cart')
  }

  const cart = carts[0]

  // Get cart items
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('id, product_id, quantity, price, discount')
    .eq('cart_id', cart.id)

  if (!cartItems || cartItems.length === 0) {
    redirect('/cart')
  }

  // Get associated products
  const productIds = cartItems.map(item => item.product_id)
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, discount, image_urls')
    .in('id', productIds)

  // Merge cart items with product data
  const productsMap = products?.reduce((map, product) => {
    map[product.id] = product
    return map
  }, {} as Record<string, any>) || {}

  const items = cartItems.map(item => {
    const product = productsMap[item.product_id]
    if (!product) return null

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      image: product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '/placeholder.svg',
      quantity: item.quantity
    }
  }).filter(Boolean) as CartItem[]

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity * (1 - item.discount / 100)
    return sum + itemTotal
  }, 0)
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + shipping

  // Get active promo codes
  const { data: promoCodes } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('is_active', true)
    .gt('end_date', new Date().toISOString())
    .lt('start_date', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutClient 
        initialItems={items}
        initialShippingDetails={userProfile ? {
          firstName: userProfile.first_name || "",
          lastName: userProfile.last_name || "",
          email: user.email || "",
          address: userProfile.address || "",
          city: userProfile.city || "",
          postalCode: userProfile.zip_code || "",
          state: userProfile.state || "",
          country: userProfile.country || "",
          phone: userProfile.phone || "",
        } : null}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        promoCodes={promoCodes || []}
        lng={lng}
      />
    </Suspense>
  )
}

interface CartItem {
  id: string
  name: string
  price: number
  discount: number
  image: string
  quantity: number
}
