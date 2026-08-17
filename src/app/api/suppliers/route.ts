import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/suppliers?q=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";

    const where = q
      ? {
          OR: [
            { name: { contains: q } },
            { cnpj: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
          ],
        }
      : {};

    const suppliers = await db.supplier.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ data: suppliers, total: suppliers.length });
  } catch (err: any) {
    console.error("Suppliers list API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao listar fornecedores" },
      { status: 500 }
    );
  }
}

// POST /api/suppliers — create a new supplier
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, cnpj, address, notes } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const supplier = await db.supplier.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        cnpj: cnpj?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({ data: supplier }, { status: 201 });
  } catch (err: any) {
    console.error("Suppliers create API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao criar fornecedor" },
      { status: 500 }
    );
  }
}
