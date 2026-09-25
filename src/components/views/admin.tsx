"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ViewHeader, SectionCard } from "@/components/shared/view-parts";
import {
  Shield,
  Users,
  Car,
  Wrench,
  Wallet,
  Boxes,
  Database,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Crown,
} from "lucide-react";
import { useNavStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/nav-config";

const ROLES = ["Admin", "Mecânico chefe", "Mecânico", "Recepcionista", "Financeiro"];
const USERS = [
  { id: 1, name: "Mecânico Master", email: "admin@mecanicopro.ai", role: "Admin", active: true, lastLogin: "agora" },
  { id: 2, name: "Carlos Pereira", email: "carlos@oficina.ai", role: "Mecânico chefe", active: true, lastLogin: "há 2h" },
  { id: 3, name: "Pedro Santos", email: "pedro@oficina.ai", role: "Mecânico", active: true, lastLogin: "ontem" },
  { id: 4, name: "Juliana Costa", email: "ju@oficina.ai", role: "Recepcionista", active: false, lastLogin: "há 5 dias" },
];

export function Admin() {
  const navigate = useNavStore((s) => s.navigate);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => !d.error && setStats(d.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <ViewHeader
        title="Painel Administrativo"
        description="Gestão completa de usuários, permissões e dados da oficina."
        icon={<Shield className="h-5 w-5" />}
        accent="orange"
      />

      {/* Admin-only banner */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/5 p-3">
        <Crown className="h-5 w-5 text-orange-400" />
        <div>
          <p className="text-sm font-semibold text-foreground">Painel restrito</p>
          <p className="text-xs text-muted-foreground">Acesso exclusivo de administradores</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AdminStat icon={<Users />} label="Usuários" value="4" tone="blue" />
        <AdminStat icon={<BarChart3 />} label="Serviços/mês" value={stats?.serviceOrderCount?.toString() || "—"} tone="orange" />
        <AdminStat icon={<TrendingUp />} label="Receita do mês" value={formatCurrency(stats?.monthRevenue ?? 0)} tone="emerald" />
        <AdminStat icon={<TrendingDown />} label="Despesas do mês" value={formatCurrency(stats?.monthExpenses ?? 0)} tone="red" />
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="flex w-full flex-wrap gap-1 bg-card/50">
          <TabsTrigger value="users" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Usuários</TabsTrigger>
          <TabsTrigger value="modules" className="gap-1.5"><Database className="h-3.5 w-3.5" /> Módulos</TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Relatórios</TabsTrigger>
          <TabsTrigger value="permissions" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> Permissões</TabsTrigger>
        </TabsList>

        {/* Users */}
        <TabsContent value="users">
          <SectionCard title="Usuários do sistema" icon={<Users className="h-4 w-4" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-semibold">Usuário</th>
                    <th className="py-2 pr-4 font-semibold">Perfil</th>
                    <th className="py-2 pr-4 font-semibold">Status</th>
                    <th className="py-2 font-semibold">Último acesso</th>
                  </tr>
                </thead>
                <tbody>
                  {USERS.map((u) => (
                    <tr key={u.id} className="border-b border-border/50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-xs font-bold text-white">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{u.name}</p>
                            <p className="text-[11px] text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-300">{u.role}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        {u.active ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Ativo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" /> Inativo
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">{u.lastLogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>

        {/* Modules */}
        <TabsContent value="modules">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Clientes", icon: Users, view: "customers", count: stats?.customerCount },
              { label: "Veículos", icon: Car, view: "vehicle-search", count: stats?.vehicleCount },
              { label: "Ordens de serviço", icon: Wrench, view: "history", count: stats?.serviceOrderCount },
              { label: "Financeiro", icon: Wallet, view: "financial" },
              { label: "Estoque", icon: Boxes, view: "inventory", count: stats?.lowStockCount },
              { label: "Banco de defeitos", icon: Database, view: "defects" },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.label}
                  onClick={() => navigate(m.view as any)}
                  className="card-premium flex items-center gap-3 rounded-2xl border border-border bg-card/50 p-4 text-left"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{m.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {m.count !== undefined ? `${m.count} registros` : "Gerenciar"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports">
          <SectionCard title="Relatórios disponíveis" icon={<FileText className="h-4 w-4" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Relatório financeiro mensal",
                "Produtividade da equipe",
                "Serviços por cliente",
                "Peças mais vendidas",
                "Lucro por tipo de serviço",
                "Histórico de manutenções",
              ].map((r) => (
                <button
                  key={r}
                  className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3 text-left transition hover:border-orange-500/40"
                  onClick={() => navigate("financial")}
                >
                  <span className="text-sm text-foreground">{r}</span>
                  <FileText className="h-4 w-4 text-orange-400" />
                </button>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        {/* Permissions matrix */}
        <TabsContent value="permissions">
          <SectionCard title="Matriz de permissões por perfil" icon={<Shield className="h-4 w-4" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-semibold">Recurso</th>
                    {ROLES.map((r) => (
                      <th key={r} className="py-2 px-2 text-center font-semibold">{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { r: "Clientes", perms: [true, true, true, true, false] },
                    { r: "Veículos", perms: [true, true, true, true, false] },
                    { r: "Ordens de serviço", perms: [true, true, true, false, false] },
                    { r: "Financeiro", perms: [true, false, false, false, true] },
                    { r: "Estoque", perms: [true, true, true, true, false] },
                    { r: "Banco de defeitos", perms: [true, true, true, false, false] },
                    { r: "Configurações", perms: [true, false, false, false, false] },
                    { r: "Painel admin", perms: [true, false, false, false, false] },
                  ].map((row) => (
                    <tr key={row.r} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium text-foreground">{row.r}</td>
                      {row.perms.map((p, i) => (
                        <td key={i} className="py-2 px-2 text-center">
                          {p ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">✓</span>
                          ) : (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-red-400">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "blue" | "orange" | "emerald" | "red";
}) {
  const tones = {
    blue: "text-blue-300 bg-blue-500/10",
    orange: "text-orange-400 bg-orange-500/10",
    emerald: "text-emerald-300 bg-emerald-500/10",
    red: "text-red-300 bg-red-500/10",
  };
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4">
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}>
        {icon}
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
