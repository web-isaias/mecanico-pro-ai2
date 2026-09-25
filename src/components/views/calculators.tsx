"use client";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewHeader, SectionCard } from "@/components/shared/view-parts";
import { Calculator, Wrench, Gauge, Droplets, Cog, Fuel, Zap, ArrowLeftRight } from "lucide-react";

export function Calculators() {
  return (
    <div>
      <ViewHeader
        title="Calculadoras Técnicas"
        description="Torque, conversões de unidades, taxa de compressão, mistura e consumo."
        icon={<Calculator className="h-5 w-5" />}
        accent="blue"
      />

      <Tabs defaultValue="torque" className="space-y-4">
        <TabsList className="flex w-full flex-wrap gap-1 bg-card/50">
          <TabsTrigger value="torque" className="gap-1.5"><Wrench className="h-3.5 w-3.5" /> Torque</TabsTrigger>
          <TabsTrigger value="conversion" className="gap-1.5"><ArrowLeftRight className="h-3.5 w-3.5" /> Conversões</TabsTrigger>
          <TabsTrigger value="compression" className="gap-1.5"><Cog className="h-3.5 w-3.5" /> Compressão</TabsTrigger>
          <TabsTrigger value="coolant" className="gap-1.5"><Droplets className="h-3.5 w-3.5" /> Aditivo</TabsTrigger>
          <TabsTrigger value="consumption" className="gap-1.5"><Fuel className="h-3.5 w-3.5" /> Consumo</TabsTrigger>
        </TabsList>

        <TabsContent value="torque"><TorqueCalc /></TabsContent>
        <TabsContent value="conversion"><ConversionCalc /></TabsContent>
        <TabsContent value="compression"><CompressionCalc /></TabsContent>
        <TabsContent value="coolant"><CoolantCalc /></TabsContent>
        <TabsContent value="consumption"><ConsumptionCalc /></TabsContent>
      </Tabs>
    </div>
  );
}

