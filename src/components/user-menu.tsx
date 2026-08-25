"use client";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/shared/brand";
import { useNavStore } from "@/lib/store";
import {
  UserCircle,
  LogOut,
  ChevronDown,
  CreditCard,
  Shield,
  Check,
  Crown,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const navigate = useNavStore((s) => s.navigate);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!session?.user) return null;

  const user = session.user as any;
  const name = (user.name as string) || "Usuário";
  const email = (user.email as string) || "";
  const initials = name.charAt(0).toUpperCase();
  const status = (user.subscriptionStatus as string) || "trial";
  const plan = (user.plan as string) || "monthly";

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "Ativo", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
    trial: { label: "Trial", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
    past_due: { label: "Pagamento pendente", color: "bg-red-500/15 text-red-300 border-red-500/30" },
    canceled: { label: "Cancelado", color: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30" },
  };
  const s = statusMap[status] || statusMap.trial;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card/50 py-1.5 pl-1.5 pr-2 transition hover:border-orange-500/40"
        aria-label="Menu do usuário"
      >
        <div className="grid h-7 w-7 place-items-center rounded-lg gradient-orange text-xs font-bold text-primary-foreground">
          {initials}
        </div>
        <span className="hidden text-xs font-semibold text-foreground sm:block">
          {name.split(" ")[0]}
        </span>
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-popover/95 shadow-2xl backdrop-blur-xl"
          >
            {/* User info */}
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl gradient-orange text-base font-bold text-primary-foreground">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">{email}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", s.color)}>
                  {s.label}
                </span>
                {plan === "annual" ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-400">
                    <Crown className="h-3 w-3" /> Plano Anual
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-muted-foreground">Plano Mensal</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("settings");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-accent"
              >
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                Minha conta
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/billing");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-accent"
              >
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Assinatura & cobrança
                {status !== "active" && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("admin");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-accent"
              >
                <Shield className="h-4 w-4 text-muted-foreground" />
                Painel admin
              </button>

              <div className="my-1 border-t border-border" />

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-background/40 px-3 py-2">
              <div className="flex items-center gap-2">
                <BrandLogo size={20} />
                <p className="text-[10px] text-muted-foreground">
                  v1.0 • Sessão segura
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
