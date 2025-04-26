import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/app/i18n";

async function getNewArrivals() {
  try {
    // Fetch new arrivals - products with isNewArrival flag or most recently added
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or("isNewArrival.eq.true")
      .order("createdAt", { ascending: false })
      .limit(9);

    if (error) {
      console.error("Error fetching new arrivals:", error);
      throw new Error("Unable to fetch products");
    }

    return {
      products: data || [],
      featuredProduct:
        data?.find((product) => product.newArrivalHeroSection === true) || null,
      secondProduct:
        data?.find(
          (product) =>
            product.newArrivalHeroSection === true &&
            product.id !==
              data?.find((p) => p.newArrivalHeroSection === true)?.id,
        ) || null,
    };
  } catch (err) {
    console.error("Error fetching new arrivals:", err);
    throw new Error("An unexpected error occurred");
  }
}

export default async function NewArrivalsPage({
  params: paramsPromise,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await paramsPromise;
  const { t } = await useTranslation(lng, "new-arrivals");
  let content;

  try {
    const { products, featuredProduct, secondProduct } = await getNewArrivals();

    if (products.length === 0) {
      content = (
        <main className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
          <p className="text-gray-500 mb-6">{t("noProducts")}</p>
          <Link href="/">
            <Button>{t("returnHome")}</Button>
          </Link>
        </main>
      );
    } else {
      content = (
        <main>
          {/* Hero Section */}
          <section className="relative bg-accent min-h-[60vh] flex items-center">
            <div className="container mx-auto px-4 py-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                    {t("heroTitle.line1")}
                    <br />
                    <span className="text-primary">{t("heroTitle.line2")}</span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-md">
                    {t("heroDescription")}
                  </p>
                  <div className="flex items-center text-primary font-medium">
                    <span>{t("exploreCollection")}</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {featuredProduct && (
                    <div className="relative h-80 rounded-lg overflow-hidden transform translate-y-8">
                      <Image
                        src={
                          featuredProduct.image_urls?.[0] || "/placeholder.svg"
                        }
                        alt={featuredProduct.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="font-medium">{featuredProduct.name}</p>
                        <p className="text-sm opacity-90">
                          {featuredProduct.brand}
                        </p>
                      </div>
                    </div>
                  )}
                  {secondProduct && (
                    <div className="relative h-80 rounded-lg overflow-hidden transform -translate-y-8">
                      <Image
                        src={
                          secondProduct.image_urls?.[0] || "/placeholder.svg"
                        }
                        alt={secondProduct.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="font-medium">{secondProduct.name}</p>
                        <p className="text-sm opacity-90">
                          {secondProduct.brand}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Products Grid */}
          <section className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                {t("latestAdditions")}
              </h2>
              <p className="text-muted-foreground">
                {t("latestAdditionsDescription")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </main>
      );
    }

    return content;
  } catch (error) {
    return (
      <main className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <p className="text-red-500 mb-6">{t("error")}</p>
        <Link href="/">
          <Button>{t("returnHome")}</Button>
        </Link>
      </main>
    );
  }
}
