import { ShoppingBag, Users, DollarSign, ShoppingCart, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import  PromoCodes  from "@/components/admin/promo-codes";
import { supabase } from "@/lib/supabase";
import { calculateProfitSummary } from "@/lib/profit-calculator";
import { useTranslation } from "@/app/i18n";
import { Badge } from "@/components/ui/badge";

async function getOrdersCount() {
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching orders count:", error);
    return 0;
  }

  return count || 0;
}

async function getCustomersCount() {
  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching customers count:", error);
    return 0;
  }

  return count || 0;
}

async function getAbandonedCartsCount() {
  const { count, error } = await supabase
    .from("carts")
    .select("*", { count: "exact", head: true })
    .eq("status", "abandoned");

  if (error) {
    console.error("Error fetching abandoned carts count:", error);
    return 0;
  }

  return count || 0;
}

async function getRecentOrders() {
  // Modified query to not rely on the relationship
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, user_id, total_amount, status, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching recent orders:", error);
    return [];
  }

  // For each order, fetch the user details separately
  const ordersWithUserDetails = await Promise.all(
    orders.map(async (order) => {
      if (!order.user_id) {
        return {
          id: order.id,
          customer: "Guest",
          total: `$${Number.parseFloat(order.total_amount).toFixed(2)}`,
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        };
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email, first_name, last_name")
        .eq("id", order.user_id)
        .single();

      if (userError || !userData) {
        console.error("Error fetching user for order:", userError);
        return {
          id: order.id,
          customer: "Unknown",
          total: `$${Number.parseFloat(order.total_amount).toFixed(2)}`,
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        };
      }

      return {
        id: order.id,
        customer:
          `${userData.first_name || ""} ${userData.last_name || ""}`.trim() ||
          userData.email,
        total: `$${Number.parseFloat(order.total_amount).toFixed(2)}`,
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      };
    }),
  );

  return ordersWithUserDetails;
}

async function getRecentCustomers() {
  // Fetch recent users
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching recent customers:", error);
    return [];
  }

  // For each user, count their orders separately
  const usersWithOrderCounts = await Promise.all(
    users.map(async (user) => {
      const { count, error: orderError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (orderError) {
        console.error("Error counting orders for user:", orderError);
        return {
          id: user.id,
          name:
            `${user.first_name || ""} ${user.last_name || ""}`.trim() || "N/A",
          email: user.email,
          orders: 0,
        };
      }

      return {
        id: user.id,
        name:
          `${user.first_name || ""} ${user.last_name || ""}`.trim() || "N/A",
        email: user.email,
        orders: count || 0,
      };
    }),
  );

  return usersWithOrderCounts;
}

export default async function AdminDashboard({
  params: paramsPromise,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await paramsPromise;
  const { t } = await useTranslation(lng, "admin");
  const [
    ordersCount,
    customersCount,
    abandonedCartsCount,
    recentOrders,
    recentCustomers,
    profitSummary,
  ] = await Promise.all([
    getOrdersCount(),
    getCustomersCount(),
    getAbandonedCartsCount(),
    getRecentOrders(),
    getRecentCustomers(),
    calculateProfitSummary(),
  ]);

  const totalRevenue = profitSummary?.totalRevenue || 0;

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalOrders")}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalCustomers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalRevenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("abandonedCarts")}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{abandonedCartsCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              {t("recentOrders")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {recentOrders.length > 0 ? (
              <ul className="space-y-4">
                {recentOrders.map((order) => (
                  <li
                    key={order.id}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        #{order.id.substring(0,8)}
                      </span>
                      <span className="text-sm text-gray-500">{order.customer}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">${order.total}</span>
                      <Badge className={`${
                        order.status === "new" ? "bg-blue-500" :
                        order.status === "processing" ? "bg-yellow-500" :
                        order.status === "shipped" ? "bg-purple-500" :
                        order.status === "delivered" ? "bg-green-500" :
                        "bg-gray-500"
                      }`}>
                        {order.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-8">{t("noOrdersYet")}</p>
            )}
            <Link
              href="/admin/orders"
              className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              {t("viewAllOrders")}
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t("recentCustomers")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {recentCustomers.length > 0 ? (
              <ul className="space-y-4">
                {recentCustomers.map((customer) => (
                  <li
                    key={customer.id}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {(customer.name || customer.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                      <span className="font-medium">{customer.name || customer.email}</span>
                      <span className="font-light text-sm text-gray-500">{customer.email}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-medium">
                      {customer.orders} {t("orders")}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-8">{t("noCustomersYet")}</p>
            )}
            <Link
              href="/admin/customers"
              className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              {t("viewAllCustomers")}
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <PromoCodes />
      </div>
    </div>
  );
}
