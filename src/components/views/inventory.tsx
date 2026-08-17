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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ViewHeader,
  SectionCard,
  EmptyState,
} from "@/components/shared/view-parts";
import {
  Boxes,
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  QrCode,
  ScanLine,
  Truck,
  Pencil,
  Trash2,
  Loader2,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  IdCard,
  Building2,
  Minus,
  History,
  Tag,
  Warehouse,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/nav-config";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

// ============================================================================
// Types
// ============================================================================
type InventoryItem = {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  category: string;
  supplier?: string | null;
  quantity: number;
  minStock: number;
  purchasePrice: number;
  salePrice: number;
  unit: string;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Supplier = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  cnpj?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// Helpers
// ============================================================================
function isLowStock(i: InventoryItem): boolean {
  return i.quantity <= i.minStock;
}

function profitMargin(i: InventoryItem): number {
  if (!i.purchasePrice || i.purchasePrice <= 0) return 0;
  return ((i.salePrice - i.purchasePrice) / i.purchasePrice) * 100;
}

function stockValue(i: InventoryItem): number {
  return i.quantity * i.purchasePrice;
}

function saleValue(i: InventoryItem): number {
  return i.quantity * i.salePrice;
}

const CATEGORY_META: Record<
  string,
  { label: string; tone: string; color: string }
> = {
  parts: {
    label: "Peças",
    tone: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    color: "#ff8a3d",
  },
  tools: {
    label: "Ferramentas",
    tone: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    color: "#3b82f6",
  },
  fluids: {
    label: "Fluidos",
    tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    color: "#10b981",
  },
};

function categoryMeta(c: string) {
  return (
    CATEGORY_META[c] || {
      label: c || "Outros",
      tone: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
      color: "#a1a1aa",
    }
  );
}

// ============================================================================
// Main component
// ============================================================================
export function Inventory() {
  const [tab, setTab] = useState("stock");

  // inventory state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [itemCreateOpen, setItemCreateOpen] = useState(false);

  // suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [supplierCreateOpen, setSupplierCreateOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(
    null
  );
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null
  );

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (category && category !== "all") params.set("category", category);
      const url = `/api/inventory${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setItems(json.data ?? []);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao carregar estoque");
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, [debouncedQuery, category]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const fetchSuppliers = useCallback(async () => {
    setSuppliersLoading(true);
    try {
      const res = await fetch("/api/suppliers", { cache: "no-store" });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setSuppliers(json.data ?? []);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao carregar fornecedores");
      setSuppliers([]);
    } finally {
      setSuppliersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "suppliers" && suppliers.length === 0) {
      fetchSuppliers();
    }
  }, [tab, suppliers.length, fetchSuppliers]);

  // ============ derived stats ============
  const stats = useMemo(() => {
    const totalItems = items.reduce((s, i) => s + i.quantity, 0);
    const totalStockValue = items.reduce((s, i) => s + stockValue(i), 0);
    const totalSaleValue = items.reduce((s, i) => s + saleValue(i), 0);
    const lowStockCount = items.filter(isLowStock).length;
    return { totalItems, totalStockValue, totalSaleValue, lowStockCount };
  }, [items]);

  const chartData = useMemo(() => {
    const map: Record<string, number> = { parts: 0, tools: 0, fluids: 0 };
    items.forEach((i) => {
      if (map[i.category] !== undefined) map[i.category] += stockValue(i);
      else map[i.category] = (map[i.category] || 0) + stockValue(i);
    });
    return Object.entries(map).map(([key, value]) => ({
      key,
      label: categoryMeta(key).label,
      value: Number(value.toFixed(2)),
      color: categoryMeta(key).color,
    }));
  }, [items]);

  const lowStockItems = useMemo(
    () => items.filter(isLowStock).sort((a, b) => a.quantity - b.quantity),
    [items]
  );

  // ============ handlers ============
  const handleItemCreated = (item: InventoryItem) => {
    setItems((prev) => [item, ...prev]);
    setItemCreateOpen(false);
    toast.success("Peça cadastrada com sucesso");
  };

  const handleItemUpdated = (updated: InventoryItem) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    if (selectedItemId === updated.id) {
      // remount detail to refresh
      setSelectedItemId(null);
      setTimeout(() => setSelectedItemId(updated.id), 30);
    }
  };

  const handleItemDeleted = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedItemId(null);
    toast.success("Item excluído");
  };

  const handleQuickStockAdjust = async (
    item: InventoryItem,
    delta: number
  ) => {
    const newQty = Math.max(0, item.quantity + delta);
    try {
      const res = await fetch(`/api/inventory/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setItems((prev) => prev.map((i) => (i.id === item.id ? json.data : i)));
      if (selectedItemId === item.id) {
        setSelectedItemId(null);
        setTimeout(() => setSelectedItemId(item.id), 30);
      }
      toast.success(
        `Estoque ajustado: ${item.quantity} → ${json.data.quantity} ${item.unit}`
      );
    } catch (err: any) {
      toast.error(err?.message || "Erro ao ajustar estoque");
    }
  };

  const handleRestock = async (item: InventoryItem) => {
    // Quick "repor" — adds 10 units (rounded up to next sensible batch)
    const target = Math.max(item.minStock * 2, item.quantity + 10);
    const delta = target - item.quantity;
    await handleQuickStockAdjust(item, delta);
  };

  const handleSupplierCreated = (s: Supplier) => {
    setSuppliers((prev) => [s, ...prev]);
    setSupplierCreateOpen(false);
    toast.success("Fornecedor cadastrado");
  };

  const handleSupplierUpdated = (s: Supplier) => {
    setSuppliers((prev) => prev.map((x) => (x.id === s.id ? s : x)));
    setEditingSupplier(null);
    toast.success("Fornecedor atualizado");
  };

  const handleSupplierDeleted = async (s: Supplier) => {
    try {
      const res = await fetch(`/api/suppliers/${s.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setSuppliers((prev) => prev.filter((x) => x.id !== s.id));
      setSupplierToDelete(null);
      toast.success("Fornecedor excluído");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao excluir fornecedor");
    }
  };

  return (
    <div className="space-y-6">
      <ViewHeader
        title="Controle de Estoque"
        description="Peças, ferramentas, fluidos, fornecedores e alertas de reposição."
        icon={<Boxes className="h-5 w-5" />}
        accent="orange"
        actions={
          <Button
            onClick={() => setItemCreateOpen(true)}
            className="gradient-orange text-primary-foreground glow-orange"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova peça</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        }
      />

      {/* Stock value summary */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          icon={<Boxes className="h-5 w-5" />}
          label="Itens em estoque"
          value={`${stats.totalItems}`}
          sub={`${items.length} tipo${items.length === 1 ? "" : "s"}`}
          tone="orange"
        />
        <KpiCard
          icon={<TrendingDown className="h-5 w-5" />}
          label="Valor de estoque"
          value={formatCurrency(stats.totalStockValue)}
          sub="preço de compra"
          tone="blue"
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Valor potencial de venda"
          value={formatCurrency(stats.totalSaleValue)}
          sub="preço de venda"
          tone="emerald"
        />
        <KpiCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Itens em baixa"
          value={`${stats.lowStockCount}`}
          sub={stats.lowStockCount > 0 ? "requer reposição" : "tudo ok"}
          tone={stats.lowStockCount > 0 ? "red" : "emerald"}
        />
      </section>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="stock" className="gap-1.5">
            <Boxes className="h-3.5 w-3.5" />
            Estoque
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Alertas
            {stats.lowStockCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 text-[10px] font-bold text-amber-300">
                {stats.lowStockCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            Fornecedores
          </TabsTrigger>
        </TabsList>

        {/* ============ Tab 1: Estoque ============ */}
        <TabsContent value="stock" className="space-y-4">
          {/* Filters bar */}
          <SectionCard className="p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nome, SKU ou código de barras..."
                  className="h-10 rounded-xl border-border bg-background/50 pl-9"
                />
              </div>
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger className="h-10 rounded-xl border-border bg-background/50">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  <SelectItem value="parts">Peças</SelectItem>
                  <SelectItem value="tools">Ferramentas</SelectItem>
                  <SelectItem value="fluids">Fluidos</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setItemCreateOpen(true)}
                className="h-10 gradient-orange text-primary-foreground glow-orange sm:justify-start"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova peça</span>
              </Button>
            </div>
            {!itemsLoading && (
              <p className="mt-2 text-xs text-muted-foreground">
                {items.length} item{items.length === 1 ? "" : "s"}
                {debouncedQuery ? ` para "${debouncedQuery}"` : ""}
                {category !== "all" ? ` em ${categoryMeta(category).label}` : ""}
              </p>
            )}
          </SectionCard>

          {/* Bar chart: stock value by category */}
          {!itemsLoading && items.length > 0 && (
            <SectionCard
              title="Valor em estoque por categoria"
              icon={<TrendingDown className="h-4 w-4" />}
            >
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
                  >
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
                      tickFormatter={(v: any) =>
                        v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v}`
                      }
                      width={64}
                    />
                    <Tooltip
                      cursor={{ fill: "oklch(1 0 0 / 4%)" }}
                      contentStyle={{
                        background: "oklch(0.2 0.04 255)",
                        border:
                          "1px solid oklch(0.68 0.21 42 / 0.4)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "oklch(0.97 0.01 240)" }}
                      formatter={(v: any) => [formatCurrency(Number(v)), "Valor"]}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          )}

          {/* Items list */}
          {itemsLoading ? (
            <SectionCard>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ItemCardSkeleton key={i} />
                ))}
              </div>
            </SectionCard>
          ) : items.length === 0 ? (
            <SectionCard>
              <EmptyState
                icon={<Boxes className="h-10 w-10 opacity-40" />}
                title={
                  debouncedQuery || category !== "all"
                    ? "Nenhum item encontrado"
                    : "Estoque vazio"
                }
                description={
                  debouncedQuery || category !== "all"
                    ? "Ajuste a busca ou o filtro de categoria."
                    : "Cadastre a primeira peça para começar."
                }
                action={
                  !debouncedQuery &&
                  category === "all" && (
                    <Button
                      onClick={() => setItemCreateOpen(true)}
                      className="gradient-orange text-primary-foreground glow-orange"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" /> Nova peça
                    </Button>
                  )
                }
              />
            </SectionCard>
          ) : (
            <SectionCard className="p-0 sm:p-0">
              <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
                {items.map((item, i) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    index={i}
                    onSelect={() => setSelectedItemId(item.id)}
                    onAdjust={(delta) => handleQuickStockAdjust(item, delta)}
                  />
                ))}
              </div>
            </SectionCard>
          )}
        </TabsContent>

        {/* ============ Tab 2: Alertas ============ */}
        <TabsContent value="alerts" className="space-y-4">
          <SectionCard
            title="Itens com estoque baixo"
            icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
            actions={
              stats.lowStockCount > 0 && (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-300"
                >
                  {stats.lowStockCount} alerta
                  {stats.lowStockCount === 1 ? "" : "s"}
                </Badge>
              )
            }
          >
            {itemsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : lowStockItems.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="h-10 w-10 text-emerald-400/60" />}
                title="Estoque em dia"
                description="Nenhum item está abaixo do estoque mínimo."
              />
            ) : (
              <div className="max-h-[40rem] space-y-2 overflow-y-auto scrollbar-premium pr-1">
                {lowStockItems.map((item, i) => (
                  <LowStockRow
                    key={item.id}
                    item={item}
                    index={i}
                    onSelect={() => setSelectedItemId(item.id)}
                    onRestock={() => handleRestock(item)}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* ============ Tab 3: Fornecedores ============ */}
        <TabsContent value="suppliers" className="space-y-4">
          <SectionCard
            title="Fornecedores"
            icon={<Truck className="h-4 w-4" />}
            actions={
              <Button
                onClick={() => setSupplierCreateOpen(true)}
                size="sm"
                className="gradient-orange text-primary-foreground glow-orange"
              >
                <Plus className="h-4 w-4" /> Novo
              </Button>
            }
          >
            {suppliersLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SupplierCardSkeleton key={i} />
                ))}
              </div>
            ) : suppliers.length === 0 ? (
              <EmptyState
                icon={<Truck className="h-10 w-10 opacity-40" />}
                title="Nenhum fornecedor cadastrado"
                description="Cadastre fornecedores para vincular às peças em estoque."
                action={
                  <Button
                    onClick={() => setSupplierCreateOpen(true)}
                    className="gradient-orange text-primary-foreground glow-orange"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" /> Novo fornecedor
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((s, i) => (
                  <SupplierCard
                    key={s.id}
                    supplier={s}
                    index={i}
                    onEdit={() => setEditingSupplier(s)}
                    onDelete={() => setSupplierToDelete(s)}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Item create dialog */}
      <ItemFormDialog
        open={itemCreateOpen}
        onOpenChange={setItemCreateOpen}
        onSaved={handleItemCreated}
      />

      {/* Item detail sheet */}
      <ItemDetailSheet
        itemId={selectedItemId}
        onClose={() => setSelectedItemId(null)}
        onUpdated={handleItemUpdated}
        onDeleted={handleItemDeleted}
        onAdjust={handleQuickStockAdjust}
      />

      {/* Supplier create dialog */}
      <SupplierFormDialog
        open={supplierCreateOpen}
        onOpenChange={setSupplierCreateOpen}
        onSaved={handleSupplierCreated}
      />

      {/* Supplier edit dialog */}
      <SupplierFormDialog
        open={!!editingSupplier}
        onOpenChange={(o) => !o && setEditingSupplier(null)}
        onSaved={handleSupplierUpdated}
        supplier={editingSupplier}
      />

      {/* Supplier delete confirm */}
      <AlertDialog
        open={!!supplierToDelete}
        onOpenChange={(o) => !o && setSupplierToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir fornecedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O histórico de peças
              vinculadas a este fornecedor não será removido, mas a referência
              será perdida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => supplierToDelete && handleSupplierDeleted(supplierToDelete)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================================
// Item card (Estoque tab)
// ============================================================================
function ItemCard({
  item,
  index,
  onSelect,
  onAdjust,
}: {
  item: InventoryItem;
  index: number;
  onSelect: () => void;
  onAdjust: (delta: number) => void;
}) {
  const meta = categoryMeta(item.category);
  const low = isLowStock(item);
  const margin = profitMargin(item);

  return (
    <motion.button
      onClick={onSelect}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      whileHover={{ y: -2 }}
      className="card-premium group flex w-full flex-col gap-3 rounded-2xl border border-border bg-card/50 p-4 text-left backdrop-blur-sm"
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${meta.tone}`}
        >
          <Boxes className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {item.name}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {item.sku ? (
              <>
                <Tag className="mr-1 inline h-3 w-3" />
                {item.sku}
              </>
            ) : item.barcode ? (
              <>
                <QrCode className="mr-1 inline h-3 w-3" />
                {item.barcode}
              </>
            ) : (
              "Sem SKU / código"
            )}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-orange-400" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <Badge
          variant="outline"
          className={`text-[10px] font-semibold ${meta.tone}`}
        >
          {meta.label}
        </Badge>
        {item.location && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {item.location}
          </span>
        )}
      </div>

      {/* Quantity + low-stock warning */}
      <div
        className={`flex items-center justify-between rounded-lg border p-2 ${
          low
            ? "border-amber-500/40 bg-amber-500/10"
            : "border-border bg-background/40"
        }`}
      >
        <div className="flex items-center gap-2">
          {low ? (
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          ) : (
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <p
              className={`text-base font-bold tabular-nums ${
                low ? "text-amber-400" : "text-foreground"
              }`}
            >
              {item.quantity}
              <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                {item.unit}
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground">
              mín. {item.minStock} {item.unit}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onAdjust(-1);
            }}
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-md border border-border bg-background/60 text-muted-foreground transition hover:border-red-500/40 hover:text-red-400"
            aria-label="Diminuir 1"
          >
            <Minus className="h-3.5 w-3.5" />
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onAdjust(1);
            }}
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-md border border-border bg-background/60 text-muted-foreground transition hover:border-emerald-500/40 hover:text-emerald-400"
            aria-label="Aumentar 1"
          >
            <Plus className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* Prices + margin */}
      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className="rounded-md bg-background/40 px-1.5 py-1.5">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Compra
          </p>
          <p className="text-xs font-semibold text-foreground">
            {formatCurrency(item.purchasePrice)}
          </p>
        </div>
        <div className="rounded-md bg-background/40 px-1.5 py-1.5">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Venda
          </p>
          <p className="text-xs font-semibold text-emerald-400">
            {formatCurrency(item.salePrice)}
          </p>
        </div>
        <div className="rounded-md bg-background/40 px-1.5 py-1.5">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Margem
          </p>
          <p
            className={`text-xs font-semibold ${
              margin >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {margin.toFixed(0)}%
          </p>
        </div>
      </div>
    </motion.button>
  );
}

// ============================================================================
// Low-stock row (Alertas tab)
// ============================================================================
function LowStockRow({
  item,
  index,
  onSelect,
  onRestock,
}: {
  item: InventoryItem;
  index: number;
  onSelect: () => void;
  onRestock: () => void;
}) {
  const meta = categoryMeta(item.category);
  const critical = item.quantity === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.2) }}
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        critical
          ? "border-red-500/40 bg-red-500/5"
          : "border-amber-500/40 bg-amber-500/5"
      }`}
    >
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
          critical
            ? "bg-red-500/15 text-red-400"
            : "bg-amber-500/15 text-amber-400"
        }`}
      >
        {critical ? (
          <AlertTriangle className="h-5 w-5" />
        ) : (
          <Package className="h-5 w-5" />
        )}
      </div>
      <button
        onClick={onSelect}
        className="min-w-0 flex-1 text-left"
      >
        <p className="truncate text-sm font-semibold text-foreground">
          {item.name}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <Badge
            variant="outline"
            className={`text-[10px] ${meta.tone}`}
          >
            {meta.label}
          </Badge>
          <span>
            Atual:{" "}
            <span
              className={`font-bold ${
                critical ? "text-red-400" : "text-amber-400"
              }`}
            >
              {item.quantity}
            </span>{" "}
            / mín. {item.minStock} {item.unit}
          </span>
        </div>
      </button>
      <Button
        size="sm"
        onClick={onRestock}
        className="shrink-0 gradient-orange text-primary-foreground glow-orange"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Repor</span>
      </Button>
    </motion.div>
  );
}

