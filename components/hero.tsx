"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import LocalizedLink from "@/components/localized-link";
import { useTranslation } from "@/app/i18n/client";

interface HeroSlide {
  id: string;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
  button_text: string;
  button_text_ar: string;
  button_link: string;
  image_url: string;
  order: number;
  active: boolean;
}

interface HeroProps {
  lng: string;
}

export default function Hero({ lng }: HeroProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(lng);

  const isArabic = lng === "ar";

  useEffect(() => {
    async function fetchHeroSlides() {
      try {
        const { data, error } = await supabase
          .from("hero_slides")
          .select("*")
          .eq("active", true)
          .order("order", { ascending: true });

        if (error) throw error;

        setSlides(data || []);
      } catch (err) {
        console.error("Error fetching hero slides:", err);
        setError("Failed to load hero slides");
      } finally {
        setIsLoading(false);
      }
    }

    fetchHeroSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[400px] rounded-lg" />;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No hero slides available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] sm:h-full overflow-hidden rounded-lg">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.image_url || "/placeholder.svg"}
            alt={isArabic ? slide.title_ar || slide.title : slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-8 md:p-12">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                {isArabic ? slide.title_ar || slide.title : slide.title}
              </h2>
              <p className="text-white/90 text-sm md:text-base mb-6">
                {isArabic
                  ? slide.subtitle_ar || slide.subtitle
                  : slide.subtitle}
              </p>
              <LocalizedLink href={slide.button_link} lng={lng}>
                <Button size="lg" className="font-medium">
                  {isArabic
                    ? slide.button_text_ar || slide.button_text
                    : slide.button_text}
                </Button>
              </LocalizedLink>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 hover:text-white"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 hover:text-white"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
