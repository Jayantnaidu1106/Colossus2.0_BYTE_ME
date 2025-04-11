"use client"

import { useSession } from "next-auth/react"
import GlobalHeader from "./global-header"
import { usePathname } from "next/navigation"

export default function ConditionalHeader() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  
  // Don't show header on public pages when not logged in
  const isPublicPath = pathname === "/" || 
                      pathname === "/api/auth/signin" || 
                      pathname === "/api/auth/signup" ||
                      pathname.startsWith("/api/auth")
  
  // Only show the header if the user is authenticated
  // or if they're on a protected page (which would redirect to login anyway)
  if (status === "authenticated" || (!isPublicPath && status !== "loading")) {
    return <GlobalHeader />
  }
  
  // Don't render anything if not authenticated and on a public page
  return null
}
