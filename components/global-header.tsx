"use client"

import { useState, useEffect } from "react"
import DarkModeToggle, { registerDarkModeChangeCallback } from "./dark-mode-toggle"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, BookOpen, Video, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import LogoutButton from "./logout-button"

export default function GlobalHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  // Register for dark mode changes
  useEffect(() => {
    const unregister = registerDarkModeChangeCallback((darkMode) => {
      setIsDarkMode(darkMode)
    })
    return unregister
  }, [])

  // Path-based visibility is now handled by ConditionalHeader

  // Determine if we should show a back button
  const showBackButton = !pathname.match(/^\/($|dashboard$)/)

  // Determine where the back button should go
  const getBackPath = () => {
    if (pathname.startsWith("/studytools/")) {
      return "/studytools"
    }
    return "/dashboard"
  }

  return (
    <header className={`py-2 px-4 shadow-sm ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {showBackButton ? (
            <Link href={getBackPath()}>
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Atlas AI
            </span>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Atlas AI
              </span>
            </Link>
          )}

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center gap-2">
                <Home className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <Link href="/studytools">
              <Button variant="ghost" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Study Tools
              </Button>
            </Link>
            <Link href="/studytools/mockinterview">
              <Button variant="ghost" className="flex items-center gap-2">
                <Video className="h-4 w-4" /> Mock Interview
              </Button>
            </Link>

          </nav>
        </div>

        <div className="flex items-center space-x-2">
          {session && <LogoutButton size="sm" />}
          <DarkModeToggle />
        </div>
      </div>
    </header>
  )
}
