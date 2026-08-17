"use client";
import { create } from "zustand";

export type ViewKey =
  | "dashboard"
  | "vehicle-search"
  | "diagnosis"
  | "obd2"
  | "catalog"
  | "schematics"
  | "camera-scanner"
  | "quotes"
  | "customers"
  | "schedule"
  | "financial"
  | "inventory"
  | "ai-mechanic"
  | "defects"
  | "history"
  | "calculators"
  | "settings"
  | "admin";

type NavState = {
  activeView: ViewKey;
  searchQuery: string;
  navigate: (view: ViewKey) => void;
  setSearch: (q: string) => void;
};

export const useNavStore = create<NavState>((set) => ({
  activeView: "dashboard",
  searchQuery: "",
  navigate: (view) => {
    set({ activeView: view });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
  setSearch: (q) => set({ searchQuery: q }),
}));
