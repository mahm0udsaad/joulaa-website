"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useTranslation } from "@/app/i18n/client"
import { CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ lng: string }>
}) {
  const { lng } = React.use(params)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { t } = useTranslation(lng, "auth")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setIsSubmitted(true)
      toast.success(t("forgotPassword.success"))
    } catch (error) {
      console.error("Error sending reset link:", error)
      toast.error(t("forgotPassword.error"))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="text-2xl">{t("forgotPassword.checkEmail.title")}</CardTitle>
            <CardDescription>
              {t("forgotPassword.checkEmail.description", { email })}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t("forgotPassword.checkEmail.instructions")}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/auth/sign-in")}
              className="w-full"
            >
              {t("forgotPassword.backToLogin")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("forgotPassword.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("forgotPassword.description")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("forgotPassword.emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("forgotPassword.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t("forgotPassword.submitButton")}
              </div>
            ) : (
              t("forgotPassword.submitButton")
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <Link
            href="/auth/sign-in"
            className="text-primary hover:underline"
          >
            {t("forgotPassword.backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  )
}
