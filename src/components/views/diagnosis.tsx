"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ViewHeader, SectionCard } from "@/components/shared/view-parts";
import { Markdown } from "@/components/shared/markdown";
import { Brain, Loader2, Play, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DIAGNOSTIC_TREE } from "@/lib/data/torque";

const COMMON_SYMPTOMS = [
  "Não liga / não pega",
  "Motor falhando em marcha lenta",
  "Motor esquentando / superaquecimento",
  "Consumo de combustível elevado",
  "Luz da injeção acesa",
  "Perda de potência",
  "Barulho no motor",
  "Vibração excessiva",
  "Ruído na suspensão",
  "Freio tremendo",
];

export function Diagnosis() {
  const [symptoms, setSymptoms] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [offlineTree, setOfflineTree] = useState<string | null>(null);

  const run = async () => {
    if (symptoms.trim().length < 3) {
      toast.error("Descreva os sintomas com mais detalhes");
      return;
    }
    setLoading(true);
    setResult(null);
    setOfflineTree(null);
    try {
      const res = await fetch("/api/ai/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms,
          vehicleInfo: vehicle,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.content);
    } catch (err: any) {
      // Fallback offline
      const key = mapSymptomToKey(symptoms);
      if (key && DIAGNOSTIC_TREE[key]) {
        setOfflineTree(key);
        toast.info("Modo offline — exibindo árvore de diagnóstico padrão");
      } else {
        toast.error(err?.message || "Erro ao gerar diagnóstico");
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSymptoms("");
    setVehicle("");
    setResult(null);
    setOfflineTree(null);
  };

  const renderOfflineTree = (key: string) => {
    const tree = DIAGNOSTIC_TREE[key];
    if (!tree) return null;
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-wider">
              Árvore de diagnóstico offline (padrão)
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-base font-bold text-orange-400">
            Diagnóstico: {tree.symptom}
          </h3>
          <div className="mt-3 space-y-3">
            {tree.steps.map((step) => (
              <div
                key={step.step}
                className="rounded-xl border border-border bg-background/40 p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange-500/15 text-xs font-bold text-orange-400">
                    {step.step}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {step.action}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-emerald-400">
                        Esperado:
                      </span>{" "}
                      {step.expected}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Para um diagnóstico personalizado com IA, conecte-se à internet e
            gere um novo diagnóstico.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <ViewHeader
        title="Diagnóstico Inteligente"
        description="Descreva os sintomas e a IA monta uma árvore de testes passo a passo."
        icon={<Brain className="h-5 w-5" />}
        accent="orange"
        actions={
          (result || offlineTree) && (
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="border-border"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Novo diagnóstico
            </Button>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Input form */}
        <SectionCard
          title="Sintomas"
          icon={<Brain className="h-4 w-4" />}
          className="lg:col-span-1"
        >
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Veículo (opcional)
              </label>
              <Input
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="ex: Onix 1.4 2017, ABC1D23"
                className="mt-1 border-border bg-background/50"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sintomas relatados
              </label>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Descreva o problema com máximo de detalhes: quando acontece, em que condição, ruídos, luzes..."
                className="mt-1 min-h-32 border-border bg-background/50"
              />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sintomas comuns
              </p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SYMPTOMS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSymptoms(s)}
                    className="rounded-full border border-border bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-orange-500/40 hover:text-orange-400"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={run}
              disabled={loading || symptoms.trim().length < 3}
              className="w-full gradient-orange text-primary-foreground glow-orange"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Gerando árvore...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Gerar diagnóstico
                </>
              )}
            </Button>
          </div>
        </SectionCard>

        {/* Result */}
        <SectionCard
          title="Árvore de diagnóstico"
          icon={<Brain className="h-4 w-4" />}
          className="lg:col-span-2"
        >
          {!result && !offlineTree && !loading && (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Brain className="h-12 w-12 opacity-30" />
              <p className="text-sm">
                Preencha os sintomas e gere o diagnóstico
              </p>
            </div>
          )}
          {loading && (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-orange-400" />
              <p className="text-sm text-muted-foreground">
                IA analisando sintomas e montando árvore de testes...
              </p>
            </div>
          )}
          {offlineTree && renderOfflineTree(offlineTree)}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-5"
            >
              <Markdown content={result} />
            </motion.div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function mapSymptomToKey(s: string): string | null {
  const t = s.toLowerCase();
  if (t.includes("não pega") || t.includes("nao pega") || t.includes("não liga") || t.includes("nao liga"))
    return "nao_pega";
  if (t.includes("marcha lenta") || t.includes("falhando"))
    return "marcha_lenta_falhando";
  if (t.includes("esquent") || t.includes("superaquec"))
    return "esquentando";
  if (t.includes("consumo"))
    return "consumo_elevado";
  return null;
}
