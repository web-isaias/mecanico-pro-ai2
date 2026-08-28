import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createServiceOrderFromQuote } from "@/lib/quote-to-service-order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // ---- Detect transition to "approved" ----
    // We need to know the previous status to decide if we should create a ServiceOrder.
    // Rule: only create OS when status CHANGES to "approved" (and no OS linked yet).
    // Editing an already-approved quote won't create a new OS (idempotent — the helper checks quoteId uniqueness).
    const previousQuote = await db.quote.findUnique({
      where: { id },
      select: { id: true, status: true, number: true },
    });
    if (!previousQuote) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }
    const wasApproved = previousQuote.status === "approved";
    const willBeApproved = body.status === "approved";
    const isApprovingNow = willBeApproved && !wasApproved;

    // ---- Build the update payload ----
    const data: any = {};
    for (const f of [
      "items",
      "laborTotal",
      "partsTotal",
      "taxPercent",
      "discount",
      "total",
      "status",
      "notes",
      "signature",
      "vehicleId",
    ]) {
      if (body[f] !== undefined) {
        if (f === "items") data.items = JSON.stringify(body[f]);
        else if (["laborTotal", "partsTotal", "taxPercent", "discount", "total"].includes(f))
          data[f] = Number(body[f]);
        else data[f] = body[f];
      }
    }

    const updated = await db.quote.update({
      where: { id },
      data,
      include: { customer: true, vehicle: true },
    });

    // ---- Create the ServiceOrder if just approved (idempotent) ----
    let serviceOrderInfo: { created: boolean; serviceOrderId?: string; serviceOrderNumber?: string } | null = null;
    if (isApprovingNow) {
      try {
        const { serviceOrder, created } = await createServiceOrderFromQuote(id);
        serviceOrderInfo = {
          created,
          serviceOrderId: serviceOrder.id,
          // Generate a friendly OS number for the UI (no DB column — derived from createdAt + id suffix)
          serviceOrderNumber: `OS-${new Date(serviceOrder.createdAt).getFullYear()}-${serviceOrder.id.slice(-6).toUpperCase()}`,
        };
      } catch (err: any) {
        console.error("createServiceOrderFromQuote error:", err);
        // Don't fail the quote update if OS creation fails
      }
    }

    return NextResponse.json({
      ...updated,
      _serviceOrder: serviceOrderInfo,
    });
  } catch (err: any) {
    console.error("Quote PUT error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao atualizar orçamento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.quote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Quote DELETE error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao excluir orçamento" },
      { status: 500 }
    );
  }
}
