"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { getOrderConfirmationEmailTemplate } from "@/lib/email-templates"
import { Copy, Package, User, MapPin, CreditCard, Mail } from "lucide-react"
import { updateOrderStatus, sendOrderEmail } from "@/app/[lng]/(admin)/admin/orders/order-actions"

interface OrderItem {
  product_name: string
  quantity: number
  unit_price: string
  subtotal: string
  product_image?: string
}

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
}

interface ShippingInfo {
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

interface Order {
  id: string
  user_id: string
  status: string
  payment_status: string
  order_date: string
  total_amount: string
  order_items: OrderItem[]
  user?: User
  shipping_address: string
  tracking_number?: string
}

interface OrderDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedOrder: Order | null
  setSelectedOrder: (order: Order | null) => void
  lng: string
  onRevalidate: () => Promise<void>
}

const orderStatuses = ["New", "Processing", "Shipped", "Delivered", "Canceled", "Returned"]

const emailTemplates = {
  new: {
    subject: "Order Received - Thank You!",
    content: "Thank you for your order! We've received your order #{{order_id}} and are processing it now.",
  },
  processing: {
    subject: "Your Order is Being Processed",
    content: "Good news! Your order #{{order_id}} is now being processed and will be shipped soon.",
  },
  shipped: {
    subject: "Your Order Has Been Shipped",
    content:
      "Your order #{{order_id}} has been shipped! You can track your package with the tracking number: {{tracking_number}}",
  },
  delivered: {
    subject: "Your Order Has Been Delivered",
    content:
      "Your order #{{order_id}} has been delivered! We hope you enjoy your products. Please let us know if you have any questions.",
  },
  canceled: {
    subject: "Your Order Has Been Canceled",
    content:
      "Your order #{{order_id}} has been canceled as requested. If you have any questions, please contact our customer service.",
  },
  returned: {
    subject: "Your Return Request Has Been Received",
    content: "We've received your return request for order #{{order_id}}. We'll process it as soon as possible.",
  },
}

export default function OrderDialog({ isOpen, onClose, selectedOrder, setSelectedOrder, lng, onRevalidate }: OrderDialogProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [emailContent, setEmailContent] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const { toast } = useToast()

  if (!selectedOrder) return null

  const shippingInfo: ShippingInfo = JSON.parse(selectedOrder.shipping_address)

  const copyOrderDetails = async () => {
    const orderDetails = `
        Order Details
        ------------
        Order ID: #${selectedOrder.id.substring(0, 8)}
        Date: ${formatDate(selectedOrder.order_date)}
        Payment Status: ${selectedOrder.payment_status}
        Total Amount: $${Number.parseFloat(selectedOrder.total_amount).toFixed(2)}

        Customer Information
        ------------------
        Name: ${shippingInfo.firstName} ${shippingInfo.lastName}
        Email: ${shippingInfo.email}
        Phone: ${shippingInfo.phone}

        Shipping Address
        ---------------
        ${shippingInfo.address}
        ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.postalCode}
        ${shippingInfo.country}

        Order Items
        ----------
        ${selectedOrder.order_items
        .map(
            (item) =>
            `${item.product_name} x ${item.quantity} - $${Number.parseFloat(item.unit_price).toFixed(2)} = $${Number.parseFloat(
                item.subtotal,
            ).toFixed(2)}`,
        )
        .join("\n")}
            `.trim()

    try {
      await navigator.clipboard.writeText(orderDetails)
      toast({
        title: "Copied",
        description: "Order details have been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy order details",
        variant: "destructive",
      })
    }
  }

  const handleUpdateOrderStatus = async (newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const result = await updateOrderStatus(selectedOrder.id, newStatus)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Update local state with fresh order data
      if (result.order) {
        setSelectedOrder(result.order)
      }

      // Switch to email tab if changing from "new" to "processing"
      if (selectedOrder.status === "new" && newStatus.toLowerCase() === "processing") {
        setActiveTab("email")
      }

      toast({
        title: "Status Updated",
        description: `Order #${selectedOrder.id.substring(0, 8)} status changed to ${newStatus}`,
      })

      // Update email content based on new status
      updateEmailContent(newStatus.toLowerCase())
      
      // Revalidate the orders list
      await onRevalidate()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const updateEmailContent = (status: string) => {
    const template = emailTemplates[status.toLowerCase() as keyof typeof emailTemplates] || emailTemplates.processing
    const shortOrderId = selectedOrder.id.substring(0, 8)

    // Set subject
    const subject = template.subject.replace("{{order_id}}", shortOrderId)
    setEmailSubject(subject)

    // Set content with placeholders replaced
    let content = template.content.replace("{{order_id}}", shortOrderId)

    if (selectedOrder.tracking_number) {
      content = content.replace("{{tracking_number}}", selectedOrder.tracking_number)
    } else {
      content = content.replace("{{tracking_number}}", "[Tracking number will be added soon]")
    }

    setEmailContent(content)
  }

  const handleSendEmail = async () => {
    if (!shippingInfo.email) {
      toast({
        title: "Error",
        description: "Cannot send email - no customer email address available",
        variant: "destructive",
      })
      return
    }

    setSendingEmail(true)
    try {
      const result = await sendOrderEmail(selectedOrder.id, emailSubject, emailContent)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Email Sent",
        description: `Email successfully sent to ${shippingInfo.email}`,
      })

      // Close dialog after successful email
      onClose()
    } catch (error) {
      console.error("Error sending email:", error)
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(lng, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Order Details - #{selectedOrder.id.substring(0, 8)}</DialogTitle>
            <Button variant="outline" size="sm" onClick={copyOrderDetails}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Details
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <h3 className="font-medium">Customer Information</h3>
                  </div>
                  <div className="pl-7 space-y-1">
                    <p className="font-medium">
                      {shippingInfo.firstName} {shippingInfo.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{shippingInfo.email}</p>
                    <p className="text-sm text-gray-500">{shippingInfo.phone}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <h3 className="font-medium">Shipping Address</h3>
                  </div>
                  <div className="pl-7 space-y-1">
                    <p>{shippingInfo.address}</p>
                    <p>
                      {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}
                    </p>
                    <p>{shippingInfo.country}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-gray-500" />
                  <h3 className="font-medium">Order Items</h3>
                </div>
                <div className="pl-7 space-y-2">
                  {selectedOrder.order_items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-4">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${Number.parseFloat(item.unit_price).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Total: ${Number.parseFloat(item.subtotal).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Total Amount</h3>
                  <p className="text-2xl font-bold">${Number.parseFloat(selectedOrder.total_amount).toFixed(2)}</p>
                </div>
                <div className="space-x-2">
                  {orderStatuses.map((status) => (
                    <Button
                      key={status}
                      variant={selectedOrder.status === status.toLowerCase() ? "default" : "outline"}
                      onClick={() => handleUpdateOrderStatus(status)}
                      disabled={updatingStatus}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  className="w-full p-2 border rounded h-32"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSendEmail} disabled={sendingEmail}>
                  {sendingEmail ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 