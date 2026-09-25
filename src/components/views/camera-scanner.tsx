"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ViewHeader, SectionCard } from "@/components/shared/view-parts";
import { Markdown } from "@/components/shared/markdown";
import {
  Camera,
  Upload,
  Loader2,
  ScanLine,
  Sparkles,
  X,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const PRESET_QUESTIONS = [
  "Identifique o componente e avalie o estado",
  "Esta luz do painel indica qual problema?",
  "Há vazamento visível? Qual a urgência?",
  "Avalie o desgaste e recomende ação",
];

export function CameraScanner() {
  const [image, setImage] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 8MB)");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!image) {
      toast.error("Capture ou envie uma imagem");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          question: question.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.content);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao analisar imagem");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setQuestion("");
    if (cameraRef.current) cameraRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <ViewHeader
        title="Scanner por Câmera"
        description="Use a câmera para identificar peças, luzes do painel, vazamentos e desgaste com IA visual."
        icon={<Camera className="h-5 w-5" />}
        accent="orange"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upload / capture */}
        <SectionCard title="Imagem" icon={<ScanLine className="h-4 w-4" />}>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {image ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-border">
                <img
                  src={image}
                  alt="Imagem capturada"
                  className="max-h-80 w-full object-contain bg-black"
                />
                <button
                  onClick={reset}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
                  aria-label="Remover imagem"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  className="border-border"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Trocar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-8 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-orange glow-orange">
                <Camera className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Capture ou envie uma foto
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Luzes do painel, peças, sensores, vazamentos, desgaste...
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  onClick={() => cameraRef.current?.click()}
                  className="gradient-orange text-primary-foreground glow-orange"
                >
                  <Camera className="h-4 w-4" /> Abrir câmera
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  className="border-border"
                >
                  <Upload className="h-4 w-4" /> Galeria
                </Button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Analysis */}
        <SectionCard
          title="Análise da IA"
          icon={<Sparkles className="h-4 w-4" />}
        >
          {image && (
            <div className="mb-3 space-y-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Pergunta personalizada (opcional)"
                className="border-border bg-background/50"
              />
              <div className="flex flex-wrap gap-1.5">
                {PRESET_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuestion(q)}
                    className="rounded-full border border-border bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-orange-500/40 hover:text-orange-400"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <Button
                onClick={analyze}
                disabled={loading || !image}
                className="w-full gradient-orange text-primary-foreground glow-orange"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Analisando...
                  </>
                ) : (
                  <>
                    <ScanLine className="h-4 w-4" /> Analisar com IA
                  </>
                )}
              </Button>
            </div>
          )}

          {!image && !result && (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Sparkles className="h-8 w-8 opacity-40" />
              <p className="text-sm">
                Envie uma imagem para iniciar a análise
              </p>
            </div>
          )}

          {image && !result && !loading && (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <p className="text-sm">
                Pronto para analisar. Selecione uma pergunta e toque em
                &quot;Analisar com IA&quot;.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex h-48 flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
              <p className="text-sm text-muted-foreground">
                IA visual processando...
              </p>
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4"
            >
              <Markdown content={result} />
            </motion.div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
