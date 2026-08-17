import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/suppliers/[id] — patch-style update
export async function PUT(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const existing = await db.supplier.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Fornecedor não encontrado" },
        { status: 404 }
      );
    }

    const { name, phone, email, cnpj, address, notes } = body || {};

    const updateData: any = {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return NextResponse.json(
          { error: "Nome é obrigatório" },
          { status: 400 }
        );
      }
      updateData.name = String(name).trim();
    }
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (cnpj !== undefined) updateData.cnpj = cnpj?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const supplier = await db.supplier.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: supplier });
  } catch (err: any) {
    console.error("Supplier update API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao atualizar fornecedor" },
      { status: 500 }
    );
  }
}

// DELETE /api/suppliers/[id]
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const existing = await db.supplier.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Fornecedor não encontrado" },
        { status: 404 }
      );
    }

    await db.supplier.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Supplier delete API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao excluir fornecedor" },
      { status: 500 }
    );
  }
}
