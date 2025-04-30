"use client"

import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { getDiscountedPrice } from "@/lib/data"
import { useTranslation } from "@/app/i18n/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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
  discount?: number
  promoCode?: string | null
  lng: string
}

export default function OrderSummary({
  items,
  subtotal,
  shipping,
  total,
  discount = 0,
  promoCode = null,
  lng
}: OrderSummaryProps) {
  const { t } = useTranslation(lng, "checkout")

  return (
    <Card className="hidden md:block">
      <CardHeader>
        <CardTitle>{t("orderSummary.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>{t("orderSummary.subtotal")}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("orderSummary.shipping")}</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{t("orderSummary.discount")} ({promoCode})</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>{t("orderSummary.total")}</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 