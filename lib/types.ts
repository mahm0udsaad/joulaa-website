// Homepage management types
export interface HeroSlide {
  id: string
  title: string
  title_ar?: string
  subtitle: string
  subtitle_ar?: string
  buttonText: string
  button_text_ar?: string
  buttonLink: string
  image: string
  order: number
  active: boolean
}

export interface CategoryShowcaseItem {
  id: string
  name: string
  name_ar?: string
  icon: string
  color: string
  href: string
  image: string
  order: number
  active: boolean
}

export interface SectionCardItem {
  id: string
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
  order: number
  active: boolean
}

export interface HomePageSection {
  id: string
  type:
    | "hero"
    | "category-showcase"
    | "trending"
    | "featured"
    | "new-arrivals"
    | "best-sellers"
    | "promo"
    | "end-of-month-sale"
  title: string
  visible: boolean
  order: number
}

export interface HomePageState {
  sections: HomePageSection[]
  heroSlides: HeroSlide[]
  categoryItems: CategoryShowcaseItem[]
  sectionCards: SectionCardItem[]
  isLoading: boolean
  error: string | null
}
