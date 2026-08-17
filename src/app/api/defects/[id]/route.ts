import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

// GET /api/defects/[id] — single defect
export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const defect = await db.defect.findUnique({ where: { id } });

    if (!defect) {
      return NextResponse.json(
        { error: "Defeito não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: defect });
  } catch (err: any) {
    console.error("Defect detail API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao carregar defeito" },
      { status: 500 }
    );
  }
}

// PUT /api/defects/[id] — patch-style update (only provided fields applied)
export async function PUT(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const existing = await db.defect.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Defeito não encontrado" },
        { status: 404 }
      );
    }

    const {
      author,
      vehicleDesc,
      symptom,
      diagnosis,
      solution,
      photos,
      repairTime,
      difficulty,
    } = body || {};

    const updateData: any = {};

    if (author !== undefined) {
      updateData.author =
        typeof author === "string" && author.trim()
          ? author.trim()
          : "Anônimo";
    }
    if (vehicleDesc !== undefined) {
      if (typeof vehicleDesc !== "string" || !vehicleDesc.trim()) {
        return NextResponse.json(
          { error: "Descrição do veículo é obrigatória" },
          { status: 400 }
        );
      }
      updateData.vehicleDesc = vehicleDesc.trim();
    }
    if (symptom !== undefined) {
      if (typeof symptom !== "string" || !symptom.trim()) {
        return NextResponse.json(
          { error: "Sintoma é obrigatório" },
          { status: 400 }
        );
      }
      updateData.symptom = symptom.trim();
    }
    if (diagnosis !== undefined) {
      if (typeof diagnosis !== "string" || !diagnosis.trim()) {
        return NextResponse.json(
          { error: "Diagnóstico é obrigatório" },
          { status: 400 }
        );
      }
      updateData.diagnosis = diagnosis.trim();
    }
    if (solution !== undefined) {
      if (typeof solution !== "string" || !solution.trim()) {
        return NextResponse.json(
          { error: "Solução é obrigatória" },
          { status: 400 }
        );
      }
      updateData.solution = solution.trim();
    }
    if (difficulty !== undefined) {
      updateData.difficulty = VALID_DIFFICULTIES.has(difficulty)
        ? difficulty
        : "medium";
    }
    if (repairTime !== undefined) {
      updateData.repairTime =
        typeof repairTime === "string" && repairTime.trim()
          ? repairTime.trim()
          : null;
    }
    if (photos !== undefined) {
      let photosJson: string | null = null;
      if (Array.isArray(photos)) {
        const urls = photos
          .map((p: any) => (typeof p === "string" ? p.trim() : ""))
          .filter((u: string) => u.length > 0);
        if (urls.length > 0) photosJson = JSON.stringify(urls);
      } else if (typeof photos === "string" && photos.trim()) {
        const urls = photos
          .split(",")
          .map((u) => u.trim())
          .filter((u) => u.length > 0);
        if (urls.length > 0) photosJson = JSON.stringify(urls);
      }
      updateData.photos = photosJson;
    }

    const defect = await db.defect.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: defect });
  } catch (err: any) {
    console.error("Defect update API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao atualizar defeito" },
      { status: 500 }
    );
  }
}

// DELETE /api/defects/[id]
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const existing = await db.defect.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Defeito não encontrado" },
        { status: 404 }
      );
    }

    await db.defect.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Defect delete API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao excluir defeito" },
      { status: 500 }
    );
  }
}
