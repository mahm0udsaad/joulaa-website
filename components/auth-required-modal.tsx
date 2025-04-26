import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/app/i18n/client"
import Image from "next/image"

interface AuthRequiredModalProps {
    isOpen: boolean
    onClose: () => void
    lng: string
  }
  
  export function AuthRequiredModal({ isOpen, onClose, lng }: AuthRequiredModalProps) {
    const router = useRouter()
    const { t } = useTranslation(lng, "auth")
  
    const handleSignIn = () => {
      onClose()
      router.push(`/auth/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`)
    }
  
    const handleSignUp = () => {
      onClose()
      router.push(`/auth/sign-up?redirect=${encodeURIComponent(window.location.pathname)}`)
    }
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md rounded-lg border border-pink-100 p-0 overflow-hidden">
          {/* Logo and header background */}
          <div className="bg-gradient-to-r from-pink-100 to-pink-50 p-6 flex flex-col items-center">
            <div className="mb-2">
              <Image 
                src="/assets/joulaa-logo.svg" 
                alt="Joulaa Beauty" 
                width={120} 
                height={40}
                className="h-auto"
              />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl font-semibold text-gray-800">
                {t("authRequired.title")}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                {t("authRequired.description")}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          {/* Buttons */}
          <DialogFooter className="flex flex-col px-6 pb-6 pt-2 gap-3">
            <Button
              onClick={handleSignUp}
              className="w-full bg-pink-500 hover:bg-pink-600 rounded-full py-2 text-white font-medium transition-all duration-200"
            >
              {t("authRequired.signUp")}
            </Button>
            <Button
              onClick={handleSignIn}
              variant="outline"
              className="w-full border-pink-300 text-pink-500 hover:bg-pink-50 rounded-full py-2 font-medium transition-all duration-200"
            >
              {t("authRequired.signIn")}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full py-2 transition-all duration-200"
            >
              {t("authRequired.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }