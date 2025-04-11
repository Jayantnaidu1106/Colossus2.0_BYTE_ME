"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import the ClientParticles component with no SSR
const ClientParticles = dynamic(() => import("./client-particles"), { 
  ssr: false,
  loading: () => null
})

export default function DynamicParticles() {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) return null
  
  return <ClientParticles />
}
