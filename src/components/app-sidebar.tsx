"use client";
import { NAV_CARDS } from "@/lib/nav-config";
import { useNavStore } from "@/lib/store";
import { BrandMark } from "@/components/shared/brand";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LayoutDashboard, X, LogOut, Shield } from "lucide-react";

const categories = ["IA", "Técnico", "Gestão", "Sistema"] as const;
const categoryLabels: Record<(typeof categories)[number], string> = {
  IA: "Inteligência Artificial",
  Técnico: "Recursos Técnicos",
  Gestão: "Gestão da Oficina",
  Sistema: "Sistema",
};

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const activeView = useNavStore((s) => s.activeView);
  const navigate = useNavStore((s) => s.navigate);

  const go = (key: typeof activeView) => {
    navigate(key);
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between px-2">
        <BrandMark />
        <button
          onClick={onNavigate}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Fechar menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto scrollbar-premium pr-1">
        {/* Dashboard entry */}
        <button
          onClick={() => go("dashboard")}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
            activeView === "dashboard"
              ? "bg-orange-500/15 text-orange-400 glow-orange"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </button>

        {categories.map((cat) => (
          <div key={cat} className="space-y-1.5">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              {categoryLabels[cat]}
            </p>
            {NAV_CARDS.filter((c) => c.category === cat).map((card) => {
              const Icon = card.icon;
              const active = activeView === card.key;
              return (
                <button
                  key={card.key}
                  onClick={() => go(card.key)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-orange-500/15 text-orange-400"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-lg border transition",
                      active
                        ? "border-orange-500/40 bg-orange-500/15"
                        : "border-border bg-card/40 group-hover:border-orange-500/30"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{card.label}</span>
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-400"
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-1 border-t border-border pt-3">
        <button
          onClick={() => go("admin")}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
            activeView === "admin"
              ? "bg-orange-500/15 text-orange-400"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Shield className="h-4 w-4" />
          Painel Admin
        </button>
        <button
          onClick={() => go("settings")}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
            activeView === "settings"
              ? "bg-orange-500/15 text-orange-400"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <LogOut className="h-4 w-4" />
          Sair / Configurações
        </button>
      </div>
    </div>
  );
}
