import { BrandLogo } from "@/components/shared/brand";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-3xl" />
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        {/* Brand */}
        <Link href="/" className="mb-8 flex flex-col items-center gap-3">
          <BrandLogo size={64} />
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Mecânico <span className="text-gradient-orange">Pro AI</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Assistente Técnico Automotivo
            </p>
          </div>
        </Link>
        {children}
      </div>
    </div>
  );
}
