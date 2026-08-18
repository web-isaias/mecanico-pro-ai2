# 🔧 Mecânico Pro AI

Aplicativo completo para oficinas mecânicas, mecânicos autônomos e eletricistas automotivos — com Inteligência Artificial para diagnóstico, consultas técnicas e gestão da oficina.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Prisma](https://img.shields.io/badge/Prisma-6-2d3748)

## ✨ Recursos

### Inteligência Artificial (4 skills integradas)
- **IA Mecânico** — chatbot técnico 24h (LLM) que responde sobre torques, códigos OBD2, diagnósticos
- **Diagnóstico Inteligente** — monta árvore de testes passo a passo a partir dos sintomas (LLM)
- **Scanner por Câmera** — reconhecimento visual de peças, luzes do painel, vazamentos (VLM)
- **Pesquisa por Voz** — comandos como "Abrir catálogo do Corolla", "Pesquisar código P0420" (ASR)

### Recursos técnicos
- Pesquisa rápida de veículos (16 modelos com ficha técnica completa)
- Catálogo técnico (torques, óleos, fluidos, velas, procedimentos)
- Esquemas elétricos e eletrônicos
- Scanner OBD2 (conexão Bluetooth, monitor ao vivo, banco de 12 códigos)
- Banco de defeitos colaborativo
- Calculadoras técnicas (torque, conversões, compressão, aditivo, consumo)

### Gestão da oficina
- Orçamentos com PDF + assinatura digital + compartilhamento WhatsApp
- Cadastro de clientes e veículos
- Agenda com calendário e lembretes
- Controle financeiro (fluxo de caixa, gráficos, relatórios)
- Controle de estoque e fornecedores
- Histórico de ordens de serviço
- Painel administrativo (usuários, permissões, relatórios)

## 🚀 Início rápido

```bash
# 1. Instalar dependências
bun install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# edite o .env se necessário

# 3. Criar o banco de dados e popular com dados de exemplo
bun run db:push      # aplica o schema Prisma
bun run db:seed      # popula com 4 clientes, 5 veículos, transações, etc.

# 4. Rodar em desenvolvimento
bun run dev          # http://localhost:3000
```

## 📦 Deploy

### Build de produção
```bash
bun run build
bun run start
```

### Vercel (recomendado)
1. Importe o repositório em [vercel.com/new](https://vercel.com/new)
2. Framework preset: **Next.js**
3. Variáveis de ambiente: adicione `DATABASE_URL`
4. Deploy ✅

### Docker
O `next.config.ts` já usa `output: "standalone"` para imagens otimizadas:
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json bun.lockb* ./
RUN npm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

## 🗄️ Migrando para PostgreSQL (produção)

1. Edite `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // troque de "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
2. Atualize o `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@host:5432/mecanico_pro_ai?schema=public"
   ```
3. Rode `bun run db:push` para criar as tabelas

## 🛠️ Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Estilo**: Tailwind CSS 4 + shadcn/ui (New York style) + Framer Motion
- **Banco**: Prisma ORM (SQLite dev / PostgreSQL prod)
- **IA**: z-ai-web-dev-sdk (LLM, VLM, ASR)
- **Gráficos**: Recharts
- **Estado**: Zustand + React Query

## 📁 Estrutura

```
src/
├── app/
│   ├── api/          # 14 endpoints REST + 4 rotas de IA
│   ├── globals.css   # Design system (azul/preto/laranja)
│   ├── layout.tsx
│   └── page.tsx      # Rota única — SPA com navegação por estado
├── components/
│   ├── ui/           # 51 componentes shadcn/ui
│   ├── views/        # 18 telas do app
│   ├── shared/       # brand, markdown, view-parts, loaders
│   ├── app-shell.tsx # Layout principal + roteamento
│   └── ...
├── lib/
│   ├── ai.ts         # Helpers do SDK de IA
│   ├── data/         # Catálogos offline (veículos, OBD2, torques)
│   ├── store.ts     # Store Zustand (navegação)
│   └── ...
└── prisma/
    ├── schema.prisma # 12 modelos
    └── seed.ts       # Dados de exemplo
```

## 🎨 Design

Tema premium escuro com as cores **azul escuro**, **preto** e **laranja**:
- Fundo: azul escuro profundo (OKLCH)
- Ações primárias: laranja com glow
- Cards: vidro fosco (backdrop-blur)
- Animações suaves em todas as transições

## 📄 Licença

MIT © Mecânico Pro AI
