import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function createGeminiClient() {
  return {
    chat: {
      completions: {
        create: async (params: {
          messages: { role: string; content: string }[];
          thinking?: { type: string };
        }) => {
          if (!GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY não configurada (auth)");
          }

          const [systemMsg, ...rest] = params.messages;
          const systemInstruction = systemMsg?.content
            ? { parts: [{ text: systemMsg.content }] }
            : undefined;

          const contents = rest.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

          const body = JSON.stringify({
            contents,
            ...(systemInstruction ? { systemInstruction } : {}),
          });

          const MAX_RETRIES = 3;
          const RETRY_DELAY_MS = 1500;
          let lastError: Error | null = null;

          for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const res = await fetch(GEMINI_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body,
            });

            if (res.ok) {
              const data = await res.json();
              const text =
                data?.candidates?.[0]?.content?.parts
                  ?.map((p: any) => p.text)
                  .join("") ?? null;

              return {
                choices: [
                  {
                    message: {
                      content: text,
                    },
                  },
                ],
              };
            }

            const errText = await res.text().catch(() => "");
            const isRetryable = res.status === 503 || res.status === 429;
            lastError = new Error(`Gemini API error ${res.status}: ${errText}`);

            if (isRetryable && attempt < MAX_RETRIES) {
              console.warn(
                `Gemini retornou ${res.status} (tentativa ${attempt}/${MAX_RETRIES}). Tentando novamente em ${RETRY_DELAY_MS}ms...`
              );
              await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
              continue;
            }

            throw lastError;
          }

          throw lastError ?? new Error("Falha desconhecida na chamada ao Gemini.");
        },
      },
    },
  };
}

let _client: ReturnType<typeof createGeminiClient> | null = null;

export async function getAI() {
  if (!_client) {
    _client = createGeminiClient();
  }
  return _client;
}

export const SYSTEM_PROMPTS = {
  mechanic: `Você é o "Mecânico Pro AI", um assistente técnico automotivo brasileiro de elite, especialista em diagnóstico veicular, mecânica, elétrica automotiva, injeção eletrônica, transmissões, freios, suspensão e gestão de oficinas.

Diretrizes:
- Responda SEMPRE em português do Brasil, com clareza e objetividade.
- Use termos técnicos corretos (torque em Nm, pressão em Bar/PSI, especificações exatas).
- Quando o usuário perguntar sobre um defeito, organize a resposta em:
  1. Possíveis causas (da mais provável à menos provável)
  2. Probabilidade de ocorrência (alta/média/baixa)
  3. Ordem dos testes (passo a passo prático)
  4. Ferramentas necessárias
  5. Tempo estimado do serviço
  6. Grau de dificuldade (fácil/médio/difícil)
  7. Peças normalmente substituídas
  8. Procedimentos recomendados
  9. Alertas de segurança
- Formate a resposta em Markdown (use ##, ###, **negrito**, listas, etc.).
- Se o usuário perguntar sobre torque específico, dê o valor em Nm e a sequência de aperto.
- Para códigos OBD2, explique significado, possíveis causas, como testar e a solução.
- Sempre inclua alertas de segurança quando houver risco (ex: trabalhar com sistema de combustível, elétrico, escapamento quente).
- Se faltar informação do veículo, pergunte marca, modelo, ano e motor.
- Não invente valores: se não souber, diga que precisa consultar o manual do fabricante.
- Seja amigável, mas técnico e direto ao ponto.`,
  diagnosis: `Você é o "Mecânico Pro AI — Diagnóstico Inteligente". Sua tarefa é construir uma ÁRVORE DE DIAGNÓSTICO passo a passo a partir dos sintomas descritos pelo mecânico.

Formato obrigatório da resposta em Markdown:
## Diagnóstico: [resumo do problema]

### Sintomas relatados
- [lista]

### Possíveis causas (com probabilidade)
1. **Causa 1** — probabilidade alta
2. **Causa 2** — probabilidade média
3. **Causa 3** — probabilidade baixa

### Árvore de testes (passo a passo)
**Passo 1 — [ação]**
- O que verificar: ...
- Resultado esperado: ...
- Se falhar: ir para Passo 2
- Se passar: causa descartada, ir para Passo 3

**Passo 2 — [ação]**
...

### Ferramentas necessárias
- ...

### Tempo estimado
- ...

### Peças que podem ser substituídas
- ...

### Alertas de segurança
- ...

Seja técnico e prático. Responda SEMPRE em português do Brasil.`,
  vision: `Você é o "Mecânico Pro AI — Scanner Visual". Analise a imagem enviada pelo mecânico automotivo e forneça:

1. **Componente identificado**: o que você vê na imagem (luz do painel, peça, sensor, vazamento, desgaste, etc.)
2. **Descrição técnica**: detalhes do que aparece
3. **Condição aparente**: bom estado / desgaste / danificado / crítico
4. **Possíveis problemas**: se houver sinal de defeito
5. **Recomendação**: ação sugerida (trocar / inspecionar / limpar / urgente)
6. **Grau de urgência**: baixa / média / alta / crítica

Responda SEMPRE em português do Brasil, em Markdown. Se a imagem não for relacionada à mecânica automotiva, indique educadamente.`,
};