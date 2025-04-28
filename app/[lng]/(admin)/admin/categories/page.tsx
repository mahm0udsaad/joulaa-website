"use client";

import type React from "react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  Switch,
} from "@/components/ui/ui";
import {  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,} from "@/components/ui/tabs"
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import {  useRef, useState } from "react";
import { useCategory, type Category } from "@/hooks/use-category";
import { toast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/upload-helper";
import { supabase } from "@/lib/supabase";

export default function CategoriesPage() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    isLoading,
  } = useCategory();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<Partial<Category> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Open dialog for adding a new category
  const handleAddCategory = () => {
    setCurrentCategory({
      name: "",
      image: "",
      count: 0,
      description: "",
      slug: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  // Open dialog for editing a category
  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setDialogOpen(true);
  };

  // Open dialog for deleting a category
  const handleDeleteClick = (category: Category) => {
    setCurrentCategory(category);
    setDeleteDialogOpen(true);
  };

  // Handle image upload button click
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Upload the image to Supabase Storage
      const imageUrl = await uploadImage(file);

      // Update the category state with the new image URL
      setCurrentCategory((prev) =>
        prev ? { ...prev, image: imageUrl } : null,
      );

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle form submission for adding/editing a category
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!currentCategory?.name) {
        toast({
          title: "Error",
          description: "Name is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const categoryData = {
        name: currentCategory.name,
        name_ar: currentCategory.name_ar || undefined,
        image: currentCategory.image || "",
        description: currentCategory.description || undefined,
        description_ar: currentCategory.description_ar || undefined,
        slug: currentCategory.slug || currentCategory.name.toLowerCase().replace(/\s+/g, "-"),
        count: currentCategory.count || 0,
        isActive: currentCategory.isActive ?? true,
      };

      if (currentCategory.id) {
        // Update existing category
        await updateCategory(currentCategory.id, categoryData);
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
        setDialogOpen(false);
      } else {
        // Add new category
        await addCategory(
          categoryData as Omit<Category, "id" | "createdAt" | "updatedAt">,
        );
        toast({
          title: "Success",
          description: "Category added successfully",
        });
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle category deletion
  const handleDelete = async () => {
    if (currentCategory?.id) {
      try {
        await deleteCategory(currentCategory.id);
        setDeleteDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive",
        });
      }
    }
  };

  // Generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    setCurrentCategory((prev) => (prev ? { ...prev, name, slug } : null));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">Loading...</div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={handleAddCategory} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        <Image
                          src={category.image || "/placeholder.svg"}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>{category.count}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          category.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(category)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentCategory?.id ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {currentCategory?.id
                ? "Update the details of this category."
                : "Create a new category for your products."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">Arabic</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name (English)
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={currentCategory?.name || ""}
                      onChange={handleNameChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">
                      Description (English)
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={currentCategory?.description || ""}
                      onChange={(e) =>
                        setCurrentCategory((prev) =>
                          prev ? { ...prev, description: e.target.value } : null,
                        )
                      }
                      className="col-span-3"
                      rows={3}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="ar" className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name_ar" className="text-right">
                      Name (Arabic)
                    </Label>
                    <Input
                      id="name_ar"
                      name="name_ar"
                      value={currentCategory?.name_ar || ""}
                      onChange={(e) =>
                        setCurrentCategory((prev) =>
                          prev ? { ...prev, name_ar: e.target.value } : null,
                        )
                      }
                      className="col-span-3"
                      dir="rtl"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description_ar" className="text-right pt-2">
                      Description (Arabic)
                    </Label>
                    <Textarea
                      id="description_ar"
                      name="description_ar"
                      value={currentCategory?.description_ar || ""}
                      onChange={(e) =>
                        setCurrentCategory((prev) =>
                          prev ? { ...prev, description_ar: e.target.value } : null,
                        )
                      }
                      className="col-span-3"
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  value={currentCategory?.slug || ""}
                  onChange={(e) =>
                    setCurrentCategory((prev) =>
                      prev ? { ...prev, slug: e.target.value } : null,
                    )
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image URL
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="image"
                    name="image"
                    value={currentCategory?.image || ""}
                    onChange={(e) =>
                      setCurrentCategory((prev) =>
                        prev ? { ...prev, image: e.target.value } : null,
                      )
                    }
                    className="flex-grow"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleImageButtonClick}
                    disabled={isUploading}
                    title="Upload image"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              {currentCategory?.image && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">Preview</div>
                  <div className="col-span-3">
                    <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                      <Image
                        src={currentCategory.image || "/placeholder.svg"}
                        alt="Category preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="count" className="text-right">
                  Product Count
                </Label>
                <Input
                  id="count"
                  name="count"
                  type="number"
                  value={currentCategory?.count || 0}
                  onChange={(e) =>
                    setCurrentCategory((prev) =>
                      prev
                        ? {
                            ...prev,
                            count: Number.parseInt(e.target.value) || 0,
                          }
                        : null,
                    )
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Active
                </Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    name="isActive"
                    checked={currentCategory?.isActive ?? true}
                    onCheckedChange={(checked) =>
                      setCurrentCategory((prev) =>
                        prev ? { ...prev, isActive: checked } : null,
                      )
                    }
                  />
                  <Label htmlFor="isActive">Show this category</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "
              {currentCategory?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
