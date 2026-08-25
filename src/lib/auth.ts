// Centralized NextAuth configuration
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const TRIAL_DAYS = 7;

export const authOptions: NextAuthOptions = {
  // Use JWT strategy (works with credentials provider, no DB session needed)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;
          const email = credentials.email.toLowerCase().trim();
          const user = await db.user.findUnique({ where: { email } });
          if (!user) return null;
          const valid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionId: user.subscriptionId,
          plan: user.plan,
          trialEndsAt: user.trialEndsAt?.getTime() ?? null,
          currentPeriodEnd: user.currentPeriodEnd?.getTime() ?? null,
        } as any;
        } catch (err) {
          console.error("authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign-in: copy fields from user to token
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.subscriptionStatus = (user as any).subscriptionStatus;
        token.subscriptionId = (user as any).subscriptionId;
        token.plan = (user as any).plan;
        token.trialEndsAt = (user as any).trialEndsAt;
        token.currentPeriodEnd = (user as any).currentPeriodEnd;
      }
      // On session refresh: re-read subscription status from DB
      if (trigger === "update" && token.id) {
        const fresh = await db.user.findUnique({
          where: { id: token.id as string },
          select: {
            subscriptionStatus: true,
            subscriptionId: true,
            plan: true,
            trialEndsAt: true,
            currentPeriodEnd: true,
            name: true,
          },
        });
        if (fresh) {
          token.subscriptionStatus = fresh.subscriptionStatus;
          token.subscriptionId = fresh.subscriptionId;
          token.plan = fresh.plan;
          token.trialEndsAt = fresh.trialEndsAt?.getTime() ?? null;
          token.currentPeriodEnd = fresh.currentPeriodEnd?.getTime() ?? null;
          token.name = fresh.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).subscriptionStatus = token.subscriptionStatus;
        (session.user as any).subscriptionId = token.subscriptionId;
        (session.user as any).plan = token.plan;
        (session.user as any).trialEndsAt = token.trialEndsAt;
        (session.user as any).currentPeriodEnd = token.currentPeriodEnd;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper: check if a user can access the app (active subscription or in trial)
export function hasAccess(
  subscriptionStatus: string | undefined | null,
  trialEndsAt: number | null | undefined
): boolean {
  if (subscriptionStatus === "active") return true;
  if (subscriptionStatus === "trial" && trialEndsAt) {
    return Date.now() < trialEndsAt;
  }
  return false;
}
