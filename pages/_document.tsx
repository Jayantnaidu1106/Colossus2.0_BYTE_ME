import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Inline script to catch errors before React loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global error handlers
              window.addEventListener('error', function(event) {
                console.log('Document error handler caught:', event.error);
                // Only prevent default for specific errors
                if (event.error && (
                  event.error.toString().includes('createUnhandledError') ||
                  event.error.toString().includes('handleClientError') ||
                  event.error.toString().includes('_523af1')
                )) {
                  event.preventDefault();
                  return true;
                }
              });
              
              window.addEventListener('unhandledrejection', function(event) {
                console.log('Document unhandledrejection handler caught:', event.reason);
                // Only prevent default for specific errors
                if (event.reason && (
                  event.reason.toString().includes('createUnhandledError') ||
                  event.reason.toString().includes('handleClientError') ||
                  event.reason.toString().includes('_523af1')
                )) {
                  event.preventDefault();
                  return true;
                }
              });

              // Try to patch Next.js error handling
              window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
              window.__NEXT_DATA__.__NEXT_SAFE_MODE = true;
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
