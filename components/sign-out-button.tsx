"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useTranslation } from "@/app/i18n/client"
import { useAuth } from "@/contexts/auth-context"

interface SignOutButtonProps {
  lng: string
}

export function SignOutButton({ lng }: SignOutButtonProps) {
  const { t } = useTranslation(lng, "auth")
  const { signOut } = useAuth()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={signOut}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      {t("signOut.button")}
    </Button>
  )
} 