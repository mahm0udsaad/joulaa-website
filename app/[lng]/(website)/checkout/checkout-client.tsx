"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ShippingForm } from "./shipping-form"
import { PaymentSection } from "./payment-section"
import { OrderSummary } from "./order-summary"
import { useTranslation } from "@/app/i18n/client"

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

interface CartItem {
  id: number
  name: string
  price: number
  discount: number
  image: string
  quantity: number
}

interface CheckoutClientProps {
  initialItems: CartItem[]
  initialShippingDetails: ShippingDetails | null
  subtotal: number
  shipping: number
  total: number
  lng: string
}

export function CheckoutClient({
  initialItems,
  initialShippingDetails,
  subtotal,
  shipping,
  total,
  lng
}: CheckoutClientProps) {
  const { t } = useTranslation(lng, "checkout")
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(initialShippingDetails)
  const [editingAddress, setEditingAddress] = useState(!initialShippingDetails)

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mb-8">
        <ChevronLeft className="h-4 w-4 mr-2" />
        {t("continueShopping")}
      </Link>

      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-8">
          <ShippingForm
            initialDetails={initialShippingDetails}
            onDetailsChange={setShippingDetails}
            editing={editingAddress}
            onEditingChange={setEditingAddress}
            lng={lng}
          />
          
          <PaymentSection
            items={initialItems}
            shippingDetails={shippingDetails}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
            lng={lng}
          />
        </div>

        <div className="md:col-span-2">
          <OrderSummary
            items={initialItems}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
            lng={lng}
          />
        </div>
      </div>
    </main>
  )
} 