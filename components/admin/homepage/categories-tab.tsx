"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import {
  Trash,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Star,
  Heart,
  Sun,
  Moon,
  Smile,
  ShoppingBag,
  Gift,
  Gem,
  Crown,
  Coffee,
  Palette,
  Droplet,
  Flower,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define the type for category showcase items
type CategoryShowcase = {
  id: string;
  category_id: string;
  name: string;
  name_ar: string;
  icon: string;
  color: string;
  href: string;
  image: string;
  active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
};

// Define available icons from lucide-react
const lucideIcons: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="h-5 w-5" />,
  Star: <Star className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Sun: <Sun className="h-5 w-5" />,
  Moon: <Moon className="h-5 w-5" />,
  Smile: <Smile className="h-5 w-5" />,
  ShoppingBag: <ShoppingBag className="h-5 w-5" />,
  Gift: <Gift className="h-5 w-5" />,
  Gem: <Gem className="h-5 w-5" />,
  Crown: <Crown className="h-5 w-5" />,
  Coffee: <Coffee className="h-5 w-5" />,
  Palette: <Palette className="h-5 w-5" />,
  Droplet: <Droplet className="h-5 w-5" />,
  Flower: <Flower className="h-5 w-5" />,
};

// Colors available for selection
const availableColors = [
  "from-rose-400 to-rose-200",
  "from-blue-400 to-blue-200",
  "from-green-400 to-green-200",
  "from-purple-400 to-purple-200",
  "from-yellow-400 to-yellow-200",
  "from-pink-400 to-pink-200",
  "from-indigo-400 to-indigo-200",
  "from-amber-400 to-amber-200",
];

interface CategoriesTabProps {
  initialData: any[] // Replace 'any' with your actual type
}

export default function CategoriesTab({ initialData }: CategoriesTabProps) {
  const [showcaseItems, setShowcaseItems] = useState<CategoryShowcase[]>([]);
  const [categories, setCategories] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Form state for new/edited showcase
  const [formData, setFormData] = useState<Partial<CategoryShowcase>>({
    name: "",
    name_ar: "",
    icon: "Sparkles",
    color: "from-rose-400 to-rose-200",
    href: "",
    image: "",
    active: true,
    order: 1,
    category_id: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Fetch showcase items
      const { data: showcaseData, error: showcaseError } = await supabase
        .from("category_showcase")
        .select("*")
        .order("order", { ascending: true });

      if (showcaseError) {
        console.error("Error fetching showcase data:", showcaseError);
      } else {
        setShowcaseItems(showcaseData || []);
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name");

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
      } else {
        setCategories(categoriesData || []);
        // Set default category if available
        if (categoriesData && categoriesData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category_id: categoriesData[0].id,
          }));
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle switch changes
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      name_ar: "",
      icon: "Sparkles",
      color: "from-rose-400 to-rose-200",
      href: "",
      image: "",
      active: true,
      order: showcaseItems.length + 1,
      category_id: categories.length > 0 ? categories[0].id : "",
    });
    setIsEditing(null);
  };

  // Load data for editing
  const handleEdit = (item: CategoryShowcase) => {
    setFormData({ ...item });
    setIsEditing(item.id);
    setIsDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Set loading state to true

    const timestamp = new Date().toISOString();

    try {
      if (isEditing) {
        // Update existing item
        const { error } = await supabase
          .from("category_showcase")
          .update({
            ...formData,
            updated_at: timestamp,
          })
          .eq("id", isEditing);

        if (error) {
          console.error("Error updating showcase:", error);
        } else {
          // Update local state
          setShowcaseItems((prev) =>
            prev.map((item) =>
              item.id === isEditing
                ? ({
                    ...item,
                    ...formData,
                    updated_at: timestamp,
                  } as CategoryShowcase)
                : item,
            ),
          );
        }
      } else {
        // Add new item
        const newItem = {
          ...formData,
          created_at: timestamp,
          updated_at: timestamp,
        };

        const { data, error } = await supabase
          .from("category_showcase")
          .insert([newItem])
          .select();

        if (error) {
          console.error("Error adding showcase:", error);
        } else if (data) {
          // Update local state with the returned data
          setShowcaseItems((prev) => [...prev, data[0] as CategoryShowcase]);
        }
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };
  // Handle delete
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("category_showcase")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting showcase:", error);
    } else {
      setShowcaseItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    return lucideIcons[iconName] || lucideIcons.Sparkles;
  };

  // Only keep the reordering effect if needed
  useEffect(() => {
    const handleReorder = async () => {
      // ... existing reorder logic ...
    }
    handleReorder()
  }, [categories])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Category Showcase Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setIsEditing(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Showcase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Showcase Item" : "Add New Showcase Item"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <Tabs defaultValue="english">
                <TabsList className="mb-4">
                  <TabsTrigger value="english">English</TabsTrigger>
                  <TabsTrigger value="arabic">Arabic</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                <TabsContent value="english" className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name (English)</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="href">URL Path</Label>
                    <Input
                      id="href"
                      name="href"
                      value={formData.href || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      name="image"
                      value={formData.image || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="arabic" className="space-y-4">
                  <div>
                    <Label htmlFor="name_ar">Name (Arabic)</Label>
                    <Input
                      id="name_ar"
                      name="name_ar"
                      value={formData.name_ar || ""}
                      onChange={handleInputChange}
                      dir="rtl"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) =>
                        handleSelectChange("category_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      name="order"
                      type="number"
                      value={formData.order || 1}
                      onChange={handleInputChange}
                      min={1}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Select
                      value={formData.icon}
                      onValueChange={(value) =>
                        handleSelectChange("icon", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon">
                          <div className="flex items-center space-x-2">
                            {formData.icon && getIconComponent(formData.icon)}
                            <span>{formData.icon}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(lucideIcons).map(([name, icon]) => (
                          <SelectItem key={name} value={name}>
                            <div className="flex items-center space-x-2">
                              {icon}
                              <span>{name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="color">Color Gradient</Label>
                    <Select
                      value={formData.color}
                      onValueChange={(value) =>
                        handleSelectChange("color", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-6 h-6 rounded-full bg-gradient-to-r ${formData.color}`}
                            ></div>
                            <span>{formData.color}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {availableColors.map((color) => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-6 h-6 rounded-full bg-gradient-to-r ${color}`}
                              ></div>
                              <span>{color}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {isEditing ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? "Update" : "Save"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading...</div>
        </div>
      ) : showcaseItems.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-gray-500">
            No showcase items found. Add your first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcaseItems.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`h-40 bg-gradient-to-r ${item.color} relative`}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover mix-blend-overlay"
                  />
                )}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                {!item.active && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                    Inactive
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-1 rounded-full bg-white shadow-sm">
                    {getIconComponent(item.icon)}
                  </div>
                  <h3 className="font-medium text-lg">{item.name}</h3>
                </div>
                {item.name_ar && (
                  <p
                    className="text-sm text-gray-500 mb-2 text-right"
                    dir="rtl"
                  >
                    {item.name_ar}
                  </p>
                )}
                <div className="text-sm text-gray-500 mt-2">
                  <p>Path: {item.href}</p>
                  <p>Order: {item.order}</p>
                  <p>
                    Category:{" "}
                    {categories.find((c) => c.id === item.category_id)?.name ||
                      "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
