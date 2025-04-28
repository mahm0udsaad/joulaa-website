// category-showcase.tsx (Server Component)
import { supabase } from "@/lib/supabase";
import ClientCategoryShowcase from "./category-showcase-client";

interface CategoryItem {
  id: string;
  name: string;
  name_ar?: string;
  icon: string;
  color: string;
  href: string;
  image: string;
  active: boolean;
  order: number;
}

export default async function CategoryShowcase({
  title,
  locale = "en",
}: {
  title: string;
  locale?: string;
}) {
  let categories: CategoryItem[] = [];
  let error: string | null = null;

  try {
    const { data, error: supabaseError } = await supabase
      .from("category_showcase")
      .select("*")
      .eq("active", true)
      .order("order", { ascending: true });

    if (supabaseError) throw supabaseError;

    categories = data || [];
  } catch (err) {
    console.error("Error fetching categories:", err);
    error = "Failed to load categories";
  }

  return (
    <ClientCategoryShowcase
      title={title}
      locale={locale}
      initialCategories={categories}
      initialError={error}
    />
  );
}
