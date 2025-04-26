"use client";

import { useState, useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import type { Product } from "@/contexts/product-context";

interface ProductSliderProps {
  title: string;
  products: Product[];
  loading: boolean;
  lng: string;
}

export default function ProductSlider({
  title,
  products,
  loading,
  lng,
}: ProductSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardWidth = 280; // Width of each card
  const gap = 24; // Gap between cards (6 * 4 = 24px)
  const cardsPerView = 4; // Number of cards visible at once
  const isRTL = lng === "ar";

  const maxIndex = Math.max(0, products.length - cardsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (sliderRef.current) {
      const translateX = currentIndex * (cardWidth + gap);
      sliderRef.current.style.transform = isRTL
        ? `translateX(${translateX}px)`
        : `translateX(-${translateX}px)`;
    }
  }, [currentIndex, cardWidth, gap, isRTL]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <Skeleton className="h-48 w-full rounded-lg mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">{title}</h2>
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No products available at the moment. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={isRTL ? nextSlide : prevSlide}
            disabled={isRTL ? currentIndex >= maxIndex : currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={isRTL ? prevSlide : nextSlide}
            disabled={isRTL ? currentIndex === 0 : currentIndex >= maxIndex}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          ref={sliderRef}
          className="flex gap-6 transition-transform duration-300 ease-in-out"
          style={{
            width: `${products.length * (cardWidth + gap)}px`,
            direction: isRTL ? "rtl" : "ltr",
          }}
        >
          {products.map((product) => (
            <div key={product.id} className="w-[280px] flex-shrink-0">
              <ProductCard product={product} lng={lng} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
