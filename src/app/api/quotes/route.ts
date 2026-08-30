import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const where: any = { userId };
    if (status) where.status = status;
    const quotes = await db.quote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        vehicle: true,
        serviceOrders: { select: { id: true, status: true, createdAt: true } },
      },
      take: 100,
    });
    return NextResponse.json(quotes);
  } catch (err: any) {
    console.error("Quotes GET error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao listar orçamentos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      customerId,
      vehicleId,
      items,
      laborTotal,
      partsTotal,
      taxPercent,
      discount,
      total,
      status,
      notes,
      signature,
    } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "Cliente é obrigatório" },
        { status: 400 }
      );
    }

    const count = await db.quote.count();
    const number = `ORC-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const quote = await db.quote.create({
      data: {
        userId,
        number,
        customerId,
        vehicleId: vehicleId || null,
        items: JSON.stringify(items || []),
        laborTotal: Number(laborTotal) || 0,
        partsTotal: Number(partsTotal) || 0,
        taxPercent: Number(taxPercent) || 0,
        discount: Number(discount) || 0,
        total: Number(total) || 0,
        status: status || "draft",
        notes: notes || null,
        signature: signature || null,
      },
      include: { customer: true, vehicle: true },
    });
    return NextResponse.json(quote, { status: 201 });
  } catch (err: any) {
    console.error("Quote POST error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao criar orçamento" },
      { status: 500 }
    );
  }
}
