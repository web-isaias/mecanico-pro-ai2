import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const ALLOWED_TYPES = ["income", "expense"] as const;
const ALLOWED_CATEGORIES = [
  "service",
  "parts",
  "labor",
  "rent",
  "utility",
  "other",
] as const;
const ALLOWED_STATUSES = ["paid", "pending"] as const;

// PUT /api/transactions/[id] — patch-style update
export async function PUT(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const existing = await db.transaction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );
    }

    const { type, category, description, amount, date, status } = body || {};

    if (
      type !== undefined &&
      !(ALLOWED_TYPES as readonly string[]).includes(type)
    ) {
      return NextResponse.json(
        { error: "Tipo inválido" },
        { status: 400 }
      );
    }
    if (
      category !== undefined &&
      !(ALLOWED_CATEGORIES as readonly string[]).includes(category)
    ) {
      return NextResponse.json(
        { error: "Categoria inválida" },
        { status: 400 }
      );
    }
    if (
      status !== undefined &&
      !(ALLOWED_STATUSES as readonly string[]).includes(status)
    ) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 }
      );
    }

    if (amount !== undefined) {
      const parsed = Number(amount);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return NextResponse.json(
          { error: "Valor deve ser um número positivo" },
          { status: 400 }
        );
      }
    }

    if (
      description !== undefined &&
      (typeof description !== "string" || !description.trim())
    ) {
      return NextResponse.json(
        { error: "Descrição não pode ser vazia" },
        { status: 400 }
      );
    }

    let dateValue: Date | undefined;
    if (date !== undefined && date !== null && date !== "") {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { error: "Data inválida" },
          { status: 400 }
        );
      }
      dateValue = d;
    }

    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description.trim();
    if (amount !== undefined) updateData.amount = Number(amount);
    if (dateValue !== undefined) updateData.date = dateValue;
    if (status !== undefined) updateData.status = status;

    const updated = await db.transaction.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error("Transaction update API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao atualizar transação" },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id]
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const existing = await db.transaction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );
    }

    await db.transaction.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Transaction delete API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao excluir transação" },
      { status: 500 }
    );
  }
}
