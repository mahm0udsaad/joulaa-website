"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Trash2, Loader2, ImageIcon, LinkIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Languages } from "lucide-react";

interface PromoModal {
  id: string;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
  image_url: string;
  button_text: string;
  button_text_ar: string;
  button_link: string;
  active: boolean;
}

interface PromoModalTabProps {
  initialData: any[] // Array of promo modals
}

export default function PromoModalTab({ initialData }: PromoModalTabProps) {
  const [promoModals, setPromoModals] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [promoModalDialogOpen, setPromoModalDialogOpen] = useState(false)
  const [currentPromoModal, setCurrentPromoModal] = useState<any | null>(null)


  // Add new promo modal
  const addNewPromoModal = () => {
    setCurrentPromoModal(null);
    setPromoModalDialogOpen(true);
  };

  // Edit promo modal
  const editPromoModal = (modal: PromoModal) => {
    setCurrentPromoModal(modal);
    setPromoModalDialogOpen(true);
  };

  // Delete promo modal
  const deletePromoModal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo modal?")) return;

    try {
      const { error } = await supabase
        .from("promo_modals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPromoModals(promoModals.filter((modal) => modal.id !== id));
      toast({
        title: "Promo modal deleted",
        description: "The promo modal has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting promo modal:", error);
      toast({
        title: "Error",
        description: "Failed to delete promo modal. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Toggle promo modal active state
  const togglePromoModalActive = async (id: string, active: boolean) => {
    try {
      // If activating this modal, deactivate all others first
      if (active) {
        await supabase
          .from("promo_modals")
          .update({ active: false })
          .not("id", "eq", id)
      }

      const { error } = await supabase
        .from("promo_modals")
        .update({ active })
        .eq("id", id)

      if (error) throw error

      setPromoModals(
        promoModals.map((modal) =>
          modal.id === id
            ? { ...modal, active }
            : active
              ? { ...modal, active: false }
              : modal
        )
      )

      toast({
        title: active ? "Promo modal activated" : "Promo modal deactivated",
        description: `The promo modal has been ${active ? "activated" : "deactivated"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating promo modal:", error)
      toast({
        title: "Error",
        description: "Failed to update promo modal. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Save promo modal
  const savePromoModal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const modalData = {
      title: formData.get("title") as string,
      title_ar: formData.get("title_ar") as string,
      subtitle: formData.get("subtitle") as string,
      subtitle_ar: formData.get("subtitle_ar") as string,
      image_url: formData.get("image_url") as string,
      button_text: formData.get("button_text") as string,
      button_text_ar: formData.get("button_text_ar") as string,
      button_link: formData.get("button_link") as string,
      active: formData.get("active") === "on",
    }

    try {
      if (currentPromoModal) {
        // Update existing modal
        const { error } = await supabase
          .from("promo_modals")
          .update(modalData)
          .eq("id", currentPromoModal.id)

        if (error) throw error

        // If this modal is being activated, deactivate all others
        if (modalData.active && !currentPromoModal.active) {
          await supabase
            .from("promo_modals")
            .update({ active: false })
            .not("id", "eq", currentPromoModal.id)
        }

        setPromoModals(
          promoModals.map((modal) =>
            modal.id === currentPromoModal.id
              ? { ...modal, ...modalData }
              : modalData.active
                ? { ...modal, active: false }
                : modal
          )
        )

        toast({
          title: "Promo modal updated",
          description: "The promo modal has been updated successfully.",
        })
      } else {
        // Create new modal
        // If this modal is being activated, deactivate all others first
        if (modalData.active) {
          await supabase.from("promo_modals").update({ active: false })
        }

        const { data, error } = await supabase
          .from("promo_modals")
          .insert(modalData)
          .select()

        if (error) throw error

        setPromoModals((prev) => [
          ...prev.map((modal) =>
            modalData.active ? { ...modal, active: false } : modal
          ),
          data[0],
        ])

        toast({
          title: "Promo modal created",
          description: "The promo modal has been created successfully.",
        })
      }

      setPromoModalDialogOpen(false)
    } catch (error) {
      console.error("Error saving promo modal:", error)
      toast({
        title: "Error",
        description: "Failed to save promo modal. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Promo Modal Manager</CardTitle>
            <CardDescription>
              Manage promotional modals that appear when customers visit your
              store.
            </CardDescription>
          </div>
          <Button
            onClick={addNewPromoModal}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Promo Modal
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading promo modals...</p>
            </div>
          ) : promoModals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No promo modals found. Click "Add Promo Modal" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promoModals.map((modal) => (
                <div
                  key={modal.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={
                        modal.image_url ||
                        "/placeholder.svg?height=400&width=600"
                      }
                      alt={modal.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{modal.title}</h3>
                        <p className="text-gray-600 text-sm">
                          {modal.subtitle}
                        </p>
                        {modal.title_ar && (
                          <div className="mt-1 text-xs text-gray-500 flex items-center">
                            <Languages className="h-3 w-3 mr-1" />
                            <span>AR: {modal.title_ar}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center">
                        {modal.active && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                        {modal.button_text}
                      </span>
                      <span className="text-gray-500">→</span>
                      <span className="text-gray-500 truncate">
                        {modal.button_link}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editPromoModal(modal)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deletePromoModal(modal.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`active-${modal.id}`}
                          checked={modal.active}
                          onCheckedChange={(checked) =>
                            togglePromoModalActive(modal.id, checked)
                          }
                        />
                        <Label htmlFor={`active-${modal.id}`}>
                          {modal.active ? "Active" : "Inactive"}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promo Modal Dialog */}
      <Dialog
        open={promoModalDialogOpen}
        onOpenChange={setPromoModalDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentPromoModal ? "Edit Promo Modal" : "Add Promo Modal"}
            </DialogTitle>
            <DialogDescription>
              {currentPromoModal
                ? "Update the details of this promotional modal."
                : "Create a new promotional modal that will appear to customers."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={savePromoModal} className="space-y-6">
            <Tabs defaultValue="english" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="english">English</TabsTrigger>
                <TabsTrigger value="arabic">Arabic</TabsTrigger>
                <TabsTrigger value="common">Common</TabsTrigger>
              </TabsList>

              <TabsContent value="english" className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={currentPromoModal?.title || ""}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subtitle" className="text-right">
                    Subtitle
                  </Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    defaultValue={currentPromoModal?.subtitle || ""}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="buttonText" className="text-right">
                    Button Text
                  </Label>
                  <Input
                    id="buttonText"
                    name="buttonText"
                    defaultValue={currentPromoModal?.button_text || ""}
                    className="col-span-3"
                    required
                  />
                </div>
              </TabsContent>

              <TabsContent value="arabic" className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title_ar" className="text-right">
                    Title (Arabic)
                  </Label>
                  <Input
                    id="title_ar"
                    name="title_ar"
                    defaultValue={currentPromoModal?.title_ar || ""}
                    className="col-span-3"
                    dir="rtl"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subtitle_ar" className="text-right">
                    Subtitle (Arabic)
                  </Label>
                  <Input
                    id="subtitle_ar"
                    name="subtitle_ar"
                    defaultValue={currentPromoModal?.subtitle_ar || ""}
                    className="col-span-3"
                    dir="rtl"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="buttonText_ar" className="text-right">
                    Button Text (Arabic)
                  </Label>
                  <Input
                    id="buttonText_ar"
                    name="buttonText_ar"
                    defaultValue={currentPromoModal?.button_text_ar || ""}
                    className="col-span-3"
                    dir="rtl"
                  />
                </div>
              </TabsContent>

              <TabsContent value="common" className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image_url" className="text-right">
                    Image URL
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      id="image_url"
                      name="image_url"
                      defaultValue={currentPromoModal?.image_url || ""}
                      className="flex-grow"
                      required
                    />
                    <Button type="button" variant="outline" size="icon">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="button_link" className="text-right">
                    Button Link
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      id="button_link"
                      name="button_link"
                      defaultValue={currentPromoModal?.button_link || ""}
                      className="flex-grow"
                      required
                    />
                    <Button type="button" variant="outline" size="icon">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="active" className="text-right">
                    Active
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="active"
                      name="active"
                      defaultChecked={currentPromoModal?.active ?? false}
                    />
                    <Label htmlFor="active">Show this modal to customers</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPromoModalDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
