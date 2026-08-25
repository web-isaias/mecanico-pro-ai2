import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// Forces a JWT refresh — call after webhook updates the user's subscription
export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const fresh = await db.user.findUnique({
      where: { id: token.id as string },
      select: {
        subscriptionStatus: true,
        subscriptionId: true,
        plan: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
      },
    });
    if (!fresh) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }
    return NextResponse.json({
      subscriptionStatus: fresh.subscriptionStatus,
      subscriptionId: fresh.subscriptionId,
      plan: fresh.plan,
      trialEndsAt: fresh.trialEndsAt,
      currentPeriodEnd: fresh.currentPeriodEnd,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao buscar sessão" },
      { status: 500 }
    );
  }
}
