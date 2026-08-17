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
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  IdCard,
  MapPin,
  Car,
  Wrench,
  FileText,
  CalendarClock,
  Pencil,
  Trash2,
  Loader2,
  Plus,
  MessageCircle,
  ChevronRight,
  History,
  Gauge,
  Fuel,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatCurrency, formatShortDate, formatDate } from "@/lib/nav-config";

// ============================================================================
// Types
// ============================================================================
type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year?: number | null;
  fuel?: string | null;
  engine?: string | null;
  engineCode?: string | null;
  chassis?: string | null;
  plate?: string | null;
  mileage: number;
  nextService?: string | null;
  notes?: string | null;
  createdAt: string;
};

type ServiceOrder = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  totalCost: number;
  scheduledAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  vehicle?: { id: string; brand: string; model: string; plate?: string | null } | null;
};

type Quote = {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
};

type Appointment = {
  id: string;
  title: string;
  type: string;
  status: string;
  startDate: string;
};

type CustomerListItem = {
  id: string;
  name: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  document?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  vehicles: Vehicle[];
  _count?: { services: number; quotes: number; appointments: number };
};

type CustomerDetail = CustomerListItem & {
  services: ServiceOrder[];
  quotes: Quote[];
  appointments: Appointment[];
};

// ============================================================================
// Helpers
// ============================================================================
function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function maskPlate(plate?: string | null): string {
  return (plate || "-").toUpperCase();
}

function formatMileage(km: number): string {
  if (!km) return "0 km";
  return `${km.toLocaleString("pt-BR")} km`;
}

