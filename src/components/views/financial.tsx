"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ViewHeader,
  SectionCard,
  EmptyState,
} from "@/components/shared/view-parts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Filter,
  FileText,
  Pencil,
  Trash2,
  Search,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatCurrency, formatShortDate, formatDate } from "@/lib/nav-config";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

// ============================================================================
// Types
// ============================================================================
type TransactionType = "income" | "expense";
type TransactionCategory =
  | "service"
  | "parts"
  | "labor"
  | "rent"
  | "utility"
  | "other";
type TransactionStatus = "paid" | "pending";

type Transaction = {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// Constants
// ============================================================================
const TYPE_LABELS: Record<TransactionType, string> = {
  income: "Receita",
  expense: "Despesa",
};

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  service: "Serviço",
  parts: "Peças",
  labor: "Mão de obra",
  rent: "Aluguel",
  utility: "Utilidades",
  other: "Outros",
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  paid: "Pago",
  pending: "Pendente",
};

const COLORS = {
  income: "#10b981",
  expense: "#ef4444",
  accent: "#ff8a3d",
  blue: "#3b82f6",
  purple: "#a78bfa",
};

const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  service: "#10b981",
  parts: "#ff8a3d",
  labor: "#3b82f6",
  rent: "#a78bfa",
  utility: "#f59e0b",
  other: "#94a3b8",
};

// ============================================================================
// Helpers
// ============================================================================
function getMonthBounds(d = new Date()) {
  const year = d.getFullYear();
  const month = d.getMonth();
  return {
    start: new Date(year, month, 1, 0, 0, 0, 0),
    end: new Date(year, month + 1, 0, 23, 59, 59, 999),
  };
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildLast7Days(): { label: string; key: string; date: Date }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const out: { label: string; key: string; date: Date }[] = [];
  const fmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label = fmt.format(d).replace(".", "");
    out.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      key: d.toISOString().slice(0, 10),
      date: d,
    });
  }
  return out;
}

