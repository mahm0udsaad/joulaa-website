import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function createOrder(
  userId: string | null,
  orderItems: any[],
  shippingAddress: string,
  billingAddress: string,
  totalAmount: number,
  shippingCost: number,
  taxAmount: number,
  discountAmount: number,
  paymentIntentId: string | null,
  paymentStatus: "paid" | "cash" = "paid",
) {
  try {
    const supabase = createClientComponentClient()

    // First, create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        total_amount: totalAmount,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        payment_intent_id: paymentIntentId,
        payment_status: paymentStatus,
        status: "processing",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    // Then, create the order items
    const orderItemsToInsert = orderItems.map((item) => {
      const unitPrice = Number(item.price || item.unit_price)
      return {
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name || item.product_name,
        quantity: item.quantity,
        unit_price: unitPrice,
        cost_price: unitPrice * 0.6,
        subtotal: unitPrice * item.quantity,
        color: item.selectedColor || null,
        shade: item.selectedShade || null,
        image_url: item.image_url || null,
      }
    })

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsToInsert)

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id)
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    return order
  } catch (error) {
    console.error("Error in createOrder:", error)
    throw error
  }
}

export async function getOrderById(orderId: string) {
  try {
    const supabase = createClientComponentClient()

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single()

    if (orderError) throw new Error(`Error fetching order: ${orderError.message}`)

    return order
  } catch (error) {
    console.error("Error in getOrderById:", error)
    throw error
  }
}

// Keep the original function name for backward compatibility
export async function getUserOrders(userId: string) {
  try {
    const supabase = createClientComponentClient()

    // Get all orders for the user with their order items
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (ordersError) throw new Error(`Error fetching orders: ${ordersError.message}`)

    return orders
  } catch (error) {
    console.error("Error in getUserOrders:", error)
    throw error
  }
}

// New function name (can be used in future code)
export async function getOrdersByUser(userId: string) {
  return getUserOrders(userId)
}

export async function getAllOrders() {
  try {
    const supabase = createClientComponentClient()

    // Get all orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        *,
        users:user_id (email, first_name, last_name)
      `,
      )
      .order("created_at", { ascending: false })

    if (ordersError) throw new Error(`Error fetching orders: ${ordersError.message}`)

    return orders
  } catch (error) {
    console.error("Error in getAllOrders:", error)
    throw error
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = createClientComponentClient()

    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)

    if (error) throw new Error(`Error updating order status: ${error.message}`)

    return { success: true }
  } catch (error) {
    console.error("Error in updateOrderStatus:", error)
    return { success: false, error: error }
  }
}
