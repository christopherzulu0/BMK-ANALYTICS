import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from '@/lib/prisma';
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

        const role = user.role?.name || "Guest";

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
        token.role = user.role;
      }

      if (token.email) {
        const userExists = await prisma.user.findUnique({
          where: { email: token.email },
          include: { role: true },
        });

        if (!userExists) {
          return {};
        }

        if (token.role === undefined) {
          token.role = userExists.role?.name || "dispatcher";
        }
      }

      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (session.user && session.user.email) {
        const userExists = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: { role: true },
        });

        if (!userExists) {
          return null;
        }

        session.user.role = token.role || userExists.role?.name || "dispatcher";
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const dest = new URL(url);
        if (dest.origin === new URL(baseUrl).origin) return url;
        // Allow same-path redirects when client passes window.location.origin
        // (LAN IP vs localhost) while NEXTAUTH_URL may differ.
        if (dest.pathname.startsWith("/auth/")) return url;
      } catch {
        // fall through
      }
      return baseUrl;
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
