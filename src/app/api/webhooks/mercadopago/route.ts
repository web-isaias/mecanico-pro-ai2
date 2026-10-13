import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getPreapproval,
  getAuthorizedPayment,
  mapMpStatus,
  PLANS,
  type PlanId,
} from "@/lib/mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Webhook do Mercado Pago (assinaturas).
// Eventos tratados:
//   - subscription_preapproval        → assinatura criada/autorizada/pausada/cancelada
//   - subscription_authorized_payment → cobrança recorrente (mensal/anual) processada
// Qualquer outro evento (ex.: "payment") é ignorado.
//
// Segurança:
//   - Se MERCADOPAGO_WEBHOOK_SECRET estiver definido, a assinatura (x-signature) é validada.
//   - O estado real SEMPRE é consultado na API do Mercado Pago; o corpo do aviso nunca é confiado.

function validSignature(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true; // validação desligada (não recomendado em produção)

  const sig = req.headers.get("x-signature") ?? "";
  const requestId = req.headers.get("x-request-id") ?? "";
  const parts: Record<string, string> = {};
  for (const piece of sig.split(",")) {
    const [k, v] = piece.trim().split("=");
    if (k && v) parts[k] = v;
  }
  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Formato novo: ?data.id=...&type=...   |   Formato antigo (IPN): ?topic=...&id=...
    const topic: string | null =
      url.searchParams.get("type") ||
      url.searchParams.get("topic") ||
      body?.type ||
      body?.topic ||
      null;
    const dataId: string | null =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      body?.data?.id?.toString() ||
      null;

    if (!topic || !dataId) {
      return NextResponse.json({ ok: true, message: "ignored" });
    }
    if (!validSignature(req, dataId)) {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    }

    // 1) descobrir o ID da assinatura (preapproval)
    let preapprovalId: string | null = null;
    if (topic === "preapproval" || topic === "subscription_preapproval") {
      preapprovalId = dataId;
    } else if (topic === "subscription_authorized_payment") {
      const payment = await getAuthorizedPayment(dataId);
      preapprovalId = payment?.preapproval_id ? String(payment.preapproval_id) : null;
    } else {
      return NextResponse.json({ ok: true, message: `ignored topic: ${topic}` });
    }
    if (!preapprovalId) {
      return NextResponse.json({ ok: true, message: "ignored: no preapproval" });
    }

    // 2) estado real da assinatura
    const preapproval = await getPreapproval(preapprovalId);
    if (!preapproval) {
      // erro temporário na API do MP → 500 para o Mercado Pago tentar de novo
      return NextResponse.json({ error: "preapproval indisponível" }, { status: 500 });
    }

    const userId: string | undefined = preapproval.external_reference;
    if (!userId) {
      return NextResponse.json({ ok: true, message: "no user ref" });
    }

    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ ok: true, message: "user not found" });
    }

    const internalStatus = mapMpStatus(preapproval.status);
    const planId: PlanId =
      preapproval.auto_recurring?.frequency_type === "years" ? "annual" : "monthly";
    const amount: number = preapproval.auto_recurring?.transaction_amount || PLANS[planId].price;

    // Fim do período = próxima cobrança informada pelo Mercado Pago
    // (antes era "agora + 30 dias" a cada aviso, o que estendia o acesso sem pagamento)
    const nextPayment = preapproval.next_payment_date ? new Date(preapproval.next_payment_date) : null;
    const periodEnd = nextPayment && !isNaN(nextPayment.getTime()) ? nextPayment : null;

    // "pending" (internalStatus null) não altera a conta: o cliente só abriu o checkout.
    if (internalStatus) {
      await db.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: internalStatus,
          subscriptionId: preapprovalId,
          plan: planId,
          ...(internalStatus === "active" && periodEnd ? { currentPeriodEnd: periodEnd } : {}),
        },
      });
    }

    await db.subscription.create({
      data: {
        userId,
        mpPreapprovalId: preapprovalId,
        status: internalStatus ?? "pending",
        plan: planId,
        amount,
        currency: "BRL",
        currentPeriodEnd: periodEnd,
        event: `${topic}:${preapproval.status}`,
      },
    });

    return NextResponse.json({ ok: true, status: internalStatus ?? "pending" });
  } catch (err: any) {
    console.error("MP webhook error:", err);
    // 500 faz o Mercado Pago reenviar o aviso (ex.: banco fora do ar por alguns segundos)
    return NextResponse.json({ error: "erro interno" }, { status: 500 });
  }
}

// O Mercado Pago pode chamar GET só para validar a URL
export async function GET() {
  return NextResponse.json({ ok: true, service: "mercadopago-webhook" });
}
