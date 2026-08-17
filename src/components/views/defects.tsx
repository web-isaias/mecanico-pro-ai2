"use client";
import { useState, useEffect, useCallback } from "react";
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
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ViewHeader,
  SectionCard,
  EmptyState,
} from "@/components/shared/view-parts";
import {
  Database,
  Search,
  Plus,
  ThumbsUp,
  Wrench,
  Clock,
  Car,
  Lightbulb,
  AlertTriangle,
  Pencil,
  Trash2,
  Loader2,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  User,
  Stethoscope,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatDate, formatShortDate } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================
type Defect = {
  id: string;
  author: string;
  vehicleDesc: string;
  symptom: string;
  diagnosis: string;
  solution: string;
  photos?: string | null;
  repairTime?: string | null;
  difficulty: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
};

type DifficultyKey = "easy" | "medium" | "hard";

type DefectFormData = {
  author: string;
  vehicleDesc: string;
  symptom: string;
  diagnosis: string;
  solution: string;
  repairTime: string;
  difficulty: string;
  photos: string; // comma-separated URLs
};

// ============================================================================
// Constants
// ============================================================================
const DIFFICULTY_META: Record<
  DifficultyKey,
  { label: string; badge: string; dot: string }
> = {
  easy: {
    label: "Fácil",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  medium: {
    label: "Médio",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
  },
  hard: {
    label: "Difícil",
    badge: "border-red-500/30 bg-red-500/10 text-red-300",
    dot: "bg-red-400",
  },
};

function difficultyMeta(d: string) {
  return (
    DIFFICULTY_META[d as DifficultyKey] ?? DIFFICULTY_META.medium
  );
}

const EMPTY_FORM: DefectFormData = {
  author: "",
  vehicleDesc: "",
  symptom: "",
  diagnosis: "",
  solution: "",
  repairTime: "",
  difficulty: "medium",
  photos: "",
};

// ============================================================================
// Helpers
// ============================================================================
function parsePhotos(photos?: string | null): string[] {
  if (!photos) return [];
  try {
    const parsed = JSON.parse(photos);
    if (Array.isArray(parsed)) {
      return parsed.filter((p) => typeof p === "string" && p.trim());
    }
  } catch {
    // ignore
  }
  return [];
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function summarize(text: string, max = 120): string {
  const t = (text || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "…";
}

// ============================================================================
// Main component
// ============================================================================
export function Defects() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | DifficultyKey>(
    "all"
  );
  const [sort, setSort] = useState<"recent" | "liked">("recent");
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [likingId, setLikingId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (difficultyFilter !== "all")
        params.set("difficulty", difficultyFilter);
      params.set("sort", sort);
      const qs = params.toString();
      const url = `/api/defects${qs ? `?${qs}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setDefects((json.data ?? []) as Defect[]);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao carregar defeitos");
      setDefects([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, difficultyFilter, sort]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleCreated = (defect: Defect) => {
    setDefects((prev) =>
      sort === "liked"
        ? [defect, ...prev].sort((a, b) => b.likes - a.likes)
        : [defect, ...prev]
    );
    setCreateOpen(false);
    toast.success("Defeito compartilhado com a comunidade");
  };

  const handleUpdated = (updated: Defect) => {
    setDefects((prev) =>
      prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d))
    );
    if (selectedId === updated.id) {
      setSelectedId(null);
      setTimeout(() => setSelectedId(updated.id), 50);
    }
  };

  const handleDeleted = (id: string) => {
    setDefects((prev) => prev.filter((d) => d.id !== id));
    setSelectedId(null);
    toast.success("Defeito removido");
  };

  const handleLike = async (id: string) => {
    if (likingId) return;
    setLikingId(id);
    // Optimistic update
    setDefects((prev) =>
      prev.map((d) => (d.id === id ? { ...d, likes: d.likes + 1 } : d))
    );
    try {
      const res = await fetch(`/api/defects/${id}/like`, { method: "POST" });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      // Reconcile with server value
      const finalLikes = json.data?.likes;
      if (typeof finalLikes === "number") {
        setDefects((prev) =>
          prev.map((d) => (d.id === id ? { ...d, likes: finalLikes } : d))
        );
      }
      toast.success("Obrigado por curtir!");
    } catch (err: any) {
      // Rollback
      setDefects((prev) =>
        prev.map((d) => (d.id === id ? { ...d, likes: Math.max(0, d.likes - 1) } : d))
      );
      toast.error(err?.message || "Erro ao curtir");
    } finally {
      setLikingId(null);
    }
  };

  const selected = selectedId
    ? defects.find((d) => d.id === selectedId) ?? null
    : null;

  return (
    <div>
      <ViewHeader
        title="Banco de Defeitos"
        description="Base colaborativa de diagnósticos e soluções da comunidade."
        icon={<Database className="h-5 w-5" />}
        accent="orange"
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="gradient-orange text-primary-foreground glow-orange"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Compartilhar defeito</span>
            <span className="sm:hidden">Compartilhar</span>
          </Button>
        }
      />

      {/* Search + filters + sort */}
      <SectionCard className="mb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por veículo, sintoma, diagnóstico..."
            className="h-10 rounded-xl border-border bg-background/50 pl-9"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Difficulty chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <FilterChip
              active={difficultyFilter === "all"}
              onClick={() => setDifficultyFilter("all")}
              label="Todos"
            />
            <FilterChip
              active={difficultyFilter === "easy"}
              onClick={() => setDifficultyFilter("easy")}
              label="Fácil"
              dot="bg-emerald-400"
            />
            <FilterChip
              active={difficultyFilter === "medium"}
              onClick={() => setDifficultyFilter("medium")}
              label="Médio"
              dot="bg-amber-400"
            />
            <FilterChip
              active={difficultyFilter === "hard"}
              onClick={() => setDifficultyFilter("hard")}
              label="Difícil"
              dot="bg-red-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5 rounded-lg border border-border bg-background/40 p-0.5">
            <SortToggle
              active={sort === "recent"}
              onClick={() => setSort("recent")}
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Recentes"
            />
            <SortToggle
              active={sort === "liked"}
              onClick={() => setSort("liked")}
              icon={<ThumbsUp className="h-3.5 w-3.5" />}
              label="Curtidos"
            />
          </div>
        </div>

        {!loading && (
          <p className="mt-2 text-xs text-muted-foreground">
            {defects.length} defeito{defects.length === 1 ? "" : "s"}
            {debouncedQuery ? ` para "${debouncedQuery}"` : ""}
            {difficultyFilter !== "all"
              ? ` • ${difficultyMeta(difficultyFilter).label.toLowerCase()}`
              : ""}
          </p>
        )}
      </SectionCard>

      {/* List */}
      {loading ? (
        <SectionCard>
          <div className="grid gap-3 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <DefectCardSkeleton key={i} />
            ))}
          </div>
        </SectionCard>
      ) : defects.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={<Database className="h-10 w-10 opacity-40" />}
            title={
              debouncedQuery || difficultyFilter !== "all"
                ? "Nenhum defeito encontrado"
                : "Banco de defeitos vazio"
            }
            description={
              debouncedQuery || difficultyFilter !== "all"
                ? "Tente outro termo de busca ou ajuste os filtros."
                : "Compartilhe o primeiro diagnóstico com a comunidade e ajude outros mecânicos."
            }
            action={
              !debouncedQuery &&
              difficultyFilter === "all" && (
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="gradient-orange text-primary-foreground glow-orange"
                  size="sm"
                >
                  <Plus className="h-4 w-4" /> Compartilhar defeito
                </Button>
              )
            }
          />
        </SectionCard>
      ) : (
        <SectionCard className="p-0 sm:p-0">
          <div className="grid gap-3 p-4 lg:grid-cols-2 sm:p-5">
            {defects.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
              >
                <DefectCard
                  defect={d}
                  onOpen={() => setSelectedId(d.id)}
                  onLike={() => handleLike(d.id)}
                  liking={likingId === d.id}
                />
              </motion.div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Create dialog */}
      <DefectFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={handleCreated}
      />

      {/* Detail sheet */}
      <DefectDetailSheet
        defect={selected}
        open={!!selectedId}
        onOpenChange={(o) => !o && setSelectedId(null)}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
        onLike={(id) => handleLike(id)}
        liking={!!likingId && selectedId === likingId}
      />
    </div>
  );
}

