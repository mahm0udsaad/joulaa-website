import Image from "next/image";
import Link from "next/link";
import { useCategory } from "@/contexts/category-context";
import { useTranslation } from "@/app/i18n";

interface CategorySectionProps {
  lng: string;
}

export default function CategorySection({ lng }: CategorySectionProps) {
  const { categories } = useCategory();
  const { t } = useTranslation(lng, "common");
  const isArabic = lng === "ar";
  const activeCategories = categories
    .filter((category) => category.isActive)
    .slice(0, 3);

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        {t("shopByCategory")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeCategories.map((category) => (
          <Link
            href={`/${lng}/category/${category.slug}`}
            key={category.id}
            className="group relative overflow-hidden rounded-lg h-64 transition-all duration-300 hover:shadow-xl"
          >
            <Image
              src={category.image || "/placeholder.svg"}
              alt={
                isArabic && category.name_ar ? category.name_ar : category.name
              }
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-2xl font-bold text-center mb-2">
                {isArabic && category.name_ar
                  ? category.name_ar
                  : category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-white/90 text-center px-4">
                  {isArabic && category.description_ar
                    ? category.description_ar
                    : category.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
