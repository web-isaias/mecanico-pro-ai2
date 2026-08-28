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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
  X,
  Maximize2,
  Car,
  Calendar,
  FileType2,
  type LucideIcon,
} from "lucide-react";

type DiagramCategory = "Eletrônico" | "Chicote" | "Módulos" | "Componentes" | "Fusíveis";

type Diagram = {
  id: string;
  title: string;
  category: DiagramCategory;
  vehicle: string;
  icon: LucideIcon;
  downloaded: boolean;
  fileUrl: string; // SVG data URL with the schematic preview
  fileSize: string;
  pages: number;
  description: string;
};

// Helper: builds a SVG data URL (URL-encoded) for an inline schematic.
// Each diagram has a representative schematic rendered as SVG.
function svgDataUrl(innerSvg: string, title: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520" font-family="Inter, Arial, sans-serif">
    <rect width="800" height="520" fill="#0a1628"/>
    <rect x="0" y="0" width="800" height="44" fill="#1a2f4f"/>
    <text x="20" y="28" fill="#ff8a3d" font-size="15" font-weight="bold">Mecânico Pro AI</text>
    <text x="780" y="28" fill="#94a3b8" font-size="11" text-anchor="end">${title}</text>
    <line x1="0" y1="44" x2="800" y2="44" stroke="#ff8a3d" stroke-width="2"/>
    ${innerSvg}
    <text x="20" y="500" fill="#64748b" font-size="10">Diagrama técnico • © Mecânico Pro AI — para uso profissional</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Schematic SVGs per category — simplified automotive diagrams
const SCHEMATICS = {
  // 1. Injeção eletrônica
  injection: svgDataUrl(`
    <rect x="40" y="80" width="180" height="100" rx="8" fill="#1a2f4f" stroke="#3b82f6" stroke-width="2"/>
    <text x="130" y="125" fill="#3b82f6" font-size="14" font-weight="bold" text-anchor="middle">ECU</text>
    <text x="130" y="145" fill="#64748b" font-size="10" text-anchor="middle">Módulo de Injeção</text>
    <g stroke="#10b981" stroke-width="1.5" fill="none">
      <line x1="220" y1="100" x2="320" y2="100"/>
      <line x1="220" y1="130" x2="320" y2="130"/>
      <line x1="220" y1="160" x2="320" y2="160"/>
    </g>
    <g fill="#1a2f4f" stroke="#10b981" stroke-width="1.5">
      <circle cx="380" cy="100" r="22"/>
      <circle cx="380" cy="130" r="22"/>
      <circle cx="380" cy="160" r="22"/>
      <circle cx="380" cy="190" r="22"/>
    </g>
    <g fill="#10b981" font-size="9" text-anchor="middle">
      <text x="380" y="104">INJ1</text>
      <text x="380" y="134">INJ2</text>
      <text x="380" y="164">INJ3</text>
      <text x="380" y="194">INJ4</text>
    </g>
    <g stroke="#f59e0b" stroke-width="1.5" fill="none">
      <line x1="220" y1="190" x2="280" y2="190"/>
      <line x1="220" y1="220" x2="280" y2="220"/>
      <line x1="220" y1="250" x2="280" y2="250"/>
    </g>
    <g fill="#1a2f4f" stroke="#f59e0b" stroke-width="1.5">
      <rect x="280" y="180" width="80" height="20" rx="3"/>
      <rect x="280" y="210" width="80" height="20" rx="3"/>
      <rect x="280" y="240" width="80" height="20" rx="3"/>
    </g>
    <g fill="#f59e0b" font-size="9" text-anchor="middle">
      <text x="320" y="194">MAP</text>
      <text x="320" y="224">TPS</text>
      <text x="320" y="254">ECT</text>
    </g>
    <g stroke="#ef4444" stroke-width="2" fill="none">
      <rect x="500" y="80" width="280" height="180" rx="6" fill="#1a2f4f"/>
    </g>
    <text x="640" y="105" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle">MOTOR 4 CILINDROS</text>
    <g fill="#1a2f4f" stroke="#ef4444" stroke-width="1.5">
      <rect x="540" y="130" width="60" height="40"/>
      <rect x="610" y="130" width="60" height="40"/>
      <rect x="680" y="130" width="60" height="40"/>
      <rect x="540" y="180" width="60" height="40"/>
      <rect x="610" y="180" width="60" height="40"/>
      <rect x="680" y="180" width="60" height="40"/>
    </g>
    <g fill="#ef4444" font-size="9" text-anchor="middle">
      <text x="570" y="154">CIL 1</text>
      <text x="640" y="154">CIL 2</text>
      <text x="710" y="154">CIL 3</text>
      <text x="570" y="204">CIL 4</text>
      <text x="640" y="204">Velas</text>
      <text x="710" y="204">Bobinas</text>
    </g>
    <g stroke="#94a3b8" stroke-width="1" fill="none" stroke-dasharray="3,3">
      <line x1="402" y1="100" x2="540" y2="150"/>
      <line x1="402" y1="130" x2="610" y2="150"/>
      <line x1="402" y1="160" x2="680" y2="150"/>
      <line x1="402" y1="190" x2="540" y2="200"/>
    </g>
    <rect x="40" y="320" width="720" height="120" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="60" y="345" fill="#94a3b8" font-size="11" font-weight="bold">LEGENDA</text>
    <g font-size="10">
      <rect x="60" y="360" width="14" height="14" fill="#3b82f6"/><text x="82" y="372" fill="#cbd5e1">ECU (Unidade de Controle)</text>
      <rect x="280" y="360" width="14" height="14" fill="#10b981"/><text x="302" y="372" fill="#cbd5e1">Bicos injetores</text>
      <rect x="480" y="360" width="14" height="14" fill="#f59e0b"/><text x="502" y="372" fill="#cbd5e1">Sensores</text>
      <rect x="60" y="390" width="14" height="14" fill="#ef4444"/><text x="82" y="402" fill="#cbd5e1">Bloco do motor</text>
      <rect x="280" y="390" width="14" height="14" fill="#94a3b8"/><text x="302" y="402" fill="#cbd5e1">Chicote de ligação</text>
    </g>
  `, "Esquema Injeção Eletrônica"),

  // 2. Chicote do motor
  harness: svgDataUrl(`
    <rect x="40" y="80" width="720" height="220" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="400" y="105" fill="#10b981" font-size="13" font-weight="bold" text-anchor="middle">CHICOTE PRINCIPAL DO MOTOR</text>
    <g stroke="#10b981" stroke-width="2" fill="none">
      <path d="M 80 140 Q 200 130 320 140 T 560 150 T 720 140"/>
      <path d="M 80 170 Q 200 165 320 175 T 560 180 T 720 170"/>
      <path d="M 80 200 Q 200 195 320 205 T 560 210 T 720 200"/>
      <path d="M 80 230 Q 200 225 320 235 T 560 240 T 720 230"/>
      <path d="M 80 260 Q 200 255 320 265 T 560 270 T 720 260"/>
    </g>
    <g fill="#1a2f4f" stroke="#3b82f6" stroke-width="1.5">
      <rect x="100" y="125" width="60" height="30" rx="3"/>
      <rect x="240" y="125" width="60" height="30" rx="3"/>
      <rect x="380" y="125" width="60" height="30" rx="3"/>
      <rect x="520" y="125" width="60" height="30" rx="3"/>
      <rect x="640" y="125" width="60" height="30" rx="3"/>
    </g>
    <g fill="#3b82f6" font-size="9" text-anchor="middle">
      <text x="130" y="144">ECU</text>
      <text x="270" y="144">Sensor</text>
      <text x="410" y="144">Bico</text>
      <text x="550" y="144">Bobina</text>
      <text x="670" y="144">Bateria</text>
    </g>
    <g stroke="#f59e0b" stroke-width="1" fill="none">
      <circle cx="130" cy="170" r="6" fill="#1a2f4f"/>
      <circle cx="270" cy="170" r="6" fill="#1a2f4f"/>
      <circle cx="410" cy="170" r="6" fill="#1a2f4f"/>
      <circle cx="550" cy="170" r="6" fill="#1a2f4f"/>
      <circle cx="670" cy="170" r="6" fill="#1a2f4f"/>
      <circle cx="130" cy="200" r="6" fill="#1a2f4f"/>
      <circle cx="270" cy="200" r="6" fill="#1a2f4f"/>
      <circle cx="410" cy="200" r="6" fill="#1a2f4f"/>
      <circle cx="550" cy="200" r="6" fill="#1a2f4f"/>
      <circle cx="670" cy="200" r="6" fill="#1a2f4f"/>
      <circle cx="130" cy="230" r="6" fill="#1a2f4f"/>
      <circle cx="270" cy="230" r="6" fill="#1a2f4f"/>
      <circle cx="410" cy="230" r="6" fill="#1a2f4f"/>
      <circle cx="550" cy="230" r="6" fill="#1a2f4f"/>
      <circle cx="670" cy="230" r="6" fill="#1a2f4f"/>
    </g>
    <text x="60" y="280" fill="#94a3b8" font-size="10">Conectores: 15 pinos | Seção: 0.5mm² a 2.5mm² | Comprimento: 1.8m</text>
    <rect x="40" y="320" width="720" height="120" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="60" y="345" fill="#94a3b8" font-size="11" font-weight="bold">ESQUEMA DE FIAÇÃO</text>
    <g font-size="10" fill="#cbd5e1">
      <text x="60" y="370">• Cabo preto/vermelho: alimentação 12V (+30)</text>
      <text x="60" y="388">• Cabo marrom: massa (-31)</text>
      <text x="60" y="406">• Cabo amarelo: sinal de sensores</text>
      <text x="60" y="424">• Cabo verde: comando de atuadores</text>
    </g>
  `, "Diagrama Chicote do Motor"),

  // 3. Localização de módulos
  modules: svgDataUrl(`
    <rect x="40" y="80" width="720" height="280" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="400" y="105" fill="#a78bfa" font-size="13" font-weight="bold" text-anchor="middle">VISTA SUPERIOR DO VEÍCULO — LOCALIZAÇÃO DE MÓDULOS</text>
    <rect x="200" y="130" width="400" height="200" rx="20" fill="none" stroke="#475569" stroke-width="2"/>
    <rect x="280" y="140" width="80" height="40" rx="5" fill="#1a2f4f" stroke="#475569"/>
    <rect x="440" y="140" width="80" height="40" rx="5" fill="#1a2f4f" stroke="#475569"/>
    <text x="320" y="164" fill="#94a3b8" font-size="9" text-anchor="middle">Porta diant.</text>
    <text x="480" y="164" fill="#94a3b8" font-size="9" text-anchor="middle">Porta diant.</text>
    <g fill="#1a2f4f" stroke="#3b82f6" stroke-width="2">
      <rect x="220" y="180" width="60" height="30" rx="3"/>
      <text x="250" y="200" fill="#3b82f6" font-size="9" text-anchor="middle">ECU</text>
    </g>
    <line x1="250" y1="210" x2="250" y2="240" stroke="#3b82f6" stroke-width="1" stroke-dasharray="2,2"/>
    <text x="220" y="245" fill="#3b82f6" font-size="9">① ECU (Motor)</text>
    <g fill="#1a2f4f" stroke="#10b981" stroke-width="2">
      <rect x="350" y="180" width="60" height="30" rx="3"/>
      <text x="380" y="200" fill="#10b981" font-size="9" text-anchor="middle">BCM</text>
    </g>
    <line x1="380" y1="210" x2="380" y2="240" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2"/>
    <text x="350" y="245" fill="#10b981" font-size="9">② BCM (Painel)</text>
    <g fill="#1a2f4f" stroke="#f59e0b" stroke-width="2">
      <rect x="480" y="180" width="60" height="30" rx="3"/>
      <text x="510" y="200" fill="#f59e0b" font-size="9" text-anchor="middle">ABS</text>
    </g>
    <line x1="510" y1="210" x2="510" y2="240" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2,2"/>
    <text x="480" y="245" fill="#f59e0b" font-size="9">③ ABS (Freio)</text>
    <g fill="#1a2f4f" stroke="#ef4444" stroke-width="2">
      <rect x="540" y="270" width="50" height="30" rx="3"/>
      <text x="565" y="290" fill="#ef4444" font-size="9" text-anchor="middle">SRS</text>
    </g>
    <line x1="565" y1="270" x2="565" y2="240" stroke="#ef4444" stroke-width="1" stroke-dasharray="2,2"/>
    <text x="540" y="312" fill="#ef4444" font-size="9">④ SRS (Airbag)</text>
    <g fill="#1a2f4f" stroke="#a78bfa" stroke-width="2">
      <rect x="280" y="270" width="50" height="30" rx="3"/>
      <text x="305" y="290" fill="#a78bfa" font-size="9" text-anchor="middle">TS</text>
    </g>
    <text x="260" y="312" fill="#a78bfa" font-size="9">⑤ TCU (Câmbio)</text>
    <rect x="40" y="380" width="720" height="60" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="60" y="405" fill="#94a3b8" font-size="11" font-weight="bold">DISTÂNCIAS DE REFERÊNCIA</text>
    <text x="60" y="424" fill="#cbd5e1" font-size="10">ECU: 0.4m | BCM: 1.2m | ABS: 0.8m | SRS: 1.5m | TCU: 1.0m do painel</text>
  `, "Localização dos Módulos"),

  // 4. Caixa de fusíveis
  fuses: svgDataUrl(`
    <rect x="40" y="80" width="720" height="280" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="400" y="105" fill="#f59e0b" font-size="13" font-weight="bold" text-anchor="middle">CAIXA DE FUSÍVEIS — PAINEL E MOTOR</text>
    <rect x="60" y="130" width="320" height="200" rx="6" fill="#0a1628" stroke="#f59e0b" stroke-width="1"/>
    <text x="220" y="150" fill="#f59e0b" font-size="11" font-weight="bold" text-anchor="middle">CAIXA DO PAINEL</text>
    <g font-size="8" text-anchor="middle">
      ${Array.from({ length: 30 }, (_, i) => {
        const x = 80 + (i % 10) * 30;
        const y = 170 + Math.floor(i / 10) * 40;
        const amp = [10, 15, 20, 10, 25, 15, 10, 30, 15, 10][i % 10];
        return `<rect x="${x}" y="${y}" width="24" height="30" rx="2" fill="#1a2f4f" stroke="#475569" stroke-width="1"/><text x="${x + 12}" y="${y + 12}" fill="#cbd5e1" font-size="8" text-anchor="middle">F${i + 1}</text><text x="${x + 12}" y="${y + 25}" fill="#f59e0b" font-size="8" text-anchor="middle" font-weight="bold">${amp}A</text>`;
      }).join("")}
    </g>
    <rect x="420" y="130" width="320" height="200" rx="6" fill="#0a1628" stroke="#ef4444" stroke-width="1"/>
    <text x="580" y="150" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">CAIXA DO MOTOR</text>
    <g font-size="8">
      ${Array.from({ length: 24 }, (_, i) => {
        const x = 440 + (i % 8) * 38;
        const y = 170 + Math.floor(i / 8) * 60;
        const amp = [30, 40, 50, 60, 30, 40, 50, 60][i % 8];
        const isMain = i < 8;
        return `<rect x="${x}" y="${y}" width="32" height="50" rx="2" fill="#1a2f4f" stroke="${isMain ? "#ef4444" : "#475569"}" stroke-width="1.5"/><text x="${x + 16}" y="${y + 18}" fill="#cbd5e1" font-size="9" text-anchor="middle">F${i + 31}</text><text x="${x + 16}" y="${y + 35}" fill="#ef4444" font-size="9" text-anchor="middle" font-weight="bold">${amp}A</text>`;
      }).join("")}
    </g>
    <rect x="40" y="380" width="720" height="60" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="60" y="405" fill="#94a3b8" font-size="11" font-weight="bold">LEGENDA DE CORES</text>
    <g font-size="10">
      <rect x="60" y="418" width="12" height="12" fill="#ef4444"/><text x="78" y="428" fill="#cbd5e1">10A Vermelho</text>
      <rect x="180" y="418" width="12" height="12" fill="#3b82f6"/><text x="198" y="428" fill="#cbd5e1">15A Azul</text>
      <rect x="280" y="418" width="12" height="12" fill="#f59e0b"/><text x="298" y="428" fill="#cbd5e1">20A Amarelo</text>
      <rect x="400" y="418" width="12" height="12" fill="#10b981"/><text x="418" y="428" fill="#cbd5e1">30A Verde</text>
      <rect x="520" y="418" width="12" height="12" fill="#a78bfa"/><text x="538" y="428" fill="#cbd5e1">40A Roxo</text>
      <rect x="620" y="418" width="12" height="12" fill="#f43f5e"/><text x="638" y="428" fill="#cbd5e1">50A+ Maxi</text>
    </g>
  `, "Caixa de Fusíveis"),

  // 5. Ignição
  ignition: svgDataUrl(`
    <rect x="40" y="80" width="720" height="240" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="400" y="105" fill="#ef4444" font-size="13" font-weight="bold" text-anchor="middle">SISTEMA DE IGNIÇÃO — BOBINAS E VELAS</text>
    <g>
      ${[0, 1, 2, 3].map((i) => {
        const x = 100 + i * 170;
        return `
          <g fill="#1a2f4f" stroke="#f59e0b" stroke-width="2">
            <rect x="${x}" y="140" width="60" height="40" rx="4"/>
            <text x="${x + 30}" y="164" fill="#f59e0b" font-size="10" text-anchor="middle" font-weight="bold">BOB ${i + 1}</text>
          </g>
          <line x1="${x + 30}" y1="180" x2="${x + 30}" y2="210" stroke="#ef4444" stroke-width="2"/>
          <g fill="#1a2f4f" stroke="#94a3b8" stroke-width="1.5">
            <rect x="${x + 20}" y="210" width="20" height="30"/>
          </g>
          <text x="${x + 30}" y="260" fill="#94a3b8" font-size="8" text-anchor="middle">Vela ${i + 1}</text>
          <line x1="${x}" y1="160" x2="${x - 20}" y2="160" stroke="#10b981" stroke-width="1.5"/>
        `;
      }).join("")}
    </g>
    <rect x="60" y="120" width="40" height="160" rx="3" fill="#1a2f4f" stroke="#3b82f6" stroke-width="2"/>
    <text x="80" y="200" fill="#3b82f6" font-size="10" text-anchor="middle" transform="rotate(-90 80 200)">ECU</text>
    <text x="80" y="115" fill="#3b82f6" font-size="9" text-anchor="middle">ECU</text>
    <g stroke="#10b981" stroke-width="1.5" fill="none">
      <line x1="100" y1="160" x2="80" y2="160"/>
      <line x1="100" y1="195" x2="80" y2="195"/>
      <line x1="100" y1="230" x2="80" y2="230"/>
      <line x1="100" y1="265" x2="80" y2="265"/>
    </g>
    <rect x="40" y="340" width="720" height="100" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="60" y="365" fill="#94a3b8" font-size="11" font-weight="bold">ESPECIFICAÇÕES</text>
    <g font-size="10" fill="#cbd5e1">
      <text x="60" y="388">• Gap das velas: 0.9 — 1.1 mm</text>
      <text x="60" y="408">• Torque de aperto: 18 — 25 Nm</text>
      <text x="60" y="428">• Resistência primária: 0.4 — 0.6 Ω | Secundária: 8 — 12 kΩ</text>
      <text x="400" y="388">• Ordem de ignição: 1-3-4-2</text>
      <text x="400" y="408">• Tensão de disparo: 25 — 40 kV</text>
      <text x="400" y="428">• Vela recomendada: NGK IFR6A11</text>
    </g>
  `, "Sistema de Ignição"),

  // 6. Sensor lambda / sonda O2
  o2sensor: svgDataUrl(`
    <rect x="40" y="80" width="720" height="280" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="400" y="105" fill="#10b981" font-size="13" font-weight="bold" text-anchor="middle">SENSOR LAMBDA — SONDA O2 (PINAGEM)</text>
    <g fill="#1a2f4f" stroke="#10b981" stroke-width="2">
      <ellipse cx="200" cy="220" rx="50" ry="40"/>
      <rect x="150" y="180" width="100" height="20"/>
    </g>
    <text x="200" y="225" fill="#10b981" font-size="11" text-anchor="middle" font-weight="bold">SONDA O2</text>
    <text x="200" y="270" fill="#94a3b8" font-size="9" text-anchor="middle">Lambda Probe</text>
    <g stroke="#10b981" stroke-width="1.5">
      <line x1="250" y1="170" x2="380" y2="170"/>
      <line x1="250" y1="200" x2="380" y2="200"/>
      <line x1="250" y1="230" x2="380" y2="230"/>
      <line x1="250" y1="260" x2="380" y2="260"/>
    </g>
    <g fill="#1a2f4f" stroke="#3b82f6" stroke-width="2">
      <rect x="380" y="150" width="120" height="130" rx="4"/>
    </g>
    <text x="440" y="175" fill="#3b82f6" font-size="10" text-anchor="middle" font-weight="bold">CONECTOR</text>
    <text x="440" y="190" fill="#94a3b8" font-size="8" text-anchor="middle">4 pinos</text>
    <g>
      <circle cx="400" cy="170" r="6" fill="#1a2f4f" stroke="#ef4444" stroke-width="2"/>
      <circle cx="480" cy="170" r="6" fill="#1a2f4f" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="400" cy="200" r="6" fill="#1a2f4f" stroke="#10b981" stroke-width="2"/>
      <circle cx="480" cy="200" r="6" fill="#1a2f4f" stroke="#3b82f6" stroke-width="2"/>
    </g>
    <g font-size="9" fill="#cbd5e1">
      <text x="510" y="174">① +12V Aquecedor (vermelho)</text>
      <text x="510" y="204">② GND Aquecedor (marrom)</text>
      <text x="510" y="174" dx="0" dy="20">③ Sinal (amarelo)</text>
      <text x="510" y="174" dx="0" dy="40">④ Referência (preto)</text>
    </g>
    <rect x="40" y="380" width="720" height="60" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="60" y="405" fill="#94a3b8" font-size="11" font-weight="bold">ESPECIFICAÇÃO TÉCNICA</text>
    <text x="60" y="424" fill="#cbd5e1" font-size="10">Tipo: Zircônia | Faixa: 0.1 — 0.9V | Tempo de resposta: &lt;100ms | Torque: 45 — 55 Nm</text>
  `, "Pinagem Sonda O2"),

  // 7. Sistema de partida e carga
  alternator: svgDataUrl(`
    <rect x="40" y="80" width="720" height="280" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="400" y="105" fill="#f59e0b" font-size="13" font-weight="bold" text-anchor="middle">SISTEMA DE PARTIDA E CARGA — ALTERNADOR</text>
    <g fill="#1a2f4f" stroke="#ef4444" stroke-width="2">
      <rect x="80" y="180" width="80" height="60" rx="6"/>
      <text x="120" y="215" fill="#ef4444" font-size="10" text-anchor="middle" font-weight="bold">BATERIA</text>
      <text x="120" y="250" fill="#94a3b8" font-size="9" text-anchor="middle">12V / 60Ah</text>
    </g>
    <g stroke="#ef4444" stroke-width="2.5" fill="none">
      <line x1="160" y1="200" x2="280" y2="200"/>
      <line x1="160" y1="220" x2="280" y2="220"/>
    </g>
    <text x="220" y="195" fill="#ef4444" font-size="9" text-anchor="middle">+</text>
    <text x="220" y="235" fill="#ef4444" font-size="9" text-anchor="middle">−</text>
    <g fill="#1a2f4f" stroke="#f59e0b" stroke-width="2">
      <circle cx="350" cy="210" r="50"/>
      <text x="350" y="215" fill="#f59e0b" font-size="11" text-anchor="middle" font-weight="bold">ALTERNADOR</text>
      <text x="350" y="280" fill="#94a3b8" font-size="9" text-anchor="middle">90A / 14.4V</text>
    </g>
    <g stroke="#10b981" stroke-width="1.5" fill="none">
      <path d="M 400 200 L 480 200 L 480 180"/>
      <path d="M 400 220 L 500 220 L 500 240"/>
    </g>
    <text x="440" y="175" fill="#10b981" font-size="9">D+</text>
    <text x="460" y="255" fill="#10b981" font-size="9">B+</text>
    <g fill="#1a2f4f" stroke="#a78bfa" stroke-width="2">
      <rect x="550" y="160" width="80" height="40" rx="4"/>
      <rect x="550" y="220" width="80" height="40" rx="4"/>
      <text x="590" y="185" fill="#a78bfa" font-size="10" text-anchor="middle" font-weight="bold">REGULADOR</text>
      <text x="590" y="245" fill="#a78bfa" font-size="10" text-anchor="middle" font-weight="bold">RELÉ</text>
    </g>
    <g stroke="#3b82f6" stroke-width="1.5" fill="none">
      <line x1="630" y1="180" x2="680" y2="180"/>
      <line x1="630" y1="240" x2="680" y2="240"/>
    </g>
    <g fill="#1a2f4f" stroke="#3b82f6" stroke-width="2">
      <rect x="680" y="160" width="60" height="100" rx="4"/>
      <text x="710" y="210" fill="#3b82f6" font-size="10" text-anchor="middle" font-weight="bold" transform="rotate(-90 710 210)">ECU</text>
    </g>
    <rect x="40" y="380" width="720" height="60" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="60" y="405" fill="#94a3b8" font-size="11" font-weight="bold">TESTE E ESPECIFICAÇÃO</text>
    <text x="60" y="424" fill="#cbd5e1" font-size="10">Tensão carga: 13.8 — 14.4V | Corrente máx: 90A | Correia: 6PK1140 | Teste ripple: &lt;100mV</text>
  `, "Sistema de Partida e Carga"),

  // 8. Chicote da bomba de combustível
  fuelpump: svgDataUrl(`
    <rect x="40" y="80" width="720" height="280" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="400" y="105" fill="#10b981" font-size="13" font-weight="bold" text-anchor="middle">CHICOTE DA BOMBA DE COMBUSTÍVEL</text>
    <g fill="#1a2f4f" stroke="#3b82f6" stroke-width="2">
      <rect x="80" y="170" width="80" height="50" rx="4"/>
      <text x="120" y="200" fill="#3b82f6" font-size="10" text-anchor="middle" font-weight="bold">ECU</text>
    </g>
    <g stroke="#10b981" stroke-width="2" fill="none">
      <path d="M 160 180 Q 250 170 340 180"/>
      <path d="M 160 195 Q 250 200 340 200"/>
      <path d="M 160 210 Q 250 220 340 215"/>
    </g>
    <g fill="#1a2f4f" stroke="#f59e0b" stroke-width="2">
      <rect x="340" y="155" width="60" height="80" rx="4"/>
      <text x="370" y="200" fill="#f59e0b" font-size="9" text-anchor="middle" font-weight="bold">RELÉ</text>
      <text x="370" y="215" fill="#94a3b8" font-size="8" text-anchor="middle">Bomb</text>
    </g>
    <g stroke="#ef4444" stroke-width="2" fill="none">
      <path d="M 400 180 Q 480 175 540 185"/>
      <path d="M 400 215 Q 480 220 540 210"/>
    </g>
    <g fill="#1a2f4f" stroke="#ef4444" stroke-width="2">
      <ellipse cx="600" cy="200" rx="60" ry="40"/>
      <text x="600" y="200" fill="#ef4444" font-size="10" text-anchor="middle" font-weight="bold">BOMBA</text>
      <text x="600" y="215" fill="#94a3b8" font-size="8" text-anchor="middle">5 — 8 bar</text>
    </g>
    <g stroke="#a78bfa" stroke-width="1.5" fill="none">
      <line x1="600" y1="240" x2="600" y2="280"/>
      <line x1="620" y1="240" x2="620" y2="280"/>
    </g>
    <g fill="#1a2f4f" stroke="#a78bfa" stroke-width="2">
      <rect x="560" y="280" width="80" height="30" rx="3"/>
      <text x="600" y="300" fill="#a78bfa" font-size="9" text-anchor="middle" font-weight="bold">SENSOR NÍVEL</text>
    </g>
    <rect x="40" y="380" width="720" height="60" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="60" y="405" fill="#94a3b8" font-size="11" font-weight="bold">PINAGEM (4 VIAS)</text>
    <text x="60" y="424" fill="#cbd5e1" font-size="10">① +12V Bomba | ② GND | ③ Sinal nível | ④ Massa nível | Conector: AMP Superseal 4-pin</text>
  `, "Chicote Bomba Combustível"),

  // 9. Módulo ABS
  abs: svgDataUrl(`
    <rect x="40" y="80" width="720" height="280" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="400" y="105" fill="#f59e0b" font-size="13" font-weight="bold" text-anchor="middle">MÓDULO ABS — PINAGEM E SENSORES DE RODA</text>
    <g fill="#1a2f4f" stroke="#f59e0b" stroke-width="2">
      <rect x="320" y="170" width="160" height="80" rx="6"/>
      <text x="400" y="200" fill="#f59e0b" font-size="12" text-anchor="middle" font-weight="bold">MÓDULO ABS</text>
      <text x="400" y="220" fill="#94a3b8" font-size="9" text-anchor="middle">Hydraulic Unit + ECU</text>
    </g>
    <g stroke="#3b82f6" stroke-width="1.5" fill="none">
      <line x1="320" y1="180" x2="240" y2="140"/>
      <line x1="320" y1="200" x2="240" y2="170"/>
      <line x1="320" y1="220" x2="240" y2="200"/>
      <line x1="320" y1="240" x2="240" y2="230"/>
    </g>
    <g fill="#1a2f4f" stroke="#3b82f6" stroke-width="2">
      <rect x="180" y="125" width="60" height="30" rx="3"/>
      <text x="210" y="145" fill="#3b82f6" font-size="9" text-anchor="middle">ECU</text>
    </g>
    <g stroke="#10b981" stroke-width="1.5" fill="none">
      <line x1="480" y1="180" x2="580" y2="140"/>
      <line x1="480" y1="200" x2="580" y2="180"/>
      <line x1="480" y1="220" x2="580" y2="220"/>
      <line x1="480" y1="240" x2="580" y2="260"/>
    </g>
    <g fill="#1a2f4f" stroke="#10b981" stroke-width="2">
      <circle cx="610" cy="140" r="22"/>
      <circle cx="610" cy="180" r="22"/>
      <circle cx="610" cy="220" r="22"/>
      <circle cx="610" cy="260" r="22"/>
    </g>
    <g fill="#10b981" font-size="9" text-anchor="middle">
      <text x="610" y="143">Rod.</text>
      <text x="610" y="154">Diant.</text>
      <text x="610" y="183">Rod.</text>
      <text x="610" y="194">Esq.</text>
      <text x="610" y="223">Rod.</text>
      <text x="610" y="234">Dirt.</text>
      <text x="610" y="263">Rod.</text>
      <text x="610" y="274">Tras.</text>
    </g>
    <g stroke="#ef4444" stroke-width="1.5" fill="none">
      <line x1="400" y1="250" x2="400" y2="290"/>
      <line x1="380" y1="250" x2="380" y2="290"/>
      <line x1="420" y1="250" x2="420" y2="290"/>
    </g>
    <g fill="#ef4444" font-size="9" text-anchor="middle">
      <text x="380" y="305">Hid.</text>
      <text x="400" y="305">Bomba</text>
      <text x="420" y="305">Válv.</text>
    </g>
    <rect x="40" y="380" width="720" height="60" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="60" y="405" fill="#94a3b8" font-size="11" font-weight="bold">CÓDIGOS DE FALHA COMUNS</text>
    <text x="60" y="424" fill="#cbd5e1" font-size="10">C0035 — Sensor dianteiro esquerdo | C0040 — Dianteiro direito | C0045 — Traseiro</text>
  `, "Módulo ABS"),

  // 10. Relés do painel
  relays: svgDataUrl(`
    <rect x="40" y="80" width="720" height="320" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="400" y="105" fill="#a78bfa" font-size="13" font-weight="bold" text-anchor="middle">RELÉS DO PAINEL — COMANDO E FUNÇÃO</text>
    <g font-size="10">
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const x = 70 + (i % 4) * 175;
        const y = 130 + Math.floor(i / 4) * 130;
        const labels = [
          { n: "R1", f: "Bomba Combustível", c: "#ef4444" },
          { n: "R2", f: "Partida", c: "#f59e0b" },
          { n: "R3", f: "Ventoinha", c: "#10b981" },
          { n: "R4", f: "Farol Baixo", c: "#3b82f6" },
          { n: "R5", f: "Farol Alto", c: "#3b82f6" },
          { n: "R6", f: "Buzina", c: "#a78bfa" },
          { n: "R7", f: "Limpar Para-brisa", c: "#10b981" },
          { n: "R8", f: "Aquecedor", c: "#ef4444" },
        ][i];
        return `
          <g fill="#1a2f4f" stroke="${labels.c}" stroke-width="2">
            <rect x="${x}" y="${y}" width="60" height="80" rx="4"/>
            <text x="${x + 30}" y="${y + 25}" fill="${labels.c}" font-size="11" text-anchor="middle" font-weight="bold">${labels.n}</text>
            <text x="${x + 30}" y="${y + 50}" fill="#94a3b8" font-size="8" text-anchor="middle">40A</text>
            <circle cx="${x + 15}" cy="${y + 65}" r="3" fill="${labels.c}"/>
            <circle cx="${x + 30}" cy="${y + 65}" r="3" fill="${labels.c}"/>
            <circle cx="${x + 45}" cy="${y + 65}" r="3" fill="${labels.c}"/>
          </g>
          <text x="${x + 75}" y="${y + 30}" fill="#cbd5e1" font-size="9">${labels.f}</text>
          <text x="${x + 75}" y="${y + 50}" fill="#64748b" font-size="8">4 pinos ISO</text>
          <text x="${x + 75}" y="${y + 70}" fill="#64748b" font-size="8">NA/NC</text>
        `;
      }).join("")}
    </g>
    <rect x="40" y="400" width="720" height="40" rx="6" fill="#1a2f4f" stroke="#475569" stroke-width="1"/>
    <text x="60" y="424" fill="#94a3b8" font-size="11" font-weight="bold">PINAGEM: ① Bobina + | ② Bobina − | ③ Contato NA | ④ Contato comum (C)</text>
  `, "Relés do Painel"),
};

const DIAGRAMS: Diagram[] = [
  {
    id: "1",
    title: "Esquema de injeção eletrônica — ECU + sensores",
    category: "Eletrônico",
    vehicle: "Chevrolet Onix 1.4",
    icon: Cpu,
    downloaded: true,
    fileUrl: SCHEMATICS.injection,
    fileSize: "1.2 MB",
    pages: 3,
    description: "Diagrama completo do sistema de injeção eletrônica com pinagem da ECU, bicos injetores, sensores (MAP, TPS, ECT) e o bloco do motor.",
  },
  {
    id: "2",
    title: "Diagrama do chicote do motor — completo",
    category: "Chicote",
    vehicle: "Volkswagen Gol 1.0",
    icon: Layers,
    downloaded: true,
    fileUrl: SCHEMATICS.harness,
    fileSize: "2.4 MB",
    pages: 5,
    description: "Chicote principal do motor com identificação de conectores, bitolas de fio e códigos de cor conforme norma DIN.",
  },
  {
    id: "3",
    title: "Localização dos módulos (BCM, ECU, ABS)",
    category: "Módulos",
    vehicle: "Honda Civic 2.0",
    icon: Cpu,
    downloaded: false,
    fileUrl: SCHEMATICS.modules,
    fileSize: "0.8 MB",
    pages: 2,
    description: "Vista superior do veículo mostrando a localização exata de todos os módulos eletrônicos com distâncias de referência.",
  },
  {
    id: "4",
    title: "Caixa de fusíveis — painel e motor",
    category: "Fusíveis",
    vehicle: "Fiat Mobi 1.0",
    icon: Zap,
    downloaded: true,
    fileUrl: SCHEMATICS.fuses,
    fileSize: "1.5 MB",
    pages: 4,
    description: "Diagrama completo das caixas de fusíveis do painel (30 fusíveis) e do motor (24 fusíveis) com legenda de cores e amperagens.",
  },
  {
    id: "5",
    title: "Esquema de ignição — bobinas e velas",
    category: "Eletrônico",
    vehicle: "Toyota Corolla 1.8",
    icon: Zap,
    downloaded: false,
    fileUrl: SCHEMATICS.ignition,
    fileSize: "0.9 MB",
    pages: 2,
    description: "Sistema de ignição com bobinas independentes (coil-on-plug), especificações de gap, torque e resistências.",
  },
  {
    id: "6",
    title: "Sensor lambda e sonda O2 — pinagem",
    category: "Componentes",
    vehicle: "Chevrolet Onix 1.4",
    icon: CircleDot,
    downloaded: false,
    fileUrl: SCHEMATICS.o2sensor,
    fileSize: "0.6 MB",
    pages: 1,
    description: "Pinagem detalhada do sensor lambda (sonda O2) de 4 fios com funções, cores e especificações técnicas.",
  },
  {
    id: "7",
    title: "Sistema de partida e carga — alternador",
    category: "Eletrônico",
    vehicle: "Ford Ka 1.0",
    icon: Zap,
    downloaded: false,
    fileUrl: SCHEMATICS.alternator,
    fileSize: "1.1 MB",
    pages: 3,
    description: "Esquema elétrico do sistema de carga com bateria, alternador, regulador de tensão e procedimentos de teste.",
  },
  {
    id: "8",
    title: "Chicote da bomba de combustível",
    category: "Chicote",
    vehicle: "Fiat Strada 1.4",
    icon: Layers,
    downloaded: true,
    fileUrl: SCHEMATICS.fuelpump,
    fileSize: "0.7 MB",
    pages: 2,
    description: "Chicote da bomba de combustível com relé, sensor de nível e pinagem do conector AMP Superseal 4 vias.",
  },
  {
    id: "9",
    title: "Módulo ABS — pinagem e sensores de roda",
    category: "Módulos",
    vehicle: "Volkswagen Gol 1.6",
    icon: Cpu,
    downloaded: false,
    fileUrl: SCHEMATICS.abs,
    fileSize: "1.3 MB",
    pages: 3,
    description: "Módulo ABS com pinagem completa, sensores de roda (4 canais), unidade hidráulica e códigos de falha comuns.",
  },
  {
    id: "10",
    title: "Relés do painel e comando",
    category: "Fusíveis",
    vehicle: "Hyundai HB20 1.0",
    icon: Zap,
    downloaded: false,
    fileUrl: SCHEMATICS.relays,
    fileSize: "0.9 MB",
    pages: 2,
    description: "Diagrama dos 8 relés principais do painel com função de cada um, pinagem ISO e amperagens.",
  },
];

const CATEGORIES: DiagramCategory[] = ["Eletrônico", "Chicote", "Módulos", "Componentes", "Fusíveis"];

const CATEGORY_COLORS: Record<DiagramCategory, string> = {
  "Eletrônico": "text-orange-400 bg-orange-500/10",
  "Chicote": "text-emerald-400 bg-emerald-500/10",
  "Módulos": "text-blue-400 bg-blue-500/10",
  "Componentes": "text-purple-400 bg-purple-500/10",
  "Fusíveis": "text-amber-400 bg-amber-500/10",
};

export function Schematics() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [selected, setSelected] = useState<Diagram | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = DIAGRAMS.filter((d) => {
    const matchesQuery = !query || d.title.toLowerCase().includes(query.toLowerCase()) || d.vehicle.toLowerCase().includes(query.toLowerCase());
    const matchesCat = cat === "all" || d.category === cat;
    return matchesQuery && matchesCat;
  });

  const openDiagram = (d: Diagram) => {
    setSelected(d);
    setOpen(true);
  };

  const downloadDiagram = (d: Diagram, e: React.MouseEvent) => {
    e.stopPropagation();
    // Trigger download of the SVG as a file
    const link = document.createElement("a");
    link.href = d.fileUrl;
    link.download = `esquema-${d.id}-${d.vehicle.toLowerCase().replace(/\s+/g, "-")}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                {/* Preview thumbnail */}
                <div
                  className="relative cursor-pointer overflow-hidden rounded-lg border border-border bg-background/60"
                  onClick={() => openDiagram(d)}
                >
                  <img
                    src={d.fileUrl}
                    alt={d.title}
                    className="h-32 w-full object-cover opacity-80 transition group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 grid place-items-center bg-background/40 opacity-0 transition hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-full bg-orange-500/90 px-3 py-1.5 text-xs font-semibold text-white">
                      <Maximize2 className="h-3.5 w-3.5" /> Ampliar
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-500/15 text-blue-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[d.category]}`}>
                    {d.category}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{d.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{d.vehicle}</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileType2 className="h-3 w-3" /> {d.fileSize}
                  </span>
                  <span>•</span>
                  <span>{d.pages} pág.</span>
                </div>
                <div className="mt-auto flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border hover:border-orange-500/40 hover:text-orange-400"
                    onClick={() => openDiagram(d)}
                  >
                    <Eye className="h-3.5 w-3.5" /> Visualizar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={d.downloaded ? "text-emerald-400" : "text-muted-foreground"}
                    onClick={(e) => downloadDiagram(d, e)}
                    title="Baixar arquivo SVG"
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

      {/* Visualização ampliada do esquema */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl border-border bg-popover/95 p-0 backdrop-blur-xl sm:max-w-6xl">
          <DialogHeader className="border-b border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                  {selected && (() => {
                    const Icon = selected.icon;
                    return <Icon className="h-5 w-5 text-orange-400" />;
                  })()}
                  {selected?.title}
                </DialogTitle>
                <DialogDescription className="mt-1 text-muted-foreground">
                  {selected?.description}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Metadata bar */}
            {selected && (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <Badge variant="outline" className={CATEGORY_COLORS[selected.category]}>
                  {selected.category}
                </Badge>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Car className="h-3 w-3" /> {selected.vehicle}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <FileType2 className="h-3 w-3" /> {selected.fileSize}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {selected.pages} {selected.pages === 1 ? "página" : "páginas"}
                </span>
                {selected.downloaded && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Download className="h-3 w-3" /> Disponível offline
                  </span>
                )}
              </div>
            )}
          </DialogHeader>

          {/* Diagram viewer */}
          <div className="max-h-[70vh] overflow-auto bg-background/40 scrollbar-premium">
            {selected && (
              <img
                src={selected.fileUrl}
                alt={selected.title}
                className="mx-auto block w-full max-w-4xl"
              />
            )}
          </div>

          {/* Actions footer */}
          {selected && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Dica:</span> clique em Baixar para
                salvar o arquivo SVG e usar offline.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border"
                  onClick={() => {
                    window.open(selected.fileUrl, "_blank");
                  }}
                >
                  <Maximize2 className="h-3.5 w-3.5" /> Abrir em nova aba
                </Button>
                <Button
                  size="sm"
                  className="gradient-orange text-primary-foreground glow-orange"
                  onClick={(e) => downloadDiagram(selected, e as any)}
                >
                  <Download className="h-3.5 w-3.5" /> Baixar SVG
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
