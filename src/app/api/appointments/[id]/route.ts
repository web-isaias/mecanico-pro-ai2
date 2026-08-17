import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const validTypes = ["service", "delivery", "review", "maintenance"];
const validStatuses = ["scheduled", "confirmed", "done", "cancelled"];

// PUT /api/appointments/[id] — update appointment
export async function PUT(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const existing = await db.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

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

    const updateData: any = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json(
          { error: "Título é obrigatório" },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (type !== undefined) {
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: "Tipo de agendamento inválido" },
          { status: 400 }
        );
      }
      updateData.type = type;
    }

    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Status inválido" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    let start = existing.startDate;
    if (startDate !== undefined) {
      start = new Date(startDate);
      if (Number.isNaN(start.getTime())) {
        return NextResponse.json(
          { error: "Data de início inválida" },
          { status: 400 }
        );
      }
      updateData.startDate = start;
    }

    if (endDate !== undefined) {
      if (endDate === null || endDate === "") {
        updateData.endDate = null;
      } else {
        const parsed = new Date(endDate);
        if (Number.isNaN(parsed.getTime())) {
          return NextResponse.json(
            { error: "Data de término inválida" },
            { status: 400 }
          );
        }
        if (parsed < start) {
          return NextResponse.json(
            { error: "Data de término não pode ser anterior à de início" },
            { status: 400 }
          );
        }
        updateData.endDate = parsed;
      }
    }

    if (customerId !== undefined) {
      if (customerId === null || customerId === "") {
        updateData.customerId = null;
      } else {
        const customer = await db.customer.findUnique({
          where: { id: customerId },
        });
        if (!customer) {
          return NextResponse.json(
            { error: "Cliente não encontrado" },
            { status: 404 }
          );
        }
        updateData.customerId = customerId;
      }
    }

    if (vehicleDesc !== undefined) {
      updateData.vehicleDesc =
        typeof vehicleDesc === "string" ? vehicleDesc.trim() || null : null;
    }

    if (notes !== undefined) {
      updateData.notes =
        typeof notes === "string" ? notes.trim() || null : null;
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ data: appointment });
  } catch (err: any) {
    console.error("Appointment update API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao atualizar agendamento" },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[id]
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const existing = await db.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    await db.appointment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Appointment delete API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao excluir agendamento" },
      { status: 500 }
    );
  }
}
