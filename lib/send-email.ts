import { Resend } from 'resend';
import { getOrderConfirmationEmailTemplate } from './email-templates';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface SendOrderConfirmationEmailParams {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: string;
  orderTotal: number;
  orderItems: OrderItem[];
  customMessage?: string;
}

export async function sendOrderConfirmationEmail({
  customerName,
  customerEmail,
  orderNumber,
  orderDate,
  orderTotal,
  orderItems,
  customMessage,
}: SendOrderConfirmationEmailParams) {
  try {
    const emailHtml = getOrderConfirmationEmailTemplate(
      customerName,
      orderNumber,
      orderDate,
      orderTotal,
      orderItems,
      customMessage
    );

    const { data, error } = await resend.emails.send({
      from: 'Joulaa Beauty <orders@joulaa.com>',
      to: customerEmail,
      subject: `Order Confirmation - Order #${orderNumber}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    throw error;
  }
} 