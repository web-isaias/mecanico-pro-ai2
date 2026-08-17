import { NextRequest, NextResponse } from "next/server";
import { getAI, SYSTEM_PROMPTS } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, question } = body as {
      image?: string;
      question?: string;
    };

    if (!image) {
      return NextResponse.json(
        { error: "Imagem (base64 ou URL) é obrigatória" },
        { status: 400 }
      );
    }

    const prompt = question?.trim() || SYSTEM_PROMPTS.vision;

    const zai = await getAI();
    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
      thinking: { type: "disabled" },
    });

    const content = response.choices[0]?.message?.content || "";
    return NextResponse.json({ content });
  } catch (err: any) {
    console.error("Vision API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao analisar imagem" },
      { status: 500 }
    );
  }
}
