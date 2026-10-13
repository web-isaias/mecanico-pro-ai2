import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that don't require authentication or active subscription
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth",
  "/api/webhooks",
  "/api/billing",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p));
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/robots")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets and Next internals
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Skip public paths (login, register, webhooks, billing API)
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Read JWT from cookie (no DB hit, fast)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 1. No session → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Check subscription status
  const status = (token.subscriptionStatus as string) || "trial";
  const trialEndsAt = token.trialEndsAt as number | null;
  const currentPeriodEnd = token.currentPeriodEnd as number | null;
  const now = Date.now();

  const isActive = status === "active" && (!currentPeriodEnd || currentPeriodEnd > now);
  const inTrial = status === "trial" && trialEndsAt && now < trialEndsAt;
  const gracePeriod = status === "past_due" && currentPeriodEnd && now < currentPeriodEnd + 3 * 24 * 60 * 60 * 1000;

  // assinatura cancelada continua valendo até o fim do período já pago
  const canceledButPaid = status === "canceled" && currentPeriodEnd && currentPeriodEnd > now;

  const hasAccess = isActive || inTrial || gracePeriod || canceledButPaid;

  // 3. No access → redirect to billing (unless already there)
  if (!hasAccess && pathname !== "/billing") {
    return NextResponse.redirect(new URL("/billing", req.url));
  }

  // 4. Already logged in + has access + trying to access /login or /register → redirect to /
  // (but allow /billing so users can upgrade/change plans even when active)
  if (hasAccess && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except static assets and Next internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