// ============================================================================
// Item form dialog (create / edit)
// ============================================================================
type ItemFormData = {
  name: string;
  sku: string;
  barcode: string;
  category: string;
  supplier: string;
  quantity: string;
  minStock: string;
  purchasePrice: string;
  salePrice: string;
  unit: string;
  location: string;
};

const emptyItemForm: ItemFormData = {
  name: "",
  sku: "",
  barcode: "",
  category: "parts",
  supplier: "",
  quantity: "0",
  minStock: "0",
  purchasePrice: "0",
  salePrice: "0",
  unit: "un",
  location: "",
};

function ItemFormDialog({
  open,
  onOpenChange,
  onSaved,
  item,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: (i: InventoryItem) => void;
  item?: InventoryItem | null;
}) {
  const [form, setForm] = useState<ItemFormData>(emptyItemForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!item;

  useEffect(() => {
    if (open) {
      setForm(
        item
          ? {
              name: item.name || "",
              sku: item.sku || "",
              barcode: item.barcode || "",
              category: item.category || "parts",
              supplier: item.supplier || "",
              quantity: String(item.quantity ?? 0),
              minStock: String(item.minStock ?? 0),
              purchasePrice: String(item.purchasePrice ?? 0),
              salePrice: String(item.salePrice ?? 0),
              unit: item.unit || "un",
              location: item.location || "",
            }
          : emptyItemForm
      );
    }
  }, [open, item]);

  const set = (k: keyof ItemFormData, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit ? `/api/inventory/${item!.id}` : "/api/inventory";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          barcode: form.barcode,
          category: form.category,
          supplier: form.supplier,
          quantity: Number(form.quantity),
          minStock: Number(form.minStock),
          purchasePrice: form.purchasePrice.replace(",", "."),
          salePrice: form.salePrice.replace(",", "."),
          unit: form.unit,
          location: form.location,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onSaved?.(json.data);
      onOpenChange(false);
      toast.success(isEdit ? "Item atualizado" : "Item cadastrado");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-premium sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-400" />
            {isEdit ? "Editar item" : "Nova peça"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados do item. Campos com * são obrigatórios."
              : "Preencha os dados do item. Campos com * são obrigatórios."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome *" className="sm:col-span-2">
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex.: Filtro de óleo Motorcraft FL-400S"
              className="border-border bg-background/50"
              autoFocus
            />
          </Field>

          <Field label="SKU">
            <div className="relative">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="Ex.: FL-400S"
                className="border-border bg-background/50 pl-9"
              />
            </div>
          </Field>

          <Field label="Código de barras">
            <div className="relative">
              <QrCode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.barcode}
                onChange={(e) => set("barcode", e.target.value)}
                placeholder="Ex.: 7891234567890"
                className="border-border bg-background/50 pl-9"
              />
            </div>
          </Field>

          <Field label="Categoria *">
            <Select
              value={form.category}
              onValueChange={(v) => set("category", v)}
            >
              <SelectTrigger className="border-border bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parts">Peças</SelectItem>
                <SelectItem value="tools">Ferramentas</SelectItem>
                <SelectItem value="fluids">Fluidos</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Unidade">
            <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
              <SelectTrigger className="border-border bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="un">un</SelectItem>
                <SelectItem value="cx">caixa</SelectItem>
                <SelectItem value="pct">pacote</SelectItem>
                <SelectItem value="l">litro</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="g">g</SelectItem>
                <SelectItem value="m">metro</SelectItem>
                <SelectItem value="par">par</SelectItem>
                <SelectItem value="jogo">jogo</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Fornecedor">
            <div className="relative">
              <Truck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.supplier}
                onChange={(e) => set("supplier", e.target.value)}
                placeholder="Nome do fornecedor"
                className="border-border bg-background/50 pl-9"
              />
            </div>
          </Field>

          <Field label="Localização">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Prateleira A3, gaveta 2..."
                className="border-border bg-background/50 pl-9"
              />
            </div>
          </Field>

          <Field label="Quantidade atual">
            <Input
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="0"
              className="border-border bg-background/50"
            />
          </Field>

          <Field label="Estoque mínimo (alerta)">
            <Input
              value={form.minStock}
              onChange={(e) => set("minStock", e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="0"
              className="border-border bg-background/50"
            />
          </Field>

          <Field label="Preço de compra (R$)">
            <Input
              value={form.purchasePrice}
              onChange={(e) =>
                set("purchasePrice", e.target.value.replace(/[^\d.,]/g, ""))
              }
              inputMode="decimal"
              placeholder="0,00"
              className="border-border bg-background/50"
            />
          </Field>

          <Field label="Preço de venda (R$)">
            <Input
              value={form.salePrice}
              onChange={(e) =>
                set("salePrice", e.target.value.replace(/[^\d.,]/g, ""))
              }
              inputMode="decimal"
              placeholder="0,00"
              className="border-border bg-background/50"
            />
          </Field>
        </div>

        {/* Live margin preview */}
        <div className="rounded-lg border border-border bg-background/40 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Margem de lucro</span>
            {(() => {
              const purchase = Number(form.purchasePrice.replace(",", ".") || 0);
              const sale = Number(form.salePrice.replace(",", ".") || 0);
              const m =
                purchase > 0 ? ((sale - purchase) / purchase) * 100 : 0;
              return (
                <span
                  className={`font-bold ${
                    m >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {m.toFixed(1)}%
                </span>
              );
            })()}
          </div>
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
            {isEdit ? "Salvar alterações" : "Cadastrar item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Item detail sheet (with edit, delete, and stock adjustment)
// ============================================================================
function ItemDetailSheet({
  itemId,
  onClose,
  onUpdated,
  onDeleted,
  onAdjust,
}: {
  itemId: string | null;
  onClose: () => void;
  onUpdated: (i: InventoryItem) => void;
  onDeleted: (id: string) => void;
  onAdjust: (item: InventoryItem, delta: number) => void;
}) {
  const [detail, setDetail] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setQtyValue, setSetQtyValue] = useState("");

  useEffect(() => {
    if (!itemId) {
      setDetail(null);
      return;
    }
    let mounted = true;
    setLoading(true);
    setDetail(null);
    setSetQtyValue("");
    fetch(`/api/inventory/${itemId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        if (json.error) throw new Error(json.error);
        setDetail(json.data);
        setSetQtyValue(String(json.data?.quantity ?? ""));
      })
      .catch((err) => {
        if (mounted) toast.error(err?.message || "Erro ao carregar item");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [itemId]);

  const handleAdjust = async (delta: number) => {
    if (!detail) return;
    await onAdjust(detail, delta);
  };

  const handleSetQty = async () => {
    if (!detail) return;
    const n = Number(setQtyValue);
    if (!Number.isFinite(n) || n < 0) {
      toast.error("Quantidade inválida");
      return;
    }
    try {
      const res = await fetch(`/api/inventory/${detail.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: Math.floor(n) }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setDetail(json.data);
      onUpdated(json.data);
      toast.success(`Quantidade ajustada para ${json.data.quantity}`);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao ajustar quantidade");
    }
  };

  const handleDelete = async () => {
    if (!detail) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/inventory/${detail.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onDeleted(detail.id);
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao excluir item");
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
            <div
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${categoryMeta(detail.category).tone}`}
            >
              <Boxes className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold text-foreground">
                {detail.name}
              </h2>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {detail.sku && (
                  <span className="inline-flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {detail.sku}
                  </span>
                )}
                {detail.barcode && (
                  <span className="inline-flex items-center gap-1">
                    <QrCode className="h-3 w-3" />
                    {detail.barcode}
                  </span>
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
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stock adjustment */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ajuste de estoque
              </h3>
              <div
                className={`rounded-xl border p-4 ${
                  isLowStock(detail)
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-border bg-background/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-3xl font-bold tabular-nums ${
                        isLowStock(detail) ? "text-amber-400" : "text-foreground"
                      }`}
                    >
                      {detail.quantity}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {detail.unit}
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      mínimo: {detail.minStock} {detail.unit}
                      {isLowStock(detail) && (
                        <span className="ml-2 inline-flex items-center gap-1 text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          {detail.quantity === 0
                            ? "sem estoque"
                            : "estoque baixo"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdjust(-1)}
                    className="border-border hover:border-red-500/40 hover:text-red-400"
                  >
                    <Minus className="h-3.5 w-3.5" /> 1
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdjust(1)}
                    className="border-border hover:border-emerald-500/40 hover:text-emerald-400"
                  >
                    <Plus className="h-3.5 w-3.5" /> 1
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdjust(10)}
                    className="border-border hover:border-emerald-500/40 hover:text-emerald-400"
                  >
                    <Plus className="h-3.5 w-3.5" /> 10
                  </Button>
                  <div className="flex flex-1 items-center gap-1.5">
                    <Input
                      value={setQtyValue}
                      onChange={(e) =>
                        setSetQtyValue(e.target.value.replace(/\D/g, ""))
                      }
                      inputMode="numeric"
                      placeholder="Nova qtd."
                      className="h-8 w-24 border-border bg-background/50 text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={handleSetQty}
                      className="gradient-orange text-primary-foreground glow-orange"
                    >
                      Definir
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Prices */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Preços e margem
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-border bg-background/40 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Compra
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {formatCurrency(detail.purchasePrice)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/40 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Venda
                  </p>
                  <p className="mt-1 text-sm font-bold text-emerald-400">
                    {formatCurrency(detail.salePrice)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/40 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Margem
                  </p>
                  <p
                    className={`mt-1 text-sm font-bold ${
                      profitMargin(detail) >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {profitMargin(detail).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Valor em estoque
                  </p>
                  <p className="mt-1 text-sm font-bold text-blue-300">
                    {formatCurrency(stockValue(detail))}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Venda potencial
                  </p>
                  <p className="mt-1 text-sm font-bold text-emerald-300">
                    {formatCurrency(saleValue(detail))}
                  </p>
                </div>
              </div>
            </section>

            {/* Details */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Detalhes
              </h3>
              <div className="grid gap-2 rounded-xl border border-border bg-background/40 p-3 text-xs">
                <InfoRow
                  icon={<Tag className="h-3.5 w-3.5" />}
                  label="Categoria"
                  value={categoryMeta(detail.category).label}
                />
                {detail.supplier && (
                  <InfoRow
                    icon={<Truck className="h-3.5 w-3.5" />}
                    label="Fornecedor"
                    value={detail.supplier}
                  />
                )}
                {detail.location && (
                  <InfoRow
                    icon={<MapPin className="h-3.5 w-3.5" />}
                    label="Localização"
                    value={detail.location}
                  />
                )}
                <InfoRow
                  icon={<History className="h-3.5 w-3.5" />}
                  label="Atualizado em"
                  value={formatDate(detail.updatedAt)}
                />
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      {detail && (
        <ItemFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          item={detail}
          onSaved={(i) => {
            setDetail(i);
            onUpdated(i);
          }}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O item
              {detail ? ` "${detail.name}"` : ""} será removido
              permanentemente do estoque.
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
    <Sheet open={!!itemId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md lg:max-w-xl"
      >
        {content}
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// Supplier card (Fornecedores tab)
// ============================================================================
function SupplierCard({
  supplier,
  index,
  onEdit,
  onDelete,
}: {
  supplier: Supplier;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.2) }}
      className="card-premium group flex flex-col gap-3 rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-sm"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-400">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {supplier.name}
          </p>
          {supplier.cnpj && (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              <IdCard className="mr-1 inline h-3 w-3" />
              CNPJ: {supplier.cnpj}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
        {supplier.phone && (
          <span className="inline-flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-orange-400" />
            {supplier.phone}
          </span>
        )}
        {supplier.email && (
          <span className="inline-flex items-center gap-1.5 truncate">
            <Mail className="h-3 w-3 text-orange-400" />
            <span className="truncate">{supplier.email}</span>
          </span>
        )}
        {!supplier.phone && !supplier.email && (
          <span className="text-muted-foreground/60">
            Sem contato cadastrado
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-2 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <History className="h-3 w-3" />
          {formatDate(supplier.createdAt)}
        </span>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            onClick={onEdit}
            className="h-7 w-7 border-border"
            aria-label="Editar fornecedor"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={onDelete}
            className="h-7 w-7 border-red-500/30 text-red-400 hover:bg-red-500/10"
            aria-label="Excluir fornecedor"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Supplier form dialog (create / edit)
// ============================================================================
type SupplierFormData = {
  name: string;
  phone: string;
  email: string;
  cnpj: string;
  address: string;
  notes: string;
};

const emptySupplierForm: SupplierFormData = {
  name: "",
  phone: "",
  email: "",
  cnpj: "",
  address: "",
  notes: "",
};

function SupplierFormDialog({
  open,
  onOpenChange,
  onSaved,
  supplier,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: (s: Supplier) => void;
  supplier?: Supplier | null;
}) {
  const [form, setForm] = useState<SupplierFormData>(emptySupplierForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!supplier;

  useEffect(() => {
    if (open) {
      setForm(
        supplier
          ? {
              name: supplier.name || "",
              phone: supplier.phone || "",
              email: supplier.email || "",
              cnpj: supplier.cnpj || "",
              address: supplier.address || "",
              notes: supplier.notes || "",
            }
          : emptySupplierForm
      );
    }
  }, [open, supplier]);

  const set = (k: keyof SupplierFormData, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit
        ? `/api/suppliers/${supplier!.id}`
        : "/api/suppliers";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      onSaved?.(json.data);
      onOpenChange(false);
      toast.success(isEdit ? "Fornecedor atualizado" : "Fornecedor cadastrado");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar fornecedor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-premium sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-orange-400" />
            {isEdit ? "Editar fornecedor" : "Novo fornecedor"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados do fornecedor. * é obrigatório."
              : "Preencha os dados do fornecedor. * é obrigatório."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome / Razão social *" className="sm:col-span-2">
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex.: Auto Peças Silva Ltda"
              className="border-border bg-background/50"
              autoFocus
            />
          </Field>

          <Field label="Telefone">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="(11) 3333-4444"
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
                placeholder="vendas@fornecedor.com"
                type="email"
                className="border-border bg-background/50 pl-9"
              />
            </div>
          </Field>

          <Field label="CNPJ">
            <div className="relative">
              <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.cnpj}
                onChange={(e) => set("cnpj", e.target.value)}
                placeholder="00.000.000/0000-00"
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
              placeholder="Prazos, condições, contatos adicionais..."
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
            {isEdit ? "Salvar alterações" : "Cadastrar fornecedor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Skeletons + small shared helpers
// ============================================================================
function ItemCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
      </div>
      <Skeleton className="mt-3 h-14 w-full" />
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

function SupplierCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <Skeleton className="h-2.5 w-2/3" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: "orange" | "blue" | "emerald" | "red";
}) {
  const tones = {
    orange: "text-orange-400",
    blue: "text-blue-300",
    emerald: "text-emerald-400",
    red: "text-red-400",
  };
  return (
    <div className="card-premium rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <span className={`rounded-lg bg-card/50 p-2 ${tones[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold text-foreground">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
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
