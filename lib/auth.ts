import { UserModel } from './models/user';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Ensure this code only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('This module should only be used on the server side');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }

        try {
          // Find the user by email
          const user = await UserModel.findByEmail(credentials.email);

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Verify password
          const isPasswordValid = await UserModel.verifyPassword(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          // Return user object with id as string
          return {
            id: user._id?.toString() || '',
            name: user.name,
            email: user.email,
            standard: user.standard,
            weaktopics: user.weaktopics || []
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Authentication failed');
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.standard = user.standard;
        token.weaktopics = user.weaktopics;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.standard = token.standard as string;
        session.user.weaktopics = token.weaktopics as string[];
      }
      return session;
    },
  },
  pages: {
    signIn: '/api/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};

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
