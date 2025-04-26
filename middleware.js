import { NextResponse } from "next/server";
import { fallbackLng, languages } from "./app/i18n/settings";

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip middleware for:
  // 1. API routes
  // 2. Static files
  // 3. Next.js internal paths
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Check for language prefix
  const pathnameHasLocale = languages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (!pathnameHasLocale) {
    let locale = fallbackLng;

    // Try to get language from Accept-Language header
    if (request.headers.has("Accept-Language")) {
      const acceptLanguage = request.headers.get("Accept-Language");
      locale =
        languages.find((lang) => acceptLanguage.startsWith(lang)) ||
        fallbackLng;
    }

    // Create the new URL with locale prefix
    const newUrl = new URL(
      `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
      request.url
    );
    
    // Preserve all search parameters from the original request
    searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value);
    });

    // Redirect with locale prefix and preserved search parameters
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/ routes
     * - _next/static files
     * - _next/image image optimization files
     * - favicon.ico
     * - static assets (assets/)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};