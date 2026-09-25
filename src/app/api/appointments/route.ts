import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/appointments?from=&to=&status=&type=
// List appointments (optionally filtered by date range / status / type).
// Customer is included so the UI can display names + contact info.
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const status = searchParams.get("status")?.trim();
    const type = searchParams.get("type")?.trim();

    const where: any = { userId };

    if (from || to) {
      where.startDate = {};
      if (from) where.startDate.gte = new Date(from);
      if (to) where.startDate.lte = new Date(to);
    }
    if (status) where.status = status;
    if (type) where.type = type;

    const appointments = await db.appointment.findMany({
      where,
      orderBy: { startDate: "asc" },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            whatsapp: true,
          },
        },
      },
      take: 500,
    });

    return NextResponse.json({ data: appointments });
  } catch (err: any) {
    console.error("Appointments list API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao listar agendamentos" },
      { status: 500 }
    );
  }
}

// POST /api/appointments — create new appointment
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      type,
      status,
      startDate,
      endDate,
      customerId,
      vehicleDesc,
      notes,
    } = body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }
    if (!startDate) {
      return NextResponse.json(
        { error: "Data de início é obrigatória" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json(
        { error: "Data de início inválida" },
        { status: 400 }
      );
    }

    let end: Date | null = null;
    if (endDate) {
      const parsed = new Date(endDate);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: "Data de término inválida" },
          { status: 400 }
        );
      }
      end = parsed;
      if (end < start) {
        return NextResponse.json(
          { error: "Data de término não pode ser anterior à de início" },
          { status: 400 }
        );
      }
    }

    // Validate customer if provided (must belong to the same user)
    if (customerId && typeof customerId === "string" && customerId.trim()) {
      const customer = await db.customer.findFirst({
        where: { id: customerId, userId },
      });
      if (!customer) {
        return NextResponse.json(
          { error: "Cliente não encontrado" },
          { status: 404 }
        );
      }
    }

    const validTypes = ["service", "delivery", "review", "maintenance"];
    const validStatuses = ["scheduled", "confirmed", "done", "cancelled"];
    const finalType = validTypes.includes(type) ? type : "service";
    const finalStatus = validStatuses.includes(status) ? status : "scheduled";

    const appointment = await db.appointment.create({
      data: {
        userId,
        title: title.trim(),
        type: finalType,
        status: finalStatus,
        startDate: start,
        endDate: end,
        customerId: customerId?.trim() || null,
        vehicleDesc: vehicleDesc?.trim() || null,
        notes: notes?.trim() || null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            whatsapp: true,
          },
        },
      },
    });

    return NextResponse.json({ data: appointment }, { status: 201 });
  } catch (err: any) {
    console.error("Appointments create API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}
