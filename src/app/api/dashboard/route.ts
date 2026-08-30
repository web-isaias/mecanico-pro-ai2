import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // ── Auth: identify the logged-in workshop owner ─────────────────────
    // Without this filter, every account saw the same shared data.
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const userId = token.id as string;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // ── All queries are scoped to the current user ──────────────────────
    // Each model has a userId field linking it to the workshop owner.
    const [
      customers,
      appointmentsToday,
      upcomingAppointments,
      recentServices,
      inventoryItems,
      transactions,
      quotes,
      defects,
      notifications,
    ] = await Promise.all([
      db.customer.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { vehicles: true },
      }),
      db.appointment.findMany({
        where: {
          userId,
          startDate: { gte: today, lt: tomorrow },
        },
        orderBy: { startDate: "asc" },
      }),
      db.appointment.findMany({
        where: {
          userId,
          startDate: { gte: tomorrow },
        },
        orderBy: { startDate: "asc" },
        take: 5,
      }),
      db.serviceOrder.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { customer: true, vehicle: true },
      }),
      db.inventoryItem.findMany({ where: { userId } }),
      db.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 100,
      }),
      db.quote.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
      db.defect.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
      // Notifications are global (system-wide), not per-user — keep as-is
      db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    ]);

    // ── Financial calculations (scoped to user's transactions) ──────────
    const todayTransactions = transactions.filter(
      (t) => new Date(t.date) >= today && new Date(t.date) < tomorrow
    );
    const todayRevenue = todayTransactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const todayExpenses = todayTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthTransactions = transactions.filter(
      (t) => new Date(t.date) >= monthStart
    );
    const monthRevenue = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const monthExpenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    // ── Build chart data (last 7 days, scoped) ──────────────────────────
    const chartData: { day: string; receita: number; despesa: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      const dayTx = transactions.filter((t) => {
        const td = new Date(t.date);
        return td >= dayStart && td <= dayEnd;
      });
      chartData.push({
        day: new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(d),
        receita: dayTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        despesa: dayTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      });
    }

    // ── Low stock alerts (scoped) ───────────────────────────────────────
    const lowStockItems = inventoryItems.filter((i) => i.quantity <= i.minStock);

    return NextResponse.json({
      stats: {
        todayRevenue,
        todayExpenses,
        todayProfit: todayRevenue - todayExpenses,
        monthRevenue,
        monthExpenses,
        monthProfit: monthRevenue - monthExpenses,
        customerCount: await db.customer.count({ where: { userId } }),
        vehicleCount: await db.vehicle.count({
          where: { customer: { userId } },
        }),
        serviceOrderCount: await db.serviceOrder.count({ where: { userId } }),
        pendingQuotes: quotes.filter((q) => q.status === "draft" || q.status === "sent").length,
        lowStockCount: lowStockItems.length,
        pendingAppointments: upcomingAppointments.length,
      },
      appointmentsToday,
      upcomingAppointments,
      recentServices,
      recentCustomers: customers,
      lowStockItems,
      chartData,
      transactions,
      defects,
      notifications,
    });
  } catch (err: any) {
    console.error("Dashboard API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao carregar dashboard" },
      { status: 500 }
    );
  }
}
