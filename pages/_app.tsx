import type { AppProps } from 'next/app';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Add global error handlers
    const handleError = (event: ErrorEvent) => {
      console.log('App error handler caught:', event.error);
      // Only prevent default for specific errors
      if (event.error && (
        event.error.toString().includes('createUnhandledError') ||
        event.error.toString().includes('handleClientError') ||
        event.error.toString().includes('_523af1')
      )) {
        event.preventDefault();
        return true;
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.log('App unhandledrejection handler caught:', event.reason);
      // Only prevent default for specific errors
      if (event.reason && (
        event.reason.toString().includes('createUnhandledError') ||
        event.reason.toString().includes('handleClientError') ||
        event.reason.toString().includes('_523af1')
      )) {
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