function ResultCard({ value, label, sublabel }: { value: string; label: string; sublabel?: string }) {
  return (
    <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-orange-400 tabular-nums">{value}</p>
      {sublabel && <p className="mt-0.5 text-[11px] text-muted-foreground">{sublabel}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function TorqueCalc() {
  const [force, setForce] = useState(20);
  const [length, setLength] = useState(1); // meters
  const [unit, setUnit] = useState<"kgf" | "N">("kgf");

  const nm = useMemo(() => {
    const forceN = unit === "kgf" ? force * 9.81 : force;
    return forceN * length;
  }, [force, length, unit]);
  const kgfm = nm / 9.81;

  return (
    <SectionCard title="Torque (força × comprimento)" icon={<Wrench className="h-4 w-4" />}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Força aplicada">
          <div className="flex gap-2">
            <Input type="number" value={force} onChange={(e) => setForce(Number(e.target.value))} className="border-border bg-background/50" />
            <Select value={unit} onValueChange={(v: any) => setUnit(v)}>
              <SelectTrigger className="w-24 border-border bg-background/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kgf">kgf</SelectItem>
                <SelectItem value="N">N</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Field>
        <Field label="Comprimento da chave (m)">
          <Input type="number" step={0.01} value={length} onChange={(e) => setLength(Number(e.target.value))} className="border-border bg-background/50" />
        </Field>
        <div className="flex items-end">
          <div className="grid w-full grid-cols-2 gap-2">
            <ResultCard value={nm.toFixed(2)} label="Torque (Nm)" />
            <ResultCard value={kgfm.toFixed(2)} label="Torque (kgf·m)" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Torque (Nm) = Força (N) × Distância (m). 1 kgf = 9,81 N.
      </p>
    </SectionCard>
  );
}

function ConversionCalc() {
  const conversions = [
    { id: "nm-kgf", label: "Nm ↔ kgf·m", factor: 9.81, icon: <Wrench className="h-4 w-4" /> },
    { id: "psi-bar", label: "PSI ↔ Bar", factor: 14.5038, icon: <Gauge className="h-4 w-4" /> },
    { id: "l-ml", label: "Litros ↔ mL", factor: 1000, icon: <Droplets className="h-4 w-4" /> },
    { id: "c-f", label: "°C ↔ °F", icon: <Gauge className="h-4 w-4" /> },
  ];
  const [active, setActive] = useState("psi-bar");
  const [value, setValue] = useState(32);
  const a = conversions.find((c) => c.id === active)!;

  let primary: number, secondary: number, primaryLabel: string, secondaryLabel: string;
  if (active === "c-f") {
    primary = value * 9 / 5 + 32;
    secondary = (value - 32) * 5 / 9;
    primaryLabel = "°F";
    secondaryLabel = "°C";
  } else {
    primary = value / a.factor;
    secondary = value * a.factor;
    if (active === "nm-kgf") { primaryLabel = "kgf·m"; secondaryLabel = "Nm"; }
    else if (active === "psi-bar") { primaryLabel = "Bar"; secondaryLabel = "PSI"; }
    else { primaryLabel = "mL"; secondaryLabel = "L"; }
  }

  return (
    <SectionCard title="Conversor de medidas" icon={<ArrowLeftRight className="h-4 w-4" />}>
      <div className="mb-4 flex flex-wrap gap-2">
        {conversions.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              active === c.id
                ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={`Valor de entrada`}>
          <Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} className="border-border bg-background/50" />
        </Field>
        <ResultCard value={primary.toFixed(2)} label={`Convertido para ${primaryLabel}`} />
        <ResultCard value={secondary.toFixed(2)} label={`Convertido para ${secondaryLabel}`} />
      </div>
    </SectionCard>
  );
}

function CompressionCalc() {
  const [cylinder, setCylinder] = useState(500);
  const [combustion, setCombustion] = useState(50);
  const ratio = useMemo(() => (cylinder + combustion) / combustion, [cylinder, combustion]);
  return (
    <SectionCard title="Taxa de compressão" icon={<Cog className="h-4 w-4" />}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Volume do cilindro (cc)">
          <Input type="number" value={cylinder} onChange={(e) => setCylinder(Number(e.target.value))} className="border-border bg-background/50" />
        </Field>
        <Field label="Volume da câmara (cc)">
          <Input type="number" value={combustion} onChange={(e) => setCombustion(Number(e.target.value))} className="border-border bg-background/50" />
        </Field>
        <div className="flex items-end">
          <ResultCard value={`${ratio.toFixed(1)}:1`} label="Taxa de compressão" sublabel={ratio > 13 ? "Alta — use gasolina aditivada" : ratio > 10 ? "Média — flex" : "Baixa"} />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Taxa = (Volume do cilindro + Volume da câmara) / Volume da câmara
      </p>
    </SectionCard>
  );
}

function CoolantCalc() {
  const [total, setTotal] = useState(5);
  const [ratio, setRatio] = useState(50);
  const coolant = (total * ratio) / 100;
  const water = total - coolant;
  return (
    <SectionCard title="Mistura de aditivo" icon={<Droplets className="h-4 w-4" />}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Volume total (L)">
          <Input type="number" step={0.1} value={total} onChange={(e) => setTotal(Number(e.target.value))} className="border-border bg-background/50" />
        </Field>
        <Field label="% de aditivo">
          <Input type="number" value={ratio} onChange={(e) => setRatio(Number(e.target.value))} className="border-border bg-background/50" />
        </Field>
        <div className="flex items-end">
          <div className="grid w-full grid-cols-2 gap-2">
            <ResultCard value={`${coolant.toFixed(2)} L`} label="Aditivo" />
            <ResultCard value={`${water.toFixed(2)} L`} label="Água" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Proporção típica: 50% aditivo / 50% água destilada (clima ameno). Em regiões muito frias use até 60% aditivo.
      </p>
    </SectionCard>
  );
}

function ConsumptionCalc() {
  const [liters, setLiters] = useState(40);
  const [km, setKm] = useState(450);
  const [price, setPrice] = useState(5.79);
  const consumption = km / liters;
  const cost = (liters * price) / km;
  return (
    <SectionCard title="Consumo médio" icon={<Fuel className="h-4 w-4" />}>
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Litros abastecidos">
          <Input type="number" step={0.1} value={liters} onChange={(e) => setLiters(Number(e.target.value))} className="border-border bg-background/50" />
        </Field>
        <Field label="Km percorridos">
          <Input type="number" value={km} onChange={(e) => setKm(Number(e.target.value))} className="border-border bg-background/50" />
        </Field>
        <Field label="Preço do litro (R$)">
          <Input type="number" step={0.01} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="border-border bg-background/50" />
        </Field>
        <div className="flex items-end">
          <div className="grid w-full grid-cols-2 gap-2">
            <ResultCard value={`${consumption.toFixed(1)}`} label="km/L" />
            <ResultCard value={`R$ ${cost.toFixed(2)}`} label="/km" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Consumo = Km / Litros. Custo por km = (Litros × Preço) / Km.
      </p>
    </SectionCard>
  );
}
