// Mercado Pago REST client — uses fetch directly (no SDK dependency)
// Docs: https://www.mercadopago.com.br/developers/pt/docs/subscriptions/api-reference

const MP_API = "https://api.mercadopago.com";

export const PLANS = {
  monthly: {
    id: "monthly",
    label: "Mensal",
    price: 79.9,
    interval: 1,
    intervalType: "months",
    description: "Plano Mensal — Mecânico Pro AI",
  },
  annual: {
    id: "annual",
    label: "Anual",
    price: 799.0,
    interval: 1,
    intervalType: "years",
    description: "Plano Anual — Mecânico Pro AI (2 meses grátis)",
  },
} as const;

export type PlanId = keyof typeof PLANS;

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  }
  return token;
}

function isConfigured(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

// Create a recurring subscription (preapproval) preference
// Returns the init_point URL where the user authorizes the recurring payment
export async function createSubscriptionPreference(opts: {
  email: string;
  plan: PlanId;
  userId: string;
  backUrl: string;
}): Promise<{ initPoint: string; preapprovalId: string } | null> {
  if (!isConfigured()) return null;

  const plan = PLANS[opts.plan];
  const token = getAccessToken();
  const appId = process.env.MERCADOPAGO_APP_ID || "";

  const body: any = {
    reason: plan.description,
    auto_recurring: {
      transaction_amount: plan.price,
      currency_id: "BRL",
      frequency: plan.interval,
      frequency_type: plan.intervalType,
      // sem limite de repetições: a cobrança continua até o cliente cancelar
    },
    payer_email: opts.email,
    back_url: opts.backUrl,
    status: "pending",
    external_reference: opts.userId, // link to our User
  };

  const res = await fetch(`${MP_API}/preapproval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": `${opts.userId}-${opts.plan}-${Date.now()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("MP createSubscriptionPreference error:", err);
    throw new Error(`Erro Mercado Pago: ${res.status}`);
  }
  const data = await res.json();
  return {
    initPoint: data.init_point,
    preapprovalId: data.id,
  };
}

// Fetch the current status of a preapproval (subscription)
export async function getPreapproval(preapprovalId: string): Promise<any | null> {
  if (!isConfigured()) return null;
  const token = getAccessToken();
  const res = await fetch(`${MP_API}/preapproval/${preapprovalId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error("MP getPreapproval error:", await res.text());
    return null;
  }
  return res.json();
}

// Busca um pagamento recorrente (cobrança de uma assinatura) para descobrir a qual assinatura ele pertence
export async function getAuthorizedPayment(paymentId: string): Promise<any | null> {
  if (!isConfigured()) return null;
  const token = getAccessToken();
  const res = await fetch(`${MP_API}/authorized_payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error("MP getAuthorizedPayment error:", await res.text());
    return null;
  }
  return res.json();
}

// Map Mercado Pago status → our internal status.
// Retorna null quando o status NÃO deve alterar a conta (ex.: "pending" = cliente abriu o
// checkout mas ainda não pagou; não pode apagar o teste grátis dele).
export function mapMpStatus(mpStatus: string): string | null {
  switch (mpStatus) {
    case "authorized":
    case "active":
      return "active";
    case "paused":
      return "past_due";
    case "cancelled":
    case "canceled":
      return "canceled";
    case "pending":
    default:
      return null;
  }
}

export function isMercadoPagoConfigured(): boolean {
  return isConfigured();
}
