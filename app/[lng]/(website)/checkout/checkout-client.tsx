"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import  ShippingForm  from "./shipping-form"
import { PaymentSection } from "./payment-section"
import  OrderSummary  from "./order-summary"
import { useTranslation } from "@/app/i18n/client"
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { PromoCode } from '@/app/actions/promo-codes'
import { useActionState } from 'react'

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
  id: string
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
  promoCodes: PromoCode[]
  lng: string
}

interface State {
  errors?: {
    promoCode?: string[]
    _form?: string[]
  }
  data?: {
    discount: number
    promoCode: string
  } | null
}

const initialState: State = {
  errors: {},
  data: null,
}

async function applyPromoCode(prevState: State, formData: FormData): Promise<State> {
  const promoCode = formData.get('promoCode') as string
  const subtotal = Number(formData.get('subtotal'))

  if (!promoCode) {
    return {
      errors: {
        promoCode: ['Promo code is required'],
      },
    }
  }

  const { data: promoCodeData, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', promoCode)
    .eq('is_active', true)
    .gt('end_date', new Date().toISOString())
    .lt('start_date', new Date().toISOString())
    .single()

  if (error || !promoCodeData) {
    return {
      errors: {
        _form: ['Invalid or expired promo code'],
      },
    }
  }

  if (promoCodeData.min_purchase_amount && subtotal < promoCodeData.min_purchase_amount) {
    return {
      errors: {
        _form: [`Minimum purchase amount of $${promoCodeData.min_purchase_amount} required`],
      },
    }
  }

  let discount = 0
  if (promoCodeData.discount_type === 'percentage') {
    discount = subtotal * (promoCodeData.discount_value / 100)
  } else {
    discount = promoCodeData.discount_value
  }

  if (promoCodeData.max_discount_amount && discount > promoCodeData.max_discount_amount) {
    discount = promoCodeData.max_discount_amount
  }

  return {
    data: {
      discount,
      promoCode: promoCodeData.code,
    },
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Applying...' : 'Apply'}
    </Button>
  )
}

export default function CheckoutClient({
  initialItems,
  initialShippingDetails,
  subtotal,
  shipping,
  total,
  promoCodes,
  lng
}: CheckoutClientProps) {
  const { t } = useTranslation(lng, "checkout")
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(initialShippingDetails)
  const [editingAddress, setEditingAddress] = useState(!initialShippingDetails?.address)
  const [state, formAction] = useActionState(applyPromoCode, initialState)
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null)
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    if (state.data) {
      setAppliedPromoCode(state.data.promoCode)
      setDiscount(state.data.discount)
      toast({
        title: "Promo Code Applied",
        description: `Successfully applied promo code ${state.data.promoCode} for a discount of $${state.data.discount.toFixed(2)}`,
      })
    } else if (state.errors?._form) {
      toast({
        title: "Invalid Promo Code",
        description: state.errors._form[0],
        variant: "destructive",
      })
    }
  }, [state])

  const finalTotal = total - discount

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
            total={finalTotal}
            lng={lng}
          />
             <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {initialItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity * (1 - item.discount / 100)).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedPromoCode})</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-8 sticky top-20 h-fit">
          <OrderSummary
            items={initialItems}
            subtotal={subtotal}
            shipping={shipping}
            total={finalTotal}
            discount={discount}
            promoCode={appliedPromoCode}
            lng={lng}
          />
            <div>
          <Card>
            <CardContent>
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="subtotal" value={subtotal} />
                <div className="space-y-2">
                  <Label htmlFor="promoCode">Enter Promo Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promoCode"
                      name="promoCode"
                      placeholder="Enter code"
                      defaultValue={appliedPromoCode || ''}
                    />
                    <SubmitButton />
                  </div>
                  {state.errors?.promoCode && (
                    <p className="text-sm text-red-500">{state.errors.promoCode[0]}</p>
                  )}
                  {state.errors?._form && (
                    <p className="text-sm text-red-500">{state.errors._form[0]}</p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>

    </main>
  )
} 