// ============================================================================
// Filter chip + sort toggle
// ============================================================================
function FilterChip({
  active,
  onClick,
  label,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition",
        active
          ? "border-orange-500/40 bg-orange-500/15 text-orange-300"
          : "border-border bg-background/40 text-muted-foreground hover:border-orange-500/30 hover:text-foreground"
      )}
    >
      {dot && <span className={cn("h-2 w-2 rounded-full", dot)} />}
      {label}
    </button>
  );
}

function SortToggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition",
        active
          ? "bg-orange-500/15 text-orange-300"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ============================================================================
// Defect card (list item)
// ============================================================================
function DefectCard({
  defect,
  onOpen,
  onLike,
  liking,
}: {
  defect: Defect;
  onOpen: () => void;
  onLike: () => void;
  liking: boolean;
}) {
  const [diagOpen, setDiagOpen] = useState(false);
  const [solOpen, setSolOpen] = useState(false);
  const diff = difficultyMeta(defect.difficulty);

  return (
    <article
      onClick={onOpen}
      className="card-premium group flex h-full cursor-pointer flex-col gap-3 rounded-2xl border border-border bg-card/50 p-4 text-left backdrop-blur-sm sm:p-5"
    >
      {/* Header: author + date */}
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-300">
          {getInitials(defect.author || "Anônimo")}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {defect.author || "Anônimo"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {formatShortDate(defect.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant="outline"
            className={cn("gap-1 text-[10px]", diff.badge)}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", diff.dot)} />
            {diff.label}
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:text-orange-400" />
        </div>
      </div>

      {/* Vehicle badge */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="gap-1 border-orange-500/30 bg-orange-500/10 text-[11px] font-medium text-orange-300"
        >
          <Car className="h-3 w-3" />
          <span className="truncate">{defect.vehicleDesc}</span>
        </Badge>
        {defect.repairTime && (
          <Badge
            variant="outline"
            className="gap-1 border-border bg-background/40 text-[10px] text-muted-foreground"
          >
            <Clock className="h-3 w-3" />
            <span className="truncate max-w-[10rem]">{defect.repairTime}</span>
          </Badge>
        )}
      </div>

      {/* Symptom (prominent) */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
        <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
          <AlertTriangle className="h-3 w-3" />
          Sintoma
        </p>
        <p className="text-sm text-foreground">
          {summarize(defect.symptom, 200)}
        </p>
      </div>

      {/* Diagnosis (collapsible) */}
      <Collapsible
        open={diagOpen}
        onOpenChange={setDiagOpen}
        className="rounded-lg border border-border bg-background/40"
      >
        <CollapsibleTrigger
          onClick={(e: any) => e.stopPropagation()}
          className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Stethoscope className="h-3.5 w-3.5 text-blue-300" />
            Diagnóstico
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition",
              diagOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border px-3 py-2">
            <p className="whitespace-pre-wrap text-xs text-foreground/90">
              {defect.diagnosis}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Solution (collapsible) */}
      <Collapsible
        open={solOpen}
        onOpenChange={setSolOpen}
        className="rounded-lg border border-emerald-500/20 bg-emerald-500/5"
      >
        <CollapsibleTrigger
          onClick={(e: any) => e.stopPropagation()}
          className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
        >
          <span className="flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" />
            Solução
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition",
              solOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-emerald-500/20 px-3 py-2">
            <p className="whitespace-pre-wrap text-xs text-foreground/90">
              {defect.solution}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Footer: likes */}
      <div className="mt-auto flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          disabled={liking}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
            "border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20",
            liking && "opacity-60"
          )}
        >
          {liking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ThumbsUp className="h-3.5 w-3.5" />
          )}
          {defect.likes} {defect.likes === 1 ? "curtida" : "curtidas"}
        </button>
        <span className="text-[10px] text-muted-foreground">
          Ver detalhes
        </span>
      </div>
    </article>
  );
}

