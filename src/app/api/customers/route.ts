import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/customers?q=...&take=...&skip=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const take = Number(searchParams.get("take") ?? 100);
    const skip = Number(searchParams.get("skip") ?? 0);

    const where = q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { document: { contains: q } },
            { phone: { contains: q } },
            { whatsapp: { contains: q } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Number.isFinite(take) && take > 0 ? take : 100,
        skip: Number.isFinite(skip) && skip >= 0 ? skip : 0,
        include: {
          vehicles: {
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              services: true,
              quotes: true,
              appointments: true,
            },
          },
        },
      }),
      db.customer.count({ where }),
    ]);

    return NextResponse.json({ data: customers, total });
  } catch (err: any) {
    console.error("Customers list API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao listar clientes" },
      { status: 500 }
    );
  }
}

// POST /api/customers — create customer with optional nested vehicles
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      whatsapp,
      email,
      document,
      address,
      notes,
      vehicles,
    } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Optional: prevent duplicate by document when provided
    if (document && document.trim()) {
      const exists = await db.customer.findFirst({
        where: { document: document.trim() },
      });
      if (exists) {
        return NextResponse.json(
          { error: "Já existe um cliente com este CPF/CNPJ" },
          { status: 409 }
        );
      }
    }

    const customer = await db.customer.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        email: email?.trim() || null,
        document: document?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
        vehicles:
          Array.isArray(vehicles) && vehicles.length > 0
            ? {
                create: vehicles
                  .filter(
                    (v: any) =>
                      v &&
                      (v.brand || v.model || v.plate)
                  )
                  .map((v: any) => ({
                    brand: (v.brand || "").trim(),
                    model: (v.model || "").trim(),
                    year: v.year ? Number(v.year) : null,
                    fuel: v.fuel?.trim() || null,
                    engine: v.engine?.trim() || null,
                    engineCode: v.engineCode?.trim() || null,
                    chassis: v.chassis?.trim() || null,
                    plate: v.plate?.trim().toUpperCase() || null,
                    mileage:
                      typeof v.mileage === "number"
                        ? v.mileage
                        : Number(v.mileage || 0),
                    nextService: v.nextService
                      ? new Date(v.nextService)
                      : null,
                    notes: v.notes?.trim() || null,
                  }))
              }
            : undefined,
      },
      include: { vehicles: true },
    });

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (err: any) {
    console.error("Customers create API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}
