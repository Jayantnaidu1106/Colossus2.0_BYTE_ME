'use client';

import React from 'react';

const StaticBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(25,25,112,0.5) 100%)',
      }}
    >
      {/* Add a few static decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute top-3/4 left-2/3 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-pink-500/10 blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/3 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl"></div>
    </div>
  );
};

export default StaticBackground;
