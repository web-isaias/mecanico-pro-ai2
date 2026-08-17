"use client";
import { useNavStore } from "@/lib/store";
import { NAV_CARDS, formatCurrency, formatShortDate } from "@/lib/nav-config";
import { BrandLogo } from "@/components/shared/brand";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Users,
  Wrench,
  Package,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Bot,
  Sparkles,
  Car,
  Gauge,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

type DashboardData = {
  stats: {
    todayRevenue: number;
    todayExpenses: number;
    todayProfit: number;
    monthRevenue: number;
    monthExpenses: number;
    monthProfit: number;
    customerCount: number;
    vehicleCount: number;
    serviceOrderCount: number;
    pendingQuotes: number;
    lowStockCount: number;
    pendingAppointments: number;
  };
  appointmentsToday: any[];
  upcomingAppointments: any[];
  recentServices: any[];
  recentCustomers: any[];
  lowStockItems: any[];
  chartData: { day: string; receita: number; despesa: number }[];
  defects: any[];
  notifications: any[];
};

export function Dashboard() {
  const navigate = useNavStore((s) => s.navigate);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (mounted && !d.error) setData(d);
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const stats = data?.stats;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border gradient-navy p-6 sm:p-8"
      >
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:block">
              <BrandLogo size={64} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                Bem-vindo de volta
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Painel da Oficina
              </h1>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Diagnóstico com IA, gestão completa e catálogo técnico — tudo
                em um só lugar. Encontre qualquer informação em até 3 toques.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate("ai-mechanic")}
                  className="inline-flex items-center gap-2 rounded-xl gradient-orange px-4 py-2 text-sm font-semibold text-primary-foreground glow-orange transition hover:scale-[1.02]"
                >
                  <Bot className="h-4 w-4" />
                  IA Mecânico
                </button>
                <button
                  onClick={() => navigate("camera-scanner")}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-orange-500/40"
                >
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  Scanner Visual
                </button>
              </div>
            </div>
          </div>
          {/* Today summary */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-2">
            <StatPill
              icon={<DollarSign className="h-4 w-4" />}
              label="Faturamento hoje"
              value={formatCurrency(stats?.todayRevenue ?? 0)}
              tone="emerald"
            />
            <StatPill
              icon={<CalendarClock className="h-4 w-4" />}
              label="Agendados hoje"
              value={`${data?.appointmentsToday.length ?? 0}`}
              tone="orange"
            />
            <StatPill
              icon={<Wrench className="h-4 w-4" />}
              label="Serviços em andamento"
              value={`${stats?.serviceOrderCount ?? 0}`}
              tone="blue"
            />
          </div>
        </div>
      </motion.section>

      {/* Performance indicators */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Faturamento do mês"
          value={formatCurrency(stats?.monthRevenue ?? 0)}
          trend="+12,4%"
          tone="emerald"
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Lucro do mês"
          value={formatCurrency(stats?.monthProfit ?? 0)}
          trend="+8,1%"
          tone="emerald"
        />
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label="Clientes ativos"
          value={`${stats?.customerCount ?? 0}`}
          trend="+2"
          tone="blue"
        />
        <KpiCard
          icon={<Car className="h-5 w-5" />}
          label="Veículos cadastrados"
          value={`${stats?.vehicleCount ?? 0}`}
          tone="orange"
        />
        <KpiCard
          icon={<FileText className="h-5 w-5" />}
          label="Orçamentos pendentes"
          value={`${stats?.pendingQuotes ?? 0}`}
          tone="amber"
        />
        <KpiCard
          icon={<Package className="h-5 w-5" />}
          label="Itens em estoque baixo"
          value={`${stats?.lowStockCount ?? 0}`}
          tone="red"
        />
        <KpiCard
          icon={<CalendarClock className="h-5 w-5" />}
          label="Próximos agendamentos"
          value={`${stats?.pendingAppointments ?? 0}`}
          tone="purple"
        />
        <KpiCard
          icon={<Wrench className="h-5 w-5" />}
          label="Ordens de serviço"
          value={`${stats?.serviceOrderCount ?? 0}`}
          tone="blue"
        />
      </section>

      {/* Main grid: cards */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Recursos do App
          </h2>
          <span className="text-xs text-muted-foreground">
            {NAV_CARDS.length} ferramentas
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {NAV_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.key}
                onClick={() => navigate(card.key)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
                whileHover={{ y: -2 }}
                className="card-premium group relative flex flex-col items-start gap-2 overflow-hidden rounded-2xl border border-border bg-card/50 p-4 text-left backdrop-blur-sm"
              >
                <div
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                    card.gradient
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {card.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {card.description}
                  </p>
                </div>
                <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-400 opacity-0 transition group-hover:opacity-100">
                  Acessar <ArrowUpRight className="h-3 w-3" />
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Bottom grid */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Today's services */}
        <div className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-foreground">
                Serviços de hoje
              </h3>
            </div>
            <button
              onClick={() => navigate("schedule")}
              className="text-[11px] font-semibold text-orange-400 hover:underline"
            >
              Ver agenda
            </button>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto scrollbar-premium pr-1">
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Carregando...
              </p>
            ) : (data?.appointmentsToday ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum serviço para hoje
              </p>
            ) : (
              data?.appointmentsToday.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange-500/10 text-orange-400">
                    <Clock time={a.startDate} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {a.title}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {a.vehicleDesc || "Veículo não informado"}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming reviews + alerts */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-300" />
              <h3 className="text-sm font-semibold text-foreground">
                Próximas revisões
              </h3>
            </div>
            <div className="max-h-36 space-y-2 overflow-y-auto scrollbar-premium pr-1">
              {(data?.upcomingAppointments ?? []).length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Sem revisões próximas
                </p>
              ) : (
                data?.upcomingAppointments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">
                        {a.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatShortDate(a.startDate)}
                      </p>
                    </div>
                    <span className="rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                      {a.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stock alerts */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">
                Alertas de estoque
              </h3>
            </div>
            <div className="max-h-36 space-y-1.5 overflow-y-auto scrollbar-premium pr-1">
              {(data?.lowStockItems ?? []).length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Estoque em dia ✓
                </p>
              ) : (
                data?.lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-amber-500/5 p-2"
                  >
                    <span className="truncate text-xs text-foreground">
                      {item.name}
                    </span>
                    <span className="ml-2 shrink-0 text-[11px] font-bold text-amber-400">
                      {item.quantity}/{item.minStock}
                    </span>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => navigate("inventory")}
              className="mt-3 w-full rounded-lg border border-amber-500/30 bg-amber-500/10 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20"
            >
              Gerenciar estoque
            </button>
          </div>
        </div>

        {/* Chart + recent customers */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-foreground">
                  Receita x Despesa (7 dias)
                </h3>
              </div>
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData ?? []}>
                  <defs>
                    <linearGradient id="gReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gDespesa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(1 0 0 / 6%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "oklch(0.7 0.01 240)", fontSize: 10 }}
                    stroke="oklch(1 0 0 / 10%)"
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.2 0.04 255)",
                      border: "1px solid oklch(0.68 0.21 42 / 0.4)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "oklch(0.97 0.01 240)" }}
                    formatter={(v: any) => formatCurrency(v)}
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#gReceita)"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesa"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#gDespesa)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent customers */}
          <div className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-300" />
                <h3 className="text-sm font-semibold text-foreground">
                  Últimos clientes
                </h3>
              </div>
              <button
                onClick={() => navigate("customers")}
                className="text-[11px] font-semibold text-orange-400 hover:underline"
              >
                Ver todos
              </button>
            </div>
            <div className="max-h-36 space-y-1.5 overflow-y-auto scrollbar-premium pr-1">
              {(data?.recentCustomers ?? []).length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Nenhum cliente cadastrado
                </p>
              ) : (
                data?.recentCustomers.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-background/40 p-2"
                  >
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-500/15 text-[10px] font-bold text-blue-300">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {c.name}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {c.vehicles?.length ?? 0} veículo(s)
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatShortDate(c.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Clock({ time }: { time: string }) {
  const d = new Date(time);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return (
    <span className="text-xs font-bold tabular-nums text-orange-400">
      {h}:{m}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    scheduled: { label: "Agendado", color: "bg-blue-500/15 text-blue-300" },
    confirmed: { label: "Confirmado", color: "bg-emerald-500/15 text-emerald-300" },
    done: { label: "Concluído", color: "bg-zinc-500/15 text-zinc-300" },
    cancelled: { label: "Cancelado", color: "bg-red-500/15 text-red-300" },
  };
  const s = map[status] || map.scheduled;
  return (
    <span className={cn("rounded px-2 py-0.5 text-[10px] font-semibold", s.color)}>
      {s.label}
    </span>
  );
}

function StatPill({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "orange" | "blue";
}) {
  const tones = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    blue: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  };
  return (
    <div className={cn("rounded-xl border px-3 py-2", tones[tone])}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-0.5 text-base font-bold text-foreground">{value}</p>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  trend,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  tone: "emerald" | "orange" | "blue" | "amber" | "red" | "purple";
}) {
  const tones = {
    emerald: "text-emerald-400",
    orange: "text-orange-400",
    blue: "text-blue-300",
    amber: "text-amber-400",
    red: "text-red-400",
    purple: "text-purple-400",
  };
  return (
    <div className="card-premium rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className={cn("rounded-lg bg-card/50 p-2", tones[tone])}>{icon}</span>
        {trend && (
          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400">
            <TrendingUp className="h-3 w-3" /> {trend}
          </span>
        )}
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
