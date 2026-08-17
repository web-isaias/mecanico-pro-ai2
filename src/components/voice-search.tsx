"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Mic, Square, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useNavStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

type VoiceResult =
  | { type: "navigate"; view: string; message: string }
  | { type: "search"; query: string; message: string }
  | { type: "obd"; code: string; message: string }
  | { type: "text"; message: string };

// Parse the transcribed voice command into an action
function parseVoiceCommand(text: string): VoiceResult {
  const t = text.toLowerCase().trim();

  // Navigation commands
  if (t.includes("abrir catálogo") || t.includes("catálogo do")) {
    const vehicle = t.replace(/.*catálogo (do|da)?\s*/, "").trim();
    return {
      type: "search",
      query: vehicle || "corolla",
      message: `Abrindo catálogo para: ${vehicle}`,
    };
  }
  if (t.includes("código p") || t.match(/p\d{4}/)) {
    const codeMatch = t.match(/p\s?(\d{3,4})/i);
    const code = codeMatch ? `P${codeMatch[1].padStart(4, "0")}` : "P0300";
    return {
      type: "obd",
      code,
      message: `Pesquisando código ${code}`,
    };
  }
  if (t.includes("torque do") || t.includes("torque")) {
    return {
      type: "search",
      query: t.replace(/.*torque (do|da)?\s*/, "").trim() || "cabeçote",
      message: "Buscando especificações de torque",
    };
  }
  if (t.includes("ia mecânico") || t.includes("ajud") || t.includes("pergunta")) {
    return { type: "navigate", view: "ai-mechanic", message: "Abrindo IA Mecânico" };
  }
  if (t.includes("dashboard") || t.includes("início") || t.includes("inicio") || t.includes("tela inicial")) {
    return { type: "navigate", view: "dashboard", message: "Voltando ao dashboard" };
  }
  if (t.includes("orçamento") || t.includes("orcamento")) {
    return { type: "navigate", view: "quotes", message: "Abrindo orçamentos" };
  }
  if (t.includes("cliente")) {
    return { type: "navigate", view: "customers", message: "Abrindo clientes" };
  }
  if (t.includes("agenda")) {
    return { type: "navigate", view: "schedule", message: "Abrindo agenda" };
  }
  if (t.includes("financeiro") || t.includes("dinheiro") || t.includes("caixa")) {
    return { type: "navigate", view: "financial", message: "Abrindo financeiro" };
  }
  if (t.includes("estoque")) {
    return { type: "navigate", view: "inventory", message: "Abrindo estoque" };
  }
  if (t.includes("scanner") || t.includes("câmera") || t.includes("camera")) {
    return { type: "navigate", view: "camera-scanner", message: "Abrindo scanner por câmera" };
  }
  if (t.includes("obd") || t.includes("códig")) {
    return { type: "navigate", view: "obd2", message: "Abrindo scanner OBD2" };
  }
  if (t.includes("defeito")) {
    return { type: "navigate", view: "defects", message: "Abrindo banco de defeitos" };
  }
  if (t.includes("diagnóstic") || t.includes("diagnostico")) {
    return { type: "navigate", view: "diagnosis", message: "Abrindo diagnóstico inteligente" };
  }
  if (t.includes("calculadora")) {
    return { type: "navigate", view: "calculators", message: "Abrindo calculadoras" };
  }
  if (t.includes("configura")) {
    return { type: "navigate", view: "settings", message: "Abrindo configurações" };
  }
  // Default: treat as vehicle/technical search
  if (t.length > 2) {
    return {
      type: "search",
      query: text,
      message: `Buscando: "${text}"`,
    };
  }
  return { type: "text", message: "Não entendi. Tente novamente." };
}

export function VoiceSearchButton() {
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<VoiceResult | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavStore((s) => s.navigate);
  const setSearch = useNavStore((s) => s.setSearch);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  };

  const startRecording = async () => {
    try {
      setResult(null);
      setTranscript("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        setProcessing(true);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(",")[1];
          try {
            const res = await fetch("/api/voice", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audio: base64Audio }),
            });
            const data = await res.json();
            if (data.text) {
              setTranscript(data.text);
              const parsed = parseVoiceCommand(data.text);
              setResult(parsed);
            } else {
              toast.error("Não consegui transcrever o áudio.");
            }
          } catch (err) {
            console.error(err);
            toast.error("Erro ao processar áudio.");
          } finally {
            setProcessing(false);
            cleanup();
          }
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível acessar o microfone.");
      setOpen(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleResult = () => {
    if (!result) return;
    toast.success(result.message);
    if (result.type === "navigate") {
      navigate(result.view as any);
    } else if (result.type === "search") {
      setSearch(result.query);
      navigate("vehicle-search");
    } else if (result.type === "obd") {
      setSearch(result.code);
      navigate("obd2");
    }
    setOpen(false);
  };

  const handleClose = () => {
    if (recording) stopRecording();
    cleanup();
    setOpen(false);
    setTranscript("");
    setResult(null);
    setProcessing(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-muted-foreground hover:text-orange-400"
        onClick={() => setOpen(true)}
        aria-label="Pesquisa por voz"
      >
        <Mic className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
      </Button>

      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="max-w-md border-border bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Mic className="h-5 w-5 text-orange-400" />
              Pesquisa por Voz
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Diga um comando como: "Abrir catálogo do Corolla", "Pesquisar
              código P0420", "Abrir IA Mecânico"
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-6 py-4">
            {/* Mic visualizer */}
            <button
              onClick={() => (recording ? stopRecording() : startRecording())}
              disabled={processing}
              className="relative grid h-24 w-24 place-items-center rounded-full border-2 transition disabled:opacity-50"
              style={{
                borderColor: recording
                  ? "oklch(0.68 0.21 42 / 0.6)"
                  : "oklch(0.55 0.16 255 / 0.4)",
                background: recording
                  ? "oklch(0.68 0.21 42 / 0.15)"
                  : "transparent",
              }}
              aria-label={recording ? "Parar gravação" : "Iniciar gravação"}
            >
              {processing ? (
                <Loader2 className="h-10 w-10 animate-spin text-orange-400" />
              ) : recording ? (
                <Square className="h-10 w-10 fill-orange-400 text-orange-400" />
              ) : (
                <Mic className="h-10 w-10 text-orange-400" />
              )}
              {recording && (
                <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-orange-500/20" />
              )}
            </button>

            <p className="text-sm text-muted-foreground">
              {processing
                ? "Transcrevendo..."
                : recording
                ? "Ouvindo... toque para parar"
                : "Toque no microfone e fale"}
            </p>

            {transcript && (
              <div className="w-full rounded-xl border border-border bg-background/50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Transcrição
                </p>
                <p className="mt-1 text-sm text-foreground">&quot;{transcript}&quot;</p>
              </div>
            )}

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full rounded-xl border border-orange-500/30 bg-orange-500/10 p-4"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-400">
                    Ação reconhecida
                  </p>
                  <p className="mt-1 text-sm text-foreground">{result.message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-border"
              >
                <X className="h-4 w-4 mr-2" /> Fechar
              </Button>
              {result && (
                <Button
                  onClick={handleResult}
                  className="flex-1 gradient-orange text-primary-foreground glow-orange"
                >
                  Executar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
