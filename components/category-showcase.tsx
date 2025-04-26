"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Palette,
  LollipopIcon as Lipstick,
  Scissors,
  SprayCanIcon as Spray,
  Eye,
  Loader2,
  Star,
  Heart,
  Sun,
  Moon,
  Smile,
  ShoppingBag,
  Gift,
  Gem,
  Crown,
  Coffee,
  Droplet,
  Flower,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface CategoryItem {
  id: string;
  name: string;
  name_ar?: string;
  icon: string;
  color: string;
  href: string;
  image: string;
  active: boolean;
  order: number;
}

const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
  Lipstick: <Lipstick className="h-6 w-6" />,
  Scissors: <Scissors className="h-6 w-6" />,
  Spray: <Spray className="h-6 w-6" />,
  Eye: <Eye className="h-6 w-6" />,
  Star: <Star className="h-6 w-6" />,
  Heart: <Heart className="h-6 w-6" />,
  Sun: <Sun className="h-6 w-6" />,
  Moon: <Moon className="h-6 w-6" />,
  Smile: <Smile className="h-6 w-6" />,
  ShoppingBag: <ShoppingBag className="h-6 w-6" />,
  Gift: <Gift className="h-6 w-6" />,
  Gem: <Gem className="h-6 w-6" />,
  Crown: <Crown className="h-6 w-6" />,
  Coffee: <Coffee className="h-6 w-6" />,
  Droplet: <Droplet className="h-6 w-6" />,
  Flower: <Flower className="h-6 w-6" />,
};

export default function CategoryShowcase({
  title,
  locale = "en",
}: {
  title: string;
  locale?: string;
}) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from("category_showcase")
        .select("*")
        .eq("active", true)
        .order("order", { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">No categories found</div>
    );
  }

  // Get the icon element for a category, with fallback to Sparkles
  const getCategoryIcon = (iconName: string) => {
    return iconMap[iconName] || iconMap.Sparkles;
  };

  // Get name based on locale
  const getCategoryName = (category: CategoryItem) => {
    return locale === "ar" && category.name_ar
      ? category.name_ar
      : category.name;
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
      <div className="grid justify-center grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="group relative flex flex-col items-center"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-lg">
              {/* Color gradient overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r opacity-60 group-hover:opacity-70 transition-opacity",
                  category.color || "from-blue-400 to-blue-200", // Default fallback if color is missing
                )}
              />
              {/* Image */}
              <img
                src={
                  category.image ||
                  `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(category.name)}`
                }
                alt={getCategoryName(category)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Category name overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center bg-white/30 rounded-full p-2 mb-2 backdrop-blur-sm">
                  {getCategoryIcon(category.icon)}
                </div>
                <span
                  className="font-medium text-center text-white text-lg px-3 py-1.5 bg-black/30 rounded backdrop-blur-sm"
                  dir={locale === "ar" ? "rtl" : "ltr"}
                >
                  {getCategoryName(category)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
