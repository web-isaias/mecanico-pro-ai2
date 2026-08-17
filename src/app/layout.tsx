import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mecânico Pro AI — Assistente Técnico Automotivo",
  description:
    "O aplicativo de mecânica mais completo do mercado. Diagnóstico com IA, catálogo técnico, scanner OBD2, gestão completa da oficina e mais.",
  keywords: [
    "mecânica automotiva",
    "diagnóstico veicular",
    "OBD2",
    "IA automotiva",
    "oficina mecânica",
    "catálogo técnico",
  ],
  authors: [{ name: "Mecânico Pro AI" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mecânico Pro AI",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1628",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "oklch(0.21 0.04 255)",
              color: "oklch(0.97 0.01 240)",
              border: "1px solid oklch(0.68 0.21 42 / 0.4)",
            },
          }}
        />
      </body>
    </html>
  );
}
