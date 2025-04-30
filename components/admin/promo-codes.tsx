"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { useFormState, useFormStatus } from "react-dom"
import { 
  getPromoCodes, 
  createPromoCode, 
  updatePromoCode, 
  deletePromoCode, 
  togglePromoCodeActive,
  type PromoCode,
  State
} from "@/app/actions/promo-codes"

const initialState: State = {
  errors: {},
  data: null,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        "Save"
      )}
    </Button>
  )
}

export default function PromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPromoCode, setCurrentPromoCode] = useState<PromoCode | null>(null)

  const [createState, createFormAction] = useFormState(createPromoCode, initialState)
  const [updateState, updateFormAction] = useFormState(
    (prevState: State, formData: FormData) => 
      updatePromoCode(currentPromoCode?.id || '', prevState, formData),
    initialState
  )

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  useEffect(() => {
    if (createState.data || updateState.data) {
      setIsDialogOpen(false)
      fetchPromoCodes()
      toast({
        title: "Success",
        description: currentPromoCode ? "Promo code updated successfully" : "Promo code created successfully",
      })
    }
  }, [createState.data, updateState.data])

  useEffect(() => {
    if (createState.errors?._form || updateState.errors?._form) {
      toast({
        title: "Error",
        description: createState.errors._form?.[0] || updateState.errors._form?.[0],
        variant: "destructive",
      })
    }
  }, [createState.errors, updateState.errors])

  const fetchPromoCodes = async () => {
    try {
      const data = await getPromoCodes()
      setPromoCodes(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch promo codes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return

    const { success, errors } = await deletePromoCode(id)

    if (success) {
      setPromoCodes(promoCodes.filter((code) => code.id !== id))
      toast({
        title: "Success",
        description: "Promo code deleted successfully",
      })
    } else if (errors?._form) {
      toast({
        title: "Error",
        description: errors._form[0],
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (id: string, is_active: boolean) => {
    const { success, errors } = await togglePromoCodeActive(id, is_active)

    if (success) {
      setPromoCodes(
        promoCodes.map((code) =>
          code.id === id ? { ...code, is_active } : code
        )
      )
      toast({
        title: "Success",
        description: `Promo code ${is_active ? "activated" : "deactivated"} successfully`,
      })
    } else if (errors?._form) {
      toast({
        title: "Error",
        description: errors._form[0],
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Promo Codes</CardTitle>
            <CardDescription>
              Manage your promotional codes and discounts.
            </CardDescription>
          </div>
          <Button onClick={() => {
            setCurrentPromoCode(null)
            setIsDialogOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Promo Code
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : promoCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No promo codes found. Click "Add Promo Code" to create one.
            </div>
          ) : (
            <div className="space-y-4">
              {promoCodes.map((code) => (
                <div
                  key={code.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{code.code}</span>
                      {code.is_active && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {code.discount_type === "percentage"
                        ? `${code.discount_value}% off`
                        : `$${code.discount_value} off`}
                      {code.min_purchase_amount &&
                        ` (Min. purchase: $${code.min_purchase_amount})`}
                      {code.max_discount_amount &&
                        ` (Max. discount: $${code.max_discount_amount})`}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Valid from {format(new Date(code.start_date), "MMM d, yyyy")} to{" "}
                      {format(new Date(code.end_date), "MMM d, yyyy")}
                    </div>
                    {code.usage_limit && (
                      <div className="text-xs text-gray-400">
                        Used {code.used_count} of {code.usage_limit} times
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentPromoCode(code)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(code.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={code.is_active}
                      onCheckedChange={(checked) =>
                        handleToggleActive(code.id, checked)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentPromoCode ? "Edit Promo Code" : "Add Promo Code"}
            </DialogTitle>
            <DialogDescription>
              {currentPromoCode
                ? "Update the details of this promotional code."
                : "Create a new promotional code for your store."}
            </DialogDescription>
          </DialogHeader>
          <form
            action={currentPromoCode ? updateFormAction : createFormAction}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={currentPromoCode?.code}
                  required
                  pattern="[A-Z0-9-]+"
                  title="Only uppercase letters, numbers, and hyphens are allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_type">Discount Type</Label>
                <Select
                  name="discount_type"
                  defaultValue={currentPromoCode?.discount_type || "percentage"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_value">Discount Value</Label>
                <Input
                  id="discount_value"
                  name="discount_value"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={currentPromoCode?.discount_value}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage_limit">Usage Limit</Label>
                <Input
                  id="usage_limit"
                  name="usage_limit"
                  type="number"
                  min="1"
                  defaultValue={currentPromoCode?.usage_limit || ""}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_purchase_amount">Minimum Purchase</Label>
                <Input
                  id="min_purchase_amount"
                  name="min_purchase_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={currentPromoCode?.min_purchase_amount || ""}
                  placeholder="Leave empty for no minimum"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_discount_amount">Maximum Discount</Label>
                <Input
                  id="max_discount_amount"
                  name="max_discount_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={currentPromoCode?.max_discount_amount || ""}
                  placeholder="Leave empty for no maximum"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  defaultValue={
                    currentPromoCode?.start_date
                      ? format(new Date(currentPromoCode.start_date), "yyyy-MM-dd'T'HH:mm")
                      : ""
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  defaultValue={
                    currentPromoCode?.end_date
                      ? format(new Date(currentPromoCode.end_date), "yyyy-MM-dd'T'HH:mm")
                      : ""
                  }
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                name="is_active"
                defaultChecked={currentPromoCode?.is_active ?? true}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <SubmitButton />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 