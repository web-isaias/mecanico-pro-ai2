import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PUT /api/services/[id]
// Updates a ServiceOrder. Primary use case: change status through the workflow
// pending → in_progress → done | cancelled
//
// Side effects when status becomes "done":
//   1. Sets completedAt = now
//   2. Decrement inventory for items of type "part" (matched by name OR SKU)
//      — uses a best-effort match. Items that don't match any inventory row are skipped.
//   3. Creates a Transaction (income) for the service total
//
// Side effects when status moves away from "done" (e.g. cancelled or back to pending):
//   - None (we don't reverse stock/transactions to keep audit simple)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const newStatus = body.status as string | undefined;
    const otherFields: any = {};
    for (const f of ["title", "description", "priority", "laborCost", "partsCost", "totalCost", "warranty", "scheduledAt"]) {
      if (body[f] !== undefined) {
        if (["laborCost", "partsCost", "totalCost"].includes(f)) otherFields[f] = Number(body[f]);
        else if (f === "scheduledAt") otherFields[f] = body[f] ? new Date(body[f]) : null;
        else otherFields[f] = body[f];
      }
    }

    // Load current state to detect transitions
    const current = await db.serviceOrder.findUnique({
      where: { id },
      select: { id: true, status: true, title: true, totalCost: true, customerId: true, userId: true, completedAt: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Ordem de serviço não encontrada" }, { status: 404 });
    }

    const wasDone = current.status === "done";
    const willBeDone = newStatus === "done" && !wasDone;

    // Build update data
    const updateData: any = { ...otherFields };
    if (newStatus) updateData.status = newStatus;
    if (willBeDone) updateData.completedAt = new Date();

    const updated = await db.serviceOrder.update({
      where: { id },
      data: updateData,
      include: { customer: true, vehicle: true, items: true, quote: true },
    });

    // Side effects on transition to "done"
    let sideEffects: {
      stockAdjusted: { name: string; quantity: number; remaining: number; matched: boolean }[];
      transactionCreated: { id: string; amount: number } | null;
    } = { stockAdjusted: [], transactionCreated: null };

    if (willBeDone) {
      // ---- 1. Decrement inventory for "part" items ----
      const partItems = updated.items.filter((it) => it.type === "part");
      for (const item of partItems) {
        // Try to find matching InventoryItem by name (exact), SKU or barcode.
        // Note: SQLite doesn't support Prisma's `mode: "insensitive"`, so we do
        // an exact match first, then fall back to a case-insensitive compare in JS.
        const desc = item.description?.trim() || "";
        const descLower = desc.toLowerCase();

        let matchedInv = await db.inventoryItem.findFirst({
          where: {
            OR: [
              { name: desc },
              { sku: desc },
              { barcode: desc },
            ],
          },
        });

        // Fallback: case-insensitive exact match via JS
        if (!matchedInv && desc) {
          const candidates = await db.inventoryItem.findMany({
            where: { name: { contains: descLower } },
          });
          matchedInv = candidates.find((c) => c.name.toLowerCase() === descLower) || null;
        }

        if (matchedInv) {
          const decrement = Math.max(1, Math.floor(item.quantity));
          const newQty = Math.max(0, matchedInv.quantity - decrement);
          await db.inventoryItem.update({
            where: { id: matchedInv.id },
            data: { quantity: newQty },
          });
          sideEffects.stockAdjusted.push({
            name: matchedInv.name,
            quantity: decrement,
            remaining: newQty,
            matched: true,
          });
        } else {
          sideEffects.stockAdjusted.push({
            name: item.description,
            quantity: Math.floor(item.quantity),
            remaining: -1,
            matched: false,
          });
        }
      }

      // ---- 2. Create financial transaction (income) ----
      const amount = updated.totalCost || 0;
      if (amount > 0) {
        const tx = await db.transaction.create({
          data: {
            userId: updated.userId || undefined,
            type: "income",
            category: "service",
            description: `OS: ${updated.title}${updated.customer ? ` — ${updated.customer.name}` : ""}`,
            amount,
            date: new Date(),
            status: "paid",
          },
        });
        sideEffects.transactionCreated = { id: tx.id, amount };
      }
    }

    return NextResponse.json({
      ...updated,
      _sideEffects: sideEffects,
    });
  } catch (err: any) {
    console.error("Service order PUT error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao atualizar ordem de serviço" },
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
    await db.serviceOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Service order DELETE error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao excluir ordem de serviço" },
      { status: 500 }
    );
  }
}
