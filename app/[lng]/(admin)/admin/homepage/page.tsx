import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HeroSlidesTab from "@/components/admin/homepage/hero-slides-tab"
import CategoriesTab from "@/components/admin/homepage/categories-tab"
import SectionCardsTab from "@/components/admin/homepage/section-cards-tab"
import PromoSectionsTab from "@/components/admin/homepage/promo-sections-tab"
import PromoModalTab from "@/components/admin/homepage/promo-modal-tab"
import { supabase } from "@/lib/supabase"

export default async function HomePageManager() {

  // Fetch all homepage data
  const [
    heroSlides,
    categories,
    sectionCards,
    promoSections,
    promoModals
  ] = await Promise.all([
    // Fetch hero slides
    supabase
      .from("hero_slides")
      .select("*")
      .order("order", { ascending: true }),
    
    // Fetch categories
    supabase
      .from("category-showcase")
      .select("*")
      .order("order", { ascending: true }),
    
    // Fetch section cards
    supabase
      .from("section_cards")
      .select("*"),
    
    // Fetch promo sections
    supabase
      .from("promo_sections")
      .select("*")
      .order("order", { ascending: true }),
    
    // Fetch promo modal
    supabase
    .from("promo_modals")
    .select("*")
    .order("created_at", { ascending: false })
  ])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Homepage Manager</h1>

      <Tabs defaultValue="hero-slides">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hero-slides">Hero Slides</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="section-cards">Section Cards</TabsTrigger>
          <TabsTrigger value="promo-sections">Promo Sections</TabsTrigger>
          <TabsTrigger value="promo-modal">Promo Modal</TabsTrigger>
        </TabsList>

        <TabsContent value="hero-slides" className="p-4 border rounded-md mt-4">
          <HeroSlidesTab initialData={heroSlides.data || []} />
        </TabsContent>

        <TabsContent value="categories" className="p-4 border rounded-md mt-4">
          <CategoriesTab initialData={categories.data || []} />
        </TabsContent>

        <TabsContent value="section-cards" className="p-4 border rounded-md mt-4">
          <SectionCardsTab initialData={sectionCards.data || []} />
        </TabsContent>

        <TabsContent value="promo-sections" className="p-4 border rounded-md mt-4">
          <PromoSectionsTab initialData={promoSections.data || []} />
        </TabsContent>

        <TabsContent value="promo-modal" className="p-4 border rounded-md mt-4">
          <PromoModalTab initialData={promoModals.data || null} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
