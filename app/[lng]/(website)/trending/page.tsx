import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import SortProducts from "@/components/sort-products";
import { useTranslation } from "@/app/i18n";

async function fetchTrendingProducts(sortOption: string = "popularity") {
  try {
    // Check if the products table exists
    const { error: tableError } = await supabase
      .from("products")
      .select("id")
      .limit(1);

    if (tableError) {
      console.error("Error checking products table:", tableError);
      throw new Error("Unable to fetch products");
    }

    // Fetch trending products - high rating, featured, or with discount
    let query = supabase
      .from("products")
      .select("*")
      .or("rating.gte.4,isFeatured.eq.true,discount.gt.0");

    // Apply sorting based on the selected option
    if (sortOption === "popularity") {
      query = query.order("reviews", { ascending: false });
    } else if (sortOption === "rating") {
      query = query.order("rating", { ascending: false });
    } else if (sortOption === "discount") {
      query = query.order("discount", { ascending: false });
    } else if (sortOption === "price-low") {
      query = query.order("price", { ascending: true });
    } else if (sortOption === "price-high") {
      query = query.order("price", { ascending: false });
    }

    const { data, error } = await query.limit(13);

    if (error) {
      console.error("Error fetching trending products:", error);
      throw new Error("Unable to fetch products");
    }

    return data || [];
  } catch (err) {
    console.error("Error fetching trending products:", err);
    throw new Error("An unexpected error occurred");
  }
}

export default async function TrendingPage({
  params: { lng },
  searchParams,
}: {
  params: { lng: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { t } = await useTranslation(lng, "trending");
  const sortOption =
    typeof searchParams?.sort === "string" ? searchParams.sort : "popularity";

  try {
    const products = await fetchTrendingProducts(sortOption);

    if (products.length === 0) {
      return (
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
          <p className="text-gray-500 mb-6">{t("noProducts")}</p>
          <Button asChild>
            <Link href={`/${lng}`}>{t("returnHome")}</Link>
          </Button>
        </main>
      );
    }

    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <form className="w-[180px]">
              <SortProducts
                sortOption={sortOption}
                translations={{
                  label: t("sortBy.label"),
                  popularity: t("sortBy.popularity"),
                  rating: t("sortBy.rating"),
                  discount: t("sortBy.discount"),
                  priceLow: t("sortBy.priceLow"),
                  priceHigh: t("sortBy.priceHigh"),
                }}
              />
            </form>
          </div>
        </div>

        {/* Featured trending product */}
        {products.length > 0 && (
          <div className="relative rounded-lg overflow-hidden mb-12 bg-gradient-to-r from-pink-100 to-purple-100">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-4">
                  {t("featuredTrending")}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {products[0].name}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {products[0].description}
                </p>
                <div className="flex items-center gap-4 mb-6">
                  {products[0].discount > 0 ? (
                    <>
                      <span className="text-2xl font-bold">
                        $
                        {(
                          (products[0].price * (100 - products[0].discount)) /
                          100
                        ).toFixed(2)}
                      </span>
                      <span className="text-lg text-muted-foreground line-through">
                        ${products[0].price.toFixed(2)}
                      </span>
                      <span className="bg-primary/10 text-primary text-sm font-medium px-2 py-1 rounded">
                        {Math.round(products[0].discount)}% {t("discount")}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">
                      ${products[0].price.toFixed(2)}
                    </span>
                  )}
                </div>
                <Button className="w-full sm:w-auto" asChild>
                  <Link href={`/${lng}/product/${products[0].id}`}>
                    {t("shopNow")}
                  </Link>
                </Button>
              </div>
              <div className="md:w-1/2 relative h-64 md:h-auto">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent md:hidden" />
                <Image
                  src={products[0].image_urls?.[0] || "/placeholder.svg"}
                  alt={products[0].name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Trending products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(1).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <p className="text-red-500 mb-6">{t("error")}</p>
        <Button asChild>
          <Link href={`/${lng}`}>{t("returnHome")}</Link>
        </Button>
      </main>
    );
  }
}
