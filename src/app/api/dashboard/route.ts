import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/nav-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { vehicles: true },
      }),
      db.appointment.findMany({
        where: {
          startDate: { gte: today, lt: tomorrow },
        },
        orderBy: { startDate: "asc" },
      }),
      db.appointment.findMany({
        where: {
          startDate: { gte: tomorrow },
        },
        orderBy: { startDate: "asc" },
        take: 5,
      }),
      db.serviceOrder.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { customer: true, vehicle: true },
      }),
      db.inventoryItem.findMany(),
      db.transaction.findMany({
        orderBy: { date: "desc" },
        take: 100,
      }),
      db.quote.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
      db.defect.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    ]);

    // Financial calculations
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

    // Build chart data (last 7 days)
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

    // Low stock alerts
    const lowStockItems = inventoryItems.filter((i) => i.quantity <= i.minStock);

    return NextResponse.json({
      stats: {
        todayRevenue,
        todayExpenses,
        todayProfit: todayRevenue - todayExpenses,
        monthRevenue,
        monthExpenses,
        monthProfit: monthRevenue - monthExpenses,
        customerCount: await db.customer.count(),
        vehicleCount: await db.vehicle.count(),
        serviceOrderCount: await db.serviceOrder.count(),
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

export { formatCurrency };
