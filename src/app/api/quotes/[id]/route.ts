import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
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
    return NextResponse.json(updated);
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
