"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Mail, Lock, Loader2, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const error = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("E-mail ou senha incorretos");
        setLoading(false);
        return;
      }
      toast.success("Login realizado com sucesso!");
      // Force full reload so middleware verifies the new session cookie
      window.location.href = callbackUrl;
    } catch (err) {
      toast.error("Erro ao fazer login");
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
            Bem-vindo de volta
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Entre na sua conta para acessar o painel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error === "AccessDenied" && (
            <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
              Sua assinatura está inativa.{" "}
              <Link href="/billing" className="underline">Ativar agora</Link>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
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
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="border-border bg-background/50 pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-orange text-primary-foreground glow-orange"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Entrar
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-300">
              <Sparkles className="h-3.5 w-3.5" /> Conta demo
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <strong className="text-foreground">demo@mecanicopro.ai</strong> / senha{" "}
              <strong className="text-foreground">demo1234</strong>
            </p>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link href="/register" className="font-semibold text-orange-400 hover:underline">
              Criar agora (7 dias grátis)
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
