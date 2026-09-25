// Banco de códigos OBD2 comuns no Brasil
export type ObdCode = {
  code: string;
  meaning: string;
  causes: string[];
  howToTest: string;
  solution: string;
  urgency: "baixa" | "média" | "alta" | "crítica";
};

export const OBD2_CODES: ObdCode[] = [
  {
    code: "P0300",
    meaning: "Falhas aleatórias/múltiplas de ignição (misfire)",
    causes: [
      "Velas de ignição gastas ou inadequadas",
      "Cabos de vela em mau estado",
      "Bobinas de ignição defeituosas",
      "Bico injetor sujo ou falhando",
      "Combustível de má qualidade/batida",
      "Pressão de combustível baixa",
      "Sensor de posição do comando (CMP)",
      "Sincronismo do comando incorreto",
    ],
    howToTest:
      "1. Leia os códigos e identifique o cilindro (P030X). 2. Inspecione velas e cabos. 3. Faça teste de compressão. 4. Teste bobinas trocando entre cilindros. 5. Verifique pressão de combustível. 6. Avalie bico injetor com osciloscópio.",
    solution:
      "Substituir velas e cabos conforme manutenção programada; trocar bobina defeituosa; limpar ou trocar bico injetor; corrigir sincronismo se necessário.",
    urgency: "alta",
  },
  {
    code: "P0301",
    meaning: "Falha de ignição no cilindro 1",
    causes: [
      "Vela do cilindro 1 ruim",
      "Bobina do cilindro 1 defeituosa",
      "Bico injetor 1 entupido",
      "Baixa compressão no cilindro 1",
    ],
    howToTest:
      "Troque a bobina do cilindro 1 com a do cilindro 2. Se a falha mudar de cilindro, a bobina é a culpada. Se persistir, verifique vela, bico e compressão.",
    solution: "Substituir o componente identificado como defeituoso no teste de troca.",
    urgency: "alta",
  },
  {
    code: "P0171",
    meaning: "Sistema muito pobre (banco 1)",
    causes: [
      "Vácuo/Falsão de ar (juntas, coletor, mangueiras)",
      "Sensor MAF sujo ou defeituoso",
      "Pressão de combustível baixa",
      "Bomba de combustível fraca",
      "Filtro de combustível entupido",
    ],
    howToTest:
      "1. Faça inspeção visual de mangueiras de vácuo. 2. Teste com spray de limpador em juntas para detectar falhas. 3. Limpe o sensor MAF. 4. Meça pressão de combustível na flauta.",
    solution: "Reparar vazamento de vácuo; limpar/trocar MAF; substituir filtro/bomba de combustível.",
    urgency: "média",
  },
  {
    code: "P0420",
    meaning: "Eficiência do catalisador abaixo do limite (banco 1)",
    causes: [
      "Catalisador ineficiente/danificado",
      "Sensor Sonda Lambda (O2) avariado",
      "Vazamento de escape antes do catalisador",
      "Falhas de ignição não reparadas",
    ],
    howToTest:
      "1. Inspecione vazamentos no escapamento. 2. Compare leitura dos sensores O2 antes e depois do catalisador com scanner. 3. Verifique se há outros códigos de misfire/combustível.",
    solution: "Reparar vazamentos; trocar sensor O2 se defeituoso; substituir catalisador se ineficiente.",
    urgency: "média",
  },
  {
    code: "P0122",
    meaning: "Sensor TPS — sinal de tensão baixo",
    causes: [
      "Sensor TPS defeituoso",
      "Curto ao terra no chicote",
      "Conector solto/oxidado",
      "Mau contato no pedal eletrônico",
    ],
    howToTest:
      "Verifique a tensão do sensor TPS com o scanner em tempo real. A tensão deve variar suavemente de ~0.5V a ~4.5V ao acelerar. Travamento indica defeito.",
    solution: "Limpar conexões; substituir sensor TPS; reparar chicote se necessário.",
    urgency: "média",
  },
  {
    code: "P0135",
    meaning: "Aquecedor do sensor O2 banco 1 sensor 1 — circuito",
    causes: [
      "Aquecedor da sonda lambda queimado",
      "Fusível do aquecedor queimado",
      "Chicote/relé com problema",
    ],
    howToTest: "Meça resistência do aquecedor do sensor O2 (geralmente 4-12 ohms). Verifique fusível e alimentação 12V.",
    solution: "Substituir sensor O2; reparar chicote; trocar fusível.",
    urgency: "média",
  },
  {
    code: "P0327",
    meaning: "Sensor de detonação (knock) — sinal baixo",
    causes: [
      "Sensor de detonação defeituoso",
      "Conector oxidado",
      "Aperto incorreto do sensor",
      "Chicote com curto",
    ],
    howToTest: "Bata suavemente perto do sensor com chave e observe leitura no scanner. Sem variação = defeito.",
    solution: "Reapertar sensor com torque especificado; limpar conector; trocar sensor.",
    urgency: "média",
  },
  {
    code: "P0500",
    meaning: "Sensor de velocidade do veículo (VSS) — sem sinal",
    causes: [
      "Sensor VSS defeituoso",
      "Chicote/conector danificado",
      "Problema no ABS (compartilhado)",
    ],
    howToTest: "Verifique se o velocímetro funciona. Meça sinal do sensor VSS com osciloscópio ao girar a roda.",
    solution: "Substituir sensor VSS; reparar chicote.",
    urgency: "alta",
  },
  {
    code: "P0113",
    meaning: "Sensor de temperatura do ar (IAT) — sinal alto",
    causes: ["Sensor IAT defeituoso", "Chicote aberto", "Conector solto"],
    howToTest: "Meça resistência do sensor IAT variando com temperatura. Compare com tabela do fabricante.",
    solution: "Trocar sensor IAT; reparar chicote.",
    urgency: "baixa",
  },
  {
    code: "P0340",
    meaning: "Sensor de posição do comando (CMP) — circuito",
    causes: ["Sensor CMP defeituoso", "Chicote/conector", "Sincronismo incorreto"],
    howToTest: "Verifique sinal do sensor CMP com osciloscópio durante partida. Sem pulso = sensor defeituoso.",
    solution: "Trocar sensor CMP; verificar sincronismo da correia/corrente.",
    urgency: "alta",
  },
  {
    code: "P0217",
    meaning: "Sobreaquecimento do motor — temperatura elevada",
    causes: [
      "Refrigerante baixo",
      "Bomba d'água defeituosa",
      "Termostato travado fechado",
      "Ventoinha não liga",
      "Radiador entupido",
      "Junta de cabeçote queimada",
    ],
    howToTest: "Verifique nível do líquido, teste ventoinha, radiador, termostato e bomba. Faça teste estanqueidade.",
    solution: "Reparar vazamentos; trocar termostato/ventoinha/bomba; reparar junta do cabeçote.",
    urgency: "crítica",
  },
  {
    code: "P0562",
    meaning: "Tensão do sistema baixa (bateria/alternador)",
    causes: ["Bateria fraca", "Alternador defeituoso", "Regulador de tensão", "Correia do alternador frouxa"],
    howToTest: "Meça tensão da bateria com motor parado (~12.6V) e ligado (13.8-14.4V). Abaixo = alternador.",
    solution: "Carregar/trocar bateria; reconstruir/trocar alternador; ajustar correia.",
    urgency: "alta",
  },
];

export function findObdCode(code: string): ObdCode | undefined {
  return OBD2_CODES.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
}