// ============================================================================
// Main component
// ============================================================================
export function Customers() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/customers${debouncedQuery ? `?q=${encodeURIComponent(debouncedQuery)}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setCustomers(json.data ?? []);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao carregar clientes");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleCreated = (customer: CustomerListItem) => {
    setCustomers((prev) => [customer, ...prev]);
    setCreateOpen(false);
    toast.success("Cliente cadastrado com sucesso");
  };

  const handleUpdated = (updated: CustomerListItem) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
    );
    // Refresh detail if it's the open one
    if (selectedId === updated.id) {
      // detail will be re-fetched by the DetailPanel via key change
      setSelectedId(null);
      setTimeout(() => setSelectedId(updated.id), 50);
    }
  };

  const handleDeleted = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setSelectedId(null);
    toast.success("Cliente excluído");
  };

  return (
    <div>
      <ViewHeader
        title="Cadastro de Clientes"
        description="Gerencie clientes, veículos e histórico de serviços."
        icon={<Users className="h-5 w-5" />}
        accent="orange"
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="gradient-orange text-primary-foreground glow-orange"
            size="sm"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo cliente</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        }
      />

      {/* Search bar */}
      <SectionCard className="mb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, telefone, CPF/CNPJ ou e-mail..."
            className="h-10 rounded-xl border-border bg-background/50 pl-9"
          />
        </div>
        {!loading && (
          <p className="mt-2 text-xs text-muted-foreground">
            {customers.length} cliente{customers.length === 1 ? "" : "s"}
            {debouncedQuery ? ` para "${debouncedQuery}"` : ""}
          </p>
        )}
      </SectionCard>

      {/* Customer list */}
      {loading ? (
        <SectionCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CustomerCardSkeleton key={i} />
            ))}
          </div>
        </SectionCard>
      ) : customers.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={<Users className="h-10 w-10 opacity-40" />}
            title={debouncedQuery ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            description={
              debouncedQuery
                ? "Tente outro termo de busca."
                : "Comece cadastrando seu primeiro cliente."
            }
            action={
              !debouncedQuery && (
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="gradient-orange text-primary-foreground glow-orange"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4" /> Novo cliente
                </Button>
              )
            }
          />
        </SectionCard>
      ) : (
        <SectionCard className="p-0 sm:p-0">
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
            {customers.map((c, i) => (
              <motion.button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.2) }}
                whileHover={{ y: -2 }}
                className="card-premium group flex flex-col gap-3 rounded-2xl border border-border bg-card/50 p-4 text-left backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-orange text-sm font-bold text-primary-foreground">
                    {getInitials(c.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {c.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {c.phone || "Sem telefone"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-orange-400" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1 rounded-md bg-background/40 px-2 py-1">
                    <IdCard className="h-3 w-3 text-blue-300" />
                    <span className="truncate text-muted-foreground">
                      {c.document || "Sem CPF"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 rounded-md bg-background/40 px-2 py-1">
                    <Car className="h-3 w-3 text-orange-400" />
                    <span className="text-muted-foreground">
                      {c.vehicles.length} veíc.
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="border-border text-[10px] font-normal text-muted-foreground"
                  >
                    <Wrench className="mr-0.5 h-3 w-3" />
                    {c._count?.services ?? 0} OS
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border text-[10px] font-normal text-muted-foreground"
                  >
                    <FileText className="mr-0.5 h-3 w-3" />
                    {c._count?.quotes ?? 0} orç.
                  </Badge>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {formatShortDate(c.createdAt)}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Create dialog */}
      <CustomerFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={handleCreated}
      />

      {/* Detail panel */}
      <CustomerDetailPanel
        customerId={selectedId}
        onClose={() => setSelectedId(null)}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

// ============================================================================
// Customer card skeleton
// ============================================================================
function CustomerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-14" />
      </div>
    </div>
  );
}

// ============================================================================
// Customer form (create / edit)
// ============================================================================
type CustomerFormData = {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  document: string;
  address: string;
  notes: string;
};

const emptyForm: CustomerFormData = {
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  document: "",
  address: "",
  notes: "",
};

function CustomerFormDialog({
  open,
  onOpenChange,
  onSaved,
  customer,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: (c: CustomerListItem) => void;
  customer?: CustomerListItem | null;
}) {
  const [form, setForm] = useState<CustomerFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!customer;

  useEffect(() => {
    if (open) {
      setForm(
        customer
          ? {
              name: customer.name || "",
              phone: customer.phone || "",
              whatsapp: customer.whatsapp || "",
              email: customer.email || "",
              document: customer.document || "",
              address: customer.address || "",
              notes: customer.notes || "",
            }
          : emptyForm
      );
    }
  }, [open, customer]);

  const set = (k: keyof CustomerFormData, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Telefone é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit
        ? `/api/customers/${customer!.id}`
        : "/api/customers";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onSaved?.(json.data);
      onOpenChange(false);
      toast.success(isEdit ? "Cliente atualizado" : "Cliente cadastrado");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar cliente");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-premium sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-orange-400" />
            {isEdit ? "Editar cliente" : "Novo cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados do cliente. Campos com * são obrigatórios."
              : "Preencha os dados do cliente. Campos com * são obrigatórios."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome *" className="sm:col-span-2">
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Nome completo ou razão social"
              className="border-border bg-background/50"
              autoFocus
            />
          </Field>

          <Field label="Telefone *">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="(11) 99999-9999"
                className="border-border bg-background/50 pl-9"
              />
            </div>
          </Field>

          <Field label="WhatsApp">
            <div className="relative">
              <MessageCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="Mesmo do telefone ou outro"
                className="border-border bg-background/50 pl-9"
              />
            </div>
          </Field>

          <Field label="E-mail">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="cliente@email.com"
                type="email"
                className="border-border bg-background/50 pl-9"
              />
            </div>
          </Field>

          <Field label="CPF / CNPJ">
            <div className="relative">
              <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.document}
                onChange={(e) => set("document", e.target.value)}
                placeholder="000.000.000-00"
                className="border-border bg-background/50 pl-9"
              />
            </div>
          </Field>

          <Field label="Endereço" className="sm:col-span-2">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Rua, número, bairro, cidade"
                className="border-border bg-background/50 pl-9"
              />
            </div>
          </Field>

          <Field label="Observações" className="sm:col-span-2">
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Preferências, histórico, alertas..."
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
            {isEdit ? "Salvar alterações" : "Cadastrar cliente"}
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
// Vehicle form (inline, for adding inside detail panel)
// ============================================================================
type VehicleFormData = {
  brand: string;
  model: string;
  year: string;
  fuel: string;
  engine: string;
  plate: string;
  mileage: string;
};

const emptyVehicle: VehicleFormData = {
  brand: "",
  model: "",
  year: "",
  fuel: "",
  engine: "",
  plate: "",
  mileage: "",
};

function VehicleForm({
  onSave,
}: {
  onSave: (v: VehicleFormData) => Promise<void>;
}) {
  const [form, setForm] = useState<VehicleFormData>(emptyVehicle);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  const set = (k: keyof VehicleFormData, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
    if (!form.brand.trim() && !form.model.trim() && !form.plate.trim()) {
      toast.error("Informe marca, modelo ou placa do veículo");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      setForm(emptyVehicle);
      setShow(false);
    } finally {
      setSaving(false);
    }
  };

  if (!show) {
    return (
      <Button
        onClick={() => setShow(true)}
        variant="outline"
        size="sm"
        className="w-full border-dashed border-border text-muted-foreground hover:text-orange-400"
      >
        <Plus className="h-4 w-4" /> Adicionar veículo
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-background/40 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Marca *">
          <Input
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
            placeholder="Chevrolet, Toyota..."
            className="border-border bg-background/50"
          />
        </Field>
        <Field label="Modelo *">
          <Input
            value={form.model}
            onChange={(e) => set("model", e.target.value)}
            placeholder="Onix, Corolla..."
            className="border-border bg-background/50"
          />
        </Field>
        <Field label="Ano">
          <Input
            value={form.year}
            onChange={(e) => set("year", e.target.value)}
            placeholder="2020"
            inputMode="numeric"
            className="border-border bg-background/50"
          />
        </Field>
        <Field label="Placa">
          <Input
            value={form.plate}
            onChange={(e) => set("plate", e.target.value.toUpperCase())}
            placeholder="ABC1D23"
            className="border-border bg-background/50 uppercase"
          />
        </Field>
        <Field label="Combustível">
          <Select value={form.fuel || "none"} onValueChange={(v) => set("fuel", v === "none" ? "" : v)}>
            <SelectTrigger className="border-border bg-background/50">
              <SelectValue placeholder="Selecionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              <SelectItem value="Flex">Flex</SelectItem>
              <SelectItem value="Gasolina">Gasolina</SelectItem>
              <SelectItem value="Etanol">Etanol</SelectItem>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="Híbrido">Híbrido</SelectItem>
              <SelectItem value="Elétrico">Elétrico</SelectItem>
              <SelectItem value="GNV">GNV</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Motor">
          <Input
            value={form.engine}
            onChange={(e) => set("engine", e.target.value)}
            placeholder="1.4 8V, 1.0 Turbo..."
            className="border-border bg-background/50"
          />
        </Field>
        <Field label="Quilometragem" className="sm:col-span-2">
          <Input
            value={form.mileage}
            onChange={(e) => set("mileage", e.target.value)}
            placeholder="0"
            inputMode="numeric"
            className="border-border bg-background/50"
          />
        </Field>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setForm(emptyVehicle);
            setShow(false);
          }}
          className="border-border"
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          onClick={submit}
          size="sm"
          disabled={saving}
          className="gradient-orange text-primary-foreground glow-orange"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar veículo
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Detail panel (Sheet on mobile, side dialog on desktop)
// ============================================================================
function CustomerDetailPanel({
  customerId,
  onClose,
  onUpdated,
  onDeleted,
}: {
  customerId: string | null;
  onClose: () => void;
  onUpdated: (c: CustomerListItem) => void;
  onDeleted: (id: string) => void;
}) {
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!customerId) {
      setDetail(null);
      return;
    }
    let mounted = true;
    setLoading(true);
    setDetail(null);
    fetch(`/api/customers/${customerId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        if (json.error) throw new Error(json.error);
        setDetail(json.data);
      })
      .catch((err) => {
        if (mounted) toast.error(err?.message || "Erro ao carregar cliente");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [customerId]);

  const handleAddVehicle = async (v: VehicleFormData) => {
    if (!customerId) return;
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: detail?.name,
          phone: detail?.phone,
          whatsapp: detail?.whatsapp,
          email: detail?.email,
          document: detail?.document,
          address: detail?.address,
          notes: detail?.notes,
          newVehicle: v,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setDetail(json.data);
      onUpdated(json.data);
      toast.success("Veículo adicionado");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao adicionar veículo");
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!customerId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onDeleted(customerId);
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao excluir cliente");
    } finally {
      setDeleting(false);
    }
  };

  const content = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-gradient-navy p-5">
        {loading || !detail ? (
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
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-orange text-base font-bold text-primary-foreground">
              {getInitials(detail.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold text-foreground">
                {detail.name}
              </h2>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {detail.phone && (
                  <a
                    href={`tel:${detail.phone}`}
                    className="inline-flex items-center gap-1 hover:text-orange-400"
                  >
                    <Phone className="h-3 w-3" /> {detail.phone}
                  </a>
                )}
                {detail.whatsapp && (
                  <a
                    href={`https://wa.me/55${detail.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-emerald-400"
                  >
                    <MessageCircle className="h-3 w-3" /> WhatsApp
                  </a>
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
        {loading || !detail ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Contact info */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contato
              </h3>
              <div className="grid gap-2 rounded-xl border border-border bg-background/40 p-3 text-xs">
                {detail.email && (
                  <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="E-mail" value={detail.email} />
                )}
                {detail.document && (
                  <InfoRow icon={<IdCard className="h-3.5 w-3.5" />} label="CPF/CNPJ" value={detail.document} />
                )}
                {detail.address && (
                  <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Endereço" value={detail.address} />
                )}
                {!detail.email && !detail.document && !detail.address && (
                  <p className="text-muted-foreground">
                    Sem informações de contato adicionais.
                  </p>
                )}
              </div>
              {detail.notes && (
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3 text-xs">
                  <p className="mb-1 font-semibold text-orange-400">Observações</p>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {detail.notes}
                  </p>
                </div>
              )}
            </section>

            {/* Vehicles */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Veículos ({detail.vehicles.length})
                </h3>
              </div>
              <div className="max-h-80 space-y-2 overflow-y-auto scrollbar-premium pr-1">
                {detail.vehicles.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Nenhum veículo cadastrado
                  </p>
                ) : (
                  detail.vehicles.map((v) => (
                    <article
                      key={v.id}
                      className="rounded-xl border border-border bg-background/40 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {v.brand} {v.model}
                            {v.year ? ` • ${v.year}` : ""}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                            {v.plate && (
                              <Badge
                                variant="outline"
                                className="border-orange-500/30 bg-orange-500/10 text-[10px] font-bold text-orange-300"
                              >
                                {maskPlate(v.plate)}
                              </Badge>
                            )}
                            {v.fuel && (
                              <span className="inline-flex items-center gap-0.5">
                                <Fuel className="h-3 w-3" /> {v.fuel}
                              </span>
                            )}
                            {v.engine && (
                              <span className="inline-flex items-center gap-0.5">
                                <Gauge className="h-3 w-3" /> {v.engine}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-0.5">
                              <Gauge className="h-3 w-3" /> {formatMileage(v.mileage)}
                            </span>
                          </div>
                        </div>
                        {v.nextService && (
                          <Badge
                            variant="outline"
                            className="border-blue-500/30 bg-blue-500/10 text-[10px] text-blue-300"
                          >
                            <CalendarClock className="mr-1 h-3 w-3" />
                            {formatShortDate(v.nextService)}
                          </Badge>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
              <VehicleForm onSave={handleAddVehicle} />
            </section>

            {/* Recent service orders */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ordens de serviço ({detail.services.length})
                </h3>
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto scrollbar-premium pr-1">
                {detail.services.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Nenhuma ordem de serviço registrada
                  </p>
                ) : (
                  detail.services.map((s) => (
                    <article
                      key={s.id}
                      className="rounded-xl border border-border bg-background/40 p-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {s.title}
                          </p>
                          {s.vehicle && (
                            <p className="mt-0.5 truncate text-muted-foreground">
                              {s.vehicle.brand} {s.vehicle.model}
                              {s.vehicle.plate ? ` • ${s.vehicle.plate}` : ""}
                            </p>
                          )}
                        </div>
                        <ServiceStatusBadge status={s.status} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <History className="h-3 w-3" />
                          {formatDate(s.createdAt)}
                        </span>
                        {s.totalCost > 0 && (
                          <span className="font-semibold text-emerald-400">
                            {formatCurrency(s.totalCost)}
                          </span>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            {/* Quotes summary */}
            {detail.quotes.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Orçamentos recentes
                </h3>
                <div className="space-y-1.5">
                  {detail.quotes.slice(0, 5).map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-2 text-xs"
                    >
                      <span className="truncate font-mono text-muted-foreground">
                        #{q.number}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-border text-[10px]"
                        >
                          {quoteStatusLabel(q.status)}
                        </Badge>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(q.total)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      {!loading && detail && (
        <div className="border-t border-border bg-card/50 p-3">
          <div className="flex items-center gap-2">
            {detail.phone && (
              <Button asChild variant="outline" size="sm" className="flex-1 border-border">
                <a href={`tel:${detail.phone}`}>
                  <Phone className="h-3.5 w-3.5" /> Ligar
                </a>
              </Button>
            )}
            {detail.whatsapp && (
              <Button asChild variant="outline" size="sm" className="flex-1 border-emerald-500/30 text-emerald-400">
                <a
                  href={`https://wa.me/55${detail.whatsapp.replace(/\D/g, "")}`}
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

      {/* Edit dialog (rendered inside; needs customer) */}
      {detail && (
        <CustomerFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          customer={detail}
          onSaved={(c) => {
            setDetail((d) => (d ? { ...d, ...c } : d));
            onUpdated(c);
          }}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os veículos, ordens de
              serviço, orçamentos e agendamentos vinculados também serão
              removidos.
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
    <>
      {/* Side panel — slides from right on all breakpoints (mobile full, desktop panel) */}
      <Sheet open={!!customerId} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-md lg:max-w-xl"
        >
          {content}
        </SheetContent>
      </Sheet>
    </>
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

function ServiceStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "Pendente", className: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
    in_progress: { label: "Em andamento", className: "border-blue-500/30 bg-blue-500/10 text-blue-300" },
    done: { label: "Concluído", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    cancelled: { label: "Cancelado", className: "border-red-500/30 bg-red-500/10 text-red-300" },
  };
  const s = map[status] || map.pending;
  return (
    <Badge variant="outline" className={`shrink-0 text-[10px] ${s.className}`}>
      {s.label}
    </Badge>
  );
}

function quoteStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Rascunho",
    sent: "Enviado",
    approved: "Aprovado",
    rejected: "Rejeitado",
  };
  return map[status] || status;
}
