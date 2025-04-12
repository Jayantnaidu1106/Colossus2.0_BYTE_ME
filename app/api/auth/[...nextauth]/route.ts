import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
// Import server initialization to ensure database is set up
import "@/lib/server-init";
import { UserModel } from "@/lib/models/user";

// Log environment variables for debugging (without exposing secrets)
console.log('NextAuth Config:', {
  GOOGLE_CLIENT_ID_SET: !!process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET_SET: !!process.env.GOOGLE_CLIENT_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET
});

export const options = {
  // NextAuth configuration options
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
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
            standard: user.standard || undefined,
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
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile, email }) {
      console.log("Sign in attempt:", { user, account, profile, email });
      // Always allow sign in
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.standard = token.standard as string;
        session.user.weaktopics = token.weaktopics as string[];
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.standard = user.standard;
        token.weaktopics = user.weaktopics;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    }
  },
  debug: true,
  events: {
    async signIn(message) {
      console.log('Sign in successful:', message);
    },
    async signOut(message) {
      console.log('Sign out successful:', message);
    },
    async error(message) {
      console.error('Auth error:', message);
    },
    async createUser(message) {
      console.log('User created:', message);
    },
    async linkAccount(message) {
      console.log('Account linked:', message);
    }
  }
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
