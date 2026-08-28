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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewHeader, SectionCard, EmptyState } from "@/components/shared/view-parts";
import { History, Search, Wrench, ShieldCheck, CalendarClock, DollarSign, User, Car, Link2, FileText } from "lucide-react";
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

  useEffect(() => {
    let mounted = true;
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => mounted && setOrders(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

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
                    <p className="mt-1 text-sm text-foreground">{selected.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Cliente" value={selected.customer?.name || "-"} />
                  <InfoRow icon={<Car className="h-3.5 w-3.5" />} label="Veículo" value={selected.vehicle ? `${selected.vehicle.brand} ${selected.vehicle.model}` : "-"} />
                  <InfoRow icon={<CalendarClock className="h-3.5 w-3.5" />} label="Agendado" value={selected.scheduledAt ? formatDate(selected.scheduledAt) : "-"} />
                  <InfoRow icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Garantia" value={selected.warranty || "-"} />
                  <InfoRow icon={<DollarSign className="h-3.5 w-3.5" />} label="Mão de obra" value={formatCurrency(selected.laborCost)} />
                  <InfoRow icon={<DollarSign className="h-3.5 w-3.5" />} label="Peças" value={formatCurrency(selected.partsCost)} />
                </div>
                {selected.items?.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Itens do serviço</p>
                    <div className="space-y-1.5">
                      {selected.items.map((it: any) => (
                        <div key={it.id} className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-2 text-xs">
                          <span className="text-foreground">{it.description}</span>
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
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
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
