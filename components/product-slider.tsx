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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Responsively determine cards per view based on viewport width
  const getCardsPerView = () => {
    if (viewportWidth < 640) return 1.5; // Mobile: show 1.5 cards
    if (viewportWidth < 768) return 2; // Small tablets: show 2 cards
    if (viewportWidth < 1024) return 3; // Tablets: show 3 cards
    return 4; // Desktop: show 4 cards
  };
  
  const cardWidth = 280; // Width of each card
  const gap = 24; // Gap between cards (6 * 4 = 24px)
  const cardsPerView = getCardsPerView();
  const isRTL = lng === "ar";

  const maxIndex = Math.max(0, products.length - Math.floor(cardsPerView));

  // Update viewport width on resize
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    
    // Initial setup
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    // Prevent default behavior to stop image dragging
    e.preventDefault();
    
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(currentIndex * (cardWidth + gap));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    // Don't prevent default here as it would block scrolling
    // on mobile devices when reaching the ends of the slider
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(currentIndex * (cardWidth + gap));
  };

  // Handle dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current || !containerRef.current) return;
    
    // Prevent default to avoid text selection during drag
    e.preventDefault();
    
    const x = e.pageX - containerRef.current.offsetLeft;
    const dragDistance = (x - startX) * (isRTL ? 1 : -1);
    const newPosition = scrollLeft + dragDistance;
    
    // Limit the drag to prevent dragging beyond boundaries
    const maxDrag = (products.length - cardsPerView) * (cardWidth + gap);
    const limitedPosition = Math.max(0, Math.min(newPosition, maxDrag));
    
    // Apply the transform without changing currentIndex yet
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'none'; // Ensure smooth dragging
      sliderRef.current.style.transform = isRTL
        ? `translateX(${limitedPosition}px)`
        : `translateX(-${limitedPosition}px)`;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current || !containerRef.current) return;
    
    // For touch events, we need to prevent the default scrolling
    // only when we're actively dragging horizontally
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const dragDistance = Math.abs(x - startX);
    
    // If dragging horizontally more than 10px, prevent vertical scrolling
    if (dragDistance > 10) {
      e.preventDefault();
    }
    
    const dragDir = (x - startX) * (isRTL ? 1 : -1);
    const newPosition = scrollLeft + dragDir;
    
    // Limit the drag to prevent dragging beyond boundaries
    const maxDrag = (products.length - cardsPerView) * (cardWidth + gap);
    const limitedPosition = Math.max(0, Math.min(newPosition, maxDrag));
    
    // Apply the transform without changing currentIndex yet
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'none'; // Ensure smooth dragging
      sliderRef.current.style.transform = isRTL
        ? `translateX(${limitedPosition}px)`
        : `translateX(-${limitedPosition}px)`;
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDragging || !sliderRef.current) return;
    setIsDragging(false);
    
    // Get the current transform value
    const transform = sliderRef.current.style.transform;
    const currentTranslate = parseInt(transform.replace(/[^-\d.]/g, ''));
    
    // Calculate which index to snap to
    let newIndex = Math.round(Math.abs(currentTranslate) / (cardWidth + gap));
    
    // Ensure the index is within bounds
    newIndex = Math.max(0, Math.min(newIndex, maxIndex));
    
    // Update the index
    setCurrentIndex(newIndex);
  };

  // Apply smooth scrolling based on currentIndex
  useEffect(() => {
    if (sliderRef.current) {
      // For the last index, ensure we don't translate too far, especially on mobile
      let translateX;
      
      if (currentIndex >= maxIndex && viewportWidth < 768) {
        // Special handling for the last slide on mobile - ensure the last card is fully visible
        translateX = (products.length - cardsPerView) * (cardWidth + gap);
      } else {
        translateX = currentIndex * (cardWidth + gap);
      }
      
      sliderRef.current.style.transition = isDragging ? 'none' : 'transform 300ms ease-in-out';
      sliderRef.current.style.transform = isRTL
        ? `translateX(${translateX}px)`
        : `translateX(-${translateX}px)`;
    }
  }, [currentIndex, cardWidth, gap, isRTL, isDragging, products.length, cardsPerView, viewportWidth, maxIndex]);

  // Add event listeners for mouse/touch up outside the component
  useEffect(() => {
    const handleMouseUpOutside = () => {
      if (isDragging) handleDragEnd();
    };

    window.addEventListener('mouseup', handleMouseUpOutside);
    window.addEventListener('touchend', handleMouseUpOutside);

    return () => {
      window.removeEventListener('mouseup', handleMouseUpOutside);
      window.removeEventListener('touchend', handleMouseUpOutside);
    };
  }, [isDragging]);

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

  // Add this style block to prevent image dragging and selection issues
  useEffect(() => {
    // Apply global styles to prevent unwanted behaviors during drag
    const style = document.createElement('style');
    style.innerHTML = `
      .no-select-during-drag * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      .no-select-during-drag img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

      <div 
        ref={containerRef}
        className={`overflow-hidden ${isDragging ? 'no-select-during-drag' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        <div
          ref={sliderRef}
          className={`flex gap-6 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} will-change-transform`}
          style={{
            width: `${products.length * (cardWidth + gap) - gap}px`, // Adjust width calculation
            direction: isRTL ? "rtl" : "ltr",
          }}
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className="w-[280px] flex-shrink-0"
              style={{
                // Apply specific styling to the last card on mobile
                ...(product.id === products[products.length - 1]?.id && viewportWidth < 768 && {
                  paddingRight: '1px', // Ensure last card has a small buffer
                })
              }}
            >
              <ProductCard product={product} lng={lng} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile indicator dots */}
      {viewportWidth < 768 && products.length > 1 && (
        <div className="flex justify-center mt-4 gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button 
              key={idx} 
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? 'w-4 bg-gray-800' : 'w-2 bg-gray-300'
              }`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}