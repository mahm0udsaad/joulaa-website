"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Heart,
  Globe,
  Home,
  ShoppingCart,
  TrendingUp,
  Package,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useWishlist } from "@/components/wishlist-provider";
import { useTranslation } from "@/app/i18n/client";
import { setStoredLanguage, switchLanguage } from "@/lib/language";

interface MobileMenuProps {
  lng: string;
}

export default function MobileMenu({ lng }: MobileMenuProps) {
  const { t } = useTranslation(lng, "common");
  const pathname = usePathname();
  const { wishlist } = useWishlist();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLanguageSwitch = () => {
    const newLng = lng === "en" ? "ar" : "en";
    setStoredLanguage(newLng);
    window.location.href = switchLanguage(lng, pathname);
  };

  // Navigation links with icons for better visual cues
  const navLinks = [
    { href: "/", text: t("navbar.home"), icon: <Home className="h-5 w-5" /> },
    {
      href: "/shop",
      text: t("navbar.shop"),
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      href: "/new-arrivals",
      text: t("navbar.newArrivals"),
      icon: <Package className="h-5 w-5" />,
    },
    {
      href: "/trending",
      text: t("navbar.trending"),
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      href: "/collections",
      text: t("navbar.collections"),
      icon: <FolderPlus className="h-5 w-5" />,
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] sm:w-[400px] overflow-y-auto p-0"
      >
        <SheetHeader className="p-6 border-b bg-slate-50">
          <SheetTitle className="text-xl font-bold">
            {t("navbar.menu")}
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 py-6">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground/70 hover:bg-slate-100"
                }`}
              >
                {link.icon}
                <span>{link.text}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-500 mb-4">
              {t("navbar.actions")}
            </p>

            <div className="space-y-2">
              <Link href="/search">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-foreground/70 hover:bg-slate-100 rounded-md p-3 h-auto"
                >
                  <Search className="mr-3 h-5 w-5" />
                  {t("navbar.search")}
                </Button>
              </Link>

              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-foreground/70 hover:bg-slate-100 rounded-md p-3 h-auto relative"
                >
                  <Heart className="mr-3 h-5 w-5" />
                  {t("navbar.wishlist")}
                  {wishlist?.length > 0 && (
                    <span className="absolute right-4 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlist?.length}
                    </span>
                  )}
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="w-full justify-start text-foreground/70 hover:bg-slate-100 rounded-md p-3 h-auto"
                onClick={handleLanguageSwitch}
              >
                <Globe className="mr-3 h-5 w-5" />
                {lng === "en" ? "العربية" : "English"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t bg-slate-50 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} {t("footer.companyName")}
        </div>
      </SheetContent>
    </Sheet>
  );
}
