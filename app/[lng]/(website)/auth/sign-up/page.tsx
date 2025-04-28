"use client";

import type React from "react";
import { useState, use } from "react";
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
import { Mail } from "lucide-react";
import { useTranslation } from "@/app/i18n/client";

export default function SignUpPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = use(params);
  const { t } = useTranslation(lng, "auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = t("invalidEmail");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("invalidEmail");
    }

    if (!password) {
      newErrors.password = t("passwordRequirements");
    } else if (password.length < 8) {
      newErrors.password = t("passwordRequirements");
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t("passwordMismatch");
    }

    if (!firstName.trim()) {
      newErrors.firstName = t("firstNameRequired");
    }

    if (!lastName.trim()) {
      newErrors.lastName = t("lastNameRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const { error, success } = await signUp(email, password, {
      firstName,
      lastName,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: t("authError"),
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (success) {
      setIsSuccess(true);
      toast({
        title: t("accountCreated"),
        description: t("verificationSent").replace("{email}", email),
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {t("emailVerification")}
            </CardTitle>
            <CardDescription>{t("verifyEmail")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4 rounded-lg border p-4">
              <Mail className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">{t("nextSteps")}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("checkVerificationEmail")}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              onClick={() =>
                router.push(
                  "/auth/sign-in?redirect=" + encodeURIComponent(redirectUrl),
                )
              }
              className="w-full"
            >
              {t("continueToSignIn")}
            </Button>
            <p className="text-sm text-center text-gray-500">
              {t("noVerificationEmail")}{" "}
              <button
                onClick={() => setIsSuccess(false)}
                className="text-primary hover:underline"
              >
                {t("tryAgain")}
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {t("createAccount")}
          </CardTitle>
          <CardDescription>{t("fillInformation")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("firstName")}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner size="sm" /> : t("signUp")}
            </Button>
            <p className="text-sm text-center text-gray-500">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href={`/auth/sign-in${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                className="text-primary hover:underline"
              >
                {t("signIn")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
