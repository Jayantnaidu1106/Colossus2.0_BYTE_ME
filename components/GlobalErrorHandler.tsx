'use client';

import React, { useEffect } from 'react';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  useEffect(() => {
    // Save the original console.error
    const originalConsoleError = console.error;
    
    // Handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      console.log('Unhandled Promise Rejection:', event.reason);
    };

    // Handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      console.log('Uncaught Error:', event.error || event.message);
    };

    // Override console.error to catch React errors
    console.error = (...args: any[]) => {
      // Still call the original console.error
      originalConsoleError.apply(console, args);
      
      // Check if this is a React error
      const errorString = args.join(' ');
      if (errorString.includes('React') || errorString.includes('Uncaught')) {
        console.log('React Error Caught:', args);
      }
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return <>{children}</>;
};

export default GlobalErrorHandler;
