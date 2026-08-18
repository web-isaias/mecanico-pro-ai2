"use client";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavStore } from "@/lib/store";

export function ViewHeader({
  title,
  description,
  icon,
  accent = "orange",
  actions,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  accent?: "orange" | "blue";
  actions?: React.ReactNode;
}) {
  const navigate = useNavStore((s) => s.navigate);
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6"
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate("dashboard")}
          className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-card/50 text-muted-foreground transition hover:border-orange-500/50 hover:text-orange-400"
          aria-label="Voltar ao dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {icon && (
          <div
            className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-xl border",
              accent === "orange"
                ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                : "border-blue-500/30 bg-blue-500/10 text-blue-300"
            )}
          >
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

export function SectionCard({
  children,
  className,
  title,
  icon,
  actions,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-sm",
        className
      )}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-orange-400">{icon}</span>}
            {title && (
              <h3 className="text-sm font-semibold tracking-wide text-foreground">
                {title}
              </h3>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
