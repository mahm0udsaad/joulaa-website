"use client";

import { useRouter } from "next/navigation";

interface SortProductsProps {
  sortOption: string;
  translations: {
    label: string;
    popularity: string;
    rating: string;
    discount: string;
    priceLow: string;
    priceHigh: string;
  };
}

export default function SortProducts({
  sortOption,
  translations,
}: SortProductsProps) {
  const router = useRouter();

  return (
    <select
      name="sort"
      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
      defaultValue={sortOption}
      onChange={(e) => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("sort", e.target.value);
        router.push(newUrl.pathname + newUrl.search);
      }}
    >
      <option value="popularity">{translations.popularity}</option>
      <option value="rating">{translations.rating}</option>
      <option value="discount">{translations.discount}</option>
      <option value="price-low">{translations.priceLow}</option>
      <option value="price-high">{translations.priceHigh}</option>
    </select>
  );
}
