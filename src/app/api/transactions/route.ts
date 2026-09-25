import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["income", "expense"] as const;
const ALLOWED_CATEGORIES = [
  "service",
  "parts",
  "labor",
  "rent",
  "utility",
  "other",
] as const;
const ALLOWED_STATUSES = ["paid", "pending"] as const;

// GET /api/transactions?type=&category=&status=&from=&to=&q=&take=&skip=
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type")?.trim();
    const category = searchParams.get("category")?.trim();
    const status = searchParams.get("status")?.trim();
    const from = searchParams.get("from")?.trim();
    const to = searchParams.get("to")?.trim();
    const q = searchParams.get("q")?.trim();
    const takeRaw = Number(searchParams.get("take") ?? 500);
    const skipRaw = Number(searchParams.get("skip") ?? 0);

    const where: any = { userId };

    if (type && (ALLOWED_TYPES as readonly string[]).includes(type)) {
      where.type = type;
    }
    if (category && (ALLOWED_CATEGORIES as readonly string[]).includes(category)) {
      where.category = category;
    }
    if (status && (ALLOWED_STATUSES as readonly string[]).includes(status)) {
      where.status = status;
    }

    if (from || to) {
      where.date = {};
      if (from) {
        const d = new Date(from);
        if (!Number.isNaN(d.getTime())) where.date.gte = d;
      }
      if (to) {
        // include the whole "to" day
        const d = new Date(to);
        if (!Number.isNaN(d.getTime())) {
          d.setHours(23, 59, 59, 999);
          where.date.lte = d;
        }
      }
    }

    if (q) {
      where.description = { contains: q };
    }

    const take =
      Number.isFinite(takeRaw) && takeRaw > 0 ? Math.min(takeRaw, 1000) : 500;
    const skip = Number.isFinite(skipRaw) && skipRaw >= 0 ? skipRaw : 0;

    const [data, total] = await Promise.all([
      db.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        take,
        skip,
      }),
      db.transaction.count({ where }),
    ]);

    return NextResponse.json({ data, total });
  } catch (err: any) {
    console.error("Transactions list API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao listar transações" },
      { status: 500 }
    );
  }
}

// POST /api/transactions — create
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      category,
      description,
      amount,
      date,
      status,
    } = body || {};

    if (!type || !(ALLOWED_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json(
        { error: "Tipo inválido. Use 'income' ou 'expense'." },
        { status: 400 }
      );
    }
    if (
      !category ||
      !(ALLOWED_CATEGORIES as readonly string[]).includes(category)
    ) {
      return NextResponse.json(
        {
          error:
            "Categoria inválida. Use service, parts, labor, rent, utility ou other.",
        },
        { status: 400 }
      );
    }
    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "Descrição é obrigatória" },
        { status: 400 }
      );
    }
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Valor deve ser um número positivo" },
        { status: 400 }
      );
    }

    let dateValue: Date | undefined;
    if (date) {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { error: "Data inválida" },
          { status: 400 }
        );
      }
      dateValue = d;
    }

    const finalStatus =
      status && (ALLOWED_STATUSES as readonly string[]).includes(status)
        ? status
        : "paid";

    const transaction = await db.transaction.create({
      data: {
        userId,
        type,
        category,
        description: description.trim(),
        amount: parsedAmount,
        date: dateValue ?? new Date(),
        status: finalStatus,
      },
    });

    return NextResponse.json({ data: transaction }, { status: 201 });
  } catch (err: any) {
    console.error("Transactions create API error:", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao criar transação" },
      { status: 500 }
    );
  }
}
