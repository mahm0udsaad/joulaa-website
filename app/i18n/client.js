"use client";

import { useEffect, useState } from "react";
import i18next from "i18next";
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
} from "react-i18next";
import { useCookies } from "react-cookie";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { getOptions, languages, cookieName } from "./settings";

const runsOnServerSide = typeof window === "undefined";

// Create i18next instance only once
const i18nInstance = i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language, namespace) =>
        import(`./locales/${language}/${namespace}.json`),
    ),
  );

// Initialize only once
if (!i18nInstance.isInitialized) {
  i18nInstance.init({
    ...getOptions(),
    lng: undefined,
    react: { useSuspense: true }, // <-- Important
    detection: {
      order: ["path", "cookie", "htmlTag", "navigator"],
      caches: ["cookie"],
      lookupCookie: cookieName,
      cookieExpirationDate: new Date(Date.now() + 31536000 * 1000),
    },
    preload: runsOnServerSide ? languages : [],
    debug: false,
  });
  
}

export function useTranslation(lng, ns, options) {
  const [cookies, setCookie] = useCookies([cookieName]);
  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;
  const [initialized, setInitialized] = useState(false);

  // Force language if specified in props
  useEffect(() => {
    if (runsOnServerSide) return;
    
    // If lng is provided explicitly, use it and don't let it be overridden
    if (lng && !initialized) {
      i18n.changeLanguage(lng).then(() => {
        setInitialized(true);
        // Set cookie to maintain consistency
        setCookie(cookieName, lng, { path: "/", maxAge: 31536000 });
      });
    } else if (!initialized) {
      setInitialized(true);
    }
  }, []);

  // Don't need this second effect, as we're handling cookie in the first effect
  // This helps prevent unnecessary language changes

  return ret;
}