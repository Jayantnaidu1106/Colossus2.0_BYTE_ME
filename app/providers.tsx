'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from './toast-provider';
import ErrorBoundary from '@/components/ErrorBoundary';
import DirectErrorHandler from '@/components/DirectErrorHandler';

export function Providers({ children }: { children: React.ReactNode }) {
  // We can't directly call async functions in useEffect
  // So we create a nested function to handle the async operation
  useEffect(() => {
    // We don't need to do anything on the client side
    // Database initialization will happen on the server side

    // Add global error handler for unhandled errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Don't prevent default to allow error boundaries to catch the error
      console.log('Unhandled Promise Rejection:', event.reason);
    };

    const handleError = (event: ErrorEvent) => {
      // Don't prevent default to allow error boundaries to catch the error
      console.log('Uncaught Error:', event.error || event.message);
    };

    // Only add event listeners in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleError);

      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        window.removeEventListener('error', handleError);
      };
    }
  }, []);

  return (
    <DirectErrorHandler>
      <ErrorBoundary>
        <SessionProvider>
          {children}
          <ToastProvider />
        </SessionProvider>
      </ErrorBoundary>
    </DirectErrorHandler>
  );
}
