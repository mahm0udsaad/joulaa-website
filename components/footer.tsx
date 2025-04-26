import { Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/app/i18n";
import LocalizedLink from "@/components/localized-link";
import Image from "next/image";

export default async function Footer({ lng }: { lng?: string }) {
  const { t } = await useTranslation(lng, "common");
  const isRTL = lng === "ar";

  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="container mx-auto px-4 py-12">
        <div
          className={`grid grid-cols-1 md:grid-cols-4 gap-8 text-${isRTL ? "right" : "left"}`}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div>
            <Image
              src="/assets/joulaa-logo.svg"
              alt="Logo"
              width={150}
              height={50}
              className="mb-4"
            />
            <p className="text-sm mb-4">{t("footer.tagline")}</p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.shop")}</h3>
            <ul className="space-y-2">
              <li>
                <LocalizedLink
                  href="/category/lips"
                  lng={lng}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {t("home.sections.trending")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/category/face"
                  lng={lng}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {t("home.sections.featured")}
                </LocalizedLink>
              </li>

              <li>
                <LocalizedLink
                  href="/new-arrivals"
                  lng={lng}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {t("navigation.newArrivals")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/best-sellers"
                  lng={lng}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {t("navigation.bestSellers")}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.help")}</h3>
            <ul className="space-y-2">
              <li>
                <LocalizedLink
                  href="/contact"
                  lng={lng}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {t("footer.contactUs")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/shipping"
                  lng={lng}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {t("footer.shippingReturns")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/faq"
                  lng={lng}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {t("footer.faq")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/privacy"
                  lng={lng}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {t("footer.privacyPolicy")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/terms"
                  lng={lng}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {t("footer.termsConditions")}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("footer.subscribe")}
            </h3>
            <p className="text-sm mb-4">{t("footer.subscribeText")}</p>
            <div className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="bg-white/80"
              />
              <Button className="w-full">{t("footer.subscribeButton")}</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-accent-foreground/10 mt-12 pt-6 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} {t("footer.brandName")}.{" "}
            {t("footer.allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
