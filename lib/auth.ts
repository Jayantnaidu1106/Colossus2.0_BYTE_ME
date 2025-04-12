import { NextAuthOptions } from 'next-auth';

// Ensure this code only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('This module should only be used on the server side');
}

// Import the configuration from the NextAuth route handler
import { options } from '@/app/api/auth/[...nextauth]/route';

// Export the auth options for use in API routes
export const authOptions: NextAuthOptions = options;

// Note: The actual configuration is now in app/api/auth/[...nextauth]/route.ts

// Add type definitions for NextAuth
declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    standard?: string;
    weaktopics?: string[];
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    standard?: string;
    weaktopics?: string[];
  }
}
