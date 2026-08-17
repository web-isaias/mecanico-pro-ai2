import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

// GET /api/defects?q=...&difficulty=...&sort=...&take=...&skip=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const difficulty = searchParams.get("difficulty")?.trim() ?? "";
    const sort = searchParams.get("sort")?.trim() ?? "recent";
    const take = Number(searchParams.get("take") ?? 100);
    const skip = Number(searchParams.get("skip") ?? 0);

    const where: any = {};

    if (q) {
      where.OR = [
        { vehicleDesc: { contains: q } },
        { symptom: { contains: q } },
        { diagnosis: { contains: q } },
        { solution: { contains: q } },
        { author: { contains: q } },
      ];
    }

    if (difficulty && VALID_DIFFICULTIES.has(difficulty)) {
      where.difficulty = difficulty;
    }

    const orderBy =
      sort === "liked"
        ? [{ likes: "desc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

    const [defects, total] = await Promise.all([
      db.defect.findMany({
        where,
        orderBy: orderBy as any,
        take: Number.isFinite(take) && take > 0 ? take : 100,
        skip: Number.isFinite(skip) && skip >= 0 ? skip : 0,
      }),
      db.defect.count({ where }),
    ]);

    return NextResponse.json({ data: defects, total, sort });
  } catch (err: any) {
    console.error("Defects list API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao listar defeitos" },
      { status: 500 }
    );
  }
}

// POST /api/defects — create collaborative defect entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    if (!vehicleDesc || typeof vehicleDesc !== "string" || !vehicleDesc.trim()) {
      return NextResponse.json(
        { error: "Descrição do veículo é obrigatória" },
        { status: 400 }
      );
    }
    if (!symptom || typeof symptom !== "string" || !symptom.trim()) {
      return NextResponse.json(
        { error: "Sintoma é obrigatório" },
        { status: 400 }
      );
    }
    if (!diagnosis || typeof diagnosis !== "string" || !diagnosis.trim()) {
      return NextResponse.json(
        { error: "Diagnóstico é obrigatório" },
        { status: 400 }
      );
    }
    if (!solution || typeof solution !== "string" || !solution.trim()) {
      return NextResponse.json(
        { error: "Solução é obrigatória" },
        { status: 400 }
      );
    }

    // Normalize difficulty to allowed enum
    const normalizedDifficulty = VALID_DIFFICULTIES.has(difficulty)
      ? difficulty
      : "medium";

    // Normalize author — empty becomes "Anônimo" (matches schema default)
    const finalAuthor =
      author && typeof author === "string" && author.trim()
        ? author.trim()
        : "Anônimo";

    // Photos: accept array of strings OR comma-separated string, persist as JSON string
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

    // repairTime: store as string if provided, otherwise null
    const finalRepairTime =
      repairTime && typeof repairTime === "string" && repairTime.trim()
        ? repairTime.trim()
        : null;

    const defect = await db.defect.create({
      data: {
        author: finalAuthor,
        vehicleDesc: vehicleDesc.trim(),
        symptom: symptom.trim(),
        diagnosis: diagnosis.trim(),
        solution: solution.trim(),
        photos: photosJson,
        repairTime: finalRepairTime,
        difficulty: normalizedDifficulty,
      },
    });

    return NextResponse.json({ data: defect }, { status: 201 });
  } catch (err: any) {
    console.error("Defect create API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao cadastrar defeito" },
      { status: 500 }
    );
  }
}
