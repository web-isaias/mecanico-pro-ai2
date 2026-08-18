"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewHeader, SectionCard, EmptyState } from "@/components/shared/view-parts";
import {
  Spline,
  Search,
  Download,
  Eye,
  Zap,
  Cpu,
  Wrench,
  Database,
  CircleDot,
  Layers,
  type LucideIcon,
} from "lucide-react";

type Diagram = {
  id: string;
  title: string;
  category: "Eletrônico" | "Chicote" | "Módulos" | "Componentes" | "Fusíveis";
  vehicle: string;
  icon: LucideIcon;
  downloaded: boolean;
};

const DIAGRAMS: Diagram[] = [
  { id: "1", title: "Esquema de injeção eletrônica — ECU + sensores", category: "Eletrônico", vehicle: "Chevrolet Onix 1.4", icon: Cpu, downloaded: true },
  { id: "2", title: "Diagrama do chicote do motor — completo", category: "Chicote", vehicle: "Volkswagen Gol 1.0", icon: Layers, downloaded: true },
  { id: "3", title: "Localização dos módulos (BCM, ECU, ABS)", category: "Módulos", vehicle: "Honda Civic 2.0", icon: Cpu, downloaded: false },
  { id: "4", title: "Caixa de fusíveis — painel e motor", category: "Fusíveis", vehicle: "Fiat Mobi 1.0", icon: Zap, downloaded: true },
  { id: "5", title: "Esquema de ignição — bobinas e velas", category: "Eletrônico", vehicle: "Toyota Corolla 1.8", icon: Zap, downloaded: false },
  { id: "6", title: "Sensor lambda e sonda O2 — pinagem", category: "Componentes", vehicle: "Chevrolet Onix 1.4", icon: CircleDot, downloaded: false },
  { id: "7", title: "Sistema de partida e carga — alternador", category: "Eletrônico", vehicle: "Ford Ka 1.0", icon: Zap, downloaded: false },
  { id: "8", title: "Chicote da bomba de combustível", category: "Chicote", vehicle: "Fiat Strada 1.4", icon: Layers, downloaded: true },
  { id: "9", title: "Módulo ABS — pinagem e sensores de roda", category: "Módulos", vehicle: "Volkswagen Gol 1.6", icon: Cpu, downloaded: false },
  { id: "10", title: "Relés do painel e comando", category: "Fusíveis", vehicle: "Hyundai HB20 1.0", icon: Zap, downloaded: false },
];

const CATEGORIES: Diagram["category"][] = ["Eletrônico", "Chicote", "Módulos", "Componentes", "Fusíveis"];

export function Schematics() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");

  const filtered = DIAGRAMS.filter((d) => {
    const matchesQuery = !query || d.title.toLowerCase().includes(query.toLowerCase()) || d.vehicle.toLowerCase().includes(query.toLowerCase());
    const matchesCat = cat === "all" || d.category === cat;
    return matchesQuery && matchesCat;
  });

  return (
    <div>
      <ViewHeader
        title="Esquemas Elétricos e Eletrônicos"
        description="Diagramas, chicotes, módulos e localização de componentes."
        icon={<Spline className="h-5 w-5" />}
        accent="blue"
      />

      <SectionCard className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar diagrama ou veículo..."
              className="h-10 rounded-xl border-border bg-background/50 pl-9"
            />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-full sm:w-48 border-border bg-background/50">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState
              icon={<Database className="h-10 w-10 opacity-40" />}
              title="Nenhum esquema encontrado"
              description="Ajuste a busca ou filtro."
            />
          </div>
        ) : (
          filtered.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.id}
                className="card-premium flex flex-col gap-3 rounded-2xl border border-border bg-card/50 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                    {d.category}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{d.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{d.vehicle}</p>
                </div>
                <div className="mt-auto flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 border-border">
                    <Eye className="h-3.5 w-3.5" /> Visualizar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={d.downloaded ? "text-emerald-400" : "text-muted-foreground"}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {d.downloaded ? "Salvo" : "Baixar"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
