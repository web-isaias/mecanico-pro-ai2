import { NextRequest, NextResponse } from "next/server";
import { getAI } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const audio = body.audio as string;
    if (!audio) {
      return NextResponse.json(
        { error: "Áudio base64 é obrigatório" },
        { status: 400 }
      );
    }

    const zai = await getAI();
    const response = await zai.audio.asr.create({
      file_base64: audio,
    });

    const text = (response?.text || "").trim();
    if (!text) {
      return NextResponse.json(
        { error: "Não foi possível transcrever o áudio" },
        { status: 422 }
      );
    }
    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("Voice API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao processar áudio" },
      { status: 500 }
    );
  }
}
