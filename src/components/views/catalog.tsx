"use client";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ViewHeader, SectionCard, EmptyState } from "@/components/shared/view-parts";
import {
  Search,
  Wrench,
  Gauge,
  Droplets,
  Zap,
  Cog,
  ListTree,
  CircleDot,
} from "lucide-react";
import { TORQUE_SPECS, BOLT_TORQUE_TABLE, searchTorqueSpecs } from "@/lib/data/torque";

export function Catalog() {
  const [query, setQuery] = useState("");
  const torqueResults = useMemo(() => searchTorqueSpecs(query), [query]);

  return (
    <div>
      <ViewHeader
        title="Catálogo Técnico"
        description="Torques, óleos, velas, fluidos, procedimentos e mais."
        icon={<Wrench className="h-5 w-5" />}
        accent="blue"
      />

      <div className="mb-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar torque, óleo, vela, procedimento..."
          className="h-10 rounded-xl border-border bg-card/50 pl-9"
        />
      </div>

      <Tabs defaultValue="torque" className="space-y-4">
        <TabsList className="flex w-full flex-wrap gap-1 bg-card/50">
          <TabsTrigger value="torque" className="gap-1.5">
            <Wrench className="h-3.5 w-3.5" /> Torques
          </TabsTrigger>
          <TabsTrigger value="oil" className="gap-1.5">
            <Droplets className="h-3.5 w-3.5" /> Fluidos
          </TabsTrigger>
          <TabsTrigger value="bolts" className="gap-1.5">
            <Cog className="h-3.5 w-3.5" /> Parafusos
          </TabsTrigger>
          <TabsTrigger value="procedures" className="gap-1.5">
            <ListTree className="h-3.5 w-3.5" /> Procedimentos
          </TabsTrigger>
        </TabsList>

        {/* Torque specs */}
        <TabsContent value="torque">
          <SectionCard
            title={`Especificações de torque (${torqueResults.length})`}
            icon={<Gauge className="h-4 w-4" />}
          >
            {torqueResults.length === 0 ? (
              <EmptyState
                icon={<Wrench className="h-10 w-10 opacity-40" />}
                title="Nada encontrado"
                description="Tente outro termo."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {torqueResults.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-background/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {s.component}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {s.vehicle}
                        </p>
                      </div>
                      <span className="rounded-lg bg-orange-500/15 px-2.5 py-1 text-sm font-bold text-orange-400">
                        {s.torque}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5 text-xs">
                      <p className="flex items-start gap-1.5 text-muted-foreground">
                        <ListTree className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-300" />
                        <span><strong className="text-foreground">Sequência:</strong> {s.sequence}</span>
                      </p>
                      <p className="flex items-start gap-1.5 text-muted-foreground">
                        <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-400" />
                        <span><strong className="text-foreground">Observação:</strong> {s.notes}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* Fluids */}
        <TabsContent value="oil">
          <SectionCard title="Fluidos e lubrificantes" icon={<Droplets className="h-4 w-4" />}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FLUID_SPECS.map((f) => (
                <div key={f.name} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: f.color + "22", color: f.color }}>
                      <Droplets className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-semibold text-foreground">{f.name}</p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{f.description}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground"><strong className="text-foreground">Troca:</strong> {f.change}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        {/* Bolt torque table */}
        <TabsContent value="bolts">
          <SectionCard title="Tabela de torque de parafusos (geral)" icon={<Cog className="h-4 w-4" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-semibold">Rosca</th>
                    <th className="py-2 pr-4 font-semibold">Classe</th>
                    <th className="py-2 pr-4 font-semibold">Seco (Nm)</th>
                    <th className="py-2 font-semibold">Lubrificado (Nm)</th>
                  </tr>
                </thead>
                <tbody>
                  {BOLT_TORQUE_TABLE.map((b, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono font-semibold text-foreground">{b.size}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{b.grade}</td>
                      <td className="py-2 pr-4 text-foreground">{b.dryNm}</td>
                      <td className="py-2 text-foreground">{b.lubricatedNm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              ⚠️ Valores de referência. Sempre confirme no manual do fabricante do veículo.
            </p>
          </SectionCard>
        </TabsContent>

        {/* Procedures */}
        <TabsContent value="procedures">
          <SectionCard title="Procedimentos de desmontagem/montagem" icon={<ListTree className="h-4 w-4" />}>
            <div className="space-y-3">
              {PROCEDURES.map((p) => (
                <div key={p.title} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500/15 text-orange-400">
                      <Wrench className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-sm font-semibold text-foreground">{p.title}</p>
                  </div>
                  <ol className="mt-3 space-y-1.5 pl-5 text-xs text-muted-foreground">
                    {p.steps.map((s, i) => (
                      <li key={i} className="list-decimal">
                        <span className="text-foreground">{s}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2 py-1 text-[11px] text-amber-300">
                    <Zap className="h-3 w-3" /> {p.warning}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const FLUID_SPECS = [
  { name: "Óleo de motor 5W30", color: "#ff8a3d", description: "Sintético. Indicado para maioria dos motores flex modernos.", change: "A cada 10.000 km ou 12 meses" },
  { name: "Óleo de motor 0W20", color: "#ff8a3d", description: "Sintético. Honda, Toyota e Ford Ecoboost.", change: "A cada 10.000 km ou 12 meses" },
  { name: "Óleo de motor 5W40", color: "#ff8a3d", description: "Sintético. VW e Fiat (Gol, Fox, Mobi).", change: "A cada 10.000 km ou 12 meses" },
  { name: "Fluido de freio DOT 4", color: "#3b82f6", description: "Ponto de ebulição mais alto. Padrão atual.", change: "A cada 40.000 km ou 2 anos" },
  { name: "Líquido de arrefecimento (OAT)", color: "#ec4899", description: "Rosa/longa vida. GM, Honda, Toyota.", change: "A cada 60.000 km ou 3 anos" },
  { name: "Líquido de arrefecimento (G12+)", color: "#ec4899", description: "Rosa. Padrão VW.", change: "A cada 60.000 km ou 3 anos" },
  { name: "Fluido de transmissão CVT", color: "#a78bfa", description: "Específico CVT. Use apenas o do fabricante.", change: "A cada 40.000 km" },
  { name: "Fluido de direção hidráulica", color: "#facc15", description: "ATF Dexron III ou específico.", change: "A cada 50.000 km ou 2 anos" },
];

const PROCEDURES = [
  {
    title: "Troca de óleo do motor",
    steps: [
      "Aqueça o motor por 5 minutos (óleo mais fluido)",
      "Desligue o motor e instale bandeja de dreno",
      "Remova o bujão de dreno com chave 17mm (cuidado com o óleo quente)",
      "Aguarde o óleo escorrer completamente",
      "Troque o anel de vedação do bujão (se aplicável)",
      "Recoloque o bujão com torque 17-25 Nm",
      "Remova o filtro de óleo com chave apropriada",
      "Lubrifique o anel do novo filtro com óleo limpo",
      "Instale o novo filtro apertando à mão + 3/4 de volta",
      "Adicione o óleo novo pela tampa do cabeçote",
      "Ligue o motor e verifique vazamentos",
      "Confira o nível na vareta com motor desligado",
    ],
    warning: "Nunca queime o cliente com óleo quente. Use EPI (luvas, óculos).",
  },
  {
    title: "Troca de pastilhas de freio dianteiras",
    steps: [
      "Solte as porcas das rodas com o veículo no chão",
      "Elevante o veículo e remova as rodas",
      "Abra o reservatório de fluido de freio (nível pode subir)",
      "Use alicate para empurrar o pistão da pinça",
      "Remova os parafusos da pinça (guia)",
      "Tire a pinça e apoie com arame (não deixe pendurada na mangueira)",
      "Remova as pastilhas antigas",
      "Inspecione o disco (espessura, sulpos, rebarba)",
      "Recoloque as pastilhas novas com as molas de retorno",
      "Recoloque a pinça e aperte os parafusos ao torque especificado",
      "Recoloque a roda e abaixe o veículo",
      "Bombeie o pedal de freio antes de andar",
    ],
    warning: "Pastilhas novas precisam de amaciamento (~200 km). Evite freadas bruscas.",
  },
  {
    title: "Substituição de velas de ignição",
    steps: [
      "Aguarde o motor ESFRIO (pelo menos 4h parado)",
      "Marque a ordem dos cabos de vela (não inverter)",
      "Remova o cabo da vela puxando pela bota (não pelo fio)",
      "Use chave de vela adequada e remova com cuidado",
      "Inspecione a vela antiga (cor, eletrodo, depósitos)",
      "Confira a abertura da vela nova (especificação do fabricante)",
      "Instale a vela nova APENAS com a mão até travar",
      "Apete com chave e torque 18-25 Nm (ou 1/2 volta)",
      "Recoloque o cabo de vela e ouça o clique",
      "Repita para cada cilindro uma de cada vez",
    ],
    warning: "Nunca use chave de impacto. Rosca suja pode danificar a cabeça.",
  },
];
