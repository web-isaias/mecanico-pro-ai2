import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPreapproval, mapMpStatus, PLANS, type PlanId } from "@/lib/mercadopago";

export const runtime = "nodejs";

// Mercado Pago webhook receiver
// MP calls this URL whenever a subscription event happens:
//   - preapproval authorized (user authorized recurring payment)
//   - payment received (monthly charge succeeded)
//   - payment failed (charge failed — set status to past_due)
//   - subscription cancelled
// We update the User.subscriptionStatus + create a Subscription log entry.
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic");
    const id = url.searchParams.get("id") || url.searchParams.get("data_id");

    // Parse body (MP sometimes sends JSON, sometimes query only)
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    console.log("MP webhook received:", { topic, id, body });

    // Identify the preapproval ID from various payload formats
    let preapprovalId: string | null = null;
    if (topic === "preapproval" || topic === "subscription_preapproval") {
      preapprovalId = id || body?.data?.id || body?.id;
    } else if (topic === "payment") {
      // For payment webhooks, we'd need to fetch the payment to find the preapproval
      // MP payments reference the preapproval via order or metadata
      const paymentId = id || body?.data?.id;
      if (paymentId) {
        // Try to find a user by recent subscription preapproval
        const sub = await db.subscription.findFirst({
          where: { mpPreapprovalId: { not: null } },
          orderBy: { createdAt: "desc" },
        });
        if (sub?.mpPreapprovalId) preapprovalId = sub.mpPreapprovalId;
      }
    } else if (body?.type === "subscription_preapproval" || body?.type === "preapproval") {
      preapprovalId = body?.data?.id || body?.id;
    }

    if (!preapprovalId) {
      // Not a subscription event — acknowledge and exit
      return NextResponse.json({ ok: true, message: "ignored: no preapproval" });
    }

    // Fetch the authoritative preapproval status from MP API
    const preapproval = await getPreapproval(preapprovalId);
    if (!preapproval) {
      console.error("MP webhook: could not fetch preapproval", preapprovalId);
      return NextResponse.json({ ok: true, message: "preapproval not found" });
    }

    const userId = preapproval.external_reference || preapproval.payer_id;
    if (!userId) {
      console.error("MP webhook: no external_reference on preapproval", preapprovalId);
      return NextResponse.json({ ok: true, message: "no user ref" });
    }

    const internalStatus = mapMpStatus(preapproval.status);
    const planId = (preapproval.auto_recurring?.frequency_type === "years"
      ? "annual"
      : "monthly") as PlanId;
    const amount = preapproval.auto_recurring?.transaction_amount || PLANS[planId].price;

    // Compute next period end based on plan
    const now = new Date();
    const periodEnd = new Date(
      now.getTime() +
        (planId === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000
    );

    // Update user
    await db.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: internalStatus,
        subscriptionId: preapprovalId,
        plan: planId,
        currentPeriodEnd: internalStatus === "active" ? periodEnd : undefined,
      },
    });

    // Log the subscription event
    await db.subscription.create({
      data: {
        userId,
        mpPreapprovalId: preapprovalId,
        status: internalStatus,
        plan: planId,
        amount,
        currency: "BRL",
        currentPeriodEnd: internalStatus === "active" ? periodEnd : null,
        event: `${topic || body?.type || "event"}:${preapproval.status}`,
      },
    });

    console.log("MP webhook processed:", {
      userId,
      preapprovalId,
      status: internalStatus,
      plan: planId,
    });

    return NextResponse.json({ ok: true, status: internalStatus });
  } catch (err: any) {
    console.error("MP webhook error:", err);
    // Always return 200 to MP to avoid retries for non-recoverable errors
    return NextResponse.json(
      { ok: true, error: err?.message },
      { status: 200 }
    );
  }
}

// MP sends a GET to validate the webhook URL
export async function GET() {
  return NextResponse.json({ ok: true, service: "mercadopago-webhook" });
}
