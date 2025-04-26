"use client"

import { useState, useEffect } from "react"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "./cart-provider"
import { useAuth } from "@/contexts/auth-context"

interface PaymentFormProps {
  clientSecret: string
  total: number
  onSuccess: () => void
  shippingDetails: any
  cartItems: any[]
  shippingCost: number
  subtotal: number
  userId?: string
  saveAddress?: boolean
  paymentMethod?: "card" | "cash"
}

export function PaymentForm({
  total,
  onSuccess,
  shippingDetails,
  cartItems,
  shippingCost,
  saveAddress,
  paymentMethod = "card",
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const { cartId } = useCart()
  const { user } = useAuth()

  // Check if payment is complete on page load (for redirect returns)
  useEffect(() => {
    if (!stripe) {
      return
    }

    // Retrieve the PaymentIntent to check its status
    const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret")

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return

      switch (paymentIntent.status) {
        case "succeeded":
          setPaymentStatus("succeeded")
          // Create order after successful payment
          createOrder(paymentIntent.id)
          break
        case "processing":
          setPaymentStatus("processing")
          setError("Your payment is processing.")
          break
        case "requires_payment_method":
          setPaymentStatus("failed")
          setError("Your payment was not successful, please try again.")
          break
        default:
          setPaymentStatus("failed")
          setError("Something went wrong.")
          break
      }
    })
  }, [stripe])

  const createOrder = async (paymentIntentId?: string) => {
    try {
      if (!cartId) {
        throw new Error("Cart ID is required")
      }

      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId,
          userId: user?.id,
          cartItems,
          shippingDetails,
          totalAmount: total,
          shippingCost,
          saveAddress,
          paymentStatus: paymentMethod === "cash" ? "pending" : "paid",
          paymentMethod,
          cartId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order")
      }

      // Call the onSuccess callback to clear cart and redirect
      onSuccess()
    } catch (error) {
      console.error("Error creating order:", error)
      setError("Payment was successful, but we couldn't create your order. Please contact support.")
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      // If cash on delivery, create order without payment
      if (paymentMethod === "cash") {
        await createOrder()
        onSuccess()
        return
      }

      // Card payment flow
      if (!stripe || !elements) {
        throw new Error("Stripe.js hasn't loaded yet")
      }

      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: "if_required",
      })

      if (submitError) {
        throw new Error(submitError.message)
      }

      if (paymentIntent?.status === "succeeded") {
        // Create order after successful payment
        await createOrder(paymentIntent.id)
        onSuccess()
      }
    } catch (err: any) {
      console.error("Payment error:", err)
      setError(err.message || "Something went wrong with the payment")
    } finally {
      setLoading(false)
    }
  }

  // If payment already succeeded (after redirect), show success message
  if (paymentStatus === "succeeded") {
    return (
      <div className="text-center py-4">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-4">Your order is being processed.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {paymentMethod === "card" && <PaymentElement options={{ layout: "tabs" }} />}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${total.toFixed(2)} AED${paymentMethod === "cash" ? " on Delivery" : ""}`
        )}
      </Button>
    </form>
  )
}
