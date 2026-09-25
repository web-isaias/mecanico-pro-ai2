import { NextRequest, NextResponse } from "next/server";
import { getAI, SYSTEM_PROMPTS, type ChatMessage } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

// Helper: extract text content from a ZAI completion response in a defensive way.
// The SDK contract is { choices: [{ message: { content } }] } but real-world
// responses can vary (especially on errors / rate limits / partial responses).
// We never throw — we return null if no usable content is found.
function extractContent(completion: any): string | null {
  if (!completion || typeof completion !== "object") return null;

  // Standard OpenAI-like shape: { choices: [{ message: { content } }] }
  const choices = (completion as any).choices;
  if (Array.isArray(choices) && choices.length > 0) {
    const first = choices[0];
    const msg = first?.message?.content;
    if (typeof msg === "string" && msg.trim().length > 0) return msg;
    // Some SDK variants put content at the top level of the choice
    if (typeof first?.text === "string" && first.text.trim().length > 0) return first.text;
  }

  // Fallback 1: some responses have a top-level "content" or "output"
  const topLevel = (completion as any).content || (completion as any).output;
  if (typeof topLevel === "string" && topLevel.trim().length > 0) return topLevel;

  // Fallback 2: streaming-style response with "delta"
  const choicesDelta = (completion as any).choices;
  if (Array.isArray(choicesDelta) && choicesDelta.length > 0) {
    const delta = choicesDelta[0]?.delta?.content;
    if (typeof delta === "string" && delta.trim().length > 0) return delta;
  }

  return null;
}

// Helper: classify an SDK error into a user-friendly message in pt-BR.
function friendlyErrorMessage(err: any): string {
  const msg = (err?.message || String(err || "")).toLowerCase();

  if (msg.includes("rate limit") || msg.includes("429")) {
    return "Limite de requisições atingido. Aguarde alguns segundos e tente novamente.";
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return "A IA demorou demais para responder. Tente novamente com uma pergunta mais curta.";
  }
  if (msg.includes("network") || msg.includes("econnreset") || msg.includes("fetch failed")) {
    return "Falha de conexão com o serviço de IA. Verifique sua internet e tente novamente.";
  }
  if (msg.includes("auth") || msg.includes("unauthorized") || msg.includes("api key")) {
    return "Erro de autenticação com o serviço de IA. Contate o suporte.";
  }
  if (msg.includes("insufficient") && msg.includes("quota")) {
    return "Cota de IA esgotada. Contate o administrador do sistema.";
  }
  return "Não foi possível obter uma resposta da IA no momento. Tente novamente em instantes.";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages é obrigatório" },
        { status: 400 }
      );
    }

    // ── Validate each message shape before sending to the SDK ───────────
    const sanitizedMessages = messages
      .filter((m) => m && typeof m.content === "string" && m.content.trim().length > 0)
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

    if (sanitizedMessages.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma mensagem válida para enviar à IA." },
        { status: 400 }
      );
    }

    const zai = await getAI();

    // ── Defensive: wrap the SDK call so a malformed response never crashes ─
    let completion: any;
    try {
      completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: SYSTEM_PROMPTS.mechanic },
          ...sanitizedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        thinking: { type: "disabled" },
      });
    } catch (sdkErr: any) {
      console.error("AI SDK call failed:", sdkErr);
      return NextResponse.json(
        { error: friendlyErrorMessage(sdkErr) },
        { status: 502 }
      );
    }

    // ── Extract content defensively ─────────────────────────────────────
    const content = extractContent(completion);
    if (!content) {
      // Log the unexpected shape so we can debug, but never crash the client
      console.error(
        "AI response had unexpected shape — no content extracted. Raw:",
        JSON.stringify(completion).substring(0, 500)
      );
      return NextResponse.json(
        {
          error:
            "A IA retornou uma resposta em formato inesperado. Tente reformular sua pergunta.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ content });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: friendlyErrorMessage(err) },
      { status: 500 }
    );
  }
}
