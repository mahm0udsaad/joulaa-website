// hero.tsx (Server Component)
import { supabase } from "@/lib/supabase";
import ClientHero from "./hero-client";

interface HeroSlide {
  id: string;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
  button_text: string;
  button_text_ar: string;
  button_link: string;
  image_url: string;
  order: number;
  active: boolean;
}

interface HeroProps {
  lng: string;
}

export default async function Hero({ lng }: HeroProps) {
  let slides: HeroSlide[] = [];
  let error: string | null = null;

  try {
    const { data, error: fetchError } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("active", true)
      .order("order", { ascending: true });

    if (fetchError) throw fetchError;
    slides = data || [];
  } catch (err) {
    console.error("Error fetching hero slides:", err);
    error = "Failed to load hero slides";
  }

  return <ClientHero lng={lng} initialSlides={slides} initialError={error} />;
}
