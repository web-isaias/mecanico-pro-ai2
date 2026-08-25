import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import { PLANS, type PlanId } from "@/lib/mercadopago";

export const runtime = "nodejs";

// DEV-ONLY: simulate a successful webhook (Mercado Pago not configured)
// In production, this endpoint is disabled and the real webhook does the work.
export async function POST(req: NextRequest) {
  // Disable in production if MP is configured
  if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Disponível apenas sem Mercado Pago configurado" },
      { status: 403 }
    );
  }
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const body = await req.json();
    const planId = (body?.plan as PlanId) || "monthly";
    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const now = new Date();
    const periodEnd = new Date(
      now.getTime() +
        (plan.intervalType === "years" ? 365 : 30) * 24 * 60 * 60 * 1000
    );

    const user = await db.user.update({
      where: { id: token.id as string },
      data: {
        subscriptionStatus: "active",
        plan: planId,
        currentPeriodEnd: periodEnd,
        subscriptionId: `dev_${Date.now()}`,
      },
      select: { id: true, subscriptionStatus: true, plan: true, currentPeriodEnd: true },
    });

    await db.subscription.create({
      data: {
        userId: user.id,
        mpPreapprovalId: user.subscriptionId,
        status: "active",
        plan: planId,
        amount: plan.price,
        currency: "BRL",
        currentPeriodEnd: periodEnd,
        event: "dev_activated",
      },
    });

    return NextResponse.json({
      success: true,
      user,
      message: "Assinatura ativada (modo dev). Em produção, isso aconteceria via webhook do Mercado Pago.",
    });
  } catch (err: any) {
    console.error("dev-activate error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao ativar assinatura" },
      { status: 500 }
    );
  }
}
