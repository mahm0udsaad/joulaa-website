import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Package,
  Truck,
  CreditCard,
  Clock,
  AlertCircle,
  User,
  ShoppingBag,
  Heart,
  Phone,
  MapPin,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getUserOrders } from "@/lib/order-service"
import { revalidatePath } from "next/cache"
import { SubmitButton } from "@/components/ui/submit-button"


async function updateProfile(formData: FormData) {
  "use server"
  
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

      const { error } = await supabase
        .from("users")
        .update({
      first_name: formData.get("firstName"),
      last_name: formData.get("lastName"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      zip_code: formData.get("zipCode"),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

  revalidatePath("/account")
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/sign-in")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  // Get user orders
  const orders = await getUserOrders(user.id)

  const resolvedSearchParams = await searchParams
  const defaultTab = resolvedSearchParams.tab || "profile"

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      })
  }

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AED",
      currencyDisplay: "symbol",
    }).format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "canceled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "refunded":
        return "bg-purple-100 text-purple-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="md:w-1/4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 sticky top-24">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="bg-primary/10 text-primary rounded-full p-3 mb-4">
                  <User className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              </div>

              <div className="space-y-1 mb-6">
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-sm py-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile?.address && (
                  <div className="flex items-start gap-2 text-sm py-1">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p>{profile.address}</p>
                      <p>
                        {profile.city}, {profile.state} {profile.zip_code}
                      </p>
                    </div>
                  </div>
                )}
                {!profile?.phone && !profile?.address && (
                  <p className="text-sm text-muted-foreground italic">
                    Complete your profile to see your contact information here
                  </p>
                )}
              </div>

              <form action="/auth/signout" method="post">
                <Button type="submit" variant="outline" className="w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </form>
            </div>
          </div>

          <div className="md:w-3/4">
            <h1 className="text-3xl font-bold mb-6">My Account</h1>

              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Orders</span>
                  </TabsTrigger>
                  <TabsTrigger value="wishlist" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>Wishlist</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Update your account information here</CardDescription>
                    </CardHeader>
                  <form action={updateProfile}>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First name</Label>
                          <Input 
                            id="firstName" 
                            name="firstName"
                            defaultValue={profile?.first_name || ""}
                          />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last name</Label>
                          <Input 
                            id="lastName" 
                            name="lastName"
                            defaultValue={profile?.last_name || ""}
                          />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={user.email || ""} 
                          disabled 
                        />
                          <p className="text-sm text-muted-foreground">Your email cannot be changed</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                        <Input 
                          id="phone" 
                          name="phone"
                          defaultValue={profile?.phone || ""}
                        />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                        <Input 
                          id="address" 
                          name="address"
                          defaultValue={profile?.address || ""}
                        />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                          <Input 
                            id="city" 
                            name="city"
                            defaultValue={profile?.city || ""}
                          />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                          <Input 
                            id="state" 
                            name="state"
                            defaultValue={profile?.state || ""}
                          />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input 
                            id="zipCode" 
                            name="zipCode"
                            defaultValue={profile?.zip_code || ""}
                          />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                      <SubmitButton />
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>

                <TabsContent value="orders">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order History</CardTitle>
                      <CardDescription>View and track your past orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                          <Package className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-xl font-medium mb-2">No orders yet</h3>
                          <p className="text-muted-foreground mb-6 text-center max-w-md">
                            You haven't placed any orders yet. Start shopping to see your orders here.
                          </p>
                          <Link href="/shop">
                            <Button>Browse Products</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {orders.map((order) => (
                            <div
                              key={order.id}
                              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="bg-muted/50 p-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                  <div>
                                    <h3 className="font-semibold">Order #{order.id.substring(0, 8)}</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5 mr-1" />
                                        {formatDate(order.created_at)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={getStatusColor(order.status)}>
                                      <Truck className="h-3.5 w-3.5 mr-1" />
                                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Badge>
                                    <Badge className={getPaymentStatusColor(order.payment_status)}>
                                      <CreditCard className="h-3.5 w-3.5 mr-1" />
                                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4">
                                <div className="space-y-4">
                                  {/* Order Items */}
                                  <div className="space-y-3">
                                    <h4 className="font-medium text-sm">Items</h4>
                                    <div className="grid gap-3">
                                      {order.order_items &&
                                        order.order_items.map((item: any) => (
                                          <div key={item.id} className="flex items-center gap-3">
                                            <div className="relative h-16 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                                              {item.image_url ? (
                                                <Image
                                                  src={item.image_url || "/placeholder.svg"}
                                                  alt={item.product_name}
                                                  fill
                                                  className="object-cover"
                                                />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                  <Package className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-medium text-sm truncate">{item.product_name}</p>
                                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                <span>Qty: {item.quantity}</span>
                                                {item.color && <span>• Color: {item.color}</span>}
                                                {item.shade && <span>• Shade: {item.shade}</span>}
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <p className="font-medium">{formatCurrency(item.unit_price)}</p>
                                              <p className="text-xs text-muted-foreground">
                                                Subtotal: {formatCurrency(item.subtotal)}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Order Summary */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Subtotal</span>
                                      <span>
                                        {formatCurrency(
                                          Number.parseFloat(order.total_amount) -
                                            Number.parseFloat(order.shipping_cost) -
                                            Number.parseFloat(order.tax_amount) +
                                            Number.parseFloat(order.discount_amount),
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Shipping</span>
                                      <span>{formatCurrency(order.shipping_cost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Tax</span>
                                      <span>{formatCurrency(order.tax_amount)}</span>
                                    </div>
                                    {Number.parseFloat(order.discount_amount) > 0 && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Discount</span>
                                        <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
                                      </div>
                                    )}
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-medium">
                                      <span>Total</span>
                                      <span>{formatCurrency(order.total_amount)}</span>
                                    </div>
                                  </div>

                                  {/* Tracking Information */}
                                  {order.tracking_number && (
                                    <div className="mt-4 p-3 bg-muted/50 rounded-md">
                                      <div className="flex items-start gap-2">
                                        <Truck className="h-5 w-5 text-primary mt-0.5" />
                                        <div>
                                          <p className="font-medium text-sm">Tracking Number</p>
                                          <p className="text-sm">{order.tracking_number}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Notes */}
                                  {order.notes && (
                                    <div className="mt-4 p-3 bg-muted/50 rounded-md">
                                      <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                                        <div>
                                          <p className="font-medium text-sm">Notes</p>
                                          <p className="text-sm">{order.notes}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="wishlist">
                  <Card>
                    <CardHeader>
                      <CardTitle>Wishlist</CardTitle>
                      <CardDescription>Products you've saved for later</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center py-10 text-muted-foreground">Your wishlist is empty.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
