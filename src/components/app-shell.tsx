"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { useNavStore } from "@/lib/store";
import { VIEW_TITLES } from "@/lib/nav-config";
import { motion, AnimatePresence } from "framer-motion";
import { lazy, Suspense, useMemo } from "react";
import { DashboardLoader } from "@/components/shared/loaders";

// Lazy load views for better performance
const Dashboard = lazy(() =>
  import("@/components/views/dashboard").then((m) => ({ default: m.Dashboard }))
);
const AiMechanic = lazy(() =>
  import("@/components/views/ai-mechanic").then((m) => ({ default: m.AiMechanic }))
);
const Diagnosis = lazy(() =>
  import("@/components/views/diagnosis").then((m) => ({ default: m.Diagnosis }))
);
const CameraScanner = lazy(() =>
  import("@/components/views/camera-scanner").then((m) => ({ default: m.CameraScanner }))
);
const Obd2 = lazy(() =>
  import("@/components/views/obd2").then((m) => ({ default: m.Obd2 }))
);
const VehicleSearch = lazy(() =>
  import("@/components/views/vehicle-search").then((m) => ({ default: m.VehicleSearch }))
);
const Catalog = lazy(() =>
  import("@/components/views/catalog").then((m) => ({ default: m.Catalog }))
);
const Schematics = lazy(() =>
  import("@/components/views/schematics").then((m) => ({ default: m.Schematics }))
);
const Quotes = lazy(() =>
  import("@/components/views/quotes").then((m) => ({ default: m.Quotes }))
);
const Customers = lazy(() =>
  import("@/components/views/customers").then((m) => ({ default: m.Customers }))
);
const Schedule = lazy(() =>
  import("@/components/views/schedule").then((m) => ({ default: m.Schedule }))
);
const Financial = lazy(() =>
  import("@/components/views/financial").then((m) => ({ default: m.Financial }))
);
const Inventory = lazy(() =>
  import("@/components/views/inventory").then((m) => ({ default: m.Inventory }))
);
const Defects = lazy(() =>
  import("@/components/views/defects").then((m) => ({ default: m.Defects }))
);
const History = lazy(() =>
  import("@/components/views/history").then((m) => ({ default: m.ServiceHistory }))
);
const Calculators = lazy(() =>
  import("@/components/views/calculators").then((m) => ({ default: m.Calculators }))
);
const Settings = lazy(() =>
  import("@/components/views/settings").then((m) => ({ default: m.Settings }))
);
const Admin = lazy(() =>
  import("@/components/views/admin").then((m) => ({ default: m.Admin }))
);

const viewMap = {
  dashboard: Dashboard,
  "ai-mechanic": AiMechanic,
  diagnosis: Diagnosis,
  "camera-scanner": CameraScanner,
  obd2: Obd2,
  "vehicle-search": VehicleSearch,
  catalog: Catalog,
  schematics: Schematics,
  quotes: Quotes,
  customers: Customers,
  schedule: Schedule,
  financial: Financial,
  inventory: Inventory,
  defects: Defects,
  history: History,
  calculators: Calculators,
  settings: Settings,
  admin: Admin,
} as const;

export function AppShell() {
  const activeView = useNavStore((s) => s.activeView);
  const View = viewMap[activeView];
  const title = VIEW_TITLES[activeView];

  // Memoize key for animation reset
  const animKey = useMemo(() => activeView, [activeView]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Desktop sidebar (fixed) */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-sidebar/80 backdrop-blur-sm lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col">
        <AppSidebar />
      </aside>

      {/* Mobile header */}
      <div className="flex min-h-screen flex-col lg:pl-72">
        <AppHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-6 sm:px-4 lg:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={animKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={<DashboardLoader title={title} />}>
                <View />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
