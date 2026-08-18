"use client";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoader({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-card" />
        <Skeleton className="h-4 w-72 bg-card" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl bg-card" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl bg-card" />
        <Skeleton className="h-64 rounded-2xl bg-card" />
        <Skeleton className="h-64 rounded-2xl bg-card" />
      </div>
    </div>
  );
}
