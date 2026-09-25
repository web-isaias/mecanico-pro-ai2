import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_CATEGORIES = ["parts", "tools", "fluids"];

// GET /api/inventory/[id] — single inventory item
export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const item = await db.inventoryItem.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: item });
  } catch (err: any) {
    console.error("Inventory detail API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao carregar item" },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/[id] — patch-style update (also used for stock adjustment)
export async function PUT(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const existing = await db.inventoryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 }
      );
    }

    const {
      name,
      sku,
      barcode,
      category,
      supplier,
      quantity,
      minStock,
      purchasePrice,
      salePrice,
      unit,
      location,
    } = body || {};

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
    if (sku !== undefined) updateData.sku = sku?.trim() || null;
    if (barcode !== undefined) updateData.barcode = barcode?.trim() || null;
    if (category !== undefined) {
      updateData.category = VALID_CATEGORIES.includes(category)
        ? category
        : "parts";
    }
    if (supplier !== undefined) updateData.supplier = supplier?.trim() || null;

    if (quantity !== undefined) {
      const n = typeof quantity === "number" ? quantity : Number(quantity);
      updateData.quantity =
        Number.isFinite(n) && n >= 0 ? Math.floor(n) : existing.quantity;
    }
    if (minStock !== undefined) {
      const n = typeof minStock === "number" ? minStock : Number(minStock);
      updateData.minStock =
        Number.isFinite(n) && n >= 0 ? Math.floor(n) : existing.minStock;
    }
    if (purchasePrice !== undefined) {
      const n =
        typeof purchasePrice === "number"
          ? purchasePrice
          : Number(String(purchasePrice || "").replace(",", "."));
      updateData.purchasePrice =
        Number.isFinite(n) && n >= 0 ? n : existing.purchasePrice;
    }
    if (salePrice !== undefined) {
      const n =
        typeof salePrice === "number"
          ? salePrice
          : Number(String(salePrice || "").replace(",", "."));
      updateData.salePrice =
        Number.isFinite(n) && n >= 0 ? n : existing.salePrice;
    }
    if (unit !== undefined) updateData.unit = unit?.trim() || "un";
    if (location !== undefined) updateData.location = location?.trim() || null;

    const item = await db.inventoryItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: item });
  } catch (err: any) {
    console.error("Inventory update API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao atualizar item" },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/[id]
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const existing = await db.inventoryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 }
      );
    }

    await db.inventoryItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Inventory delete API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao excluir item" },
      { status: 500 }
    );
  }
}
