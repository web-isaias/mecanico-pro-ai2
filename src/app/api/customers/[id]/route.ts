import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/customers/[id] — single customer with vehicles + recent serviceOrders
export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        vehicles: {
          orderBy: { createdAt: "desc" },
        },
        services: {
          orderBy: { createdAt: "desc" },
          take: 25,
          include: {
            vehicle: true,
            items: true,
          },
        },
        quotes: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        appointments: {
          orderBy: { startDate: "desc" },
          take: 10,
        },
        _count: {
          select: {
            services: true,
            quotes: true,
            appointments: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: customer });
  } catch (err: any) {
    console.error("Customer detail API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao carregar cliente" },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] — update customer (and optionally add a new vehicle)
export async function PUT(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const existing = await db.customer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const {
      name,
      phone,
      whatsapp,
      email,
      document,
      address,
      notes,
      newVehicle,
    } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // If document changed, check for conflict
    if (document && document.trim() && document.trim() !== existing.document) {
      const conflict = await db.customer.findFirst({
        where: {
          document: document.trim(),
          NOT: { id },
        },
      });
      if (conflict) {
        return NextResponse.json(
          { error: "Já existe outro cliente com este CPF/CNPJ" },
          { status: 409 }
        );
      }
    }

    // Build update payload
    const updateData: any = {
      name: name.trim(),
      phone: phone !== undefined ? phone?.trim() || null : existing.phone,
      whatsapp:
        whatsapp !== undefined ? whatsapp?.trim() || null : existing.whatsapp,
      email: email !== undefined ? email?.trim() || null : existing.email,
      document:
        document !== undefined ? document?.trim() || null : existing.document,
      address:
        address !== undefined ? address?.trim() || null : existing.address,
      notes: notes !== undefined ? notes?.trim() || null : existing.notes,
    };

    if (newVehicle && (newVehicle.brand || newVehicle.model || newVehicle.plate)) {
      updateData.vehicles = {
        create: {
          brand: (newVehicle.brand || "").trim(),
          model: (newVehicle.model || "").trim(),
          year: newVehicle.year ? Number(newVehicle.year) : null,
          fuel: newVehicle.fuel?.trim() || null,
          engine: newVehicle.engine?.trim() || null,
          engineCode: newVehicle.engineCode?.trim() || null,
          chassis: newVehicle.chassis?.trim() || null,
          plate: newVehicle.plate?.trim().toUpperCase() || null,
          mileage:
            typeof newVehicle.mileage === "number"
              ? newVehicle.mileage
              : Number(newVehicle.mileage || 0),
          nextService: newVehicle.nextService
            ? new Date(newVehicle.nextService)
            : null,
          notes: newVehicle.notes?.trim() || null,
        },
      };
    }

    const customer = await db.customer.update({
      where: { id },
      data: updateData,
      include: {
        vehicles: { orderBy: { createdAt: "desc" } },
        _count: {
          select: { services: true, quotes: true, appointments: true },
        },
      },
    });

    return NextResponse.json({ data: customer });
  } catch (err: any) {
    console.error("Customer update API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id]
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const existing = await db.customer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Cascade deletes will remove vehicles; serviceOrders reference the
    // customer directly so they will be removed too (onDelete: Cascade).
    await db.customer.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Customer delete API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao excluir cliente" },
      { status: 500 }
    );
  }
}
