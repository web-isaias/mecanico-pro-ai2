"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ViewHeader, SectionCard, EmptyState } from "@/components/shared/view-parts";
import {
  ScanLine,
  Search,
  Bluetooth,
  Loader2,
  Trash2,
  AlertTriangle,
  Activity,
  Gauge,
  Thermometer,
  Battery,
  Cpu,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { OBD2_CODES, findObdCode, type ObdCode } from "@/lib/data/obd2";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Sensor = {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: number;
  unit: string;
  color: string;
  range: [number, number];
};

export function Obd2() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCodes, setActiveCodes] = useState<string[]>(["P0300", "P0171"]);
  const [monitoring, setMonitoring] = useState(false);
  const [chartData, setChartData] = useState<{ t: string; rpm: number; temp: number; volt: number }[]>([]);
  const [selectedCode, setSelectedCode] = useState<ObdCode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated live data
  useEffect(() => {
    if (monitoring) {
      const tick = () => {
        const t = new Date();
        const dataPoint = {
          t: `${t.getMinutes().toString().padStart(2, "0")}:${t.getSeconds().toString().padStart(2, "0")}`,
          rpm: 700 + Math.floor(Math.random() * 200),
          temp: 88 + Math.random() * 6,
          volt: 13.8 + Math.random() * 0.6,
        };
        setChartData((d) => [...d.slice(-19), dataPoint]);
      };
      tick();
      timerRef.current = setInterval(tick, 1500);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [monitoring]);

  const connect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnected(true);
      setConnecting(false);
      toast.success("Adaptador OBD2 conectado via Bluetooth");
    }, 1500);
  };

  const disconnect = () => {
    setConnected(false);
    setMonitoring(false);
    toast.info("Desconectado do adaptador OBD2");
  };

  const clearCodes = () => {
    setActiveCodes([]);
    toast.success("Códigos apagados da memória da ECU");
  };

  const scanCodes = () => {
    if (!connected) {
      toast.error("Conecte o adaptador OBD2 primeiro");
      return;
    }
    setActiveCodes(["P0300", "P0171"]);
    toast.success("Leitura concluída: 2 códigos encontrados");
  };

  const sensors: Sensor[] = [
    { id: "rpm", label: "RPM do motor", icon: <Activity className="h-4 w-4" />, value: chartData.at(-1)?.rpm ?? 0, unit: "rpm", color: "#ff8a3d", range: [600, 7000] },
    { id: "temp", label: "Temp. do motor", icon: <Thermometer className="h-4 w-4" />, value: chartData.at(-1)?.temp ?? 0, unit: "°C", color: "#3b82f6", range: [0, 120] },
    { id: "volt", label: "Tensão da bateria", icon: <Battery className="h-4 w-4" />, value: chartData.at(-1)?.volt ?? 0, unit: "V", color: "#10b981", range: [10, 15] },
  ];

  const filteredCodes = OBD2_CODES.filter(
    (c) => c.code.toLowerCase().includes(query.toLowerCase()) || c.meaning.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <ViewHeader
        title="Scanner OBD2"
        description="Leia, apague e monitore sensores em tempo real. Compatível com adaptadores Bluetooth."
        icon={<ScanLine className="h-5 w-5" />}
        accent="blue"
      />

      {/* Connection */}
      <SectionCard className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`grid h-12 w-12 place-items-center rounded-xl border ${connected ? "border-emerald-500/40 bg-emerald-500/10" : "border-border bg-card/40"}`}>
              <Bluetooth className={`h-6 w-6 ${connected ? "text-emerald-400" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="font-semibold text-foreground">Adaptador ELM327</p>
              <p className="text-xs text-muted-foreground">
                {connected ? "Conectado • pronto para uso" : connecting ? "Conectando..." : "Desconectado"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!connected ? (
              <Button
                onClick={connect}
                disabled={connecting}
                className="gradient-orange text-primary-foreground glow-orange"
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Conectando...
                  </>
                ) : (
                  <>
                    <Bluetooth className="h-4 w-4" /> Conectar
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={disconnect}
                className="border-border"
              >
                <XCircle className="h-4 w-4" /> Desconectar
              </Button>
            )}
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Codes */}
        <SectionCard
          title="Códigos de falha"
          icon={<AlertTriangle className="h-4 w-4" />}
          actions={
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" onClick={scanCodes} className="border-border">
                <ScanLine className="h-3.5 w-3.5" /> Ler
              </Button>
              <Button size="sm" variant="outline" onClick={clearCodes} className="border-border">
                <Trash2 className="h-3.5 w-3.5" /> Apagar
              </Button>
            </div>
          }
        >
          {activeCodes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              <p className="text-sm font-semibold text-foreground">
                Sem códigos ativos
              </p>
              <p className="text-xs text-muted-foreground">
                Toque em &quot;Ler&quot; para escanear
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeCodes.map((code) => {
                const obd = findObdCode(code);
                return (
                  <button
                    key={code}
                    onClick={() => setSelectedCode(obd || { code, meaning: "Código não catalogado", causes: [], howToTest: "", solution: "Consulte manual técnico.", urgency: "média" })}
                    className="flex w-full items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-left transition hover:border-red-500/50"
                  >
                    <span className="rounded-lg bg-red-500/15 px-2 py-1 font-mono text-xs font-bold text-red-400">
                      {code}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {obd?.meaning || "Código não catalogado"}
                      </p>
                    </div>
                    <UrgencyBadge urgency={obd?.urgency || "média"} />
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Live monitor */}
        <SectionCard
          title="Monitor em tempo real"
          icon={<Activity className="h-4 w-4" />}
          className="lg:col-span-2"
          actions={
            <Button
              size="sm"
              variant={monitoring ? "outline" : "default"}
              onClick={() => setMonitoring((m) => !m)}
              disabled={!connected}
              className={monitoring ? "border-border" : "gradient-orange text-primary-foreground glow-orange"}
            >
              {monitoring ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Parar
                </>
              ) : (
                <>
                  <Activity className="h-3.5 w-3.5" /> Monitorar
                </>
              )}
            </Button>
          }
        >
          {!connected ? (
            <EmptyState
              icon={<Bluetooth className="h-10 w-10 opacity-40" />}
              title="Conecte o adaptador OBD2"
              description="O monitoramento ao vivo requer conexão Bluetooth ativa."
            />
          ) : (
            <div className="space-y-4">
              {/* Sensor cards */}
              <div className="grid grid-cols-3 gap-3">
                {sensors.map((s) => (
                  <div key={s.id} className="rounded-xl border border-border bg-background/40 p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      {s.icon}
                      <span className="text-[10px] uppercase tracking-wider">{s.label}</span>
                    </div>
                    <p className="mt-1 text-xl font-bold tabular-nums" style={{ color: s.color }}>
                      {s.value.toFixed(s.unit === "V" ? 2 : s.unit === "°C" ? 1 : 0)}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">{s.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
              {/* Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" vertical={false} />
                    <XAxis dataKey="t" tick={{ fill: "oklch(0.7 0.01 240)", fontSize: 10 }} stroke="oklch(1 0 0 / 10%)" tickLine={false} />
                    <YAxis tick={{ fill: "oklch(0.7 0.01 240)", fontSize: 10 }} stroke="oklch(1 0 0 / 10%)" tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.2 0.04 255)",
                        border: "1px solid oklch(0.68 0.21 42 / 0.4)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line type="monotone" dataKey="rpm" stroke="#ff8a3d" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="volt" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <Legend color="#ff8a3d" label="RPM" />
                <Legend color="#3b82f6" label="Temp. (°C)" />
                <Legend color="#10b981" label="Tensão (V)" />
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Code database */}
      <div className="mt-4">
        <SectionCard title="Banco de códigos OBD2" icon={<Cpu className="h-4 w-4" />}>
          <div className="mb-3 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar código ou significado (ex: P0300, misfire, lambda)..."
              className="h-10 rounded-xl border-border bg-background/50 pl-9"
            />
          </div>
          <div className="max-h-96 space-y-2 overflow-y-auto scrollbar-premium pr-1">
            {filteredCodes.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum código encontrado
              </p>
            ) : (
              filteredCodes.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCode(c)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                    selectedCode?.code === c.code
                      ? "border-orange-500/50 bg-orange-500/10"
                      : "border-border bg-background/40 hover:border-orange-500/30"
                  }`}
                >
                  <span className="font-mono text-sm font-bold text-orange-400">{c.code}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{c.meaning}</span>
                  <UrgencyBadge urgency={c.urgency} />
                </button>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* Code detail */}
      {selectedCode && (
        <SectionCard title={`Detalhes: ${selectedCode.code}`} icon={<FileText className="h-4 w-4" />} className="mt-4">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Significado</p>
              <p className="text-sm font-semibold text-foreground">{selectedCode.meaning}</p>
              <div className="mt-2">
                <UrgencyBadge urgency={selectedCode.urgency} large />
              </div>
            </div>
            {selectedCode.causes.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Possíveis causas</p>
                <ul className="space-y-1">
                  {selectedCode.causes.map((cause, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedCode.howToTest && (
              <div>
                <p className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">Como testar</p>
                <p className="text-sm leading-relaxed text-foreground">{selectedCode.howToTest}</p>
              </div>
            )}
            {selectedCode.solution && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <p className="mb-1 text-[11px] uppercase tracking-wider text-emerald-400">Solução recomendada</p>
                <p className="text-sm leading-relaxed text-foreground">{selectedCode.solution}</p>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function UrgencyBadge({ urgency, large }: { urgency: ObdCode["urgency"]; large?: boolean }) {
  const map = {
    baixa: { label: "Baixa", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
    média: { label: "Média", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
    alta: { label: "Alta", color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
    crítica: { label: "Crítica", color: "bg-red-500/15 text-red-300 border-red-500/30" },
  };
  const s = map[urgency];
  return (
    <Badge variant="outline" className={`${s.color} ${large ? "px-3 py-1 text-xs" : "text-[10px]"}`}>
      {s.label}
    </Badge>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span className="text-[11px]">{label}</span>
    </div>
  );
}
