"use client"

import { useState } from "react"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/app/i18n/client"

interface ShippingDetails {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  postalCode: string
  state: string
  country: string
  phone: string
}

interface ShippingFormProps {
  initialDetails: ShippingDetails | null
  onDetailsChange: (details: ShippingDetails | null) => void
  editing: boolean
  onEditingChange: (editing: boolean) => void
  lng: string
}

export default function ShippingForm({
  initialDetails,
  onDetailsChange,
  editing: initialEditing,
  onEditingChange,
  lng
}: ShippingFormProps) {
  const { t } = useTranslation(lng, "checkout")
  const [editing, setEditing] = useState(initialEditing || !initialDetails?.address)
  const [formData, setFormData] = useState<ShippingDetails>(initialDetails || {
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    state: "",
    country: "",
    phone: "",
  })
  const [saveAddress, setSaveAddress] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    const fieldName = id.includes("-") ? id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) : id

    const newDetails = {
      ...formData,
      [fieldName]: value,
    }
    setFormData(newDetails)
    onDetailsChange(newDetails)
  }

  const handleSaveAddress = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: t("shipping.success.title"),
        description: t("shipping.success.description"),
      })
    } catch (error) {
      console.error('Error saving address:', error)
      toast({
        title: t("shipping.error.title"),
        description: t("shipping.error.description"),
        variant: "destructive"
      })
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t("shipping.title")}</h2>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => onEditingChange(true)}>
            <Edit className="h-4 w-4 mr-2" />
            {t("shipping.change")}
          </Button>
        )}
      </div>

      {!editing ? (
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{t("shipping.fields.firstName")}</span>
                <span className="font-medium">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{t("shipping.fields.email")}</span>
                <span className="font-medium">{formData.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{t("shipping.fields.phone")}</span>
                <span className="font-medium">{formData.phone}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{t("shipping.fields.address")}</span>
                <span className="font-medium">{formData.address}</span>
                <span className="font-medium">
                  {formData.city}, {formData.state} {formData.postalCode}
                </span>
                <span className="font-medium">{formData.country}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">{t("shipping.fields.firstName")}</Label>
            <Input
              id="firstName"
              placeholder={t("shipping.placeholders.firstName")}
              required
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="lastName">{t("shipping.fields.lastName")}</Label>
            <Input
              id="lastName"
              placeholder={t("shipping.placeholders.lastName")}
              required
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="email">{t("shipping.fields.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("shipping.placeholders.email")}
              required
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">{t("shipping.fields.address")}</Label>
            <Input
              id="address"
              placeholder={t("shipping.placeholders.address")}
              required
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="city">{t("shipping.fields.city")}</Label>
            <Input
              id="city"
              placeholder={t("shipping.placeholders.city")}
              required
              value={formData.city}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="postalCode">{t("shipping.fields.postalCode")}</Label>
            <Input
              id="postalCode"
              placeholder={t("shipping.placeholders.postalCode")}
              required
              value={formData.postalCode}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="state">{t("shipping.fields.state")}</Label>
            <Input
              id="state"
              placeholder={t("shipping.placeholders.state")}
              required
              value={formData.state}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="country">{t("shipping.fields.country")}</Label>
            <Input
              id="country"
              placeholder={t("shipping.placeholders.country")}
              required
              value={formData.country}
              onChange={handleInputChange}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="phone">{t("shipping.fields.phone")}</Label>
            <Input
              id="phone"
              placeholder={t("shipping.placeholders.phone")}
              required
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          {user && (
            <div className="sm:col-span-2 flex items-center space-x-2">
              <Switch id="save-address" checked={saveAddress} onCheckedChange={setSaveAddress} />
              <Label htmlFor="save-address">{t("shipping.saveAddress")}</Label>
            </div>
          )}
          <div className="sm:col-span-2 flex justify-end space-x-4">
            <Button variant="outline" onClick={() => onEditingChange(false)}>
              {t("shipping.cancel")}
            </Button>
            <Button
              onClick={() => {
                if (saveAddress && user) {
                  handleSaveAddress()
                }
                onEditingChange(false)
              }}
            >
              {t("shipping.save")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 