"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/app/i18n/client";

export default function OrderConfirmationPage({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, "checkout");
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const paymentStatus = searchParams.get("redirect_status");

  useEffect(() => {
    // You could send this to your backend to update order status
    if (paymentIntent && paymentStatus === "succeeded") {
      console.log(t("orderConfirmation.paymentSuccess"), paymentIntent);
    }
  }, [paymentIntent, paymentStatus, t]);

  return (
    <main className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">
          {t("orderConfirmation.title")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("orderConfirmation.description")}
        </p>
        <div className="flex flex-col gap-4">
          <Link href="/">
            <Button className="w-full">
              {t("orderConfirmation.continueShopping")}
            </Button>
          </Link>
          <Link href="/account">
            <Button variant="outline" className="w-full">
              {t("orderConfirmation.viewOrderHistory")}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
