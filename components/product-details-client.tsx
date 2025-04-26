"use client";

import { useState } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Minus, Plus, Share2, Star, Truck } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import ProductCard from "@/components/product-card";
import { useToast } from "@/components/ui/use-toast";
import type { Product } from "@/contexts/product-context";
import { useTranslation } from "@/app/i18n/client";
import ProductReviewModal from "./product-review-modal";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";

export default function ProductDetailsClient({
  product,
  similarProducts,
  lng,
}: {
  product: Product;
  similarProducts: Product[];
  lng: string;
}) {
  const { t } = useTranslation(lng, "common");
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const { user } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviews, setReviews] = useState<Array<any>>(
    Array.isArray(product.reviews) ? product.reviews : [],
  );

  const inWishlist = isInWishlist(product.id);

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      image: product.image_urls?.[0] || "/placeholder.svg",
      quantity: quantity,
    });
    toast({
      title: t("product.addedToCart"),
      description: t("product.addedToCartDesc", { count: quantity }),
      duration: 2000,
    });
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast({
        title: t("product.removedFromWishlist"),
        description: t("product.removedFromWishlistDesc", {
          name: product.name,
        }),
        duration: 2000,
      });
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price:
          product.discount > 0
            ? (product.price * (100 - product.discount)) / 100
            : product.price,
        image: product.image_urls?.[0] || "/placeholder.svg",
        originalPrice: product.price,
      });
      toast({
        title: t("product.addedToWishlist"),
        description: t("product.addedToWishlistDesc", { name: product.name }),
        duration: 2000,
      });
    }
  };

  const discountedPrice =
    product.discount > 0
      ? (product.price * (100 - product.discount)) / 100
      : product.price;

  async function handleReviewSubmit({
    stars,
    comment,
  }: {
    stars: number;
    comment: string;
  }) {
    setReviewLoading(true);
    const review = {
      id: crypto.randomUUID(),
      user: user?.name || user?.email || t("product.anonymous"),
      comment,
      stars,
      created_at: new Date().toISOString(),
    };
    const updatedReviews = [...reviews, review];
    const { error } = await supabase
      .from("products")
      .update({ reviews: updatedReviews })
      .eq("id", product.id);
    setReviewLoading(false);
    if (!error) {
      setReviews(updatedReviews);
      setReviewModalOpen(false);
      toast({
        title: t("product.reviewAdded"),
        description: t("product.reviewAddedDesc"),
      });
    } else {
      toast({ title: t("common.actions.error"), description: error.message });
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.image_urls?.[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain"
            />
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                {product.discount}% {t("product.off")}
              </div>
            )}
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {product.image_urls?.map((image, index) => (
              <button
                key={index}
                className={`relative h-20 w-20 rounded-md overflow-hidden border-2 ${
                  selectedImage === index
                    ? "border-primary"
                    : "border-transparent"
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-lg text-muted-foreground">{product.brand}</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviews} {t("product.reviews")})
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold">
              ${discountedPrice.toFixed(2)}
            </span>
            {product.discount > 0 && (
              <span className="text-xl text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-gray-700">{product.description}</p>

          <div className="flex items-center space-x-4">
            <div className="flex items-center border rounded-md">
              <button
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  handleQuantityChange(Number.parseInt(e.target.value) || 1)
                }
                className="w-16 text-center border-0"
              />
              <button
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={handleAddToCart} className="flex-1">
              {t("product.addToCart")}
            </Button>
            <Button
              variant={inWishlist ? "default" : "outline"}
              size="icon"
              onClick={handleToggleWishlist}
              className="rounded-full"
            >
              <Heart className={`h-5 w-5 ${inWishlist ? "fill-white" : ""}`} />
              <span className="sr-only">
                {inWishlist
                  ? t("product.removeFromWishlist")
                  : t("product.addToWishlist")}
              </span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Share2 className="h-5 w-5" />
              <span className="sr-only">{t("product.share")}</span>
            </Button>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Truck className="h-4 w-4 mx-2" />
            <span>{t("product.freeShipping")}</span>
          </div>

          {product.stock_status && (
            <div
              className={`text-sm ${product.stock_status === "In Stock" ? "text-green-600" : "text-red-600"}`}
            >
              {t(
                `product.stockStatus.${product.stock_status === "In Stock" ? "inStock" : "outOfStock"}`,
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">
            {t("product.description")}
          </TabsTrigger>
          <TabsTrigger value="details">{t("product.details")}</TabsTrigger>
          <TabsTrigger value="reviews">{t("product.reviewsTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="p-4 border rounded-md mt-2">
          <div className="prose max-w-none">
            <p>{product.description}</p>
            <ul className="mt-4">
              <li>{t("product.dermatologicallyTested")}</li>
              <li>{t("product.suitableForAllSkinTypes")}</li>
              <li>{t("product.crueltyFreeVegan")}</li>
              <li>{t("product.freeFromParabensSulfates")}</li>
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="details" className="p-4 border rounded-md mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">
                {t("product.productDetails")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <span className="font-medium">{t("product.brand")}</span>{" "}
                  {product.brand}
                </li>
                <li>
                  <span className="font-medium">{t("product.weight")}</span>{" "}
                  {product.weight || t("product.na")}
                </li>
                <li>
                  <span className="font-medium">{t("product.dimensions")}</span>{" "}
                  {product.dimensions || t("product.na")}
                </li>
                <li>
                  <span className="font-medium">{t("product.sku")}</span>{" "}
                  {product.sku || product.id}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">{t("product.ingredients")}</h3>
              <p className="text-sm text-gray-600">
                {product.ingredients || t("product.ingredientsNotAvailable")}
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{t("product.customerReviews")}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewModalOpen(true)}
              >
                {t("product.writeAReview")}
              </Button>
              <ProductReviewModal
                open={reviewModalOpen}
                onOpenChange={setReviewModalOpen}
                onSubmit={handleReviewSubmit}
                loading={reviewLoading}
                title={t("product.writeAReview")}
                t={t}
              />
            </div>
            {Array.isArray(reviews) && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="p-4 border rounded-md">
                    <div className="flex justify-between mb-2">
                      <div>
                        <span className="font-medium">{review.user}</span>
                        <div className="flex mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                {t("product.noReviewsYet")}
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            {t("product.similarProducts")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <ProductCard key={product.id} product={product} lng={lng} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
