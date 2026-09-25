"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ViewHeader, SectionCard } from "@/components/shared/view-parts";
import { BrandLogo } from "@/components/shared/brand";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Cloud,
  Fingerprint,
  Download,
  Smartphone,
  Globe,
  Moon,
  Sun,
  LogOut,
  KeyRound,
  Lock,
  CalendarClock,
  Crown,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// Map internal subscription status → user-friendly label + tone
const SUBSCRIPTION_DISPLAY: Record<
  string,
  { label: string; tone: "trial" | "active" | "warning" | "canceled"; description: string }
> = {
  trial: {
    label: "Período de teste",
    tone: "trial",
    description: "Teste grátis — sem cobrança",
  },
  active: {
    label: "Ativo",
    tone: "active",
    description: "Assinatura paga em dia",
  },
  past_due: {
    label: "Pagamento pendente",
    tone: "warning",
    description: "Houve falha na última cobrança",
  },
  canceled: {
    label: "Cancelado",
    tone: "canceled",
    description: "Assinatura cancelada",
  },
};

const TONE_STYLES: Record<string, string> = {
  trial: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  warning: "border-red-500/40 bg-red-500/10 text-red-300",
  canceled: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
};

export function Settings() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    review: true,
    oil: true,
    timingBelt: true,
    brakes: true,
    tires: false,
    warranty: true,
    stock: true,
    appointment: true,
  });
  const [offlineMode, setOfflineMode] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <div>
      <ViewHeader
        title="Configurações"
        description="Conta, segurança, sincronização e preferências do app."
        icon={<SettingsIcon className="h-5 w-5" />}
        accent="blue"
      />

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="flex w-full flex-wrap gap-1 bg-card/50">
          <TabsTrigger value="account" className="gap-1.5"><User className="h-3.5 w-3.5" /> Conta</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> Segurança</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Notificações</TabsTrigger>
          <TabsTrigger value="system" className="gap-1.5"><Cloud className="h-3.5 w-3.5" /> Sistema</TabsTrigger>
        </TabsList>

        {/* Account */}
        <TabsContent value="account">
          <div className="grid gap-4 lg:grid-cols-3">
            <SectionCard title="Perfil" icon={<User className="h-4 w-4" />} className="lg:col-span-2">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-orange glow-orange">
                  <span className="text-2xl font-bold text-primary-foreground">M</span>
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">Mecânico Master</p>
                  <p className="text-sm text-muted-foreground">admin@mecanicopro.ai</p>
                  <Badge variant="outline" className="mt-1 border-orange-500/40 bg-orange-500/10 text-orange-400">
                    Plano Premium
                  </Badge>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Nome completo"><Input defaultValue="Mecânico Master" className="border-border bg-background/50" /></Field>
                <Field label="E-mail"><Input defaultValue="admin@mecanicopro.ai" className="border-border bg-background/50" /></Field>
                <Field label="Telefone"><Input defaultValue="(11) 99999-0000" className="border-border bg-background/50" /></Field>
                <Field label="Nome da oficina"><Input defaultValue="Oficina Premium" className="border-border bg-background/50" /></Field>
              </div>
              <Button className="mt-3 gradient-orange text-primary-foreground glow-orange" onClick={() => toast.success("Perfil atualizado!")}>
                Salvar alterações
              </Button>
            </SectionCard>

            <SectionCard title="Plano atual" icon={<KeyRound className="h-4 w-4" />}>
              <SubscriptionCard session={session} onUpgrade={() => router.push("/billing")} />
            </SectionCard>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <div className="grid gap-4 sm:grid-cols-2">
            <SectionCard title="Login social" icon={<Globe className="h-4 w-4" />}>
              <div className="space-y-2">
                <LoginOption name="Google" connected />
                <LoginOption name="Apple" connected />
                <LoginOption name="E-mail e senha" connected />
              </div>
            </SectionCard>
            <SectionCard title="Autenticação biométrica" icon={<Fingerprint className="h-4 w-4" />}>
              <ToggleRow
                icon={<Fingerprint className="h-4 w-4" />}
                label="Usar biometria"
                description="Desbloqueie com impressão digital ou Face ID"
                checked={biometrics}
                onChange={setBiometrics}
              />
              <div className="mt-3 space-y-2">
                <Button variant="outline" className="w-full border-border"><Lock className="h-4 w-4" /> Alterar PIN (4 dígitos)</Button>
                <Button variant="outline" className="w-full border-border"><KeyRound className="h-4 w-4" /> Ativar autenticação 2FA</Button>
              </div>
            </SectionCard>
            <SectionCard title="Criptografia de dados" icon={<Shield className="h-4 w-4" />}>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Shield className="h-4 w-4" />
                  <p className="text-sm font-semibold">Criptografia AES-256 ativa</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Todos os dados de clientes, veículos e financeiros são criptografados.
                </p>
              </div>
            </SectionCard>
            <SectionCard title="Sessão" icon={<LogOut className="h-4 w-4" />}>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-blue-300" />
                    <div>
                      <p className="text-sm text-foreground">iPhone 15 Pro</p>
                      <p className="text-[10px] text-muted-foreground">São Paulo, SP • agora</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Atual</Badge>
                </div>
                <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => toast.info("Sessão encerrada em outros dispositivos")}>
                  <LogOut className="h-4 w-4" /> Encerrar sessão em outros dispositivos
                </Button>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <SectionCard title="Lembretes automáticos" icon={<Bell className="h-4 w-4" />}>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(notifications).map(([key, val]) => {
                const labels: Record<string, { label: string; icon: string }> = {
                  review: { label: "Revisões programadas", icon: "🔄" },
                  oil: { label: "Troca de óleo", icon: "🛢️" },
                  timingBelt: { label: "Correia dentada", icon: "⚙️" },
                  brakes: { label: "Pastilhas de freio", icon: "🛑" },
                  tires: { label: "Pneus", icon: "🚗" },
                  warranty: { label: "Garantias vencendo", icon: "📜" },
                  stock: { label: "Estoque baixo", icon: "📦" },
                  appointment: { label: "Serviços agendados", icon: "📅" },
                };
                const cfg = labels[key];
                return (
                  <ToggleRow
                    key={key}
                    icon={<span>{cfg.icon}</span>}
                    label={cfg.label}
                    checked={val}
                    onChange={(v) => setNotifications((n) => ({ ...n, [key]: v }))}
                  />
                );
              })}
            </div>
          </SectionCard>
        </TabsContent>

        {/* System */}
        <TabsContent value="system">
          <div className="grid gap-4 sm:grid-cols-2">
            <SectionCard title="Modo offline" icon={<Download className="h-4 w-4" />}>
              <ToggleRow
                icon={<Download className="h-4 w-4" />}
                label="Baixar catálogo para uso offline"
                description="Catálogo técnico, diagramas e histórico disponíveis sem internet"
                checked={offlineMode}
                onChange={setOfflineMode}
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Catálogo baixado: 1.2 GB • Última sincronização: há 2 horas
              </p>
              <Button variant="outline" size="sm" className="mt-2 border-border" onClick={() => toast.success("Catálogo atualizado em segundo plano")}>
                <Download className="h-3.5 w-3.5" /> Atualizar agora
              </Button>
            </SectionCard>
            <SectionCard title="Backup automático" icon={<Cloud className="h-4 w-4" />}>
              <ToggleRow
                icon={<Cloud className="h-4 w-4" />}
                label="Backup na nuvem"
                description="Sincroniza dados a cada 6 horas"
                checked={autoBackup}
                onChange={setAutoBackup}
              />
              <p className="mt-3 text-xs text-emerald-400">✓ Último backup: hoje às 06:00</p>
            </SectionCard>
            <SectionCard title="Aparência" icon={<Moon className="h-4 w-4" />}>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1 border-orange-500/40 bg-orange-500/10 text-orange-400">
                  <Moon className="h-4 w-4" /> Escuro
                </Button>
                <Button variant="outline" className="flex-1 border-border text-muted-foreground">
                  <Sun className="h-4 w-4" /> Claro
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">O tema escuro é recomendado para uso em ambientes de oficina.</p>
            </SectionCard>
            <SectionCard title="Sobre o app" icon={<SettingsIcon className="h-4 w-4" />}>
              <div className="flex items-center gap-3">
                <BrandLogo size={48} />
                <div>
                  <p className="font-bold text-foreground">Mecânico Pro AI</p>
                  <p className="text-xs text-muted-foreground">Versão 1.0.0 • Build 2024.10</p>
                  <p className="text-[10px] text-muted-foreground mt-1">© 2024 Mecânico Pro AI. Todos os direitos reservados.</p>
                </div>
              </div>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
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

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
      <div className="flex items-center gap-3">
        <span className="text-orange-400">{icon}</span>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function LoginOption({ name, connected }: { name: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
      <span className="text-sm font-medium text-foreground">{name}</span>
      {connected ? (
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Conectado</Badge>
      ) : (
        <Button size="sm" variant="outline" className="border-border">Conectar</Button>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SubscriptionCard — reads the REAL subscription status from the session.
// Replaces the previous hardcoded "Plano Premium / R$ 79,90 / Renovação automática"
// that lied to trial users by showing "paid/active" status.
// ────────────────────────────────────────────────────────────────────────────
function SubscriptionCard({
  session,
  onUpgrade,
}: {
  session: any;
  onUpgrade: () => void;
}) {
  const user = session?.user as any;
  const status: string = user?.subscriptionStatus || "trial";
  const plan: string = user?.plan || "monthly";
  const trialEndsAt = user?.trialEndsAt ? new Date(user.trialEndsAt as number) : null;
  const currentPeriodEnd = user?.currentPeriodEnd
    ? new Date(user.currentPeriodEnd as number)
    : null;

  const display = SUBSCRIPTION_DISPLAY[status] || SUBSCRIPTION_DISPLAY.trial;
  const toneStyle = TONE_STYLES[display.tone];

  const now = new Date();
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const periodDaysLeft = currentPeriodEnd
    ? Math.max(0, Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const planLabel = plan === "annual" ? "Anual" : "Mensal";
  const planPrice = plan === "annual" ? "R$ 799,00/ano" : "R$ 79,90/mês";

  return (
    <div className="space-y-3">
      {/* Status badge */}
      <div className={`rounded-xl border p-4 ${toneStyle}`}>
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-card/40">
            {display.tone === "active" ? (
              <Crown className="h-4 w-4" />
            ) : display.tone === "trial" ? (
              <Sparkles className="h-4 w-4" />
            ) : display.tone === "warning" ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold">{display.label}</p>
            <p className="text-xs opacity-80">{display.description}</p>
          </div>
        </div>
      </div>

      {/* Plan + period info (only meaningful when there's an actual subscription) */}
      {status === "active" && (
        <div className="rounded-xl border border-border bg-background/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Plano
              </p>
              <p className="text-sm font-semibold text-foreground">
                {planLabel} <span className="text-muted-foreground">• {planPrice}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Renova em
              </p>
              <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <CalendarClock className="h-3.5 w-3.5 text-orange-400" />
                {periodDaysLeft} dias
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trial countdown — only shown during trial */}
      {status === "trial" && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-amber-400">
                Teste grátis expira em
              </p>
              <p className="flex items-center gap-1 text-lg font-bold text-foreground">
                <CalendarClock className="h-4 w-4 text-amber-400" />
                {trialDaysLeft} {trialDaysLeft === 1 ? "dia" : "dias"}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {trialEndsAt?.toLocaleDateString("pt-BR")}
            </p>
          </div>
          <Button
            size="sm"
            className="mt-3 w-full gradient-orange text-primary-foreground glow-orange"
            onClick={onUpgrade}
          >
            <Crown className="h-3.5 w-3.5" /> Assinar agora
          </Button>
        </div>
      )}

      {/* Warning for past_due */}
      {status === "past_due" && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-3 text-xs text-red-300">
          <p className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Atualize seu pagamento para evitar o bloqueio do acesso.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 w-full border-red-500/40 text-red-300 hover:bg-red-500/10"
            onClick={onUpgrade}
          >
            Regularizar pagamento
          </Button>
        </div>
      )}

      {/* Feature list */}
      <ul className="space-y-1.5 text-xs">
        {[
          "IA ilimitada",
          "Catálogo técnico completo",
          "Scanner OBD2 + banco de códigos",
          "Gestão completa da oficina",
          "Suporte por e-mail",
        ].map((f) => (
          <li key={f} className="flex items-center gap-2 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