function toLocalDateInput(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ============================================================================
// Main component
// ============================================================================
export function Financial() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // filters
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [filterCategory, setFilterCategory] = useState<
    "all" | TransactionCategory
  >("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== "all") params.set("type", filterType);
      if (filterCategory !== "all") params.set("category", filterCategory);
      if (debouncedQuery) params.set("q", debouncedQuery);
      const url = `/api/transactions${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setTransactions((json.data ?? []) as Transaction[]);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao carregar transações");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterCategory, debouncedQuery]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Derived KPI + chart data
  const { monthRevenue, monthExpense, monthProfit, todayProfit } =
    useMemo(() => {
      const { start, end } = getMonthBounds();
      const today = new Date();
      let monthRevenue = 0;
      let monthExpense = 0;
      let todayProfit = 0;
      for (const t of transactions) {
        const d = new Date(t.date);
        // Only count paid for cash-flow KPIs
        if (t.status === "paid") {
          if (d >= start && d <= end) {
            if (t.type === "income") monthRevenue += t.amount;
            else monthExpense += t.amount;
          }
          if (isSameDay(d, today)) {
            if (t.type === "income") todayProfit += t.amount;
            else todayProfit -= t.amount;
          }
        }
      }
      return {
        monthRevenue,
        monthExpense,
        monthProfit: monthRevenue - monthExpense,
        todayProfit,
      };
    }, [transactions]);

  const areaChartData = useMemo(() => {
    const days = buildLast7Days();
    return days.map((day) => {
      let receita = 0;
      let despesa = 0;
      for (const t of transactions) {
        if (t.status !== "paid") continue;
        const d = new Date(t.date);
        if (isSameDay(d, day.date)) {
          if (t.type === "income") receita += t.amount;
          else despesa += t.amount;
        }
      }
      return { day: day.label, receita, despesa };
    });
  }, [transactions]);

  const pieData = useMemo(() => {
    const { start, end } = getMonthBounds();
    const totals: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type !== "expense" || t.status !== "paid") continue;
      const d = new Date(t.date);
      if (d < start || d > end) continue;
      totals[t.category] = (totals[t.category] ?? 0) + t.amount;
    }
    return (Object.keys(totals) as TransactionCategory[])
      .map((cat) => ({
        name: CATEGORY_LABELS[cat],
        value: totals[cat],
        cat,
        color: CATEGORY_COLORS[cat],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthChart = useMemo(() => {
    // last 6 months
    const today = new Date();
    const arr: {
      label: string;
      receita: number;
      despesa: number;
      lucro: number;
    }[] = [];
    const fmtMonth = new Intl.DateTimeFormat("pt-BR", { month: "short" });
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      let receita = 0;
      let despesa = 0;
      for (const t of transactions) {
        if (t.status !== "paid") continue;
        const td = new Date(t.date);
        if (td >= start && td <= end) {
          if (t.type === "income") receita += t.amount;
          else despesa += t.amount;
        }
      }
      let label = fmtMonth.format(d).replace(".", "");
      label = label.charAt(0).toUpperCase() + label.slice(1);
      arr.push({ label, receita, despesa, lucro: receita - despesa });
    }
    return arr;
  }, [transactions]);

  const handleCreated = (t: Transaction) => {
    setTransactions((prev) => {
      const next = [t, ...prev];
      // keep desc order by date
      next.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return next;
    });
    setCreateOpen(false);
    toast.success("Transação registrada com sucesso");
  };

  const handleUpdated = (updated: Transaction) => {
    setTransactions((prev) => {
      const next = prev.map((t) => (t.id === updated.id ? updated : t));
      next.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return next;
    });
    setSelectedId(null);
    setTimeout(() => setSelectedId(updated.id), 30);
  };

  const handleDeleted = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setSelectedId(null);
    toast.success("Transação excluída");
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const updated = json.data as Transaction;
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
      toast.success("Marcado como pago");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao atualizar status");
    }
  };

  const selected = useMemo(
    () => transactions.find((t) => t.id === selectedId) ?? null,
    [transactions, selectedId]
  );

  return (
    <div>
      <ViewHeader
        title="Controle Financeiro"
        description="Fluxo de caixa, contas a pagar/receber e relatórios."
        icon={<Wallet className="h-5 w-5" />}
        accent="orange"
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="gradient-orange text-primary-foreground glow-orange"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova transação</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        }
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Filter className="h-4 w-4" /> Transações
          </TabsTrigger>
          <TabsTrigger value="bills">
            <Wallet className="h-4 w-4" /> Contas
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4" /> Relatórios
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* Tab 1 — Visão Geral                                          */}
        {/* ============================================================ */}
        <TabsContent value="overview">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KpiCard
                icon={<ArrowUpCircle className="h-5 w-5" />}
                label="Receita do mês"
                value={formatCurrency(monthRevenue)}
                tone="emerald"
                loading={loading}
              />
              <KpiCard
                icon={<ArrowDownCircle className="h-5 w-5" />}
                label="Despesa do mês"
                value={formatCurrency(monthExpense)}
                tone="red"
                loading={loading}
              />
              <KpiCard
                icon={<TrendingUp className="h-5 w-5" />}
                label="Lucro do mês"
                value={formatCurrency(monthProfit)}
                tone={
                  monthProfit >= 0 ? "emerald" : "red"
                }
                loading={loading}
              />
              <KpiCard
                icon={<Wallet className="h-5 w-5" />}
                label="Lucro de hoje"
                value={formatCurrency(todayProfit)}
                tone={todayProfit >= 0 ? "orange" : "red"}
                loading={loading}
              />
            </div>

            {/* Charts */}
            <div className="grid gap-4 lg:grid-cols-3">
              <SectionCard
                className="lg:col-span-2"
                title="Receita x Despesa (7 dias)"
                icon={<TrendingUp className="h-4 w-4" />}
              >
                {loading ? (
                  <Skeleton className="h-64 w-full rounded-xl" />
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={areaChartData}>
                        <defs>
                          <linearGradient
                            id="gFinReceita"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={COLORS.income}
                              stopOpacity={0.5}
                            />
                            <stop
                              offset="100%"
                              stopColor={COLORS.income}
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="gFinDespesa"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={COLORS.expense}
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="100%"
                              stopColor={COLORS.expense}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="oklch(1 0 0 / 6%)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="day"
                          tick={{
                            fill: "oklch(0.7 0.01 240)",
                            fontSize: 11,
                          }}
                          stroke="oklch(1 0 0 / 10%)"
                          tickLine={false}
                        />
                        <YAxis
                          tick={{
                            fill: "oklch(0.7 0.01 240)",
                            fontSize: 10,
                          }}
                          stroke="oklch(1 0 0 / 10%)"
                          tickLine={false}
                          tickFormatter={(v: number) =>
                            v >= 1000
                              ? `R$ ${(v / 1000).toFixed(1)}k`
                              : `R$ ${v}`
                          }
                          width={50}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "oklch(0.2 0.04 255)",
                            border:
                              "1px solid oklch(0.68 0.21 42 / 0.4)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          labelStyle={{ color: "oklch(0.97 0.01 240)" }}
                          formatter={(v: any) => formatCurrency(Number(v))}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 11 }}
                          formatter={(v: string) =>
                            v === "receita" ? "Receita" : "Despesa"
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey="receita"
                          stroke={COLORS.income}
                          strokeWidth={2}
                          fill="url(#gFinReceita)"
                        />
                        <Area
                          type="monotone"
                          dataKey="despesa"
                          stroke={COLORS.expense}
                          strokeWidth={2}
                          fill="url(#gFinDespesa)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Despesas por categoria"
                icon={<TrendingDown className="h-4 w-4" />}
              >
                {loading ? (
                  <Skeleton className="h-64 w-full rounded-xl" />
                ) : pieData.length === 0 ? (
                  <div className="flex h-64 items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Sem despesas no mês
                    </p>
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={85}
                          paddingAngle={2}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "oklch(0.2 0.04 255)",
                            border:
                              "1px solid oklch(0.68 0.21 42 / 0.4)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          formatter={(v: any) => formatCurrency(Number(v))}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 10 }}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </SectionCard>
            </div>

            {/* 6-month bar chart */}
            <SectionCard
              title="Histórico (6 meses)"
              icon={<TrendingUp className="h-4 w-4" />}
            >
              {loading ? (
                <Skeleton className="h-56 w-full rounded-xl" />
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthChart}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(1 0 0 / 6%)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{
                          fill: "oklch(0.7 0.01 240)",
                          fontSize: 11,
                        }}
                        stroke="oklch(1 0 0 / 10%)"
                        tickLine={false}
                      />
                      <YAxis
                        tick={{
                          fill: "oklch(0.7 0.01 240)",
                          fontSize: 10,
                        }}
                        stroke="oklch(1 0 0 / 10%)"
                        tickLine={false}
                        tickFormatter={(v: number) =>
                          v >= 1000
                            ? `R$ ${(v / 1000).toFixed(1)}k`
                            : `R$ ${v}`
                        }
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.2 0.04 255)",
                          border:
                            "1px solid oklch(0.68 0.21 42 / 0.4)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "oklch(0.97 0.01 240)" }}
                        formatter={(v: any) => formatCurrency(Number(v))}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 11 }}
                        formatter={(v: string) => {
                          if (v === "receita") return "Receita";
                          if (v === "despesa") return "Despesa";
                          return "Lucro";
                        }}
                      />
                      <Bar
                        dataKey="receita"
                        fill={COLORS.income}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="despesa"
                        fill={COLORS.expense}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="lucro"
                        fill={COLORS.accent}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>
          </motion.div>
        </TabsContent>

        {/* ============================================================ */}
        {/* Tab 2 — Transações                                            */}
        {/* ============================================================ */}
        <TabsContent value="transactions">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Filters */}
            <SectionCard className="p-4">
              <div className="grid gap-3 sm:grid-cols-12">
                <div className="sm:col-span-6">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar por descrição..."
                      className="h-10 rounded-xl border-border bg-background/50 pl-9"
                    />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <Select
                    value={filterType}
                    onValueChange={(v: any) => setFilterType(v)}
                  >
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3">
                  <Select
                    value={filterCategory}
                    onValueChange={(v: any) => setFilterCategory(v)}
                  >
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {(Object.keys(CATEGORY_LABELS) as TransactionCategory[]).map(
                        (c) => (
                          <SelectItem key={c} value={c}>
                            {CATEGORY_LABELS[c]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {!loading && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {transactions.length} transação
                  {transactions.length === 1 ? "" : "ões"}
                  {(filterType !== "all" || filterCategory !== "all" || debouncedQuery)
                    ? " • Filtros aplicados"
                    : ""}
                </p>
              )}
            </SectionCard>

            {/* Transactions list */}
            {loading ? (
              <SectionCard>
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TransactionRowSkeleton key={i} />
                  ))}
                </div>
              </SectionCard>
            ) : transactions.length === 0 ? (
              <SectionCard>
                <EmptyState
                  icon={<Wallet className="h-10 w-10 opacity-40" />}
                  title={
                    debouncedQuery ||
                    filterType !== "all" ||
                    filterCategory !== "all"
                      ? "Nenhuma transação encontrada"
                      : "Nenhuma transação cadastrada"
                  }
                  description={
                    debouncedQuery ||
                    filterType !== "all" ||
                    filterCategory !== "all"
                      ? "Ajuste os filtros e tente novamente."
                      : "Comece registrando sua primeira transação."
                  }
                  action={
                    !debouncedQuery &&
                    filterType === "all" &&
                    filterCategory === "all" && (
                      <Button
                        onClick={() => setCreateOpen(true)}
                        className="gradient-orange text-primary-foreground glow-orange"
                        size="sm"
                      >
                        <Plus className="h-4 w-4" /> Nova transação
                      </Button>
                    )
                  }
                />
              </SectionCard>
            ) : (
              <SectionCard className="p-0 sm:p-0">
                <div className="max-h-[40rem] overflow-y-auto scrollbar-premium p-4 sm:p-5">
                  <div className="space-y-2">
                    {transactions.map((t, i) => (
                      <TransactionRow
                        key={t.id}
                        transaction={t}
                        onClick={() => setSelectedId(t.id)}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}
          </motion.div>
        </TabsContent>

        {/* ============================================================ */}
        {/* Tab 3 — Contas a pagar/receber                                */}
        {/* ============================================================ */}
        <TabsContent value="bills">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <BillsView
              transactions={transactions}
              loading={loading}
              onMarkPaid={handleMarkPaid}
              onOpenDetail={(id) => setSelectedId(id)}
            />
          </motion.div>
        </TabsContent>

        {/* ============================================================ */}
        {/* Tab 4 — Relatórios                                            */}
        {/* ============================================================ */}
        <TabsContent value="reports">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ReportsView
              transactions={transactions}
              monthRevenue={monthRevenue}
              monthExpense={monthExpense}
              monthProfit={monthProfit}
              todayProfit={todayProfit}
              pieData={pieData}
            />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Create dialog */}
      <TransactionFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={handleCreated}
      />

      {/* Detail sheet */}
      <TransactionDetailSheet
        transaction={selected}
        open={!!selectedId}
        onOpenChange={(v) => {
          if (!v) setSelectedId(null);
        }}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
        onMarkPaid={handleMarkPaid}
      />
    </div>
  );
}

// ============================================================================
// KPI card
// ============================================================================
function KpiCard({
  icon,
  label,
  value,
  tone,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "red" | "orange" | "blue" | "purple";
  loading?: boolean;
}) {
  const tones: Record<string, string> = {
    emerald: "text-emerald-400",
    red: "text-red-400",
    orange: "text-orange-400",
    blue: "text-blue-300",
    purple: "text-purple-400",
  };
  return (
    <div className="card-premium rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className={cn("rounded-lg bg-card/50 p-2", tones[tone])}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {loading ? (
        <Skeleton className="mt-1 h-6 w-3/4" />
      ) : (
        <p className="mt-0.5 text-lg font-bold text-foreground">{value}</p>
      )}
    </div>
  );
}

// ============================================================================
// Transaction row
// ============================================================================
function TransactionRow({
  transaction,
  onClick,
  index,
}: {
  transaction: Transaction;
  onClick: () => void;
  index: number;
}) {
  const isIncome = transaction.type === "income";
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card/40 p-3 text-left transition hover:border-orange-500/40 hover:bg-card/70"
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
          isIncome
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-red-500/10 text-red-400"
        )}
      >
        {isIncome ? (
          <ArrowUpCircle className="h-5 w-5" />
        ) : (
          <ArrowDownCircle className="h-5 w-5" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {transaction.description}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{formatShortDate(transaction.date)}</span>
          <span>•</span>
          <span>{CATEGORY_LABELS[transaction.category]}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={cn(
            "text-sm font-bold tabular-nums",
            isIncome ? "text-emerald-400" : "text-red-400"
          )}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </span>
        <StatusBadge status={transaction.status} />
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </motion.button>
  );
}

function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card/30 p-3">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
      <div className="flex flex-col items-end gap-1">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const isPaid = status === "paid";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold",
        isPaid
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-amber-500/15 text-amber-300"
      )}
    >
      {isPaid ? (
        <CheckCircle2 className="h-2.5 w-2.5" />
      ) : (
        <Clock className="h-2.5 w-2.5" />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}

// ============================================================================
// Transaction form dialog (create / edit)
// ============================================================================
type TransactionFormData = {
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: string;
  date: string;
  status: TransactionStatus;
};

const emptyForm: TransactionFormData = {
  type: "income",
  category: "service",
  description: "",
  amount: "",
  date: toLocalDateInput(new Date()),
  status: "paid",
};

function TransactionFormDialog({
  open,
  onOpenChange,
  onSaved,
  transaction,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: (t: Transaction) => void;
  transaction?: Transaction | null;
}) {
  const [form, setForm] = useState<TransactionFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!transaction;

  useEffect(() => {
    if (open) {
      setForm(
        transaction
          ? {
              type: transaction.type,
              category: transaction.category,
              description: transaction.description,
              amount: String(transaction.amount),
              date: toLocalDateInput(new Date(transaction.date)),
              status: transaction.status,
            }
          : emptyForm
      );
    }
  }, [open, transaction]);

  const set = <K extends keyof TransactionFormData>(
    k: K,
    v: TransactionFormData[K]
  ) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
    if (!form.description.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }
    const amount = Number(form.amount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        type: form.type,
        category: form.category,
        description: form.description.trim(),
        amount,
        date: new Date(form.date).toISOString(),
        status: form.status,
      };
      const res = isEdit && transaction
        ? await fetch(`/api/transactions/${transaction.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onSaved?.(json.data as Transaction);
      if (isEdit) toast.success("Transação atualizada");
      // create success toast is fired by parent
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar transação");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-premium sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar transação" : "Nova transação"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados da transação."
              : "Registre uma receita ou despesa."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Type */}
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["income", "expense"] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("type", t)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition",
                    form.type === t
                      ? t === "income"
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : "border-red-500/50 bg-red-500/10 text-red-400"
                      : "border-border bg-background/50 text-muted-foreground hover:bg-card/50"
                  )}
                >
                  {t === "income" ? (
                    <ArrowUpCircle className="h-4 w-4" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4" />
                  )}
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select
              value={form.category}
              onValueChange={(v) => set("category", v as TransactionCategory)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_LABELS) as TransactionCategory[]).map(
                  (c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Ex: Pagamento cliente João, Compra de óleo 5W30..."
              className="min-h-[68px] rounded-xl"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label>Valor (R$)</Label>
            <Input
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className="rounded-xl"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as TransactionStatus)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={saving}
            className="gradient-orange text-primary-foreground glow-orange"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Salvar alterações" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Transaction detail sheet
// ============================================================================
function TransactionDetailSheet({
  transaction,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
  onMarkPaid,
}: {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdated: (t: Transaction) => void;
  onDeleted: (id: string) => void;
  onMarkPaid: (id: string) => Promise<void>;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const closeAll = () => {
    setEditOpen(false);
    setDeleteOpen(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!transaction) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onDeleted(transaction.id);
      setDeleteOpen(false);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  };

  if (!transaction) return null;
  const isIncome = transaction.type === "income";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-md lg:max-w-xl"
        >
          <div className="gradient-navy p-5">
            <SheetHeader className="space-y-0">
              <SheetTitle className="flex items-center gap-2 text-base">
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-lg",
                    isIncome
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  )}
                >
                  {isIncome ? (
                    <ArrowUpCircle className="h-5 w-5" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5" />
                  )}
                </span>
                <span className="flex-1 truncate">
                  {transaction.description}
                </span>
              </SheetTitle>
              <SheetDescription className="sr-only">
                Detalhes da transação
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto scrollbar-premium p-5">
            {/* Big amount */}
            <div className="rounded-2xl border border-border bg-card/50 p-5 text-center">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {TYPE_LABELS[transaction.type]}
              </p>
              <p
                className={cn(
                  "mt-1 text-3xl font-bold tabular-nums",
                  isIncome ? "text-emerald-400" : "text-red-400"
                )}
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
              <div className="mt-3 flex justify-center">
                <StatusBadge status={transaction.status} />
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-2 rounded-2xl border border-border bg-card/40 p-4">
              <InfoRow
                label="Categoria"
                value={CATEGORY_LABELS[transaction.category]}
              />
              <InfoRow label="Data" value={formatDate(transaction.date)} />
              <InfoRow
                label="Criado em"
                value={formatDate(transaction.createdAt)}
              />
            </div>

            {/* Quick actions */}
            {transaction.status === "pending" && (
              <Button
                onClick={() => onMarkPaid(transaction.id)}
                className="w-full gradient-orange text-primary-foreground glow-orange"
              >
                <CheckCircle2 className="h-4 w-4" />
                Marcar como pago
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 border-t border-border bg-background/60 p-4">
            <Button
              variant="outline"
              onClick={() => setEditOpen(true)}
              className="flex-1"
            >
              <Pencil className="h-4 w-4" /> Editar
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              className="border-red-500/40 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" /> Excluir
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit dialog */}
      <TransactionFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={onUpdated}
        transaction={transaction}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(v) => {
          setDeleteOpen(v);
          if (!v && !deleting) {
            // keep detail open
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação{" "}
              <span className="font-medium text-foreground">
                {transaction.description}
              </span>{" "}
              ({formatCurrency(transaction.amount)}) será removida
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

// ============================================================================
// Bills view (Tab 3)
// ============================================================================
function BillsView({
  transactions,
  loading,
  onMarkPaid,
  onOpenDetail,
}: {
  transactions: Transaction[];
  loading: boolean;
  onMarkPaid: (id: string) => void;
  onOpenDetail: (id: string) => void;
}) {
  const pending = transactions.filter((t) => t.status === "pending");
  const toPay = pending.filter((t) => t.type === "expense");
  const toReceive = pending.filter((t) => t.type === "income");

  const totalToPay = toPay.reduce((s, t) => s + t.amount, 0);
  const totalToReceive = toReceive.reduce((s, t) => s + t.amount, 0);

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryPill
          icon={<ArrowDownCircle className="h-4 w-4" />}
          label="Total a pagar"
          value={formatCurrency(totalToPay)}
          tone="red"
          count={toPay.length}
        />
        <SummaryPill
          icon={<ArrowUpCircle className="h-4 w-4" />}
          label="Total a receber"
          value={formatCurrency(totalToReceive)}
          tone="emerald"
          count={toReceive.length}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* A pagar */}
        <SectionCard
          title="Contas a pagar"
          icon={<ArrowDownCircle className="h-4 w-4 text-red-400" />}
        >
          {toPay.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-8 w-8 opacity-40" />}
              title="Nenhuma conta a pagar"
              description="Todos os pagamentos estão em dia."
            />
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto scrollbar-premium pr-1">
              {toPay.map((t, i) => (
                <BillRow
                  key={t.id}
                  transaction={t}
                  index={i}
                  onClick={() => onOpenDetail(t.id)}
                  onMarkPaid={() => onMarkPaid(t.id)}
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* A receber */}
        <SectionCard
          title="Contas a receber"
          icon={<ArrowUpCircle className="h-4 w-4 text-emerald-400" />}
        >
          {toReceive.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-8 w-8 opacity-40" />}
              title="Nenhuma conta a receber"
              description="Sem receitas pendentes."
            />
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto scrollbar-premium pr-1">
              {toReceive.map((t, i) => (
                <BillRow
                  key={t.id}
                  transaction={t}
                  index={i}
                  onClick={() => onOpenDetail(t.id)}
                  onMarkPaid={() => onMarkPaid(t.id)}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function BillRow({
  transaction,
  index,
  onClick,
  onMarkPaid,
}: {
  transaction: Transaction;
  index: number;
  onClick: () => void;
  onMarkPaid: () => void;
}) {
  const isIncome = transaction.type === "income";
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      className="flex items-center gap-3 rounded-xl border border-border bg-card/40 p-3"
    >
      <button
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
            isIncome
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          )}
        >
          {isIncome ? (
            <ArrowUpCircle className="h-5 w-5" />
          ) : (
            <ArrowDownCircle className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {transaction.description}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatShortDate(transaction.date)} •{" "}
            {CATEGORY_LABELS[transaction.category]}
          </p>
        </div>
        <span
          className={cn(
            "text-sm font-bold tabular-nums",
            isIncome ? "text-emerald-400" : "text-red-400"
          )}
        >
          {formatCurrency(transaction.amount)}
        </span>
      </button>
      <Button
        size="icon"
        variant="outline"
        onClick={onMarkPaid}
        className="h-9 w-9 shrink-0 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
        title="Marcar como pago"
      >
        <CheckCircle2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

function SummaryPill({
  icon,
  label,
  value,
  tone,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "red";
  count: number;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        tone === "emerald"
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-red-500/20 bg-red-500/5"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            tone === "emerald" ? "text-emerald-400" : "text-red-400"
          )}
        >
          {icon}
        </span>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <span className="text-xs text-muted-foreground">
          {count} {count === 1 ? "item" : "itens"}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Reports view (Tab 4) — simple HTML+print approach
// ============================================================================
function ReportsView({
  transactions,
  monthRevenue,
  monthExpense,
  monthProfit,
  todayProfit,
  pieData,
}: {
  transactions: Transaction[];
  monthRevenue: number;
  monthExpense: number;
  monthProfit: number;
  todayProfit: number;
  pieData: { name: string; value: number; cat: string; color: string }[];
}) {
  const [generating, setGenerating] = useState(false);

  const now = new Date();
  const monthName = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(now);

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const esc = (s: string) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const buildHTML = () => {
    const rows = sorted
      .map((t) => {
        const isIncome = t.type === "income";
        const sign = isIncome ? "+" : "-";
        const color = isIncome ? "#10b981" : "#ef4444";
        return `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${esc(
            formatShortDate(t.date)
          )}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${esc(
            t.description
          )}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-transform:capitalize;">${esc(
            CATEGORY_LABELS[t.category]
          )}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${
            isIncome ? "Receita" : "Despesa"
          }</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${
            t.status === "paid" ? "Pago" : "Pendente"
          }</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;color:${color};font-weight:600;">${sign}${formatCurrency(
            t.amount
          )}</td>
        </tr>`;
      })
      .join("");

    const pieRows = pieData
      .map(
        (p) => `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${esc(
            p.name
          )}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(
            p.value
          )}</td>
        </tr>`
      )
      .join("");

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Relatório Financeiro — ${esc(monthName)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 32px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: .04em; color: #475569; }
  .sub { color: #64748b; font-size: 12px; margin-bottom: 16px; }
  .summary { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 16px; }
  .summary .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
  .summary .lbl { font-size: 11px; text-transform: uppercase; color: #64748b; }
  .summary .val { font-size: 18px; font-weight: 700; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; padding: 8px; background: #f1f5f9; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; color: #475569; }
  td { font-size: 12px; }
  .total-row td { font-weight: 700; border-top: 2px solid #0f172a; padding-top: 10px; }
  .footer { margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: center; }
  .brand { display:flex; align-items:center; gap:10px; margin-bottom: 8px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; background: #ff8a3d; color: #fff; text-transform: uppercase; }
  @media print { body { margin: 0; } .no-print { display: none; } }
</style>
</head>
<body>
  <div class="brand">
    <span class="badge">Mecânico Pro AI</span>
  </div>
  <h1>Relatório Financeiro</h1>
  <div class="sub">Período: <strong>${esc(monthName)}</strong> · Gerado em ${esc(
    formatDate(now)
  )}</div>

  <div class="summary">
    <div class="card"><div class="lbl">Receita do mês</div><div class="val" style="color:#10b981">${formatCurrency(
      monthRevenue
    )}</div></div>
    <div class="card"><div class="lbl">Despesa do mês</div><div class="val" style="color:#ef4444">${formatCurrency(
      monthExpense
    )}</div></div>
    <div class="card"><div class="lbl">Lucro do mês</div><div class="val" style="color:${
      monthProfit >= 0 ? "#10b981" : "#ef4444"
    }">${formatCurrency(monthProfit)}</div></div>
    <div class="card"><div class="lbl">Lucro de hoje</div><div class="val" style="color:${
      todayProfit >= 0 ? "#10b981" : "#ef4444"
    }">${formatCurrency(todayProfit)}</div></div>
  </div>

  <h2>Resumo Geral</h2>
  <table>
    <tr><td>Total de receitas (hist.)</td><td style="text-align:right;color:#10b981;font-weight:600">${formatCurrency(
      totalIncome
    )}</td></tr>
    <tr><td>Total de despesas (hist.)</td><td style="text-align:right;color:#ef4444;font-weight:600">${formatCurrency(
      totalExpense
    )}</td></tr>
    <tr class="total-row"><td>Saldo</td><td style="text-align:right;color:${
      totalIncome - totalExpense >= 0 ? "#10b981" : "#ef4444"
    }">${formatCurrency(totalIncome - totalExpense)}</td></tr>
    <tr><td>Total de transações</td><td style="text-align:right">${transactions.length}</td></tr>
  </table>

  ${
    pieData.length > 0
      ? `<h2>Despesas por categoria (mês)</h2>
  <table>
    <thead><tr><th>Categoria</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>${pieRows}</tbody>
  </table>`
      : ""
  }

  <h2>Todas as transações</h2>
  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Descrição</th>
        <th>Categoria</th>
        <th>Tipo</th>
        <th>Status</th>
        <th style="text-align:right">Valor</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="6" style="text-align:center;padding:16px;color:#94a3b8">Sem transações registradas</td></tr>`}
    </tbody>
  </table>

  <div class="footer">
    Mecânico Pro AI · Assistente Técnico Automotivo · Documento gerado automaticamente
  </div>

  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 300); };
  </script>
</body>
</html>`;
  };

  const generate = () => {
    setGenerating(true);
    try {
      const html = buildHTML();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (!win) {
        toast.error("Habilite pop-ups para gerar o relatório");
        URL.revokeObjectURL(url);
        return;
      }
      // Revoke after 1 minute to free memory
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      toast.success("Abrindo relatório para impressão/PDF");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao gerar relatório");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="Relatório de desempenho"
        icon={<FileText className="h-4 w-4" />}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Gere um relatório completo em formato imprimível (PDF).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-border bg-background/40 p-4">
            <p className="text-sm font-medium text-foreground">
              Resumo do mês atual
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receita</span>
                <span className="font-semibold text-emerald-400">
                  {formatCurrency(monthRevenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Despesa</span>
                <span className="font-semibold text-red-400">
                  {formatCurrency(monthExpense)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Lucro</span>
                <span
                  className={cn(
                    "font-bold",
                    monthProfit >= 0 ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {formatCurrency(monthProfit)}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-border bg-background/40 p-4">
            <p className="text-sm font-medium text-foreground">
              Totais históricos
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total de transações
                </span>
                <span className="font-semibold text-foreground">
                  {transactions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receitas</span>
                <span className="font-semibold text-emerald-400">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Despesas</span>
                <span className="font-semibold text-red-400">
                  {formatCurrency(totalExpense)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Relatório imprimível
            </p>
            <p className="text-xs text-muted-foreground">
              Abre em nova janela — use &ldquo;Salvar como PDF&rdquo; no diálogo
              de impressão.
            </p>
          </div>
          <Button
            onClick={generate}
            disabled={generating}
            className="gradient-orange text-primary-foreground glow-orange"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Gerar relatório PDF
          </Button>
        </div>
      </SectionCard>

      {/* Quick breakdown card */}
      <SectionCard
        title="Despesas por categoria (mês)"
        icon={<TrendingDown className="h-4 w-4" />}
      >
        {pieData.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sem despesas no mês
          </p>
        ) : (
          <div className="space-y-2">
            {pieData.map((p) => {
              const total = pieData.reduce((s, x) => s + x.value, 0) || 1;
              const pct = (p.value / total) * 100;
              return (
                <div
                  key={p.cat}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-2.5"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ background: p.color }}
                  />
                  <span className="flex-1 text-sm text-foreground">
                    {p.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {pct.toFixed(1)}%
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {formatCurrency(p.value)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
