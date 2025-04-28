import type React from "react";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/app/i18n";
import Hero from "@/components/hero";
import FeaturedProducts from "@/components/featured-products";
import NewArrivals from "@/components/new-arrivals";
import BestSellers from "@/components/best-sellers";
import PromoModal from "@/components/promo-modal";
import CategoryShowcase from "@/components/category-showcase";
import PromoSection from "@/components/promo-section";
import CategoriesSidebar from "@/components/categories-sidebar";
import DailyDeals from "@/components/daily-deals";
import TrendingProducts from "@/components/trending-products";
import SectionCard from "@/components/section-card";
import { Skeleton } from "@/components/ui/skeleton";

// Replace the getSections function with this version that uses the default schema
async function getSections() {
  return [
    { id: "1", type: "hero", visible: true, order: 1 },
    { id: "2", type: "category-showcase", visible: true, order: 5 },
    { id: "3", type: "trending", visible: true, order: 2 },
    { id: "4", type: "featured", visible: true, order: 3 },
    { id: "5", type: "new-arrivals", visible: true, order: 4 },
    { id: "6", type: "best-sellers", visible: true, order: 6 },
    { id: "7", type: "end-of-month-sale", visible: true, order: 7 },
    { id: "8", type: "promo", visible: true, order: 8 },
  ];
}

// Fetch section cards
async function getSectionCards(position: string, lng: string) {
  try {
    const { data, error } = await supabase
      .from("section_cards")
      .select("*")
      .eq("position", position)
      .eq("active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error(
        `Error fetching section card for position ${position}:`,
        error,
      );
      return null;
    }

    const isArabic = lng === "ar";

    return {
      id: data.id.toString(),
      title: isArabic && data.title_ar ? data.title_ar : data.title,
      title_ar: data.title_ar,
      subtitle:
        isArabic && data.subtitle_ar ? data.subtitle_ar : data.subtitle || "",
      subtitle_ar: data.subtitle_ar,
      description:
        isArabic && data.description_ar
          ? data.description_ar
          : data.description || "",
      description_ar: data.description_ar,
      image: data.image_url,
      link: data.button_link,
      linkText:
        isArabic && data.button_text_ar
          ? data.button_text_ar
          : data.button_text,
      button_text_ar: data.button_text_ar,
      position: data.position,
      order: data.order || 1,
      active: data.active,
    };
  } catch (error) {
    console.error(
      `Error fetching section card for position ${position}:`,
      error,
    );
    return null;
  }
}

export default async function Home({
  params: paramsPromise,
}: {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await paramsPromise;
  const { t } = await useTranslation(lng);
  const sections = await getSections();

  const sortedSections = [...sections]
    .filter((section) => section.visible)
    .sort((a, b) => a.order - b.order);

  // Get section cards for each position
  const [trendingCard, featuredCard, newArrivalsCard, bestSellersCard] =
    await Promise.all([
      getSectionCards("trending", lng),
      getSectionCards("featured", lng),
      getSectionCards("new-arrivals", lng),
      getSectionCards("best-sellers", lng),
    ]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            {t("home.loading")}
          </div>
        }
      >
        <PromoModal lng={lng} />
      </Suspense>

      <div className="w-full mx-auto">
        {/* Top section with hero and sidebars */}
        {sortedSections.some((s) => s.type === "hero") && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-2 md:px-4 py-6">
            {/* Left sidebar with categories - hidden on mobile */}
            <div className="hidden md:block md:col-span-3 lg:col-span-2">
              <Suspense
                fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}
              >
                <CategoriesSidebar lng={lng} />
              </Suspense>
            </div>

            {/* Main hero banner - full width on mobile, adjusted column span on larger screens */}
            <div className="col-span-1 md:col-span-6 lg:col-span-7 w-full">
              <Suspense
                fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}
              >
                <Hero lng={lng} />
              </Suspense>
            </div>

            {/* Right sidebar with deals - hidden on mobile */}
            <div className="hidden md:block md:col-span-3">
              <Suspense
                fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}
              >
                <DailyDeals lng={lng} />
              </Suspense>
            </div>
          </div>
        )}

        {/* Render sections in order */}
        {sortedSections.map((section) => {
          if (section.type === "hero") return null;

          // Trending Products Section
          if (section.type === "trending") {
            return (
              <div
                key={section.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-8 mb-12"
              >
                <div className="md:col-span-9">
                  <Suspense
                    fallback={
                      <Skeleton className="h-[400px] w-full rounded-lg" />
                    }
                  >
                    <TrendingProducts
                      title={t("home.sections.trending")}
                      lng={lng}
                    />
                  </Suspense>
                </div>
                {trendingCard && (
                  <div className="md:col-span-3 flex items-stretch">
                    <SectionCard {...trendingCard} lng={lng} />
                  </div>
                )}
              </div>
            );
          }

          // Category Showcase Section
          if (section.type === "category-showcase") {
            return (
              <div key={section.id} className="px-4 md:px-8 mb-12">
                <Suspense
                  fallback={
                    <Skeleton className="h-[400px] w-full rounded-lg" />
                  }
                >
                  <CategoryShowcase
                    title={t("home.sections.categoryShowcase")}
                    lng={lng}
                  />
                </Suspense>
              </div>
            );
          }

          // Featured Products Section
          if (section.type === "featured") {
            return (
              <div
                key={section.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-8 mb-12"
              >
                <div className="md:col-span-9">
                  <Suspense
                    fallback={
                      <Skeleton className="h-[400px] w-full rounded-lg" />
                    }
                  >
                    <FeaturedProducts
                      title={t("home.sections.featured")}
                      lng={lng}
                    />
                  </Suspense>
                </div>
                {featuredCard && (
                  <div className="md:col-span-3 flex items-stretch">
                    <SectionCard {...featuredCard} lng={lng} />
                  </div>
                )}
              </div>
            );
          }

          // New Arrivals Section
          if (section.type === "new-arrivals") {
            return (
              <div
                key={section.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-8 mb-12"
              >
                <div className="md:col-span-9">
                  <Suspense
                    fallback={
                      <Skeleton className="h-[400px] w-full rounded-lg" />
                    }
                  >
                    <NewArrivals
                      title={t("home.sections.newArrivals")}
                      lng={lng}
                    />
                  </Suspense>
                </div>
                {newArrivalsCard && (
                  <div className="md:col-span-3 flex items-stretch">
                    <SectionCard {...newArrivalsCard} lng={lng} />
                  </div>
                )}
              </div>
            );
          }

          // Best Sellers Section
          if (section.type === "best-sellers") {
            return (
              <div
                key={section.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 md:px-8 mb-12"
              >
                <div className="md:col-span-9">
                  <Suspense
                    fallback={
                      <Skeleton className="h-[400px] w-full rounded-lg" />
                    }
                  >
                    <BestSellers
                      title={t("home.sections.bestSellers")}
                      lng={lng}
                    />
                  </Suspense>
                </div>
                {bestSellersCard && (
                  <div className="md:col-span-3 flex items-stretch">
                    <SectionCard {...bestSellersCard} lng={lng} />
                  </div>
                )}
              </div>
            );
          }

          // Promo Section
          if (section.type === "promo") {
            return (
              <div key={section.id} className="px-4 md:px-8 mb-12">
                <Suspense
                  fallback={
                    <Skeleton className="h-[300px] w-full rounded-lg" />
                  }
                >
                  <PromoSection
                    title={t("home.sections.promotions")}
                    lng={lng}
                  />
                </Suspense>
              </div>
            );
          }

          return null;
        })}
      </div>
    </main>
  );
}
