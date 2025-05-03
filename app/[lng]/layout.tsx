import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "../../styles/globals.css";
import { dir } from "i18next";
import { languages } from "../i18n/settings";
import { Toaster } from "@/components/toaster";
import ClientProviders from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://joulaa.com'),
  title: "Joulaa - Premium Makeup & Cosmetics | Luxury Beauty Products",
  description:
    "Discover premium makeup, skincare, and cosmetics products for your beauty routine. Luxury beauty brands, cruelty-free formulas, and expert beauty tips.",
  keywords:
    "makeup, cosmetics, beauty products, skincare, luxury beauty, foundation, lipstick, mascara, cruelty-free, vegan beauty",
  openGraph: {
    title: "Joulaa - Premium Makeup & Cosmetics",
    description: "Discover luxury beauty products for your perfect look",
    images: [
      {
        url: "/assets/joulaa-logo.svg",
        width: 1200,
        height: 630,
        alt: "Joulaa Cosmetics Collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joulaa - Premium Makeup & Cosmetics",
    description: "Discover luxury beauty products for your perfect look",
    images: ["/images/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://joulaa.com.com",
    languages: {
      en: "https://joulaa.com/en",
      ar: "https://joulaa.com/ar",
    },
  },
};

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export default async function RootLayout({
  children,
  params: paramsPromise,
}: {
  children: ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await paramsPromise;

  return (
    <html lang={lng} dir={dir(lng)}>
      <body className={`${inter.className} ${playfair.variable}`}>
        <ClientProviders>
          {children}
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
