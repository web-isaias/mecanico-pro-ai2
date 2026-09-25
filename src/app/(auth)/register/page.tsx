"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Mail,
  Lock,
  Loader2,
  UserPlus,
  User as UserIcon,
  Building2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { TRIAL_DAYS } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, workshopName }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        setLoading(false);
        return;
      }
      // Auto-login after registration (with redirect to /
      // so middleware can verify the new session)
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Conta criada mas falhou ao entrar. Faça login manualmente.");
        router.push("/login");
        return;
      }
      toast.success(`Conta criada! Você tem ${TRIAL_DAYS} dias de teste grátis.`);
      // Force a full reload so middleware runs with the new cookie
      window.location.href = "/";
    } catch (err) {
      toast.error("Erro ao criar conta");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <Card className="border-border bg-card/60 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-foreground">
            Criar sua conta
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {TRIAL_DAYS} dias de teste grátis — sem cartão de crédito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Seu nome</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="João da Silva"
                  required
                  className="border-border bg-background/50 pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="workshopName">Nome da oficina (opcional)</Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="workshopName"
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value)}
                  placeholder="Oficina do João"
                  className="border-border bg-background/50 pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  className="border-border bg-background/50 pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha (mín. 6 caracteres)</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="border-border bg-background/50 pl-9"
                />
              </div>
            </div>

            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5">
              <ul className="space-y-1 text-[11px] text-emerald-300">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3" /> Diagnóstico com IA ilimitado
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3" /> Catálogo técnico completo
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3" /> Gestão de oficina (clientes, agenda, financeiro)
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-orange text-primary-foreground glow-orange"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Criar conta grátis
                </>
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-orange-400 hover:underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
