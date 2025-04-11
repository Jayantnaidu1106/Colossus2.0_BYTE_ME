"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
  className?: string
}

export default function LogoutButton({
  variant = "ghost",
  size = "default",
  showIcon = true,
  className = ""
}: LogoutButtonProps) {
  const handleLogout = async () => {
    // Sign out and redirect to the home page
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      Logout
    </Button>
  )
}
