"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Banknote, CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { PaymentForm } from "@/components/payment-form"
import { useCart } from "@/components/cart-provider"

// Initialize Stripe with the public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not configured in environment variables")
}

interface ShippingDetails {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  postalCode: string
  state: string
  country: string
  phone: string
}

interface PaymentSectionProps {
  shippingDetails: ShippingDetails | null
  subtotal: number
  shipping: number
  total: number
  items: CartItem[]
}

export function PaymentSection({
  shippingDetails,
  subtotal,
  shipping,
  total,
  items
}: PaymentSectionProps) {
  const [clientSecret, setClientSecret] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card")
  const router = useRouter()
  const { clearCart } = useCart()

  useEffect(() => {
    if (total > 0) {
      setLoading(true)
      setError("")

      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: total }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || "Failed to create payment intent")
          }
          return res.json()
        })
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret)
          } else {
            throw new Error("No client secret received")
          }
        })
        .catch((err) => {
          console.error("Payment initialization error:", err)
          setError(err.message || "Failed to initialize payment. Please try again.")
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [total])

  const handlePaymentSuccess = () => {
    clearCart()
    router.push("/order-confirmation")
  }

  // Validate shipping details before allowing payment
  const isShippingValid = () => {
    if (!shippingDetails) return false

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "postalCode",
      "state",
      "country",
      "phone",
    ]

    return requiredFields.every((field) => shippingDetails[field as keyof ShippingDetails]?.trim())
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-xl font-semibold mb-4">Payment Information</h2>

      <div className="mb-6">
        <Label className="text-base font-medium mb-3 block">Select Payment Method</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all flex items-center ${
              paymentMethod === "card"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-muted-foreground"
            }`}
            onClick={() => setPaymentMethod("card")}
          >
            <div className="mx-3">
              <CreditCard
                className={`h-5 w-5 ${paymentMethod === "card" ? "text-primary" : "text-muted-foreground"}`}
              />
            </div>
            <div>
              <div className="font-medium">Credit/Debit Card</div>
              <div className="text-xs text-muted-foreground">Pay securely online</div>
            </div>
            <div className="mx-auto">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "card" ? "border-primary" : "border-muted-foreground"
                }`}
              >
                {paymentMethod === "card" && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
              </div>
            </div>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all flex items-center ${
              paymentMethod === "cash"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-muted-foreground"
            }`}
            onClick={() => setPaymentMethod("cash")}
          >
            <div className="mx-3">
              <Banknote
                className={`h-5 w-5 ${paymentMethod === "cash" ? "text-primary" : "text-muted-foreground"}`}
              />
            </div>
            <div>
              <div className="font-medium">Cash on Delivery</div>
              <div className="text-xs text-muted-foreground">Pay when you receive</div>
            </div>
            <div className="mx-auto">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "cash" ? "border-primary" : "border-muted-foreground"
                }`}
              >
                {paymentMethod === "cash" && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !shippingDetails ? (
        <Alert>
          <AlertDescription>
            Please complete all shipping information fields before proceeding to payment.
          </AlertDescription>
        </Alert>
      ) : (
        clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#dc2626",
                },
              },
              loader: "auto",
            }}
          >
            <PaymentForm
              cartItems={items}
              clientSecret={clientSecret}
              total={total}
              onSuccess={handlePaymentSuccess}
              shippingDetails={shippingDetails!}
              shippingCost={shipping}
              subtotal={subtotal}
              paymentMethod={paymentMethod}
            />
          </Elements>
        )
      )}
    </div>
  )
} 