import {
  Search,
  Brain,
  ScanLine,
  BookOpen,
  Spline,
  Camera,
  FileText,
  Users,
  CalendarDays,
  Wallet,
  Boxes,
  Bot,
  Database,
  History,
  Settings,
  Calculator,
  type LucideIcon,
} from "lucide-react";
import type { ViewKey } from "./store";

export type NavCard = {
  key: ViewKey;
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  category: "IA" | "Técnico" | "Gestão" | "Sistema";
};

export const NAV_CARDS: NavCard[] = [
  {
    key: "vehicle-search",
    label: "Pesquisa Rápida",
    description: "Veículo por marca, modelo, placa, motor",
    icon: Search,
    gradient: "from-orange-500 to-amber-600",
    category: "Técnico",
  },
  {
    key: "diagnosis",
    label: "Diagnóstico Inteligente",
    description: "Árvore de testes com IA",
    icon: Brain,
    gradient: "from-orange-500 to-red-600",
    category: "IA",
  },
  {
    key: "obd2",
    label: "Scanner OBD2",
    description: "Ler, monitorar e apagar códigos",
    icon: ScanLine,
    gradient: "from-sky-500 to-blue-700",
    category: "IA",
  },
  {
    key: "catalog",
    label: "Catálogo Técnico",
    description: "Torques, óleos, velas, procedimentos",
    icon: BookOpen,
    gradient: "from-blue-600 to-indigo-700",
    category: "Técnico",
  },
  {
    key: "schematics",
    label: "Esquemas Elétricos",
    description: "Diagramas e chicotes",
    icon: Spline,
    gradient: "from-cyan-500 to-blue-700",
    category: "Técnico",
  },
  {
    key: "camera-scanner",
    label: "Scanner por Câmera",
    description: "Reconhecimento visual com IA",
    icon: Camera,
    gradient: "from-amber-500 to-orange-700",
    category: "IA",
  },
  {
    key: "quotes",
    label: "Orçamentos",
    description: "Gere PDF profissional com assinatura",
    icon: FileText,
    gradient: "from-emerald-500 to-teal-700",
    category: "Gestão",
  },
  {
    key: "customers",
    label: "Clientes",
    description: "Cadastro e histórico completo",
    icon: Users,
    gradient: "from-teal-500 to-cyan-700",
    category: "Gestão",
  },
  {
    key: "schedule",
    label: "Agenda",
    description: "Serviços, revisões, lembretes",
    icon: CalendarDays,
    gradient: "from-purple-500 to-indigo-700",
    category: "Gestão",
  },
  {
    key: "financial",
    label: "Financeiro",
    description: "Fluxo de caixa, lucros e gráficos",
    icon: Wallet,
    gradient: "from-green-500 to-emerald-700",
    category: "Gestão",
  },
  {
    key: "inventory",
    label: "Estoque",
    description: "Peças, fornecedores, alertas",
    icon: Boxes,
    gradient: "from-amber-500 to-yellow-700",
    category: "Gestão",
  },
  {
    key: "ai-mechanic",
    label: "IA Mecânico",
    description: "Assistente técnico 24h",
    icon: Bot,
    gradient: "from-orange-500 to-red-600",
    category: "IA",
  },
  {
    key: "defects",
    label: "Banco de Defeitos",
    description: "Base colaborativa de soluções",
    icon: Database,
    gradient: "from-blue-500 to-violet-700",
    category: "Técnico",
  },
  {
    key: "history",
    label: "Histórico de Serviços",
    description: "Todas as ordens de serviço",
    icon: History,
    gradient: "from-slate-500 to-blue-800",
    category: "Gestão",
  },
  {
    key: "calculators",
    label: "Calculadoras",
    description: "Torque, conversões, compressão",
    icon: Calculator,
    gradient: "from-cyan-500 to-blue-700",
    category: "Técnico",
  },
  {
    key: "settings",
    label: "Configurações",
    description: "Conta, segurança, sincronização",
    icon: Settings,
    gradient: "from-zinc-500 to-slate-700",
    category: "Sistema",
  },
];

export const VIEW_TITLES: Record<ViewKey, string> = {
  dashboard: "Dashboard",
  "vehicle-search": "Pesquisa Rápida de Veículos",
  diagnosis: "Diagnóstico Inteligente",
  obd2: "Scanner OBD2",
  catalog: "Catálogo Técnico",
  schematics: "Esquemas Elétricos",
  "camera-scanner": "Scanner por Câmera (IA)",
  quotes: "Gerador de Orçamentos",
  customers: "Cadastro de Clientes",
  schedule: "Agenda da Oficina",
  financial: "Controle Financeiro",
  inventory: "Controle de Estoque",
  "ai-mechanic": "IA Mecânico",
  defects: "Banco de Defeitos",
  history: "Histórico de Serviços",
  calculators: "Calculadoras Técnicas",
  settings: "Configurações",
  admin: "Painel Administrativo",
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(d);
}
