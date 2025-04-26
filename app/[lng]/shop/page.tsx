import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/app/i18n";
import ClientShopPage from "./components/client-shop-page";

const PRODUCTS_PER_PAGE = 50;

async function getProducts(page = 1) {
  const start = (page - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE - 1;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .range(start, end)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data || [];
}

export default async function ShopPage({
  params: paramsPromise,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await paramsPromise;
  const { t } = await useTranslation(lng, "common");
  const initialProducts = await getProducts();

  return (
    <ClientShopPage
      lng={lng}
      initialProducts={initialProducts}
      translations={{
        shopAllProducts: t("shop.shopAllProducts"),
        filters: t("shop.filters"),
        search: t("shop.search"),
        categories: t("shop.categories"),
        priceRange: t("shop.priceRange"),
        brands: t("shop.brands"),
        onSale: t("shop.onSale"),
        newArrivals: t("shop.newArrivals"),
        bestSellers: t("shop.bestSellers"),
        resetFilters: t("shop.resetFilters"),
        noProducts: t("shop.noProducts"),
        tryAdjusting: t("shop.tryAdjusting"),
        showing: t("shop.showing"),
        products: t("shop.products"),
        sortBy: t("shop.sortBy"),
        featured: t("shop.featured"),
        newest: t("shop.newest"),
        priceLowHigh: t("shop.priceLowToHigh"),
        priceHighLow: t("shop.priceHighToLow"),
        rating: t("shop.rating"),
        loadMore: t("shop.loadMore"),
      }}
    />
  );
}
