"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/app/i18n/client";

interface Category {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  description?: string;
  image_url?: string;
  type?: "lips" | "face" | "eyes";
  featured?: boolean;
  order?: number;
}

export default function HeaderCategoriesDropdown({ lng }: { lng: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation(lng, "common");
  const isArabic = lng === "ar";

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching categories:", error);
          return;
        }

        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Get translated category type
  const getCategoryTypeTranslation = (type: string) => {
    return t(`categoryTypes.${type}`) || type;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium">
        {t("categories")} <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-2 py-1.5">
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </>
        ) : categories.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-gray-500">
            <p>{t("noCategoriesFound")}</p>
          </div>
        ) : (
          categories.map((category) => (
            <DropdownMenuItem key={category.id} asChild>
              <Link
                href={`/${lng}/category/${category.slug}`}
                className="flex items-center gap-3"
              >
                {category.image_url && (
                  <div className="h-8 w-8 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={category.image_url || "/placeholder.svg"}
                      alt={
                        isArabic && category.name_ar
                          ? category.name_ar
                          : category.name
                      }
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <span>
                    {isArabic && category.name_ar
                      ? category.name_ar
                      : category.name}
                  </span>
                  {category.type && (
                    <span className="text-xs text-muted-foreground">
                      {getCategoryTypeTranslation(category.type)}
                    </span>
                  )}
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
