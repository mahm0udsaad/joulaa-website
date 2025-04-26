import { useTranslation } from "@/app/i18n"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import LocalizedLink from "@/components/localized-link"

interface SectionCardProps {
  id?: string
  title: string
  title_ar?: string
  subtitle?: string
  subtitle_ar?: string
  description?: string
  description_ar?: string
  image: string
  link: string
  linkText: string
  button_text_ar?: string
  position?: string
  lng?: string
}

export default async function SectionCard({
  title,
  title_ar,
  subtitle,
  subtitle_ar,
  description,
  description_ar,
  image,
  link,
  linkText,
  button_text_ar,
  lng = "en",
}: SectionCardProps) {
  const { t } = await useTranslation(lng, "common")
  const isArabic = lng === "ar"

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-lg group">
      <Image
        src={image || "/placeholder.svg?height=400&width=600"}
        alt={isArabic ? title_ar || title : title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-end p-6">
        <div className={`space-y-2 text-${isArabic ? "right" : "left"}`} dir={isArabic ? "rtl" : "ltr"}>
          <h3 className="text-xl font-bold text-white">{isArabic ? title_ar || title : title}</h3>
          {(subtitle || subtitle_ar) && (
            <p className="text-white/90 text-sm">{isArabic ? subtitle_ar || subtitle : subtitle}</p>
          )}
          {(description || description_ar) && (
            <p className="text-white/80 text-xs line-clamp-2">
              {isArabic ? description_ar || description : description}
            </p>
          )}
          <LocalizedLink href={link} lng={lng}>
            <Button variant="secondary" className="mt-2">
              {isArabic ? button_text_ar || linkText : linkText}
            </Button>
          </LocalizedLink>
        </div>
      </div>
    </div>
  )
}
