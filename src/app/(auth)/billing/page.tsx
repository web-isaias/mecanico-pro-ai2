"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  CreditCard,
  CalendarClock,
  AlertTriangle,
  Crown,
  Zap,
  Shield,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { TRIAL_DAYS } from "@/lib/auth";

type PlanId = "monthly" | "annual";

const PLANS = {
  monthly: {
    id: "monthly" as PlanId,
    label: "Mensal",
    price: 79.9,
    period: "/mês",
    description: "Cancele quando quiser",
    features: [
      "IA Mecânico ilimitado",
      "Diagnóstico inteligente ilimitado",
      "Scanner por câmera (VLM)",
      "Pesquisa por voz (ASR)",
      "Catálogo técnico completo",
      "Scanner OBD2 + banco de códigos",
      "Gestão completa (clientes, agenda, financeiro, estoque)",
      "Orçamentos com PDF + assinatura",
      "Suporte por e-mail",
    ],
  },
  annual: {
    id: "annual" as PlanId,
    label: "Anual",
    price: 799.0,
    period: "/ano",
    description: "2 meses grátis • Economize R$ 159",
    features: [
      "Tudo do plano Mensal",
      "2 meses grátis (economia de R$ 159)",
      "Suporte prioritário",
      "Backup em nuvem automático",
      "Multiusuário (até 5 contas)",
      "Relatórios avançados",
    ],
  },
};

export default function BillingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("monthly");
  const [loading, setLoading] = useState<PlanId | null>(null);

  // Redirect if logged in with active subscription
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const u = session.user as any;
      if (u.subscriptionStatus === "active") {
        toast.info("Sua assinatura está ativa!");
        router.push("/");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="grid h-64 place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    );
  }

  const handleCheckout = async (plan: PlanId) => {
    setLoading(plan);
    try {
      const res = await fetch("/api/billing/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      if (data.dev) {
        // Dev mode — show toast and use dev-activate endpoint
        toast.info("Modo dev: ative a assinatura para teste");
        return;
      }
      // Redirect to Mercado Pago
      window.location.href = data.initPoint;
    } catch (err) {
      toast.error("Erro ao iniciar pagamento");
    } finally {
      setLoading(null);
    }
  };

  const handleDevActivate = async (plan: PlanId) => {
    setLoading(plan);
    try {
      const res = await fetch("/api/billing/dev-activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      toast.success("Assinatura ativada (modo dev)!");
      await update({}); // refresh session JWT
      setTimeout(() => router.push("/"), 800);
    } catch (err) {
      toast.error("Erro ao ativar");
    } finally {
      setLoading(null);
    }
  };

  const handleRefresh = async () => {
    await update({});
    toast.success("Sessão atualizada");
    window.location.reload();
  };

  const user = session?.user as any;
  const trialEndsAt = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const daysLeft = trialEndsAt
    ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const isConfigured = process.env.NEXT_PUBLIC_MP_CONFIGURED === "true";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-5xl"
    >
      <Card className="border-border bg-card/60 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl gradient-orange glow-orange">
            <Crown className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Escolha seu plano
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {user?.subscriptionStatus === "trial" && daysLeft > 0 ? (
              <>
                Você está em <span className="text-orange-400">período de teste</span> — restam{" "}
                <strong className="text-foreground">{daysLeft} dias</strong>
              </>
            ) : (
              <>Sua conta está <span className="text-red-400">inativa</span>. Ative para continuar usando</>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status banner */}
          {user?.subscriptionStatus === "trial" && daysLeft <= 2 && daysLeft > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Seu período de teste expira em {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ative sua assinatura agora para não perder o acesso.
                </p>
              </div>
            </div>
          )}
          {user?.subscriptionStatus !== "trial" && user?.subscriptionStatus !== "active" && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Acesso bloqueado
                </p>
                <p className="text-xs text-muted-foreground">
                  Ative sua assinatura para liberar o painel.
                </p>
              </div>
            </div>
          )}

          {/* Plans grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {Object.values(PLANS).map((plan) => {
              const isAnnual = plan.id === "annual";
              return (
                <div
                  key={plan.id}
                  className={`relative overflow-hidden rounded-2xl border-2 p-5 transition ${
                    selectedPlan === plan.id
                      ? "border-orange-500/50 bg-orange-500/5 glow-orange"
                      : "border-border bg-background/40 hover:border-orange-500/30"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {isAnnual && (
                    <div className="absolute right-4 top-4">
                      <Badge className="gradient-orange text-primary-foreground">
                        <Zap className="mr-1 h-3 w-3" /> 20% OFF
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-foreground">
                      {plan.label}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      R$ {plan.price.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="mt-1 text-xs text-orange-400">{plan.description}</p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-xs text-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-5 w-full gradient-orange text-primary-foreground glow-orange"
                    disabled={loading !== null}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isConfigured) handleCheckout(plan.id);
                      else handleDevActivate(plan.id);
                    }}
                  >
                    {loading === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" /> Assinar {plan.label}
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Dev notice */}
          {!isConfigured && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-xs">
              <p className="flex items-center gap-2 font-semibold text-blue-300">
                <Shield className="h-4 w-4" /> Ambiente de desenvolvimento
              </p>
              <p className="mt-1 text-muted-foreground">
                Mercado Pago não está configurado. Os botões acima ativam a assinatura
                diretamente (para teste). Em produção, eles abririam o checkout do Mercado Pago
                com PIX, cartão ou boleto.
              </p>
            </div>
          )}

          {/* Payment methods preview */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" /> Pagamento recorrente automático
            </span>
            <span>•</span>
            <span>Pix, cartão de crédito, boleto</span>
            <span>•</span>
            <span>Cancele quando quiser</span>
          </div>

          {/* Footer actions */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-4">
            {user?.subscriptionStatus === "active" && (
              <Button variant="outline" size="sm" onClick={handleRefresh} className="border-border">
                <RefreshCw className="h-3.5 w-3.5" /> Atualizar status
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-muted-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
