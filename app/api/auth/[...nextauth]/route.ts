import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          // Connect to MongoDB directly
          const client = await clientPromise;
          const db = client.db();

          // Find the user by email
          const user = await db.collection('users').findOne({ email: credentials.email });

          if (!user) {
            throw new Error("Invalid email or password");
          }

          // Removed bcrypt - using a simple string equality check
          if (credentials.password !== user.password) {
            throw new Error("Invalid credentials");
          }

          // Return user object with id as string
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            standard: user.standard,
            weaktopics: user.weaktopics || []
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error("Authentication failed");
        }
      }
    }),
  ],
});

export { handler as GET, handler as POST };
