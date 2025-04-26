export { useCategory } from "@/contexts/category-context"
export type { Category } from "@/contexts/category-context"

export interface Category {
  id: string;
  name: string;
  name_ar?: string;
  image: string;
  count: number;
  description?: string;
  description_ar?: string;
  slug: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
