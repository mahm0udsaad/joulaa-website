"use client"

import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { getDiscountedPrice } from "@/lib/data"
import { useTranslation } from "@/app/i18n/client"

interface CartItem {
  id: number
  name: string
  price: number
  discount: number
  image: string
  quantity: number
}

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
  lng: string
}

export function OrderSummary({
  items,
  subtotal,
  shipping,
  total,
  lng
}: OrderSummaryProps) {
  const { t } = useTranslation(lng, "checkout")

  return (
    <div className="bg-white p-6 rounded-lg border sticky top-24">
      <h2 className="text-xl font-semibold mb-4">{t("orderSummary.title")}</h2>

      <div className="max-h-80 overflow-y-auto mb-4">
        {items.map((item) => {
          const discountedPrice = getDiscountedPrice(item.price, item.discount)

          return (
            <div
              key={item.id}
              className="flex py-3 border-b last:border-b-0"
            >
              <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              </div>
              <div className="mx-4 flex-1">
                <h3 className="font-medium text-sm">{item.name}</h3>
                <div className="flex justify-between mt-1">
                  <span className="text-sm">{t("orderSummary.quantity")}: {item.quantity}</span>
                  <span className="font-medium">
                    {(Number.parseFloat(discountedPrice) * item.quantity).toFixed(2)} AED
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("orderSummary.subtotal")}</span>
          <span>{subtotal.toFixed(2)} AED</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("orderSummary.shipping")}</span>
          <span>{shipping === 0 ? t("orderSummary.free") : `${shipping.toFixed(2)} AED`}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-bold text-lg">
          <span>{t("orderSummary.total")}</span>
          <span>{total.toFixed(2)} AED</span>
        </div>
        <p className="text-xs text-muted-foreground">{t("orderSummary.delivery")}</p>
      </div>
    </div>
  )
} 