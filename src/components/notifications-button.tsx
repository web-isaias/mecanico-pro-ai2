"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, AlertTriangle, CalendarClock, Package, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_NOTIFICATIONS = [
  {
    id: "1",
    type: "review",
    title: "Revisão — Honda Civic 2.0",
    message: "Cliente João Silva tem revisão programada hoje às 14:00",
    icon: CalendarClock,
    color: "text-orange-400",
    read: false,
  },
  {
    id: "2",
    type: "oil",
    title: "Troca de óleo pendente",
    message: "Onix 1.4 — ABC1D23 atingiu 10.000 km desde a última troca",
    icon: Wrench,
    color: "text-amber-400",
    read: false,
  },
  {
    id: "3",
    type: "stock",
    title: "Estoque baixo",
    message: "Filtro de óleo Onix 1.4 abaixo do mínimo (3 un.)",
    icon: Package,
    color: "text-red-400",
    read: false,
  },
  {
    id: "4",
    type: "warranty",
    title: "Garantia vencendo",
    message: "Garantia do serviço #4521 vence em 7 dias",
    icon: AlertTriangle,
    color: "text-amber-400",
    read: true,
  },
];

export function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(SAMPLE_NOTIFICATIONS);
  const unread = items.filter((i) => !i.read).length;

  const markAll = () =>
    setItems((arr) => arr.map((i) => ({ ...i, read: true })));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-orange-400"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 border-border bg-popover/95 p-0 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Notificações</p>
            {unread > 0 && (
              <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
                {unread} novas
              </span>
            )}
          </div>
          <button
            onClick={markAll}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-orange-400"
          >
            <Check className="h-3 w-3" /> Marcar todas
          </button>
        </div>
        <ScrollArea className="h-72">
          <div className="space-y-1 p-2">
            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sem notificações
              </p>
            ) : (
              items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg p-3 transition",
                      item.read ? "opacity-60" : "bg-accent/50"
                    )}
                  >
                    <span className={cn("mt-0.5", item.color)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.message}
                      </p>
                    </div>
                    {!item.read && (
                      <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
