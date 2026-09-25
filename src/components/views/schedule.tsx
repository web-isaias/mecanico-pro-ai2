"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  ViewHeader,
  SectionCard,
  EmptyState,
} from "@/components/shared/view-parts";
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Pencil,
  Trash2,
  Loader2,
  Clock,
  User,
  Car,
  Calendar as CalendarIcon,
  Wrench,
  Truck,
  RefreshCw,
  StickyNote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDate, formatShortDate } from "@/lib/nav-config";

// ============================================================================
// Types
// ============================================================================
type AppointmentType = "service" | "delivery" | "review" | "maintenance";
type AppointmentStatus = "scheduled" | "confirmed" | "done" | "cancelled";

type CustomerLite = {
  id: string;
  name: string;
  phone?: string | null;
  whatsapp?: string | null;
};

type Appointment = {
  id: string;
  title: string;
  type: AppointmentType | string;
  status: AppointmentStatus | string;
  startDate: string;
  endDate?: string | null;
  customerId?: string | null;
  customer?: CustomerLite | null;
  vehicleDesc?: string | null;
  notes?: string | null;
  createdAt: string;
};

// ============================================================================
// Constants & helpers
// ============================================================================
const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const TYPE_META: Record<
  string,
  { label: string; badge: string; dot: string; icon: typeof Wrench }
> = {
  service: {
    label: "Serviço",
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    dot: "bg-orange-400",
    icon: Wrench,
  },
  delivery: {
    label: "Entrega",
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    dot: "bg-purple-400",
    icon: Truck,
  },
  review: {
    label: "Revisão",
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    dot: "bg-blue-400",
    icon: RefreshCw,
  },
  maintenance: {
    label: "Manutenção",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
    icon: StickyNote,
  },
};

