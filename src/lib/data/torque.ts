// Especificações de torque populares
export type TorqueSpec = {
  vehicle: string;
  component: string;
  torque: string;
  sequence: string;
  notes: string;
};

export const TORQUE_SPECS: TorqueSpec[] = [
  {
    vehicle: "Chevrolet Onix 1.4 (SPE/4)",
    component: "Parafusos do cabeçote",
    torque: "25 Nm + 90° + 90° + 45°",
    sequence: "Do centro para as extremidades em espiral, 3 etapas",
    notes: "Usar parafusos novos ( Stretch ). Rosca limpa e seca.",
  },
  {
    vehicle: "Chevrolet Onix 1.4 (SPE/4)",
    component: "Cárter (parafusos)",
    torque: "8 Nm",
    sequence: "Em X do centro para fora",
    notes: "Não usar ferramenta de impacto.",
  },
  {
    vehicle: "Volkswagen Gol 1.0 (VHT)",
    component: "Parafusos do cabeçote",
    torque: "70 Nm + 90° + 90°",
    sequence: "Do centro para extremidades, 3 etapas",
    notes: "Sempre usar parafusos novos. Reapertar com motor frio.",
  },
  {
    vehicle: "Fiat Mobi/Uno 1.0 (Fire)",
    component: "Parafusos do cabeçote",
    torque: "60 Nm + 60°",
    sequence: "Do centro para fora em 2 etapas",
    notes: "Parafusos novos obrigatoriamente.",
  },
  {
    vehicle: "Toyota Corolla 1.8 (VVT-i)",
    component: "Parafusos do cabeçote",
    torque: "49 Nm + 90° + 90°",
    sequence: "Centralizado em espiral, 3 etapas",
    notes: "Apenas parafusos novos. Rosca limpa e lubrificada.",
  },
  {
    vehicle: "Honda Civic 2.0 (i-VTEC)",
    component: "Parafusos do cabeçote",
    torque: "39 Nm + 90° + 90°",
    sequence: "Do centro para fora, 3 etapas",
    notes: "Parafusos novos. Rosca seca.",
  },
  {
    vehicle: "Geral (todas)",
    component: "Velas de ignição",
    torque: "18-25 Nm (ou 1/2 volta após assentar)",
    sequence: "Individual, cada cilindro",
    notes: "Rosca limpa, nunca excesso.",
  },
  {
    vehicle: "Geral (todas)",
    component: "Porca da roda",
    torque: "100-110 Nm",
    sequence: "Em estrela (cruz) 5 etapas",
    notes: "Aperto final com veículo no chão. Sem lubrificação no cubo.",
  },
  {
    vehicle: "Geral (todas)",
    component: "Parafuso do filtro de óleo",
    torque: "17 Nm (liso) / 25 Nm (roscado)",
    sequence: "Único",
    notes: "Lubrificar anel de vedação com óleo do motor.",
  },
  {
    vehicle: "Geral (todas)",
    component: "Bico injetor (parafuso)",
    torque: "10 Nm",
    sequence: "Único",
    notes: "Não usar arame elétrico nas vias de combustível.",
  },
  {
    vehicle: "Geral (todas)",
    component: "Suporte do disco de freio",
    torque: "110 Nm",
    sequence: "Único, travão",
    notes: "Aplicar Loctite médio.",
  },
  {
    vehicle: "Geral (todas)",
    component: "Parafuso da polia do virabrequim",
    torque: "120-180 Nm (varia)",
    sequence: "Único, usar ferramenta de travamento",
    notes: "Confirmar valor específico do veículo.",
  },
];

export function searchTorqueSpecs(query: string): TorqueSpec[] {
  const q = query.toLowerCase().trim();
  if (!q) return TORQUE_SPECS;
  return TORQUE_SPECS.filter((s) =>
    `${s.vehicle} ${s.component}`.toLowerCase().includes(q)
  );
}

// Tabela de torque para parafusos comuns (geral)
export type BoltTorque = {
  size: string;
  grade: string;
  dryNm: string;
  lubricatedNm: string;
};

export const BOLT_TORQUE_TABLE: BoltTorque[] = [
  { size: "M4", grade: "8.8", dryNm: "2.9", lubricatedNm: "2.2" },
  { size: "M5", grade: "8.8", dryNm: "5.8", lubricatedNm: "4.4" },
  { size: "M6", grade: "8.8", dryNm: "10", lubricatedNm: "7.5" },
  { size: "M8", grade: "8.8", dryNm: "24", lubricatedNm: "18" },
  { size: "M8", grade: "10.9", dryNm: "34", lubricatedNm: "26" },
  { size: "M10", grade: "8.8", dryNm: "47", lubricatedNm: "35" },
  { size: "M10", grade: "10.9", dryNm: "67", lubricatedNm: "50" },
  { size: "M12", grade: "8.8", dryNm: "82", lubricatedNm: "61" },
  { size: "M12", grade: "10.9", dryNm: "116", lubricatedNm: "87" },
  { size: "M14", grade: "8.8", dryNm: "131", lubricatedNm: "98" },
  { size: "M14", grade: "10.9", dryNm: "186", lubricatedNm: "140" },
  { size: "M16", grade: "8.8", dryNm: "203", lubricatedNm: "152" },
  { size: "M16", grade: "10.9", dryNm: "288", lubricatedNm: "216" },
];

