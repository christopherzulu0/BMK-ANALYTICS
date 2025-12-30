import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import {prisma} from '@/lib/prisma';
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    // EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST,
    //     port: process.env.EMAIL_SERVER_PORT ? Number(process.env.EMAIL_SERVER_PORT) : undefined,
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER,
    //       pass: process.env.EMAIL_SERVER_PASSWORD,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM,
    //   async authorize(email) {
    //     if (!email) return null;
    //     const user = await prisma.user.findUnique({
    //       where: { email },
    //       include: { role: true },
    //     });
    //     if (!user) return null;
    //     return {
    //       id: user.id,
    //       name: user.name,
    //       email: user.email,
    //       role: user.role?.name || "Guest",
    //     };
    //   },
    // }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Fetch user with their role relation
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        // Use the role name if available, otherwise fallback
        const role = user.role?.name || "Guest";
        console.log(`Authorize callback: User authenticated with role: "${role}" (from role relation)`);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.role = user.role; // user.role is now always a string (role name)
        console.log(`JWT callback: Setting token.role to "${user.role}" from user.role`);
      }

      // Check if the user still exists in the database
      if (token.email) {
        const userExists = await prisma.user.findUnique({
          where: { email: token.email },
          include: { role: true },
        });

        // If user doesn't exist, invalidate the token
        if (!userExists) {
          console.log(`User with email ${token.email} no longer exists in the database. Invalidating token.`);
          return {};
        }

        // If the user exists but token.role is undefined, set it to the user's role name from the database
        if (userExists && token.role === undefined) {
          const dbRole = userExists.role?.name || "dispatcher";
          console.log(`JWT callback: User role is undefined, setting token.role from database role: "${dbRole}"`);
          token.role = dbRole;
          console.log(`JWT callback: token.role is now "${token.role}"`);
        }
      }

      console.log(`JWT callback: Returning token with role: "${token.role}" (role type: ${typeof token.role})`);
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      // Check if the user still exists in the database
      if (session.user && session.user.email) {
        const userExists = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: { role: true },
        });

        // If user doesn't exist, return null to terminate the session
        if (!userExists) {
          console.log(`User with email ${session.user.email} no longer exists in the database. Terminating session.`);
          return null;
        }

        // Assign role from token, or fall back to role name from database, or default to "dispatcher"
        session.user.role = token.role || userExists.role?.name || "dispatcher";

        // Log the role assignment for debugging
        console.log(`Session callback: Setting session.user.role to "${session.user.role}" (token.role: "${token.role}", userExists.role: "${userExists.role?.name}")`);
      }
      console.log(`Session callback: Returning session with user.role: "${session?.user?.role}" (role type: ${typeof session?.user?.role})`);
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
