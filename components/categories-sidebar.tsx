import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/app/i18n";

export default async function CategoriesSidebar({ lng }: { lng: string }) {
  const { data: categories } = await supabase.from("categories").select("*");

  const { t } = await useTranslation(lng, "common");
  const isArabic = lng === "ar";

  return (
    <div className="bg-white rounded-lg shadow-sm h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">{t("categories")}</h3>
      </div>
      <div className="p-2">
        {!categories || categories.length === 0 ? (
          <div className="py-4 px-3 text-center text-gray-500">
            <p>{t("noCategoriesFound")}</p>
          </div>
        ) : (
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/${lng}/category/${category.slug}`}
                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <span>
                    {isArabic && category.name_ar
                      ? category.name_ar
                      : category.name}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
