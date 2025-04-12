'use client';

import React from 'react';

interface SimpleBgParticlesProps {
  particleCount?: number;
  particleColors?: string[];
}

// Pre-generate particles to avoid re-renders
const generateParticles = (count: number, colors: string[]) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      delay: Math.random() * 5,
    });
  }
  return particles;
};

const SimpleBgParticles: React.FC<SimpleBgParticlesProps> = ({
  particleCount = 100,
  particleColors = ['#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#0ea5e9', '#22d3ee', '#10b981', '#f97316', '#eab308'],
}) => {
  // Generate particles only once
  const particles = React.useMemo(() => {
    return generateParticles(particleCount, particleColors);
  }, [particleCount, particleColors]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            animationDuration: `${20 / particle.speed}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default SimpleBgParticles;
