// daily-deals.tsx (Server Component)
import { supabase } from "@/lib/supabase";
import ClientDailyDeals from "./daily-deals-client";
import type { Product } from "@/contexts/product-context";

interface DailyDealsProps {
  lng: string;
}

export default async function DailyDeals({ lng }: DailyDealsProps) {
  let deals: Product[] = [];
  let error: Error | null = null;

  try {
    const { data, error: supabaseError } = await supabase
      .from("products")
      .select("*")
      .eq("isDailyOffer", true)
      .order("id", { ascending: false });

    if (supabaseError) {
      throw supabaseError;
    }

    deals = data || [];
  } catch (err) {
    console.error("Error fetching daily deals:", err);
    error = err instanceof Error ? err : new Error("Unknown error occurred");
  }

  return (
    <ClientDailyDeals lng={lng} initialDeals={deals} initialError={error} />
  );
}