// ============================================================================
// Card skeleton
// ============================================================================
function DefectCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-2.5 w-1/3" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-5 w-1/2 rounded-full" />
      <Skeleton className="mt-3 h-16 w-full rounded-xl" />
      <Skeleton className="mt-3 h-8 w-full rounded-lg" />
      <Skeleton className="mt-2 h-8 w-full rounded-lg" />
    </div>
  );
}

// ============================================================================
// Create / edit form dialog
// ============================================================================
function DefectFormDialog({
  open,
  onOpenChange,
  onSaved,
  defect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: (d: Defect) => void;
  defect?: Defect | null;
}) {
  const [form, setForm] = useState<DefectFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const isEdit = !!defect;

  useEffect(() => {
    if (open) {
      if (defect) {
        setForm({
          author: defect.author || "",
          vehicleDesc: defect.vehicleDesc || "",
          symptom: defect.symptom || "",
          diagnosis: defect.diagnosis || "",
          solution: defect.solution || "",
          repairTime: defect.repairTime || "",
          difficulty: defect.difficulty || "medium",
          photos: parsePhotos(defect.photos).join(", "),
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, defect]);

  const set = (k: keyof DefectFormData, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
    if (!form.vehicleDesc.trim()) {
      toast.error("Descrição do veículo é obrigatória");
      return;
    }
    if (!form.symptom.trim()) {
      toast.error("Sintoma é obrigatório");
      return;
    }
    if (!form.diagnosis.trim()) {
      toast.error("Diagnóstico é obrigatório");
      return;
    }
    if (!form.solution.trim()) {
      toast.error("Solução é obrigatória");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit ? `/api/defects/${defect!.id}` : "/api/defects";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onSaved?.(json.data);
      onOpenChange(false);
      toast.success(isEdit ? "Defeito atualizado" : "Defeito compartilhado");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar defeito");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-premium sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-orange-400" />
            {isEdit ? "Editar defeito" : "Compartilhar defeito"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados do registro. Campos com * são obrigatórios."
              : "Ajude a comunidade: compartilhe um diagnóstico que você resolveu. Campos com * são obrigatórios."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Autor (opcional)" className="sm:col-span-2">
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="Anônimo (deixe em branco se preferir)"
                className="border-border bg-background/50 pl-9"
              />
            </div>
          </Field>

          <Field label="Veículo *" className="sm:col-span-2">
            <div className="relative">
              <Car className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.vehicleDesc}
                onChange={(e) => set("vehicleDesc", e.target.value)}
                placeholder="Ex.: Fiat Uno 1.0 2015, motor Firefly"
                className="border-border bg-background/50 pl-9"
                autoFocus
              />
            </div>
          </Field>

          <Field label="Sintoma *" className="sm:col-span-2">
            <Textarea
              value={form.symptom}
              onChange={(e) => set("symptom", e.target.value)}
              placeholder="Ex.: Motor falhando em alta rotação, luz da injeção acendendo..."
              className="min-h-20 resize-y border-border bg-background/50"
            />
          </Field>

          <Field label="Diagnóstico *" className="sm:col-span-2">
            <Textarea
              value={form.diagnosis}
              onChange={(e) => set("diagnosis", e.target.value)}
              placeholder="Ex.: Scanner mostrou código P0301 (falha no cilindro 1); vela/bobina testadas..."
              className="min-h-24 resize-y border-border bg-background/50"
            />
          </Field>

          <Field label="Solução *" className="sm:col-span-2">
            <Textarea
              value={form.solution}
              onChange={(e) => set("solution", e.target.value)}
              placeholder="Ex.: Troca de bobina de ignição do cilindro 1; limpeza de bicos..."
              className="min-h-24 resize-y border-border bg-background/50"
            />
          </Field>

          <Field label="Tempo de reparo">
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.repairTime}
                onChange={(e) => set("repairTime", e.target.value)}
                placeholder="Ex.: 2 horas, 1 dia"
                className="border-border bg-background/50 pl-9"
              />
            </div>
          </Field>

          <Field label="Dificuldade">
            <Select
              value={form.difficulty || "medium"}
              onValueChange={(v) => set("difficulty", v)}
            >
              <SelectTrigger className="border-border bg-background/50">
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Fotos (URLs separadas por vírgula)" className="sm:col-span-2">
            <div className="relative">
              <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.photos}
                onChange={(e) => set("photos", e.target.value)}
                placeholder="https://...jpg, https://...png (opcional)"
                className="border-border bg-background/50 pl-9"
              />
            </div>
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
            {isEdit ? "Salvar alterações" : "Compartilhar"}
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
// Detail sheet
// ============================================================================
function DefectDetailSheet({
  defect,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
  onLike,
  liking,
}: {
  defect: Defect | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdated: (d: Defect) => void;
  onDeleted: (id: string) => void;
  onLike: (id: string) => void;
  liking: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset child dialogs whenever the sheet closes / defect changes
  useEffect(() => {
    if (!open) {
      setEditOpen(false);
      setDeleteOpen(false);
    }
  }, [open]);

  const handleDelete = async () => {
    if (!defect) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/defects/${defect.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onDeleted(defect.id);
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao excluir defeito");
    } finally {
      setDeleting(false);
    }
  };

  const content = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-gradient-navy p-5">
        {!defect ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-base font-bold text-blue-300">
              {getInitials(defect.author || "Anônimo")}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold text-foreground">
                {defect.author || "Anônimo"}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Compartilhado em {formatDate(defect.createdAt)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1",
                    difficultyMeta(defect.difficulty).badge
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      difficultyMeta(defect.difficulty).dot
                    )}
                  />
                  {difficultyMeta(defect.difficulty).label}
                </Badge>
                {defect.repairTime && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-border text-[10px] text-muted-foreground"
                  >
                    <Clock className="h-3 w-3" />
                    {defect.repairTime}
                  </Badge>
                )}
              </div>
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
        {!defect ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Vehicle */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Veículo
              </h3>
              <div className="flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/5 p-3 text-sm">
                <Car className="h-4 w-4 shrink-0 text-orange-400" />
                <span className="font-medium text-foreground">
                  {defect.vehicleDesc}
                </span>
              </div>
            </section>

            {/* Symptom */}
            <section className="space-y-2">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                Sintoma
              </h3>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
                <p className="whitespace-pre-wrap text-foreground">
                  {defect.symptom}
                </p>
              </div>
            </section>

            {/* Diagnosis */}
            <section className="space-y-2">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-300">
                <Stethoscope className="h-3.5 w-3.5" />
                Diagnóstico
              </h3>
              <div className="rounded-xl border border-border bg-background/40 p-3 text-sm">
                <p className="whitespace-pre-wrap text-foreground/90">
                  {defect.diagnosis}
                </p>
              </div>
            </section>

            {/* Solution */}
            <section className="space-y-2">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                <Lightbulb className="h-3.5 w-3.5" />
                Solução
              </h3>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                <p className="whitespace-pre-wrap text-foreground/90">
                  {defect.solution}
                </p>
              </div>
            </section>

            {/* Photos */}
            {parsePhotos(defect.photos).length > 0 && (
              <section className="space-y-2">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Fotos ({parsePhotos(defect.photos).length})
                </h3>
                <div className="max-h-64 space-y-2 overflow-y-auto scrollbar-premium pr-1">
                  <div className="grid grid-cols-2 gap-2">
                    {parsePhotos(defect.photos).map((src, idx) => (
                      <a
                        key={idx}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-lg border border-border bg-background/40"
                      >
                        <img
                          src={src}
                          alt={`Foto ${idx + 1}`}
                          className="h-32 w-full object-cover transition hover:opacity-80"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Meta */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Informações
              </h3>
              <div className="grid gap-2 rounded-xl border border-border bg-background/40 p-3 text-xs">
                <InfoRow
                  icon={<Wrench className="h-3.5 w-3.5" />}
                  label="Dificuldade"
                  value={difficultyMeta(defect.difficulty).label}
                />
                {defect.repairTime && (
                  <InfoRow
                    icon={<Clock className="h-3.5 w-3.5" />}
                    label="Tempo de reparo"
                    value={defect.repairTime}
                  />
                )}
                <InfoRow
                  icon={<ThumbsUp className="h-3.5 w-3.5" />}
                  label="Curtidas"
                  value={`${defect.likes}`}
                />
                <InfoRow
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Atualizado em"
                  value={formatDate(defect.updatedAt)}
                />
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Footer: like */}
      {defect && (
        <div className="border-t border-border bg-card/50 p-3">
          <Button
            onClick={() => onLike(defect.id)}
            disabled={liking}
            className="w-full gradient-orange text-primary-foreground glow-orange"
          >
            {liking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp className="h-4 w-4" />
            )}
            Curtir ({defect.likes})
          </Button>
        </div>
      )}

      {/* Edit dialog */}
      {defect && (
        <DefectFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          defect={defect}
          onSaved={(d) => onUpdated(d)}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir defeito?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro será removido
              permanentemente do banco de defeitos.
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
    <Sheet open={open} onOpenChange={onOpenChange}>
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
