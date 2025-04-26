import { NextResponse } from "next/server"
import { Resend } from "resend"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json()

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields: to, subject, or html" }, { status: 400 })
    }

    const data = await resend.emails.send({
      from: "Joulaa <noreply@joulaa.com>", // Update with your verified domain
      to: [to],
      subject,
      html,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
