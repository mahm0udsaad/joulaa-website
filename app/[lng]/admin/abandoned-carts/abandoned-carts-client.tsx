"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search } from "lucide-react"
import { useTranslation } from "@/app/i18n/client"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
  }
}

interface Cart {
  id: string
  status: string
  updated_at: string
  items: CartItem[]
  user: {
    id: string
    name: string | null
    email: string
  } | null
}

interface AbandonedCartsClientProps {
  initialCarts: Cart[]
  lng: string
}

export function AbandonedCartsClient({ initialCarts, lng }: AbandonedCartsClientProps) {
  const { t } = useTranslation(lng, "abondanedCarts")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("updated_at")
  const [carts, setCarts] = useState(initialCarts)
  const supabase = createClientComponentClient()
    
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    const filtered = initialCarts.filter((cart) => {
      const searchLower = e.target.value.toLowerCase()
      return (
        cart.id.toLowerCase().includes(searchLower) ||
        cart.user?.name?.toLowerCase().includes(searchLower) ||
        cart.user?.email.toLowerCase().includes(searchLower) ||
        cart.items.some((item) => item.product.name.toLowerCase().includes(searchLower))
      )
    })
    setCarts(filtered)
  }

  const handleSort = (value: string) => {
    setSortBy(value)
    const sorted = [...carts].sort((a, b) => {
      switch (value) {
        case "updated_at":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case "customerName":
          return (a.user?.name || "").localeCompare(b.user?.name || "")
        case "totalValue":
          const aTotal = a.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
          const bTotal = b.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
          return bTotal - aTotal
        default:
          return 0
      }
    })
    setCarts(sorted)
  }

  const handleAction = async (action: string, cartId: string) => {
    try {
      switch (action) {
        case "sendEmail":
          const { error: emailError } = await supabase
            .from("cart_actions")
            .insert({ cart_id: cartId, action: "send_reminder" })
          if (emailError) throw emailError
          toast.success(t("carts.actions.emailSent"))
          break

        case "applyDiscount":
          const { error: discountError } = await supabase
            .from("cart_actions")
            .insert({ cart_id: cartId, action: "apply_discount" })
          if (discountError) throw discountError
          toast.success(t("carts.actions.discountApplied"))
          break

        case "recoverCart":
          const { error: recoverError } = await supabase
            .from("carts")
            .update({ status: "active" })
            .eq("id", cartId)
          if (recoverError) throw recoverError
          toast.success(t("carts.actions.cartRecovered"))
          break

        case "deleteCart":
          const { error: deleteError } = await supabase
            .from("carts")
            .delete()
            .eq("id", cartId)
          if (deleteError) throw deleteError
          setCarts(carts.filter((cart) => cart.id !== cartId))
          toast.success(t("carts.actions.cartDeleted"))
          break
      }
    } catch (error) {
      console.error("Action error:", error)
      toast.error(t("carts.actions.error"))
    }
  }

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("carts.title")}</h1>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder={t("carts.searchPlaceholder")}
            value={searchTerm}
            onChange={handleSearch}
            className="w-64"
          />
        </div>
        <Select onValueChange={handleSort} defaultValue={sortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("carts.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">{t("carts.sortOptions.lastUpdated")}</SelectItem>
            <SelectItem value="customerName">{t("carts.sortOptions.customerName")}</SelectItem>
            <SelectItem value="totalValue">{t("carts.sortOptions.cartValue")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("carts.table.cartId")}</TableHead>
            <TableHead>{t("carts.table.customerName")}</TableHead>
            <TableHead>{t("carts.table.products")}</TableHead>
            <TableHead>{t("carts.table.totalValue")}</TableHead>
            <TableHead>{t("carts.table.lastUpdated")}</TableHead>
            <TableHead>{t("carts.table.status")}</TableHead>
            <TableHead>{t("carts.table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carts.map((cart) => (
            <TableRow key={cart.id}>
              <TableCell>{cart.id}</TableCell>
              <TableCell>{cart.user?.name || t("carts.table.guest")}</TableCell>
              <TableCell>
                {cart.items.map((item) => item.product.name).join(", ")}
              </TableCell>
              <TableCell>${calculateTotal(cart.items).toFixed(2)}</TableCell>
              <TableCell>{new Date(cart.updated_at).toLocaleDateString()}</TableCell>
              <TableCell>{t(`carts.status.${cart.status}`)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">{t("carts.actions.openMenu")}</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t("carts.actions.title")}</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleAction("sendEmail", cart.id)}>
                      {t("carts.actions.sendEmail")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("applyDiscount", cart.id)}>
                      {t("carts.actions.applyDiscount")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("recoverCart", cart.id)}>
                      {t("carts.actions.recoverCart")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAction("deleteCart", cart.id)}>
                      {t("carts.actions.deleteCart")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 