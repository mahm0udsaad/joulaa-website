'use server'

import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

const promoCodeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().min(0, 'Discount value must be positive'),
  min_purchase_amount: z.number().nullable(),
  max_discount_amount: z.number().nullable(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  usage_limit: z.number().nullable(),
  is_active: z.boolean().default(true),
})

export type PromoCode = z.infer<typeof promoCodeSchema> & {
  id: string
  used_count: number
  created_at: string
  updated_at: string
}

export type State = {
  errors?: {
    code?: string[]
    discount_type?: string[]
    discount_value?: string[]
    min_purchase_amount?: string[]
    max_discount_amount?: string[]
    start_date?: string[]
    end_date?: string[]
    usage_limit?: string[]
    is_active?: string[]
    _form?: string[]
  }
  data?: PromoCode | null
}

export async function getPromoCodes() {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch promo codes')
  }

  return data as PromoCode[]
}

export async function createPromoCode(prevState: State, formData: FormData): Promise<State> {
  const rawFormData = {
    code: formData.get('code'),
    discount_type: formData.get('discount_type'),
    discount_value: Number(formData.get('discount_value')),
    min_purchase_amount: formData.get('min_purchase_amount')
      ? Number(formData.get('min_purchase_amount'))
      : null,
    max_discount_amount: formData.get('max_discount_amount')
      ? Number(formData.get('max_discount_amount'))
      : null,
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date'),
    usage_limit: formData.get('usage_limit')
      ? Number(formData.get('usage_limit'))
      : null,
    is_active: formData.get('is_active') === 'on',
  }

  const validatedFields = promoCodeSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { data, error } = await supabase
    .from('promo_codes')
    .insert(validatedFields.data)
    .select()
    .single()

  if (error) {
    return {
      errors: {
        _form: ['Failed to create promo code'],
      },
    }
  }

  revalidatePath('/admin')
  return { data }
}

export async function updatePromoCode(id: string, prevState: State, formData: FormData): Promise<State> {
  const rawFormData = {
    code: formData.get('code'),
    discount_type: formData.get('discount_type'),
    discount_value: Number(formData.get('discount_value')),
    min_purchase_amount: formData.get('min_purchase_amount')
      ? Number(formData.get('min_purchase_amount'))
      : null,
    max_discount_amount: formData.get('max_discount_amount')
      ? Number(formData.get('max_discount_amount'))
      : null,
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date'),
    usage_limit: formData.get('usage_limit')
      ? Number(formData.get('usage_limit'))
      : null,
    is_active: formData.get('is_active') === 'on',
  }

  const validatedFields = promoCodeSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { data, error } = await supabase
    .from('promo_codes')
    .update(validatedFields.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return {
      errors: {
        _form: ['Failed to update promo code'],
      },
    }
  }

  revalidatePath('/admin')
  return { data }
}

export async function deletePromoCode(id: string) {
  const { error } = await supabase.from('promo_codes').delete().eq('id', id)

  if (error) {
    return {
      errors: {
        _form: ['Failed to delete promo code'],
      },
    }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function togglePromoCodeActive(id: string, is_active: boolean) {
  const { error } = await supabase
    .from('promo_codes')
    .update({ is_active })
    .eq('id', id)

  if (error) {
    return {
      errors: {
        _form: ['Failed to update promo code status'],
      },
    }
  }

  revalidatePath('/admin')
  return { success: true }
} 