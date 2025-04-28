"use client";

import type React from "react";
import { useState, use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/loading-spinner";
import { useTranslation } from "@/app/i18n/client";

export default function SignInPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = use(params);
  const { t } = useTranslation(lng, "auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const { toast } = useToast();

  // Redirect if user is already signed in
  useEffect(() => {
    if (!isLoading && user) {
      // If user is admin, redirect to admin page
      if (user.role === "admin") {
        router.push("/admin");
        return;
      }
      // Otherwise redirect to the original URL or home page
      router.push(redirectUrl);
    }
  }, [user, isLoading, router, redirectUrl]);

  // Show loading state while checking auth status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render the form if user is already signed in
  if (user) {
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = t("invalidEmail");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("invalidEmail");
    }

    if (!password) {
      newErrors.password = t("passwordRequirements");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const { error, success } = await signIn(email, password);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: t("authError"),
        description: error.message || t("invalidCredentials"),
        variant: "destructive",
      });
      return;
    }

    if (success) {
      toast({
        title: t("signIn"),
        description: t("accountCreated"),
      });
      // The redirect will be handled by the useEffect hook
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t("signIn")}</CardTitle>
          <CardDescription>{t("signIn")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t("forgotPasswordTitle")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner size="sm" /> : t("signIn")}
            </Button>
            <p className="text-sm text-center text-gray-500">
              {t("dontHaveAccount")}{" "}
              <Link
                href={`/auth/sign-up${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                className="text-primary hover:underline"
              >
                {t("signUp")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
