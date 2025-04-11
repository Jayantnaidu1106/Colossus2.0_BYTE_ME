'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from './toast-provider';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';
import ErrorBoundary from '@/components/ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  // We can't directly call async functions in useEffect
  // So we create a nested function to handle the async operation
  useEffect(() => {
    // We don't need to do anything on the client side
    // Database initialization will happen on the server side

    // Add global error handler for unhandled errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      console.log('Unhandled Promise Rejection:', event.reason);
    };

    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      console.log('Uncaught Error:', event.error || event.message);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <GlobalErrorHandler>
      <ErrorBoundary fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="mb-6">We encountered an unexpected error. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }>
        <SessionProvider>
          {children}
          <ToastProvider />
        </SessionProvider>
      </ErrorBoundary>
    </GlobalErrorHandler>
  );
}
