import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_CATEGORIES = ["parts", "tools", "fluids"];

// GET /api/inventory?q=...&category=...&lowStock=true
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const lowStock = searchParams.get("lowStock") === "true";
    const take = Number(searchParams.get("take") ?? 500);
    const skip = Number(searchParams.get("skip") ?? 0);

    const where: any = { userId };
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { barcode: { contains: q } },
      ];
    }
    if (category && VALID_CATEGORIES.includes(category)) {
      where.category = category;
    }

    let items = await db.inventoryItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Number.isFinite(take) && take > 0 ? take : 500,
      skip: Number.isFinite(skip) && skip >= 0 ? skip : 0,
    });

    // lowStock filter — depends on per-item minStock, so filter in JS
    if (lowStock) {
      items = items.filter((i) => i.quantity <= i.minStock);
    }

    return NextResponse.json({ data: items, total: items.length });
  } catch (err: any) {
    console.error("Inventory list API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao listar itens de estoque" },
      { status: 500 }
    );
  }
}

// POST /api/inventory — create a new inventory item
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
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

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const cat = VALID_CATEGORIES.includes(category) ? category : "parts";

    // Parse numbers defensively (accept number OR numeric string)
    const parseQty = (v: any): number => {
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    };
    const parsePrice = (v: any): number => {
      const n = typeof v === "number" ? v : Number(String(v || "").replace(",", "."));
      return Number.isFinite(n) && n >= 0 ? n : 0;
    };

    const item = await db.inventoryItem.create({
      data: {
        userId,
        name: name.trim(),
        sku: sku?.trim() || null,
        barcode: barcode?.trim() || null,
        category: cat,
        supplier: supplier?.trim() || null,
        quantity: parseQty(quantity),
        minStock: parseQty(minStock),
        purchasePrice: parsePrice(purchasePrice),
        salePrice: parsePrice(salePrice),
        unit: unit?.trim() || "un",
        location: location?.trim() || null,
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (err: any) {
    console.error("Inventory create API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao criar item de estoque" },
      { status: 500 }
    );
  }
}
