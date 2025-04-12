'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import SimpleBgParticles to avoid SSR issues
const SimpleBgParticles = dynamic(() => import('./SimpleBgParticles'), {
  ssr: false,
  loading: () => null
});

// Define the colors outside the component to prevent re-renders
const particleColors = ['#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#0ea5e9', '#22d3ee', '#10b981', '#f97316', '#eab308'];

const ParticlesWrapper: React.FC = () => {
  return (
    <SimpleBgParticles
      particleCount={200}
      particleColors={particleColors}
    />
  );
};

export default ParticlesWrapper;
