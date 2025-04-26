import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface ProductSuggestion {
  id: number;
  name: string;
  category: string;
  image_urls: string[];
}

export default function SearchComponent({ t }: { t: Function }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, category, image_urls")
          .ilike("name", `%${searchQuery}%`)
          .limit(5);

        if (error) throw error;
        setSuggestions(data || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products/${searchQuery}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">{t("navbar.search")}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[300px] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <form onSubmit={handleSearch} className="p-2">
            <div className="relative">
              <Input
                type="text"
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              {t("search.loading")}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto">
              {suggestions.map((suggestion) => (
                <Link
                  key={suggestion.id}
                  href={`/product/${suggestion.id}`}
                  className="block px-4 py-2 hover:bg-gray-50 text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={suggestion.image_urls[0] || "/placeholder.svg"}
                        alt={suggestion.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{suggestion.name}</div>
                      <div className="text-xs text-gray-500">
                        {suggestion.category}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              {t("search.noResults")}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