// Sintomas comuns e suas árvores de diagnóstico (offline fallback)
export const DIAGNOSTIC_TREE: Record<string, {
  symptom: string;
  steps: { step: string; action: string; expected: string }[];
}> = {
  "nao_pega": {
    symptom: "O carro não pega / não dá partida",
    steps: [
      { step: "1", action: "Verificar som da partida: o motor gira?", expected: "Motor gira normalmente" },
      { step: "2a", action: "Se motor NÃO gira: verificar bateria (12.4V+), bornes, motor de arranque, fusível 60A", expected: "Bateria com 12.4V+ e bornes limpos" },
      { step: "2b", action: "Se motor gira: verificar se há combustível e faísca", expected: "Pressão de combustível e faísca presentes" },
      { step: "3", action: "Avaliar bomba de combustível: ela arma ao ligar a chave?", expected: "Som da bomba por 2-3s ao ligar chave" },
      { step: "4", action: "Verificar velas, bobinas e cabo de vela", expected: "Faísca azul/branca intensa" },
      { step: "5", action: "Verificar imobilizador (luz acesa no painel)", expected: "Luz verde do imob desligada" },
      { step: "6", action: "Avaliar sensor de posição do virabrequim (CKP)", expected: "Sinal de rotação ao dar partida" },
      { step: "7", action: "Verificar sincronismo da correia/corrente do comando", expected: "Sincronismo correto" },
    ],
  },
  "marcha_lenta_falhando": {
    symptom: "Motor falhando em marcha lenta",
    steps: [
      { step: "1", action: "Verificar código de falha com scanner OBD2", expected: "Identificar código P0300 ou similar" },
      { step: "2", action: "Inspecionar velas e cabos de ignição", expected: "Velas em bom estado, abertura correta" },
      { step: "3", action: "Testar bobinas trocando entre cilindros", expected: "Falha migra com a bobina" },
      { step: "4", action: "Verificar bicos injetores (resistência e vazão)", expected: "Bicos com 11-17 ohms, vazão uniforme" },
      { step: "5", action: "Verificar sensor MAF e limpar/atualizar", expected: "Leitura de massa de ar estável" },
      { step: "6", action: "Inspecionar mangueiras de vácuo (falsão de ar)", expected: "Sem vazamentos de vácuo" },
      { step: "7", action: "Verificar sensor TPS e marcha lenta", expected: "TPS varia suavemente, IAC sem travamento" },
      { step: "8", action: "Avaliar compressão dos cilindros", expected: "Compressão 9-13 bar uniforme" },
    ],
  },
  "esquentando": {
    symptom: "Motor esquentando / superaquecimento",
    steps: [
      { step: "1", action: "Verificar nível do líquido de arrefecimento", expected: "Nível no reservatório entre MIN e MAX" },
      { step: "2", action: "Verificar se a ventoinha liga ao atingir 95°C", expected: "Ventoinha aciona" },
      { step: "3", action: "Verificar termostato (radiador esquenta uniformemente?)", expected: "Mangueira superior esquenta após atingir 90°C" },
      { step: "4", action: "Avaliar bomba d'água (ruído, vazamento)", expected: "Circulação sem ruído/vazamento" },
      { step: "5", action: "Verificar radiador entupido ou com aletas danificadas", expected: "Fluxo de ar livre" },
      { step: "6", action: "Testar válvula do reservatório (tampão)", expected: "Válvula mantém pressão" },
      { step: "7", action: "Verificar se há gases no líquido (junta queimada)", expected: "Sem bolhas no reservatório" },
    ],
  },
  "consumo_elevado": {
    symptom: "Consumo de combustível elevado",
    steps: [
      { step: "1", action: "Verificar códigos OBD2 (mistura rica? O2? MAF?)", expected: "Sem códigos ou identificar P0172" },
      { step: "2", action: "Verificar pressão e vazamento dos bicos injetores", expected: "Pressão 2.5-4 bar conforme modelo, sem gotejamento" },
      { step: "3", action: "Avaliar sensor MAF/O2 (limpar ou trocar)", expected: "Leituras dentro do esperado" },
      { step: "4", action: "Verificar filtro de ar entupido", expected: "Filtro limpo" },
      { step: "5", action: "Verificar pressão e estado dos pneus", expected: "Calibragem correta" },
      { step: "6", action: "Verificar freios arrastando", expected: "Rodas giram livremente" },
      { step: "7", action: "Avaliar hábitos e sincronismo do comando", expected: "Sincronismo correto" },
    ],
  },
};
