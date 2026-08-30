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
    const orders = await db.serviceOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        vehicle: true,
        items: true,
        quote: true,
      },
      take: 100,
    });
    return NextResponse.json(orders);
  } catch (err: any) {
    console.error("Service orders GET error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao listar ordens de serviço" },
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
    const { customerId, vehicleId, title, description, status, priority, laborCost, partsCost, totalCost, warranty, scheduledAt, items } = body;
    if (!customerId || !title) {
      return NextResponse.json(
        { error: "Cliente e título são obrigatórios" },
        { status: 400 }
      );
    }
    // Validate customer belongs to this user
    const customer = await db.customer.findFirst({ where: { id: customerId, userId } });
    if (!customer) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }
    const order = await db.serviceOrder.create({
      data: {
        userId,
        customerId,
        vehicleId: vehicleId || null,
        title,
        description: description || null,
        status: status || "pending",
        priority: priority || "normal",
        laborCost: Number(laborCost) || 0,
        partsCost: Number(partsCost) || 0,
        totalCost: Number(totalCost) || 0,
        warranty: warranty || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        items: items?.length
          ? { create: items.map((it: any) => ({
              description: it.description,
              type: it.type || "service",
              quantity: Number(it.quantity) || 1,
              unitPrice: Number(it.unitPrice) || 0,
              total: Number(it.total) || 0,
            })) }
          : undefined,
      },
      include: { customer: true, vehicle: true, items: true },
    });
    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    console.error("Service order POST error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao criar ordem de serviço" },
      { status: 500 }
    );
  }
}
