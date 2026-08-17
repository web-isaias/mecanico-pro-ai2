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
import { ViewHeader, SectionCard, EmptyState } from "@/components/shared/view-parts";
import { Search, Car, Fuel, Gauge, Droplets, Zap, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { VEHICLE_CATALOG, searchVehicles, type VehicleEngine } from "@/lib/data/vehicles";
import { useNavStore } from "@/lib/store";

type SearchResult = {
  make: string;
  logo: string;
  model: string;
  years: string;
  engine: VehicleEngine;
};

export function VehicleSearch() {
  const searchQuery = useNavStore((s) => s.searchQuery);
  const [query, setQuery] = useState(searchQuery || "");
  const [make, setMake] = useState("all");
  const [selected, setSelected] = useState<SearchResult | null>(null);

  const results = useMemo<SearchResult[]>(() => {
    let list = searchVehicles(query);
    if (make !== "all") list = list.filter((r) => r.make === make);
    return list;
  }, [query, make]);

  return (
    <div>
      <ViewHeader
        title="Pesquisa Rápida de Veículos"
        description="Encontre por marca, modelo, ano, motor, placa ou chassi."
        icon={<Search className="h-5 w-5" />}
        accent="orange"
      />

      {/* Search bar */}
      <SectionCard className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Onix 1.4, Corolla, ABC1D23, Flex..."
              className="h-10 rounded-xl border-border bg-background/50 pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={make} onValueChange={setMake}>
              <SelectTrigger className="w-44 border-border bg-background/50">
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as marcas</SelectItem>
                {VEHICLE_CATALOG.map((m) => (
                  <SelectItem key={m.name} value={m.name}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Results */}
        <div className="lg:col-span-2">
          <SectionCard title={`Resultados (${results.length})`}>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto scrollbar-premium pr-1">
              {results.length === 0 ? (
                <EmptyState
                  icon={<Car className="h-10 w-10 opacity-40" />}
                  title="Nenhum veículo encontrado"
                  description="Tente outro termo ou ajuste o filtro."
                />
              ) : (
                results.map((r, i) => (
                  <motion.button
                    key={`${r.make}-${r.model}-${i}`}
                    onClick={() => setSelected(r)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      selected?.model === r.model && selected?.engine.name === r.engine.name
                        ? "border-orange-500/50 bg-orange-500/10"
                        : "border-border bg-background/40 hover:border-orange-500/30"
                    }`}
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-lg font-bold text-white">
                      {r.logo}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {r.make} {r.model}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.engine.name} • {r.fuel} • {r.years}
                      </p>
                    </div>
                    <span className="hidden shrink-0 rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300 sm:block">
                      {r.engine.power}
                    </span>
                  </motion.button>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        {/* Ficha técnica */}
        <SectionCard title="Ficha técnica" icon={<Car className="h-4 w-4" />}>
          {!selected ? (
            <EmptyState
              icon={<Car className="h-10 w-10 opacity-40" />}
              title="Selecione um veículo"
              description="Toque em um resultado para ver a ficha técnica completa."
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 rounded-xl border border-border bg-gradient-navy p-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-lg font-bold text-white">
                  {selected.logo}
                </div>
                <div>
                  <p className="font-bold text-foreground">
                    {selected.make} {selected.model}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selected.engine.name} • {selected.years}
                  </p>
                </div>
              </div>
              <SpecRow icon={<Fuel className="h-4 w-4" />} label="Combustível" value={selected.engine.fuel} />
              <SpecRow icon={<Gauge className="h-4 w-4" />} label="Potência" value={selected.engine.power} />
              <SpecRow icon={<Droplets className="h-4 w-4" />} label="Óleo do motor" value={`${selected.engine.oilType} • ${selected.engine.oilCapacity}`} />
              <SpecRow icon={<Droplets className="h-4 w-4" />} label="Líquido de arrefecimento" value={selected.engine.coolant} />
              <SpecRow icon={<Droplets className="h-4 w-4" />} label="Fluido de freio" value={selected.engine.brakeFluid} />
              <SpecRow icon={<Gauge className="h-4 w-4" />} label="Pressão dos pneus" value={selected.engine.tirePressure} />
              <SpecRow icon={<Zap className="h-4 w-4" />} label="Velas de ignição" value={selected.engine.sparkPlug} />
              <SpecRow icon={<Zap className="h-4 w-4" />} label="Sincronismo" value={selected.engine.timingType} />
              <Button
                variant="outline"
                size="sm"
                className="w-full border-border"
                onClick={() => {
                  useNavStore.getState().setSearch(`${selected.make} ${selected.model}`);
                  useNavStore.getState().navigate("catalog");
                }}
              >
                Ver no catálogo técnico
              </Button>
            </motion.div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function SpecRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background/40 p-3">
      <span className="mt-0.5 text-orange-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
