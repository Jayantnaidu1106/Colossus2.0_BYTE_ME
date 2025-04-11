import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
// Import server initialization to ensure database is set up
import "@/lib/server-init";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
