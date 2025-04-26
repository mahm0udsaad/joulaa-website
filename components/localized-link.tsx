"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface LocalizedLinkProps {
  href: string
  lng?: string
  children: React.ReactNode
  className?: string
}

const LocalizedLink = ({ href, lng, children, className }: LocalizedLinkProps) => {
  const pathname = usePathname()
  const locale = lng || pathname.split("/")[1] || "en" // Default to 'en' if no locale is found

  // Construct the localized href
  const localizedHref = `/${locale}${href}`

  return (
    <Link href={localizedHref} className={className}>
      {children}
    </Link>
  )
}

export default LocalizedLink
