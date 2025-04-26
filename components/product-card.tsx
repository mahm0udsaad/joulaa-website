"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/contexts/product-context"
import { useCart } from "./cart-provider"
import { useWishlist } from "./wishlist-provider"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/data"
import { useTranslation } from '@/app/i18n/client'
import { useAuth } from "@/contexts/auth-context"
import { AuthRequiredModal } from "@/components/auth-required-modal"

interface ProductCardProps {
  product: Product
  lng: string
}

export default function ProductCard({ product, lng }: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation(lng, ["toast", "products"])
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const discountedPrice = product.discount > 0 ? (product.price * (100 - product.discount)) / 100 : product.price
  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    setIsAddingToCart(true)
    try {
      await addToCart(product)
      toast({
        title: t("product.addedToCart"),
        description: t("product.addedToCartDescription"),
      })
    } catch (error) {
      toast({
        title: t("product.error"),
        description: t("product.addToCartError"),
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsTogglingWishlist(true)

    // Simulate a small delay for better UX
    setTimeout(() => {
      if (inWishlist) {
        removeFromWishlist(product.id)
        toast({
          title: t('success.wishlistRemoved'),
          variant: "default"
        })
      } else {
        addToWishlist({
          id: product.id,
          name: product.name,
          price: discountedPrice,
          image: product.image_urls?.[0] || "/placeholder.svg",
          originalPrice: product.price,
        })
        toast({
          title: t('success.wishlistAdded'),
          variant: "default"
        })
      }

      setIsTogglingWishlist(false)
    }, 300)
  }

  return (
    <>
      <div className="group relative">
        <div className="relative h-60 w-full overflow-hidden rounded-lg bg-gray-100">
          {product.image_urls && product.image_urls.length > 0 ? (
            <Image
              src={product.image_urls?.[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover object-center transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">{t('products:noImage')}</span>
            </div>
          )}
          {product.discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {product.discount}% {t('products:discount')}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex justify-center space-x-2">
              <Button
                size="sm"
                variant={inWishlist ? "default" : "secondary"}
                className="rounded-full w-10 h-10 p-0"
                onClick={handleToggleWishlist}
                disabled={isTogglingWishlist}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? "fill-white" : ""}`} />
                <span className="sr-only">
                  {inWishlist ? t('products:removeFromWishlist') : t('products:addToWishlist')}
                </span>
              </Button>
              <Button
                size="sm"
                className="rounded-full w-10 h-10 p-0"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link href={`/${lng}/product/${product.id}`}>
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-1">{product.brand}</p>
            <div className="mt-1 flex items-center">
              <p className="font-medium text-gray-900">{formatCurrency(discountedPrice)}</p>
              {product.discount > 0 && (
                <p className="ml-2 text-sm text-gray-500 line-through">{formatCurrency(product.price)}</p>
              )}
            </div>
          </Link>
        </div>
      </div>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        lng={lng}
      />
    </>
  )
}
