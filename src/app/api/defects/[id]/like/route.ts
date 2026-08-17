import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/defects/[id]/like — increment likes (community appreciation)
export async function POST(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const existing = await db.defect.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Defeito não encontrado" },
        { status: 404 }
      );
    }

    const updated = await db.defect.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });

    return NextResponse.json({
      data: { id: updated.id, likes: updated.likes },
    });
  } catch (err: any) {
    console.error("Defect like API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao curtir defeito" },
      { status: 500 }
    );
  }
}
