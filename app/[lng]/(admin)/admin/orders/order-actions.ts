import { supabase } from "@/lib/supabase"
import { Order } from "@/types/order"

export interface UpdateOrderResponse {
  success: boolean
  order?: Order
  error?: string
}

export const updateOrderStatus = async (
  orderId: string,
  newStatus: string
): Promise<UpdateOrderResponse> => {
  try {
    // Update order status
    const { data, error } = await supabase
      .from("orders")
      .update({ 
        status: newStatus.toLowerCase(),
        updated_at: new Date().toISOString() 
      })
      .eq("id", orderId)
      .select()

    if (!data || data.length === 0) {
      throw new Error("Order not found or update failed")
    }

    if (error) throw error

    // Get fresh order data
    const { data: updatedOrder, error: fetchError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("id", orderId)
      .single()

    if (fetchError) throw fetchError

    return {
      success: true,
      order: updatedOrder
    }
  } catch (error) {
    console.error("Error updating order status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order status"
    }
  }
}

export const fetchOrderDetails = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("id", orderId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching order details:", error)
    return null
  }
}

export const sendOrderEmail = async (
  orderId: string,
  subject: string,
  content: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("shipping_address")
      .eq("id", orderId)
      .single()

    if (fetchError) throw fetchError

    const shippingInfo = JSON.parse(order.shipping_address)
    const customerEmail = shippingInfo.email

    if (!customerEmail) {
      throw new Error("No customer email address available")
    }

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: customerEmail,
        subject,
        html: content,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to send email")
    }

    // Update order email_sent flag
    await supabase
      .from("orders")
      .update({
        email_sent: true,
        last_email_date: new Date().toISOString(),
      })
      .eq("id", orderId)

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email"
    }
  }
} 