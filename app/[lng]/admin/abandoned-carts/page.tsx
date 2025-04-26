import { Suspense } from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AbandonedCartsClient } from "./abandoned-carts-client"
import { Loader2 } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface Product {
  id: string
  name: string
  price: number
}

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
}

interface CartItem {
  id: string
  quantity: number
  product: Product | null
}

interface Cart {
  id: string
  status: string
  updated_at: string
  total_amount: number
  currency: string
  user_id: string
  items: CartItem[]
  user: User | null
}

async function getAbandonedCarts({
  page = 1,
  pageSize = 10
} = {}) {
  const supabase = createServerComponentClient({ cookies });
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  console.log(`🔍 STEP 1: Fetching basic cart information (range ${from}-${to})...`);
  const startTime1 = performance.now();
  
  // Step 1: Fetch basic cart information with pagination
  const { data: carts, error: cartsError, count } = await supabase
    .from("carts")
    .select('id, status, updated_at, total_amount, currency, user_id', { count: 'exact' })
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .range(from, to);

  
  if (cartsError) {
    return { carts: [], count: 0, page, pageSize, totalPages: 0 };
  }


  if (!carts || carts.length === 0) {
    console.log(`ℹ️ No carts found, returning empty result`);
    return { 
      carts: [], 
      count: 0, 
      page, 
      pageSize,
      totalPages: 0 
    };
  }
  
  // Step 2: Fetch cart items for all carts in the current page
  const cartIds = carts.map(cart => cart.id);
  console.log(`🔍 STEP 2: Fetching items for ${cartIds.length} carts...`);
  
  const { data: allCartItems, error: itemsError } = await supabase
    .from("cart_items")
    .select('id, quantity, cart_id, product_id')
    .in("cart_id", cartIds);
  
    
  if (itemsError) {
    return { 
      carts: carts.map(cart => ({ ...cart, items: [], user: null })), 
      count, 
      page, 
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize) 
    };
  }
  
  
  // Step 3: Fetch product details for all products in the cart items
  const productIds = [...new Set((allCartItems ?? []).map(item => item.product_id))];
  
  let products: Product[] = [];
  
  if (productIds.length > 0) {
    const { data: fetchedProducts, error: productsError } = await supabase
      .from("products")
      .select('id, name, price')
      .in("id", productIds);
      
    if (!productsError && fetchedProducts) {
      products = fetchedProducts;
    } else {
      console.error(`❌ STEP 3 ERROR: Failed to fetch products`, productsError);
    }
  }
  
  
  // Step 4: Fetch user information for all carts
  const userIds = [...new Set(carts.map(cart => cart.user_id).filter(Boolean))];
  console.log(`🔍 STEP 4: Fetching details for ${userIds.length} unique users...`);
  const startTime4 = performance.now();
  
  let users: User[] = [];
  
  if (userIds.length > 0) {
    const { data: fetchedUsers, error: usersError } = await supabase
      .from("users")
      .select('id, first_name, last_name, email')
      .in("id", userIds);
      
    if (!usersError && fetchedUsers) {
      users = fetchedUsers;
    } else {
      console.error(`❌ STEP 4 ERROR: Failed to fetch users`, usersError);
    }
  }
    
  // Step 5: Combine all data into the final structure
  
  const enrichedCarts: Cart[] = carts.map(cart => {
    const cartItems = (allCartItems ?? [])
      .filter(item => item.cart_id === cart.id)
      .map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: products.find(p => p.id === item.product_id) || null
      }));
      
    const user = users.find(u => u.id === cart.user_id) || null;
    
    return {
      ...cart,
      items: cartItems,
      user
    };
  });
  

  return { 
    carts: enrichedCarts, 
    count, 
    page,
    pageSize, 
    totalPages: Math.ceil((count ?? 0) / pageSize)
  };
}

export default async function AbandonedCartsPage({
  params: { lng },
}: {
  params: { lng: string }
}) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect("/")
  }

  const { carts: cartData, count, page, pageSize, totalPages } = await getAbandonedCarts()
  console.log(cartData);
  return (
    <div className="container mx-auto py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        }
      >
        <AbandonedCartsClient initialCarts={cartData} lng={lng} />
      </Suspense>
    </div>
  )
}
