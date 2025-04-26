import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createOrder } from "@/lib/order-service"
import { supabase } from "@/lib/supabase"
import { sendOrderConfirmationEmail } from "@/lib/send-email"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not configured in environment variables")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31.basil",
})

export async function POST(request: Request) {
  try {
    const {
      paymentIntentId,
      userId,
      cartItems,
      shippingDetails,
      totalAmount,
      shippingCost,
      saveAddress,
      paymentMethod,
      cartId,
    } = await request.json()

    // Validate required fields
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart items are required" }, { status: 400 })
    }

    if (!shippingDetails) {
      return NextResponse.json({ error: "Shipping details are required" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!cartId) {
      return NextResponse.json({ error: "Cart ID is required" }, { status: 400 })
    }

    if (paymentMethod !== "cash") {
      if (!paymentIntentId) {
        return NextResponse.json({ error: "Payment intent ID is required" }, { status: 400 })
      }

      // Verify the payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

      if (paymentIntent.status !== "succeeded") {
        return NextResponse.json(
          {
            error: `Payment not successful. Status: ${paymentIntent.status}`,
          },
          { status: 400 },
        )
      }
    }

    // Format order items
    const orderItems = cartItems.map((item: any) => {
      if (!item || !item.price || !item.quantity) {
        throw new Error("Invalid cart item format")
      }

      const unitPrice = Number.parseFloat(item.price)
      const discountedPrice = item.discount ? unitPrice * (1 - Number.parseFloat(item.discount)) : unitPrice

      return {
        product_id: item.id || item.productId, // Add fallback for productId
        product_name: item.name,
        quantity: item.quantity,
        unit_price: discountedPrice,
        cost_price: unitPrice * 0.6, // Assuming 40% margin
        subtotal: discountedPrice * item.quantity,
        color: item.selectedColor || null,
        shade: item.selectedShade || null,
        image_url: item.image_urls?.[0] || item.image || null,
      }
    })

    // Use shipping address as billing address if not provided separately
    const shippingAddressStr = JSON.stringify(shippingDetails)
    const billingAddressStr = shippingAddressStr // Use same address for billing

    // Create the order in the database
    const order = await createOrder(
      userId,
      orderItems,
      shippingAddressStr,
      billingAddressStr,
      totalAmount,
      shippingCost,
      0, // tax amount
      0, // discount amount
      paymentIntentId,
      paymentMethod === "cash" ? "cash" : "paid", // Set payment status based on payment method
    )

    // Send order confirmation email
    try {
      const customerName = `${shippingDetails.firstName} ${shippingDetails.lastName}`
      const orderDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      await sendOrderConfirmationEmail({
        customerName,
        customerEmail: shippingDetails.email,
        orderNumber: order.id.substring(0, 8),
        orderDate,
        orderTotal: totalAmount,
        orderItems: orderItems.map(item => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
          image: item.image_url || null
        })),
        customMessage: "Your order is being processed. We'll notify you when it ships."
      })
    } catch (emailError) {
      console.error("Error sending order confirmation email:", emailError)
      // Don't return error here as order is already created
    }

    // If user is logged in and wants to save address
    if (userId && saveAddress) {
      const { error: userError } = await supabase
        .from("users")
        .update({
          first_name: shippingDetails.firstName,
          last_name: shippingDetails.lastName,
          address: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state,
          zip_code: shippingDetails.postalCode,
          country: shippingDetails.country,
          phone: shippingDetails.phone,
        })
        .eq("id", userId)

      if (userError) {
        console.error("Error updating user address:", userError)
        // Don't return error here as order is already created
      }
    }

    // Delete cart items and cart after successful order creation
    try {
      // First delete all cart items
      const { error: cartItemsError } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)

      if (cartItemsError) {
        console.error("Error deleting cart items:", cartItemsError)
        // Don't return error here as order is already created
      }

      // Then delete the cart
      const { error: cartError } = await supabase
        .from('carts')
        .delete()
        .eq('id', cartId)

      if (cartError) {
        console.error("Error deleting cart:", cartError)
        // Don't return error here as order is already created
      }
    } catch (error) {
      console.error("Error cleaning up cart:", error)
      // Don't return error here as order is already created
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Order created successfully",
    })
  } catch (error) {
    console.error("Error processing order:", error)
    return NextResponse.json(
      { 
        error: "Failed to process order",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}