const STATUS_META: Record<string, { label: string; badge: string }> = {
  scheduled: {
    label: "Agendado",
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  },
  confirmed: {
    label: "Confirmado",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  done: {
    label: "Concluído",
    badge: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  },
  cancelled: {
    label: "Cancelado",
    badge: "border-red-500/30 bg-red-500/10 text-red-300",
  },
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function buildMonthGrid(monthStart: Date): Date[] {
  const grid: Date[] = [];
  const first = new Date(monthStart);
  const dayOfWeek = first.getDay(); // 0 = Sunday
  // Leading days from previous month
  for (let i = dayOfWeek; i > 0; i--) {
    const d = new Date(first);
    d.setDate(first.getDate() - i);
    grid.push(d);
  }
  // Current month days
  const monthEnd = endOfMonth(monthStart);
  const cursor = new Date(first);
  while (cursor <= monthEnd) {
    grid.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  // Trailing days from next month until we have a multiple of 7
  while (grid.length % 7 !== 0) {
    const last = grid[grid.length - 1];
    const d = new Date(last);
    d.setDate(last.getDate() + 1);
    grid.push(d);
  }
  return grid;
}

function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "--:--";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "--:--";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatTimeRange(start?: string | null, end?: string | null): string {
  const s = formatTime(start);
  if (!end) return s;
  const e = formatTime(end);
  return `${s} – ${e}`;
}

// Convert a Date (or ISO date string) to a value accepted by <input type="datetime-local">
function toLocalInputValue(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// ============================================================================
// Main component
// ============================================================================
export function Schedule() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [currentMonth, setCurrentMonth] = useState<Date>(() =>
    startOfMonth(today)
  );
  const [selectedDay, setSelectedDay] = useState<Date>(today);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ---- Fetch appointments for the visible month (with 1 week padding) ----
  const monthStart = startOfMonth(currentMonth);
  const rangeStart = useMemo(() => {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - 7);
    return d;
  }, [monthStart]);
  const rangeEnd = useMemo(() => {
    const d = endOfMonth(currentMonth);
    d.setDate(d.getDate() + 7);
    return d;
  }, [currentMonth]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from: rangeStart.toISOString(),
        to: rangeEnd.toISOString(),
      });
      const res = await fetch(`/api/appointments?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setAppointments(json.data ?? []);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao carregar agenda");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // ---- Derived data ----
  // map: yyyy-mm-dd -> count
  const countByDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of appointments) {
      const d = new Date(a.startDate);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    return m;
  }, [appointments]);

  const monthGrid = useMemo(() => buildMonthGrid(monthStart), [monthStart]);

  const selectedDayAppointments = useMemo(() => {
    return appointments
      .filter((a) => isSameDay(new Date(a.startDate), selectedDay))
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
  }, [appointments, selectedDay]);

  // Upcoming this week (next 7 days from today, excluding today's already shown in timeline)
  const upcomingWeek = useMemo(() => {
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 7);
    return appointments
      .filter((a) => {
        const d = new Date(a.startDate);
        return d > today && d <= limit;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
  }, [appointments, today]);

  const pastAppointments = useMemo(() => {
    return appointments
      .filter((a) => new Date(a.startDate) < today)
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
      .slice(0, 5);
  }, [appointments, today]);

  const totalCountThisMonth = useMemo(
    () =>
      appointments.filter(
        (a) =>
          new Date(a.startDate).getMonth() === currentMonth.getMonth() &&
          new Date(a.startDate).getFullYear() === currentMonth.getFullYear()
      ).length,
    [appointments, currentMonth]
  );

  const selectedAppointment = useMemo(
    () => appointments.find((a) => a.id === selectedId) ?? null,
    [appointments, selectedId]
  );

  // ---- Handlers ----
  const handleCreated = (appt: Appointment) => {
    setAppointments((prev) => {
      // Insert sorted by startDate
      const next = [...prev, appt];
      next.sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      return next;
    });
    setCreateOpen(false);
    // Jump to the new appointment's day so the user sees it
    const d = new Date(appt.startDate);
    if (!Number.isNaN(d.getTime())) {
      setSelectedDay(startOfDay(d));
      setCurrentMonth(startOfMonth(d));
    }
    toast.success("Agendamento criado com sucesso");
  };

  const handleUpdated = (updated: Appointment) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    // Detail panel reads appointment via prop from this list, so no
    // close+reopen hack needed: it will reflect the new data automatically.
    toast.success("Agendamento atualizado");
  };

  const handleDeleted = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    setSelectedId(null);
    toast.success("Agendamento excluído");
  };

  const goPrevMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goNextMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  const goToday = () => {
    setCurrentMonth(startOfMonth(today));
    setSelectedDay(today);
  };

  return (
    <div>
      <ViewHeader
        title="Agenda da Oficina"
        description="Programe serviços, revisões, entregas e lembretes."
        icon={<CalendarDays className="h-5 w-5" />}
        accent="orange"
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="gradient-orange text-primary-foreground glow-orange"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo agendamento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        {/* ============================================================
            CALENDAR PANEL
           ============================================================ */}
        <SectionCard
          title={`${MONTH_NAMES[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}
          icon={<CalendarIcon className="h-4 w-4" />}
          actions={
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 border-border"
                onClick={goPrevMonth}
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-border px-3 text-xs"
                onClick={goToday}
              >
                Hoje
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 border-border"
                onClick={goNextMonth}
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          }
        >
          {loading ? (
            <CalendarSkeleton />
          ) : (
            <div>
              {/* Weekday header */}
              <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {WEEKDAYS.map((d, i) => (
                  <div key={i} className="py-1">
                    {d}
                  </div>
                ))}
              </div>
              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1">
                {monthGrid.map((day, i) => {
                  const inMonth = day.getMonth() === currentMonth.getMonth();
                  const isToday = isSameDay(day, today);
                  const isSelected = isSameDay(day, selectedDay);
                  const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
                  const count = countByDay.get(key) ?? 0;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDay(startOfDay(day))}
                      className={[
                        "relative flex aspect-square flex-col items-center justify-center rounded-lg border text-xs transition sm:text-sm",
                        inMonth ? "bg-card/40" : "bg-transparent opacity-40",
                        isSelected
                          ? "border-orange-500 bg-orange-500/15 text-orange-300"
                          : "border-border hover:border-orange-500/50 hover:bg-orange-500/5",
                        isToday && !isSelected
                          ? "text-orange-300 ring-1 ring-orange-500/30"
                          : "",
                      ].join(" ")}
                      aria-label={`Selecionar ${day.toLocaleDateString(
                        "pt-BR"
                      )}`}
                    >
                      <span
                        className={[
                          "font-medium",
                          isToday ? "font-bold" : "",
                        ].join(" ")}
                      >
                        {day.getDate()}
                      </span>
                      {count > 0 && (
                        <span
                          className={[
                            "absolute bottom-1 h-1.5 w-1.5 rounded-full",
                            isSelected
                              ? "bg-orange-400"
                              : "bg-orange-500/70",
                          ].join(" ")}
                          aria-hidden
                        />
                      )}
                      {count > 0 && (
                        <span className="absolute right-1 top-0.5 text-[8px] font-bold text-muted-foreground">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Month summary */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>
                  <span className="font-semibold text-foreground">
                    {totalCountThisMonth}
                  </span>{" "}
                  agendamento{totalCountThisMonth === 1 ? "" : "s"} neste mês
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(TYPE_META).map(([k, m]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-background/40 px-2 py-0.5 text-[10px]"
                    >
                      <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ============================================================
            SELECTED DAY TIMELINE
           ============================================================ */}
        <SectionCard
          title={selectedDay.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
          icon={<CalendarDays className="h-4 w-4" />}
          actions={
            <span className="text-xs text-muted-foreground">
              {selectedDayAppointments.length} compromisso
              {selectedDayAppointments.length === 1 ? "" : "s"}
            </span>
          }
        >
          {loading ? (
            <DayTimelineSkeleton />
          ) : selectedDayAppointments.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-9 w-9 opacity-40" />}
              title="Nenhum agendamento neste dia"
              description="Selecione outro dia ou crie um novo agendamento."
              action={
                <Button
                  onClick={() => {
                    setCreateOpen(true);
                  }}
                  className="gradient-orange text-primary-foreground glow-orange"
                  size="sm"
                >
                  <Plus className="h-4 w-4" /> Novo agendamento
                </Button>
              }
            />
          ) : (
            <div className="max-h-96 overflow-y-auto scrollbar-premium pr-1">
              <AnimatePresence initial={false}>
                {selectedDayAppointments.map((a, i) => (
                  <AppointmentRow
                    key={a.id}
                    appointment={a}
                    index={i}
                    onClick={() => setSelectedId(a.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ============================================================
          UPCOMING THIS WEEK + PAST (responsive grid)
         ============================================================ */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Próximos 7 dias"
          icon={<Clock className="h-4 w-4" />}
        >
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : upcomingWeek.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              Nenhum agendamento nos próximos 7 dias.
            </p>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto scrollbar-premium pr-1">
              {upcomingWeek.map((a, i) => (
                <AppointmentRow
                  key={a.id}
                  appointment={a}
                  index={i}
                  onClick={() => setSelectedId(a.id)}
                  compact
                  showDate
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Histórico recente"
          icon={<CalendarIcon className="h-4 w-4" />}
        >
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : pastAppointments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              Nenhum agendamento passado neste período.
            </p>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto scrollbar-premium pr-1">
              {pastAppointments.map((a, i) => (
                <AppointmentRow
                  key={a.id}
                  appointment={a}
                  index={i}
                  onClick={() => setSelectedId(a.id)}
                  compact
                  showDate
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ============================================================
          CREATE DIALOG
         ============================================================ */}
      <AppointmentFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={handleCreated}
        defaultDate={selectedDay}
      />

      {/* ============================================================
          DETAIL / EDIT / DELETE PANEL
         ============================================================ */}
      <AppointmentDetailPanel
        key={selectedId ?? "none"}
        appointment={selectedAppointment}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

// ============================================================================
// Calendar skeleton
// ============================================================================
function CalendarSkeleton() {
  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}

function DayTimelineSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

// ============================================================================
// Appointment row (used in day timeline + upcoming + history)
// ============================================================================
function AppointmentRow({
  appointment: a,
  index,
  onClick,
  compact = false,
  showDate = false,
}: {
  appointment: Appointment;
  index: number;
  onClick: () => void;
  compact?: boolean;
  showDate?: boolean;
}) {
  const typeMeta = TYPE_META[a.type] ?? TYPE_META.service;
  const statusMeta = STATUS_META[a.status] ?? STATUS_META.scheduled;
  const TypeIcon = typeMeta.icon;
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.18) }}
      whileHover={{ x: 2 }}
      className="card-premium group w-full rounded-xl border border-border bg-card/50 p-3 text-left backdrop-blur-sm"
    >
      <div className="flex items-start gap-3">
        {/* Time column */}
        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-background/40 py-1.5 text-center">
          <span className="text-xs font-bold text-orange-400">
            {formatTime(a.startDate)}
          </span>
          {a.endDate && (
            <span className="text-[9px] text-muted-foreground">
              {formatTime(a.endDate)}
            </span>
          )}
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {a.title}
            </p>
            <Badge
              variant="outline"
              className={`shrink-0 text-[10px] ${typeMeta.badge}`}
            >
              <TypeIcon className="mr-1 h-3 w-3" />
              {typeMeta.label}
            </Badge>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            {showDate && (
              <span className="inline-flex items-center gap-0.5">
                <CalendarIcon className="h-3 w-3" />
                {formatShortDate(a.startDate)}
              </span>
            )}
            {a.customer && (
              <span className="inline-flex items-center gap-0.5">
                <User className="h-3 w-3" />
                <span className="truncate">{a.customer.name}</span>
              </span>
            )}
            {a.vehicleDesc && (
              <span className="inline-flex items-center gap-0.5">
                <Car className="h-3 w-3" />
                <span className="truncate">{a.vehicleDesc}</span>
              </span>
            )}
          </div>

          {!compact && (
            <div className="mt-2 flex items-center justify-between">
              <Badge
                variant="outline"
                className={`text-[10px] ${statusMeta.badge}`}
              >
                {statusMeta.label}
              </Badge>
              <span className="text-[10px] text-muted-foreground transition group-hover:text-orange-400">
                Ver detalhes →
              </span>
            </div>
          )}
          {compact && (
            <div className="mt-1">
              <Badge
                variant="outline"
                className={`text-[10px] ${statusMeta.badge}`}
              >
                {statusMeta.label}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// ============================================================================
// Appointment form (create / edit)
// ============================================================================
type AppointmentFormData = {
  title: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  customerId: string;
  vehicleDesc: string;
  notes: string;
};

function AppointmentFormDialog({
  open,
  onOpenChange,
  onSaved,
  appointment,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: (a: Appointment) => void;
  appointment?: Appointment | null;
  defaultDate?: Date | null;
}) {
  const [form, setForm] = useState<AppointmentFormData>({
    title: "",
    type: "service",
    status: "scheduled",
    startDate: "",
    endDate: "",
    customerId: "",
    vehicleDesc: "",
    notes: "",
  });
  const [customers, setCustomers] = useState<CustomerLite[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = !!appointment;

  // Load customers list for select
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoadingCustomers(true);
    fetch("/api/customers?take=200", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        if (json.error) throw new Error(json.error);
        setCustomers(json.data ?? []);
      })
      .catch(() => {
        if (mounted) setCustomers([]);
      })
      .finally(() => mounted && setLoadingCustomers(false));
    return () => {
      mounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (appointment) {
      setForm({
        title: appointment.title || "",
        type: appointment.type || "service",
        status: appointment.status || "scheduled",
        startDate: toLocalInputValue(appointment.startDate),
        endDate: toLocalInputValue(appointment.endDate),
        customerId: appointment.customerId || "",
        vehicleDesc: appointment.vehicleDesc || "",
        notes: appointment.notes || "",
      });
    } else {
      // Default: selected day at 09:00
      const base = defaultDate ? new Date(defaultDate) : new Date();
      base.setHours(9, 0, 0, 0);
      setForm({
        title: "",
        type: "service",
        status: "scheduled",
        startDate: toLocalInputValue(base),
        endDate: "",
        customerId: "",
        vehicleDesc: "",
        notes: "",
      });
    }
  }, [open, appointment, defaultDate]);

  const set = (k: keyof AppointmentFormData, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    if (!form.startDate) {
      toast.error("Data de início é obrigatória");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit
        ? `/api/appointments/${appointment!.id}`
        : "/api/appointments";
      const payload: any = {
        title: form.title.trim(),
        type: form.type,
        status: form.status,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate
          ? new Date(form.endDate).toISOString()
          : null,
        customerId: form.customerId || null,
        vehicleDesc: form.vehicleDesc.trim() || null,
        notes: form.notes.trim() || null,
      };
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onSaved?.(json.data);
      onOpenChange(false);
      toast.success(isEdit ? "Agendamento atualizado" : "Agendamento criado");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar agendamento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-premium sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-orange-400" />
            {isEdit ? "Editar agendamento" : "Novo agendamento"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados do agendamento."
              : "Programe um serviço, revisão, entrega ou manutenção."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título *" className="sm:col-span-2">
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex: Troca de óleo, Revisão 30 mil km..."
              className="border-border bg-background/50"
              autoFocus
            />
          </Field>

          <Field label="Tipo">
            <Select
              value={form.type}
              onValueChange={(v) => set("type", v)}
            >
              <SelectTrigger className="border-border bg-background/50">
                <SelectValue placeholder="Selecionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_META).map(([k, m]) => {
                  const Icon = m.icon;
                  return (
                    <SelectItem key={k} value={k}>
                      <span className="inline-flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        {m.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v)}
            >
              <SelectTrigger className="border-border bg-background/50">
                <SelectValue placeholder="Selecionar status..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_META).map(([k, m]) => (
                  <SelectItem key={k} value={k}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Início *">
            <Input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className="border-border bg-background/50"
            />
          </Field>

          <Field label="Término (opcional)">
            <Input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
              className="border-border bg-background/50"
            />
          </Field>

          <Field label="Cliente" className="sm:col-span-2">
            <Select
              value={form.customerId || "none"}
              onValueChange={(v) =>
                set("customerId", v === "none" ? "" : v)
              }
              disabled={loadingCustomers}
            >
              <SelectTrigger className="border-border bg-background/50">
                <SelectValue
                  placeholder={
                    loadingCustomers
                      ? "Carregando clientes..."
                      : "Selecionar cliente (opcional)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Sem cliente —</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.phone ? ` • ${c.phone}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Veículo (descrição)" className="sm:col-span-2">
            <div className="relative">
              <Car className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.vehicleDesc}
                onChange={(e) => set("vehicleDesc", e.target.value)}
                placeholder="Ex: Fiat Uno 2017 • ABC1D23"
                className="border-border bg-background/50 pl-9"
              />
            </div>
          </Field>

          <Field label="Observações" className="sm:col-span-2">
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Detalhes do serviço, peças, observações..."
              className="min-h-20 resize-y border-border bg-background/50"
            />
          </Field>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border"
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
            {isEdit ? "Salvar alterações" : "Criar agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

// ============================================================================
// Appointment detail panel
// ============================================================================
function AppointmentDetailPanel({
  appointment,
  open,
  onClose,
  onUpdated,
  onDeleted,
}: {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (a: Appointment) => void;
  onDeleted: (id: string) => void;
}) {
  // Local state mirrors the incoming appointment so quick edits (status changes)
  // can be reflected immediately. The panel is `key`ed by id in the parent,
  // so switching appointments causes a fresh mount with the latest prop.
  const [local, setLocal] = useState<Appointment | null>(appointment);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    setLocal(appointment);
  }, [appointment]);

  const handleDelete = async () => {
    if (!local) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/appointments/${local.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onDeleted(local.id);
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao excluir agendamento");
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickStatus = async (newStatus: string) => {
    if (!local) return;
    if (local.status === newStatus) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/appointments/${local.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setLocal(json.data);
      onUpdated(json.data);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao atualizar status");
    } finally {
      setSavingStatus(false);
    }
  };

  const content = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-gradient-navy p-5">
        {!local ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold text-foreground">
                {local.title}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(local.startDate)}
                {local.endDate && ` → ${formatTime(local.endDate)}`}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 border-border"
                onClick={() => setEditOpen(true)}
                aria-label="Editar"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => setDeleteOpen(true)}
                aria-label="Excluir"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scrollbar-premium p-5">
        {!local ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Badges */}
            <section className="flex flex-wrap items-center gap-2">
              {(() => {
                const m = TYPE_META[local.type] ?? TYPE_META.service;
                const Icon = m.icon;
                return (
                  <Badge
                    variant="outline"
                    className={`text-xs ${m.badge}`}
                  >
                    <Icon className="mr-1 h-3 w-3" />
                    {m.label}
                  </Badge>
                );
              })()}
              {(() => {
                const m =
                  STATUS_META[local.status] ?? STATUS_META.scheduled;
                return (
                  <Badge
                    variant="outline"
                    className={`text-xs ${m.badge}`}
                  >
                    {m.label}
                  </Badge>
                );
              })()}
            </section>

            {/* Quick status change */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Alterar status
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(STATUS_META).map(([k, m]) => {
                  const active = local.status === k;
                  return (
                    <Button
                      key={k}
                      size="sm"
                      variant={active ? "default" : "outline"}
                      onClick={() => handleQuickStatus(k)}
                      disabled={active || savingStatus}
                      className={[
                        "h-8 px-2.5 text-[11px]",
                        active
                          ? "gradient-orange text-primary-foreground glow-orange"
                          : "border-border",
                      ].join(" ")}
                    >
                      {m.label}
                    </Button>
                  );
                })}
              </div>
            </section>

            {/* Date info */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quando
              </h3>
              <div className="grid gap-2 rounded-xl border border-border bg-background/40 p-3 text-xs">
                <InfoRow
                  icon={<CalendarDays className="h-3.5 w-3.5" />}
                  label="Início"
                  value={formatDate(local.startDate)}
                />
                {local.endDate && (
                  <InfoRow
                    icon={<Clock className="h-3.5 w-3.5" />}
                    label="Término"
                    value={formatDate(local.endDate)}
                  />
                )}
                <InfoRow
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Duração"
                  value={
                    local.endDate
                      ? formatTimeRange(
                          local.startDate,
                          local.endDate
                        )
                      : "—"
                  }
                />
              </div>
            </section>

            {/* Customer info */}
            {local.customer && (
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cliente
                </h3>
                <div className="grid gap-2 rounded-xl border border-border bg-background/40 p-3 text-xs">
                  <InfoRow
                    icon={<User className="h-3.5 w-3.5" />}
                    label="Nome"
                    value={local.customer.name}
                  />
                  {local.customer.phone && (
                    <InfoRow
                      icon={<Phone className="h-3.5 w-3.5" />}
                      label="Telefone"
                      value={local.customer.phone}
                    />
                  )}
                </div>
              </section>
            )}

            {local.vehicleDesc && (
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Veículo
                </h3>
                <div className="rounded-xl border border-border bg-background/40 p-3 text-xs">
                  <InfoRow
                    icon={<Car className="h-3.5 w-3.5" />}
                    label="Descrição"
                    value={local.vehicleDesc}
                  />
                </div>
              </section>
            )}

            {local.notes && (
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Observações
                </h3>
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3 text-xs">
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {local.notes}
                  </p>
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      {local?.customer && (
        <div className="border-t border-border bg-card/50 p-3">
          <div className="flex items-center gap-2">
            {local.customer.phone && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1 border-border"
              >
                <a href={`tel:${local.customer.phone}`}>
                  <Phone className="h-3.5 w-3.5" /> Ligar
                </a>
              </Button>
            )}
            {local.customer.whatsapp && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1 border-emerald-500/30 text-emerald-400"
              >
                <a
                  href={`https://wa.me/55${local.customer.whatsapp.replace(
                    /\D/g,
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      )}

      {local && (
        <AppointmentFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          appointment={local}
          onSaved={(a) => {
            setLocal(a);
            onUpdated(a);
          }}
        />
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agendamento{" "}
              <span className="font-medium text-foreground">
                {local?.title}
              </span>{" "}
              será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => !o && onClose()}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md lg:max-w-xl"
      >
        {content}
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-orange-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-foreground">{value}</p>
      </div>
    </div>
  );
}
