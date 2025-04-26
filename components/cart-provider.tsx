"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface CartItem {
  id: number // Changed to number to match your product IDs
  name: string
  price: number
  discount: number
  image: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem) => Promise<void>
  removeFromCart: (productId: number) => Promise<void> // Changed to number
  updateQuantity: (productId: number, quantity: number) => Promise<void> // Changed to number
  clearCart: () => Promise<void>
  total: number
  loading: boolean
  cartId: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cartId, setCartId] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Load cart from Supabase on mount
  useEffect(() => {
    if (user) {
      loadCart()
    } else {
      setItems([])
      setLoading(false)
    }
  }, [user])

  const loadCart = async () => {
    try {
      setLoading(true)
      if (!user) return

      // Get active cart
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (cartError && cartError.code !== 'PGRST116') {
        throw cartError
      }

      if (!cart) {
        // Create new cart if none exists
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert([{ user_id: user.id, status: 'active' }])
          .select()
          .single()

        if (createError) throw createError
        setCartId(newCart.id)
        setItems([])
        setLoading(false)
        return
      }

      setCartId(cart.id)

      // Get cart items
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select('id, product_id, quantity, price, discount')
        .eq('cart_id', cart.id)

      if (itemsError) throw itemsError

      if (cartItems && cartItems.length > 0) {
        // Get associated products
        const productIds = cartItems.map(item => item.product_id)
        
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, price, discount, image_urls')
          .in('id', productIds)

        if (productsError) throw productsError
          
        // Merge the data
        if (products) {
          const productsMap = products.reduce((map, product) => {
            map[product.id] = product
            return map
          }, {} as Record<number, any>) // Changed to number
          
          const mergedItems = cartItems.map(item => {
            const product = productsMap[item.product_id]
            if (!product) return null
            
            return {
              id: product.id,
              name: product.name,
              price: product.price,
              discount: product.discount,
              image: product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '/placeholder.svg',
              quantity: item.quantity
            }
          }).filter((item): item is CartItem => item !== null)
          
          setItems(mergedItems)
        }
      } else {
        setItems([])
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      toast({
        title: "Error",
        description: "Failed to load cart",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (item: CartItem) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to add items to cart",
          variant: "destructive"
        })
        return
      }

      // First, try to get the active cart
      const { data: existingCart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      let currentCartId: string

      if (cartError) {
        if (cartError.code === 'PGRST116') {
          // No active cart found, create a new one
          const { data: newCart, error: createError } = await supabase
            .from('carts')
            .insert([{ 
              user_id: user.id, 
              status: 'active' 
            }])
            .select()
            .single()

          if (createError) {
            console.error('Error creating cart:', createError)
            throw createError
          }

          currentCartId = newCart.id
        } else {
          throw cartError
        }
      } else {
        currentCartId = existingCart.id
      }

      // Now check if the item already exists in the cart
      const { data: existingItem, error: itemError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', currentCartId)
        .eq('product_id', item.id)
        .maybeSingle()

      if (itemError) {
        console.error('Error checking existing item:', itemError)
        throw itemError
      }

      if (existingItem) {
        // Update quantity if item exists
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)

        if (updateError) {
          console.error('Error updating item quantity:', updateError)
          throw updateError
        }
      } else {
        // Add new item if it doesn't exist
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([{
            cart_id: currentCartId,
            product_id: item.id,
            quantity: 1,
            price: item.price,
            discount: item.discount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (insertError) {
          console.error('Error inserting new item:', insertError)
          throw insertError
        }
      }

      // Update local state
      setCartId(currentCartId)
      
      // Reload cart to get updated data
      await loadCart()
      
      toast({
        title: "Success",
        description: "Item added to cart"
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      })
    }
  }

  const removeFromCart = async (productId: number) => {
    try {
      if (!user || !cartId) return

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)
        .eq('product_id', productId)

      if (error) throw error

      await loadCart() // Reload cart to get updated data
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      })
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      if (!user || !cartId) return

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('cart_id', cartId)
        .eq('product_id', productId)

      if (error) throw error

      await loadCart() // Reload cart to get updated data
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      })
    }
  }

  const clearCart = async () => {
    try {
      if (!user || !cartId) return

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)

      if (error) throw error

      setItems([])
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive"
      })
    }
  }

  const total = items.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity * (1 - item.discount / 100)
    return sum + itemTotal
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        loading,
        cartId
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}