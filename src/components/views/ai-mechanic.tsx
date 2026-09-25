"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ViewHeader, SectionCard } from "@/components/shared/view-parts";
import { Markdown } from "@/components/shared/markdown";
import { Bot, Send, Trash2, Loader2, Sparkles, Wrench, Zap, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { ChatMessage } from "@/lib/ai";
import { useNavStore } from "@/lib/store";

const SUGGESTIONS = [
  { icon: Wrench, text: "Torque do cabeçote do Onix 1.4" },
  { icon: Zap, text: "Motor falhando em marcha lenta" },
  { icon: Sparkles, text: "Código P0300" },
  { icon: Shield, text: "O carro não pega" },
];

export function AiMechanic() {
  const searchQuery = useNavStore((s) => s.searchQuery);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(searchQuery || "");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: ChatMessage = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json().catch(() => ({}));

      // ── Defensive: handle API error responses ────────────────────────
      if (!res.ok || data.error) {
        const errorMsg =
          data.error ||
          (res.status === 429
            ? "Limite de requisições atingido. Aguarde alguns segundos."
            : res.status === 502
            ? "Serviço de IA temporariamente indisponível. Tente novamente."
            : "Não foi possível falar com a IA agora. Tente novamente.");
        // Show the error as an assistant message so the user sees context,
        // plus a toast for quick feedback
        setMessages([
          ...next,
          {
            role: "assistant",
            content: `⚠️ **Erro:** ${errorMsg}\n\nTente reformular sua pergunta ou aguarde alguns instantes.`,
          },
        ]);
        toast.error(errorMsg);
        return;
      }

      // ── Success — but verify content exists ──────────────────────────
      if (!data.content || typeof data.content !== "string") {
        setMessages([
          ...next,
          {
            role: "assistant",
            content:
              "⚠️ A IA retornou uma resposta vazia. Tente reformular sua pergunta.",
          },
        ]);
        return;
      }

      setMessages([...next, { role: "assistant", content: data.content }]);
    } catch (err: any) {
      // Network-level error (fetch itself threw)
      const errorMsg =
        err?.name === "TypeError"
          ? "Falha de conexão. Verifique sua internet e tente novamente."
          : "Erro inesperado ao consultar a IA. Tente novamente.";
      setMessages([
        ...next,
        {
          role: "assistant",
          content: `⚠️ **Erro:** ${errorMsg}`,
        },
      ]);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ViewHeader
        title="IA Mecânico"
        description="Assistente técnico 24h. Pergunte sobre torques, códigos OBD2, diagnósticos e procedimentos."
        icon={<Bot className="h-5 w-5" />}
        accent="orange"
        actions={
          messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessages([])}
              className="border-border"
            >
              <Trash2 className="h-3.5 w-3.5" /> Limpar
            </Button>
          )
        }
      />

      <SectionCard className="flex h-[calc(100vh-220px)] min-h-[480px] flex-col p-0">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto scrollbar-premium p-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-orange glow-orange">
                <Bot className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Como posso ajudar?
                </h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Sou especialista em mecânica automotiva. Faça perguntas sobre
                  torques, códigos de falha, diagnósticos, manutenções e mais.
                </p>
              </div>
              <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.text}
                      onClick={() => send(s.text)}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 text-left text-sm transition hover:border-orange-500/40 hover:bg-orange-500/5"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-orange-500/10 text-orange-400">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-foreground">{s.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-orange">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  m.role === "user"
                    ? "bg-orange-500/15 text-foreground border border-orange-500/30"
                    : "border border-border bg-card/60"
                }`}
              >
                {m.role === "assistant" ? (
                  <Markdown content={m.content} />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-orange">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="rounded-2xl border border-border bg-card/60 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                  <span className="text-sm text-muted-foreground">
                    Analisando...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Pergunte sobre torque, códigos, diagnósticos..."
              className="min-h-[44px] max-h-32 flex-1 resize-none border-border bg-background/50"
              rows={1}
            />
            <Button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="gradient-orange text-primary-foreground glow-orange"
              size="icon"
              aria-label="Enviar"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
