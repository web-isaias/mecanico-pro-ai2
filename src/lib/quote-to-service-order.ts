// Server-side helper: creates a ServiceOrder from an approved Quote.
// Used by the PUT /api/quotes/[id] endpoint when status changes to "approved".
// Idempotent: if a ServiceOrder already exists for this quoteId, returns it without creating a new one.
import { db } from "@/lib/db";

export type QuoteItem = {
  id?: string;
  description: string;
  type: "service" | "part";
  quantity: number;
  unitPrice: number;
  total: number;
};

export async function createServiceOrderFromQuote(quoteId: string) {
  // 1. Load the quote with all related data
  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: { customer: true, vehicle: true },
  });
  if (!quote) {
    throw new Error("Orçamento não encontrado");
  }

  // 2. Idempotency: if there's already a ServiceOrder linked to this quote, return it.
  // The quoteId field is @unique, so at most one ServiceOrder can be linked.
  const existing = await db.serviceOrder.findUnique({
    where: { quoteId: quote.id },
    include: { customer: true, vehicle: true, items: true },
  });
  if (existing) {
    return { serviceOrder: existing, created: false };
  }

  // 3. Parse the items JSON from the quote
  let quoteItems: QuoteItem[] = [];
  try {
    quoteItems = JSON.parse(quote.items || "[]");
  } catch {
    quoteItems = [];
  }

  // 4. Build a friendly title from the quote's items (or fallback to the quote number)
  const servicesList = quoteItems
    .filter((i) => i.type === "service")
    .map((i) => i.description)
    .filter(Boolean);
  const title = servicesList.length > 0
    ? servicesList.slice(0, 2).join(" + ") + (servicesList.length > 2 ? "..." : "")
    : `OS do Orçamento ${quote.number}`;

  // 5. Build description
  const vehicleLabel = quote.vehicle
    ? `${quote.vehicle.brand} ${quote.vehicle.model}${quote.vehicle.plate ? ` — ${quote.vehicle.plate}` : ""}`
    : "Veículo não informado";
  const itemsSummary = quoteItems.length > 0
    ? quoteItems.map((i) => `• ${i.quantity}x ${i.description} — R$ ${i.total.toFixed(2)}`).join("\n")
    : "Sem itens";
  const description = `Originado do orçamento ${quote.number}\n\nVeículo: ${vehicleLabel}\n\nItens:\n${itemsSummary}${quote.notes ? `\n\nObservações do orçamento: ${quote.notes}` : ""}`;

  // 6. Create the ServiceOrder with items copied from the quote
  const serviceOrder = await db.serviceOrder.create({
    data: {
      // Link to the same owner (workshop account) if present
      userId: quote.userId || undefined,
      customerId: quote.customerId,
      vehicleId: quote.vehicleId || null,
      quoteId: quote.id, // ← the actual link
      title,
      description,
      status: "pending",
      priority: "normal",
      laborCost: quote.laborTotal,
      partsCost: quote.partsTotal,
      totalCost: quote.total,
      warranty: quote.notes?.includes("garantia") ? "Conforme orçamento" : null,
      scheduledAt: null,
      // Copy items from quote → ServiceItem rows
      items: quoteItems.length > 0
        ? {
            create: quoteItems
              .filter((i) => i.description)
              .map((i) => ({
                description: i.description,
                type: i.type || "service",
                quantity: Number(i.quantity) || 1,
                unitPrice: Number(i.unitPrice) || 0,
                total: Number(i.total) || 0,
              })),
          }
        : undefined,
    },
    include: { customer: true, vehicle: true, items: true },
  });

  return { serviceOrder, created: true };
}
