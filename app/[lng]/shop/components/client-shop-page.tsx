"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useCategory } from "@/contexts/category-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/contexts/product-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useInView } from "react-intersection-observer";
import Link from "next/link";

interface FiltersState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  onSale: boolean;
  newArrivals: boolean;
  bestSellers: boolean;
}

interface FiltersContentProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
  categories: Array<{
    name_ar: string;
    id: string;
    name: string;
  }>;
  translations: Translations;
  resetFilters: () => void;
}

interface Translations {
  shopAllProducts: string;
  filters: string;
  search: string;
  categories: string;
  priceRange: string;
  brands: string;
  onSale: string;
  newArrivals: string;
  bestSellers: string;
  resetFilters: string;
  noProducts: string;
  tryAdjusting: string;
  showing: string;
  products: string;
  sortBy: string;
  featured: string;
  newest: string;
  priceLowHigh: string;
  priceHighLow: string;
  rating: string;
  loadMore: string;
}

const PRODUCTS_PER_PAGE = 50;

interface ClientShopPageProps {
  lng: string;
  initialProducts: Product[];
  translations: Translations;
}

export default function ClientShopPage({
  lng,
  initialProducts,
  translations,
}: ClientShopPageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();
  const { categories } = useCategory();

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: 0,
    maxPrice: 1000,
    onSale: false,
    newArrivals: false,
    bestSellers: false,
  });

  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMoreProducts();
    }
  }, [inView]);

  async function loadMoreProducts() {
    if (!hasMore || loading) return;

    setLoading(true);
    const nextPage = page + 1;
    const start = (nextPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE - 1;

    try {
      let query = supabase.from("products").select("*").range(start, end);

      // Apply filters
      if (filters.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }
      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.onSale) {
        query = query.eq("on_sale", true);
      }
      if (filters.newArrivals) {
        query = query.eq("is_new_arrival", true);
      }
      if (filters.bestSellers) {
        query = query.eq("is_best_seller", true);
      }

      // Apply sorting
      switch (sortBy) {
        case "priceLowHigh":
          query = query.order("price", { ascending: true });
          break;
        case "priceHighLow":
          query = query.order("price", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts((prev) => [...prev, ...data]);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFilterChange(newFilters: typeof filters) {
    setFilters(newFilters);
    setPage(1);
    setHasMore(true);
    setLoading(true);

    try {
      let query = supabase
        .from("products")
        .select("*")
        .range(0, PRODUCTS_PER_PAGE - 1);

      if (newFilters.search) {
        query = query.ilike("name", `%${newFilters.search}%`);
      }
      if (newFilters.category) {
        query = query.eq("category", newFilters.category);
      }
      if (newFilters.onSale) {
        query = query.eq("on_sale", true);
      }
      if (newFilters.newArrivals) {
        query = query.eq("is_new_arrival", true);
      }
      if (newFilters.bestSellers) {
        query = query.eq("is_best_seller", true);
      }

      switch (sortBy) {
        case "priceLowHigh":
          query = query.order("price", { ascending: true });
          break;
        case "priceHighLow":
          query = query.order("price", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setProducts(data || []);
      setHasMore(data && data.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setFilters({
      search: "",
      category: "",
      minPrice: 0,
      maxPrice: 1000,
      onSale: false,
      newArrivals: false,
      bestSellers: false,
    });
    setSortBy("newest");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {translations.shopAllProducts}
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <div className="lg:w-1/4">
          <div className="sticky top-24">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden mb-4">
                  <SlidersHorizontal className="mx-2 h-4 w-4" />
                  {translations.filters}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <FiltersContent
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  categories={categories.map((category) => ({
                    ...category,
                    name_ar: category.name_ar || "", // Provide a default value for name_ar
                  }))}
                  translations={translations}
                  resetFilters={resetFilters}
                />
              </SheetContent>
            </Sheet>

            <div className="hidden lg:block">
              <FiltersContent
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
                translations={translations}
                resetFilters={resetFilters}
              />
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-600">
              {translations.showing} {products.length} {translations.products}
            </p>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={translations.sortBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{translations.newest}</SelectItem>
                <SelectItem value="priceLowHigh">
                  {translations.priceLowHigh}
                </SelectItem>
                <SelectItem value="priceHighLow">
                  {translations.priceHighLow}
                </SelectItem>
                <SelectItem value="rating">{translations.rating}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/${lng}/product/${product.id}`}>
                    <ProductCard product={product} lng={lng} />
                  </Link>
                ))}
              </div>

              {/* Infinite scroll trigger */}
              {hasMore && (
                <div ref={ref} className="flex justify-center mt-8">
                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-[300px] w-full" />
                      ))}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => loadMoreProducts()}
                    >
                      {translations.loadMore}
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">
                {translations.noProducts}
              </h3>
              <p className="text-gray-600">{translations.tryAdjusting}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FiltersContent({
  filters,
  onFilterChange,
  categories,
  translations,
  resetFilters,
}: FiltersContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">{translations.search}</h3>
        <div className="relative">
          <Input
            type="text"
            placeholder={translations.search}
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="categories">
          <AccordionTrigger>{translations.categories}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.category === category.id}
                    onCheckedChange={() =>
                      onFilterChange({
                        ...filters,
                        category:
                          filters.category === category.id ? "" : category.id,
                      })
                    }
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="mx-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name_ar || category.name}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>{translations.priceRange}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={[filters.minPrice, filters.maxPrice]}
                max={1000}
                step={10}
                onValueChange={([min, max]) =>
                  onFilterChange({ ...filters, minPrice: min, maxPrice: max })
                }
              />
              <div className="flex justify-between text-sm">
                <span>${filters.minPrice}</span>
                <span>${filters.maxPrice}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-4">
        <div className="flex items-center">
          <Checkbox
            id="onSale"
            checked={filters.onSale}
            onCheckedChange={(checked) =>
              onFilterChange({ ...filters, onSale: checked as boolean })
            }
          />
          <label htmlFor="onSale" className="mx-2">
            {translations.onSale}
          </label>
        </div>

        <div className="flex items-center">
          <Checkbox
            id="newArrivals"
            checked={filters.newArrivals}
            onCheckedChange={(checked) =>
              onFilterChange({ ...filters, newArrivals: checked as boolean })
            }
          />
          <label htmlFor="newArrivals" className="mx-2">
            {translations.newArrivals}
          </label>
        </div>

        <div className="flex items-center">
          <Checkbox
            id="bestSellers"
            checked={filters.bestSellers}
            onCheckedChange={(checked) =>
              onFilterChange({ ...filters, bestSellers: checked as boolean })
            }
          />
          <label htmlFor="bestSellers" className="mx-2">
            {translations.bestSellers}
          </label>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={resetFilters}>
        <X className="mx-2 h-4 w-4" />
        {translations.resetFilters}
      </Button>
    </div>
  );
}
