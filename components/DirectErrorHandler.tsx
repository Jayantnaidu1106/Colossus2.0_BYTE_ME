'use client';

import React, { useEffect } from 'react';

interface DirectErrorHandlerProps {
  children: React.ReactNode;
}

/**
 * A component that directly patches Next.js error handling functions
 * to prevent unhandled errors from crashing the application.
 */
const DirectErrorHandler: React.FC<DirectErrorHandlerProps> = ({ children }) => {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Store original console methods
    const originalConsoleError = console.error;
    const originalFetch = window.fetch;

    // Patch the fetch API to handle errors more gracefully
    window.fetch = async function(...args) {
      try {
        const response = await originalFetch.apply(this, args);
        return response;
      } catch (error) {
        console.log('Intercepted fetch error:', error);
        // Create a mock response for fetch failures
        return new Response(JSON.stringify({
          success: false,
          error: 'Network error: Could not connect to server',
          mockData: { message: 'This is mock data due to a network error' }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };

    // Create a patched console.error that doesn't throw for certain errors
    console.error = (...args: any[]) => {
      // Still log the error
      originalConsoleError.apply(console, args);

      // Check if this is a React error
      const errorString = typeof args[0] === 'string' ? args.join(' ') : '';

      // Handle specific error patterns
      if (errorString.includes('createUnhandledError') ||
          errorString.includes('handleClientError') ||
          errorString.includes('_523af1') ||
          errorString.includes('fetch failed') ||
          errorString.includes('Internal server error')) {
        console.log('Intercepted problematic error:', args);
        // Don't propagate this specific error
        return;
      }
    };

    // Try to directly patch the problematic function
    try {
      // @ts-ignore - Access window as any to patch Next.js internals
      if ((window as any).createUnhandledError) {
        const originalCreateUnhandledError = (window as any).createUnhandledError;
        (window as any).createUnhandledError = function() {
          console.log('Intercepted createUnhandledError call');
          return function(error: any) {
            console.log('Prevented unhandled error from being thrown:', error);
            // If this is a fetch error, show a user-friendly message
            if (error && (error.message?.includes('fetch failed') ||
                          error.message?.includes('Internal server error'))) {
              // You could display a toast message here if you have a toast system
              console.log('Network error occurred. Please check your connection.');
            }
            return null;
          };
        };
      }
    } catch (e) {
      console.log('Failed to patch createUnhandledError:', e);
    }

    return () => {
      // Restore original methods
      console.error = originalConsoleError;
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
};

export default DirectErrorHandler;
