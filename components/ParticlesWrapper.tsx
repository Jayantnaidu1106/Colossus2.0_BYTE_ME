'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Particles with error boundary
const Particles = dynamic(() => import('./Particles').catch(err => {
  console.error('Error loading Particles component:', err);
  return () => null; // Return empty component on error
}), {
  ssr: false,
  loading: () => null
});

const ParticlesWrapper: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      console.log('ParticlesWrapper mounted');
      setIsClient(true);
    } catch (error) {
      console.error('Error in ParticlesWrapper useEffect:', error);
      setHasError(true);
    }
  }, []);

  // Don't render if we're not on client side or if there was an error
  if (!isClient || hasError) {
    return null;
  }

  // Wrap in try-catch to prevent unhandled errors
  try {
    console.log('ParticlesWrapper: Rendering particles');
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'transparent'
        }}
      >
        <Particles
          particleColors={['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#0ea5e9']}
          particleCount={300}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={200}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
          sizeRandomness={1}
        />
      </div>
    );
  } catch (error) {
    console.error('Error rendering ParticlesWrapper:', error);
    return null;
  }
};

export default ParticlesWrapper;
