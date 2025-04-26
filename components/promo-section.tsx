import Image from "next/image"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import LocalizedLink from "@/components/localized-link"

interface PromoSection {
  id: string
  title: string
  title_ar: string
  subtitle: string
  subtitle_ar: string
  description: string
  description_ar: string
  image_url: string
  button_text: string
  button_text_ar: string
  button_link: string
  background_color: string
  text_color: string
  active: boolean
}

async function getPromoSections() {
  try {
    // First check if the table exists by making a small query
    const { error: tableCheckError } = await supabase.from("promo_sections").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      console.error("promo_sections table does not exist")
      return { error: "Promo sections table not set up. Please visit the admin homepage manager to set up the table." }
    }

    const { data, error } = await supabase.from("promo_sections").select("*").eq("active", true)

    if (error) {
      console.error("Error fetching promo sections:", error)
      return { error: "Failed to load promotional sections" }
    }

    return { data: data || [] }
  } catch (err) {
    console.error("Error in getPromoSections:", err)
    return { error: "Failed to load promotional sections" }
  }
}

export default async function PromoSection({ title, lng }: { title: string; lng?: string }) {
  const { data: promoSections, error } = await getPromoSections()
  const isArabic = lng === "ar"

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>
  }

  if (!promoSections || promoSections.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="space-y-6">
        {promoSections.map((promo) => (
          <div key={promo.id} className={`rounded-lg overflow-hidden ${promo.background_color || "bg-rose-100"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 flex flex-col justify-center">
                <h3 className={`text-2xl font-bold mb-2 ${promo.text_color || "text-rose-900"}`}>
                  {isArabic ? promo.title_ar || promo.title : promo.title}
                </h3>
                <p className={`text-lg mb-2 ${promo.text_color || "text-rose-900"}`}>
                  {isArabic ? promo.subtitle_ar || promo.subtitle : promo.subtitle}
                </p>
                <p className={`mb-4 ${promo.text_color || "text-rose-900"}`}>
                  {isArabic ? promo.description_ar || promo.description : promo.description}
                </p>
                <LocalizedLink href={promo.button_link} lng={lng}>
                  <Button variant="secondary" className="w-fit">
                    {isArabic ? promo.button_text_ar || promo.button_text : promo.button_text}
                  </Button>
                </LocalizedLink>
              </div>
              <div className="h-64 md:h-60">
                <Image
                  src={promo.image_url || "/placeholder.svg?height=400&width=600"}
                  alt={isArabic ? promo.title_ar || promo.title : promo.title}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
