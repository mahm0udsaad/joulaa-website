import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/send-email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      orderNumber,
      orderDate,
      orderTotal,
      orderItems,
      customMessage,
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !orderNumber || !orderDate || !orderTotal || !orderItems) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send the order confirmation email
    await sendOrderConfirmationEmail({
      customerName,
      customerEmail,
      orderNumber,
      orderDate,
      orderTotal,
      orderItems,
      customMessage,
    });

    return NextResponse.json(
      { message: 'Order confirmation email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-order-confirmation route:', error);
    return NextResponse.json(
      { error: 'Failed to send order confirmation email' },
      { status: 500 }
    );
  }
} 