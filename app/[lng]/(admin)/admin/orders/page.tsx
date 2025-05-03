"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import OrderDialog from "@/components/admin/order-dialog"

const orderStatuses = ["All", "New", "Processing", "Shipped", "Delivered", "Canceled", "Returned"]

export default function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [ordersPerPage, setOrdersPerPage] = useState("10")
  const [searchTerm, setSearchTerm] = useState("")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [selectedStatus])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          order_items (*)
        `,
        )
        .order("order_date", { ascending: false })

      if (selectedStatus !== "All") {
        query = query.eq("status", selectedStatus.toLowerCase())
      }

      const { data: ordersData, error: ordersError } = await query

      if (ordersError) throw ordersError

      // Fetch user emails separately since there's no direct join
      const userIds = ordersData.map((order) => order.user_id).filter(Boolean)

      let userData = {}
      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id, email, first_name, last_name")
          .in("id", userIds)

        if (usersError) throw usersError

        // Create a lookup object for users
        userData = users.reduce((acc, user) => {
          acc[user.id] = user
          return acc
        }, {})
      }

      // Combine orders with user data
      const ordersWithUserData = ordersData.map((order) => ({
        ...order,
        user: order.user_id ? userData[order.user_id] : null,
      }))

      setOrders(ordersWithUserData || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const orderId = order.id.toLowerCase()
    const customerName = order.user ? `${order.user.first_name || ""} ${order.user.last_name || ""}`.toLowerCase() : ""
    const customerEmail = order.user?.email?.toLowerCase() || ""

    return orderId.includes(searchLower) || customerName.includes(searchLower) || customerEmail.includes(searchLower)
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {orderStatuses.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              onClick={() => setSelectedStatus(status)}
              className="whitespace-nowrap"
            >
              {status}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <Select value={ordersPerPage} onValueChange={setOrdersPerPage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Orders per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.slice(0, Number.parseInt(ordersPerPage)).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.user ? `${order.user.first_name || ""} ${order.user.last_name || ""}` : "Guest"}
                      <div className="text-xs text-gray-400">{order.user?.email || "No email"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.order_date).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Badge className={`${
                        order.status === "new" ? "bg-blue-500" :
                        order.status === "processing" ? "bg-yellow-500" :
                        order.status === "shipped" ? "bg-purple-500" :
                        order.status === "delivered" ? "bg-green-500" :
                        order.status === "canceled" ? "bg-red-500" :
                        "bg-gray-500"
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Badge variant="outline" className={`
                        ${order.payment_status === "pending" ? "border-yellow-500 text-yellow-500" : 
                          order.payment_status === "paid" ? "border-green-500 text-green-500" :
                          order.payment_status === "cash" ? "border-blue-500 text-blue-500" :
                          order.payment_status === "refunded" ? "border-purple-500 text-purple-500" : 
                          "border-red-500 text-red-500"}
                        ${order.payment_status === "cash" ? "flex items-center gap-1" : ""}
                      `}>
                        {order.payment_status === "cash" && (
                          <span className="w-2 h-2 rounded-full bg-blue-500"/>
                        )}
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${Number.parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? "No orders found matching your search." : "No orders found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <OrderDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
          lng="en"
          onRevalidate={fetchOrders}
        />
      )}
    </div>
  )
}
