// Server-side helper: get the authenticated user's ID from the NextAuth JWT.
// All workshop data must be scoped to this userId — never query without it.
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return (token?.id as string) || null;
}

// Throws a 401 response if not authenticated — use in API routes that need a user.
export async function requireAuth(req: NextRequest): Promise<{ userId: string } | { error: Response }> {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return {
      error: new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return { userId };
}
