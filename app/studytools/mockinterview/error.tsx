'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error caught by mock interview error.tsx:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Mock Interview Error</h2>
        <p className="mb-4 text-gray-300">
          We encountered an error while setting up the mock interview. This could be due to the interview server being unavailable.
        </p>
        {error?.message && (
          <div className="bg-gray-800 p-4 rounded-md mb-6 overflow-auto max-h-40">
            <p className="font-mono text-sm text-gray-400">
              {error.message}
            </p>
          </div>
        )}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={reset}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/studytools'}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            Back to Study Tools
          </Button>
        </div>
      </div>
    </div>
  );
}
