import { NextRequest, NextResponse } from "next/server";
import { getAI, SYSTEM_PROMPTS } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms, vehicleInfo } = body as {
      symptoms?: string;
      vehicleInfo?: string;
    };

    if (!symptoms || symptoms.trim().length < 3) {
      return NextResponse.json(
        { error: "Descreva os sintomas com mais detalhes" },
        { status: 400 }
      );
    }

    const userPrompt = `Veículo: ${vehicleInfo || "não informado"}\nSintomas relatados pelo mecânico:\n${symptoms}\n\nConstrua a árvore de diagnóstico completa conforme o formato definido.`;

    const zai = await getAI();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: SYSTEM_PROMPTS.diagnosis },
        { role: "user", content: userPrompt },
      ],
      thinking: { type: "disabled" },
    });

    const content = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ content });
  } catch (err: any) {
    console.error("Diagnosis API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao gerar diagnóstico" },
      { status: 500 }
    );
  }
}
