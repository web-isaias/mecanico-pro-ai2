"use client";
import { BrandMark } from "@/components/shared/brand";
import { Wifi, WifiOff, Cloud, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export function AppFooter() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <footer className="mt-auto border-t border-border bg-sidebar/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BrandMark />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1.5">
            {online ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span>Modo offline</span>
              </>
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <Cloud className="h-3.5 w-3.5 text-blue-300" />
            <span>Sincronizado</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            <span>Criptografado</span>
          </span>
        </div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
          v1.0 • © {new Date().getFullYear()} Mecânico Pro AI
        </p>
      </div>
    </footer>
  );
}
