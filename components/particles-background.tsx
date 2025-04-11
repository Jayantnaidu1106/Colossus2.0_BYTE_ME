"use client"

import React, { useEffect, useState } from "react"
import Particles from "./particles"

interface ParticlesBackgroundProps {
  className?: string
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ className }) => {
  const [mounted, setMounted] = useState(false)

  // Wait for component to mount to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Use a consistent color scheme to avoid hydration mismatches
  const particleColors = ["#8b5cf6", "#6366f1", "#3b82f6"]

  return (
    <div className={`fixed inset-0 -z-10 pointer-events-none ${className}`}>
      <Particles
        particleCount={150}
        particleSpread={15}
        speed={0.05}
        particleColors={particleColors}
        moveParticlesOnHover={true}
        particleHoverFactor={0.5}
        alphaParticles={true}
        particleBaseSize={80}
        sizeRandomness={0.8}
        cameraDistance={25}
        disableRotation={false}
      />
    </div>
  )
}

export default ParticlesBackground
