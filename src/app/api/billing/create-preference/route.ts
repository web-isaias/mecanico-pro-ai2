import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import { createSubscriptionPreference, PLANS, type PlanId, isMercadoPagoConfigured } from "@/lib/mercadopago";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const body = await req.json();
    const planId = (body?.plan as PlanId) || "monthly";
    if (!PLANS[planId]) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: token.id as string },
      select: { id: true, email: true, subscriptionId: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // If MP is not configured (dev), return a dev flag
    if (!isMercadoPagoConfigured()) {
      return NextResponse.json({
        dev: true,
        message: "Mercado Pago não configurado. Use o botão de ativação dev.",
        plan: planId,
        price: PLANS[planId].price,
      });
    }

    const callbackUrl = new URL("/billing", req.url).toString();
    const result = await createSubscriptionPreference({
      email: user.email,
      plan: planId,
      userId: user.id,
      backUrl: callbackUrl,
    });
    if (!result) {
      return NextResponse.json({ error: "Falha ao criar preferência" }, { status: 500 });
    }

    // Save the preapproval ID on the user
    await db.user.update({
      where: { id: user.id },
      data: {
        subscriptionId: result.preapprovalId,
        plan: planId,
      },
    });

    // Log the subscription attempt
    await db.subscription.create({
      data: {
        userId: user.id,
        mpPreapprovalId: result.preapprovalId,
        status: "pending",
        plan: planId,
        amount: PLANS[planId].price,
        currency: "BRL",
        event: "preference_created",
      },
    });

    return NextResponse.json({
      initPoint: result.initPoint,
      preapprovalId: result.preapprovalId,
    });
  } catch (err: any) {
    console.error("create-preference error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao criar preferência de pagamento" },
      { status: 500 }
    );
  }
}
