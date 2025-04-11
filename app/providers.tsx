'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from './toast-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  // We can't directly call async functions in useEffect
  // So we create a nested function to handle the async operation
  useEffect(() => {
    // We don't need to do anything on the client side
    // Database initialization will happen on the server side
  }, []);

  return (
    <SessionProvider>
      {children}
      <ToastProvider />
    </SessionProvider>
  );
}
