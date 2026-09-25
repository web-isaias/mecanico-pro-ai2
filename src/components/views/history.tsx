"use client";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ViewHeader, SectionCard, EmptyState } from "@/components/shared/view-parts";
import {
  History,
  Search,
  Wrench,
  ShieldCheck,
  CalendarClock,
  DollarSign,
  User,
  Car,
  Link2,
  FileText,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/nav-config";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-amber-500/15 text-amber-300" },
  in_progress: { label: "Em andamento", color: "bg-blue-500/15 text-blue-300" },
  done: { label: "Concluído", color: "bg-emerald-500/15 text-emerald-300" },
  cancelled: { label: "Cancelado", color: "bg-red-500/15 text-red-300" },
};

const PRIORITY_MAP: Record<string, string> = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

export function ServiceHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => mounted && setOrders(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (!q) return true;
      return (
        (o.title || "").toLowerCase().includes(q) ||
        (o.customer?.name || "").toLowerCase().includes(q) ||
        (o.vehicle?.model || "").toLowerCase().includes(q)
      );
    });
  }, [orders, query, status]);

  const refresh = () => setRefreshKey((k) => k + 1);

  // Change the status of the currently-selected OS.
  // Calls PUT /api/services/[id] which triggers stock decrement + financial transaction on "done".
  const changeStatus = async (newStatus: "in_progress" | "done" | "cancelled" | "pending") => {
    if (!selected) return;
    setUpdatingStatus(newStatus);
    try {
      const res = await fetch(`/api/services/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Update the locally selected OS so the UI reflects the new state immediately
      setSelected(data);

      // Toasts based on side effects returned by the backend
      const side = data._sideEffects;
      if (newStatus === "done" && side) {
        const stockMsg = side.stockAdjusted.length > 0
          ? side.stockAdjusted
              .map((s: any) => s.matched
                ? `${s.name}: -${s.quantity} (${s.remaining} restantes)`
                : `${s.name}: sem correspondência no estoque`)
              .join(" • ")
          : "nenhum item de peça para baixar";
        const txMsg = side.transactionCreated
          ? `Transação de ${formatCurrency(side.transactionCreated.amount)} criada`
          : "";
        toast.success(`OS marcada como concluída! ${txMsg}`.trim(), {
          description: `Estoque: ${stockMsg}`,
          duration: 7000,
        });
      } else if (newStatus === "in_progress") {
        toast.info("OS em andamento");
      } else if (newStatus === "cancelled") {
        toast.warning("OS cancelada");
      } else if (newStatus === "pending") {
        toast.info("OS reaberta como pendente");
      }

      refresh();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao atualizar status");
    } finally {
      setUpdatingStatus(null);
      setConfirmCancel(false);
    }
  };

  return (
    <div>
      <ViewHeader
        title="Histórico de Serviços"
        description="Todas as ordens de serviço executadas na oficina."
        icon={<History className="h-5 w-5" />}
        accent="blue"
      />

      <SectionCard className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, cliente ou veículo..."
              className="h-10 rounded-xl border-border bg-background/50 pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-48 border-border bg-background/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em andamento</SelectItem>
              <SelectItem value="done">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      <SectionCard title={`Ordens de serviço (${filtered.length})`}>
        <div className="max-h-[65vh] space-y-2 overflow-y-auto scrollbar-premium pr-1">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl bg-card" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Wrench className="h-10 w-10 opacity-40" />}
              title="Nenhuma ordem encontrada"
              description="Crie ordens de serviço a partir do cadastro de clientes."
            />
          ) : (
            filtered.map((o) => {
              const s = STATUS_MAP[o.status] || STATUS_MAP.pending;
              return (
                <button
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="card-premium flex w-full items-center gap-3 rounded-xl border border-border bg-background/40 p-3 text-left"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-blue-300">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{o.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.customer?.name} {o.vehicle ? `• ${o.vehicle.brand} ${o.vehicle.model}` : ""}
                    </p>
                    {/* Badge: origem do orçamento */}
                    {o.quote && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-blue-300">
                        <Link2 className="h-2.5 w-2.5" />
                        Orçamento {o.quote.number}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(o.totalCost)}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(o.scheduledAt || o.createdAt)}</p>
                  </div>
                  <Badge variant="outline" className={s.color}>{s.label}</Badge>
                </button>
              );
            })
          )}
        </div>
      </SectionCard>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto border-border bg-popover sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-foreground">
                  <Wrench className="h-5 w-5 text-orange-400" />
                  {selected.title}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground">
                  Ordem de serviço
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4 px-4 pb-6">
                <Badge variant="outline" className={STATUS_MAP[selected.status]?.color}>
                  {STATUS_MAP[selected.status]?.label}
                </Badge>

                {/* Origem: orçamento vinculado */}
                {selected.quote && (
                  <div className="flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-500/15 text-blue-300">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Originado do orçamento</p>
                      <p className="truncate font-mono text-sm font-bold text-blue-300">
                        {selected.quote.number}
                      </p>
                    </div>
                    <Link2 className="h-4 w-4 shrink-0 text-blue-400" />
                  </div>
                )}

                {selected.description && (
                  <div className="rounded-lg border border-border bg-background/40 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Descrição</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-foreground">{selected.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Cliente" value={selected.customer?.name || "-"} />
                  <InfoRow icon={<Car className="h-3.5 w-3.5" />} label="Veículo" value={selected.vehicle ? `${selected.vehicle.brand} ${selected.vehicle.model}` : "-"} />
                  <InfoRow icon={<CalendarClock className="h-3.5 w-3.5" />} label="Agendado" value={selected.scheduledAt ? formatDate(selected.scheduledAt) : "-"} />
                  <InfoRow icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Garantia" value={selected.warranty || "-"} />
                  <InfoRow icon={<DollarSign className="h-3.5 w-3.5" />} label="Mão de obra" value={formatCurrency(selected.laborCost)} />
                  <InfoRow icon={<DollarSign className="h-3.5 w-3.5" />} label="Peças" value={formatCurrency(selected.partsCost)} />
                  {selected.completedAt && (
                    <InfoRow icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Concluído em" value={formatDate(selected.completedAt)} />
                  )}
                </div>
                {selected.items?.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Itens do serviço</p>
                    <div className="space-y-1.5">
                      {selected.items.map((it: any) => (
                        <div key={it.id} className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-foreground">{it.description}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {it.quantity}x {formatCurrency(it.unitPrice)} • {it.type === "part" ? "Peça" : "Serviço"}
                            </p>
                          </div>
                          <span className="font-semibold text-foreground">{formatCurrency(it.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-orange-400">{formatCurrency(selected.totalCost)}</span>
                  </div>
                </div>

                {/* Workflow actions */}
                <div className="rounded-xl border border-border bg-card/40 p-3">
                  <p className="mb-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Fluxo de execução
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* pending → in_progress */}
                    {selected.status === "pending" && (
                      <Button
                        size="sm"
                        className="gradient-orange text-primary-foreground glow-orange"
                        disabled={updatingStatus !== null}
                        onClick={() => changeStatus("in_progress")}
                      >
                        {updatingStatus === "in_progress" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                        Iniciar serviço
                      </Button>
                    )}

                    {/* in_progress → done */}
                    {selected.status === "in_progress" && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                        disabled={updatingStatus !== null}
                        onClick={() => changeStatus("done")}
                      >
                        {updatingStatus === "done" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Concluir serviço
                      </Button>
                    )}

                    {/* done → reopen */}
                    {selected.status === "done" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                        disabled={updatingStatus !== null}
                        onClick={() => changeStatus("pending")}
                      >
                        {updatingStatus === "pending" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <History className="h-3.5 w-3.5" />
                        )}
                        Reabrir
                      </Button>
                    )}

                    {/* cancel (anytime, except already cancelled) */}
                    {selected.status !== "cancelled" && selected.status !== "done" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                        disabled={updatingStatus !== null}
                        onClick={() => setConfirmCancel(true)}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancelar
                      </Button>
                    )}
                  </div>

                  {/* Info about side effects */}
                  {selected.status === "in_progress" && (
                    <p className="mt-2.5 flex items-start gap-1.5 text-[10px] text-muted-foreground">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                      Ao concluir: baixa automática de estoque (peças) + transação financeira de
                      <span className="font-semibold text-foreground"> {formatCurrency(selected.totalCost)}</span>.
                    </p>
                  )}
                  {selected.status === "done" && (
                    <p className="mt-2.5 flex items-start gap-1.5 text-[10px] text-emerald-300">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
                      Serviço concluído — estoque e financeiro já foram atualizados automaticamente.
                    </p>
                  )}
                  {selected.status === "cancelled" && (
                    <p className="mt-2.5 flex items-start gap-1.5 text-[10px] text-red-300">
                      <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
                      OS cancelada. Estoque e financeiro não foram afetados.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirm cancel */}
      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent className="border-border bg-popover">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Cancelar esta ordem de serviço?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              A OS será marcada como cancelada. Estoque e financeiro não serão afetados.
              Você poderá reabri-la depois se necessário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => changeStatus("cancelled")}
            >
              Sim, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  );
}
