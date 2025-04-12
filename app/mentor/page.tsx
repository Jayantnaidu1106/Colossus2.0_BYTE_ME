"use client"

import Chat from "@/components/chat"
import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react";
import StaticBackground from "@/components/StaticBackground";




export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-black text-white overflow-hidden relative">
      <StaticBackground />
      <SessionProvider>
      <Chat />
      </SessionProvider>
    </main>
  )
}

