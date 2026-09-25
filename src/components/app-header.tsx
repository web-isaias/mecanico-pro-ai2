"use client";
import { useState, useRef } from "react";
import { useNavStore } from "@/lib/store";
import { NAV_CARDS } from "@/lib/nav-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { AppSidebar } from "@/components/app-sidebar";
import { VoiceSearchButton } from "@/components/voice-search";
import { NotificationsButton } from "@/components/notifications-button";
import { UserMenu } from "@/components/user-menu";
import { BrandLogo } from "@/components/shared/brand";
import {
  Menu,
  Search,
  Bell,
  Mic,
  UserCircle,
  CalendarClock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/nav-config";

export function AppHeader() {
  const navigate = useNavStore((s) => s.navigate);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const todayRevenue = 1280.5;
  const todayAppointments = 5;
  const lowStock = 3;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-3 sm:px-4 lg:px-6">
        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 border-border bg-sidebar p-0"
          >
            <SheetTitle className="sr-only">Navegação</SheetTitle>
            <AppSidebar onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Brand (mobile) */}
        <div className="lg:hidden">
          <BrandLogo size={32} />
        </div>

        {/* Global search */}
        <div className="relative hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                useNavStore.getState().setSearch(query);
                navigate("vehicle-search");
                setQuery("");
              }
            }}
            placeholder="Pesquisar veículo, código, cliente..."
            className="h-10 rounded-xl border-border bg-card/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground/70 focus-visible:border-orange-500/50"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Quick stats (desktop) */}
          <div className="hidden items-center gap-3 mr-2 xl:flex">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <div className="leading-none">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Faturamento hoje
                </p>
                <p className="text-xs font-bold text-foreground">
                  {formatCurrency(todayRevenue)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-1.5">
              <CalendarClock className="h-4 w-4 text-orange-400" />
              <div className="leading-none">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Agendados hoje
                </p>
                <p className="text-xs font-bold text-foreground">
                  {todayAppointments}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <div className="leading-none">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Estoque baixo
                </p>
                <p className="text-xs font-bold text-foreground">{lowStock}</p>
              </div>
            </div>
          </div>

          <VoiceSearchButton />
          <NotificationsButton />
          <UserMenu />
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t border-border px-3 pb-2 pt-2 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                useNavStore.getState().setSearch(query);
                navigate("vehicle-search");
                setQuery("");
              }
            }}
            placeholder="Pesquisar veículo, código, cliente..."
            className="h-9 rounded-lg border-border bg-card/50 pl-9 text-sm"
          />
        </div>
      </div>
    </header>
  );
}
