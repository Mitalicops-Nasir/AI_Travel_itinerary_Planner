import type { NextAuthConfig } from "next-auth";
import google from "next-auth/providers/google";

/**
 * Edge-safe Auth.js config.
 *
 * This module must NOT import Prisma, bcrypt, or any Node-only module:
 * it is bundled into the edge middleware via `NextAuth(authConfig)`.
 * The credentials provider and the Prisma adapter live in `auth.ts`.
 */
export default {
  providers: [
    google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;
