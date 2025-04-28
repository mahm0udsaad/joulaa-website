import { supabase } from "@/lib/supabase";
import PromoModalClient from "./promo-modal-client";

interface PromoModal {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  button_link: string;
  active: boolean;
}

async function getPromoModal() {
  try {
    const { data, error } = await supabase
      .from("promo_modals")
      .select("*")
      .eq("active", true)
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching promo modal:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching promo modal:", error);
    return null;
  }
}

export default async function PromoModal() {
  const promo = await getPromoModal();

  return <PromoModalClient promo={promo} />;
}
