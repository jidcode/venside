"use client";

import { useSidebarStore } from "@/core/stores/sidebar-store";
import AppHeader from "./app-header";
import { cn } from "@/core/lib/utils";

export default function AppContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = useSidebarStore((state) => state.isOpen);

  return (
    <div
      className={cn(
        "w-full transition-all duration-300",
        isOpen ? "ml-0 md:ml-56" : "ml-0 md:ml-20"
      )}
    >
      <AppHeader />

      <div className="container py-10 pad bg-background text-foreground min-h-screen">
        {children}
      </div>
    </div>
  );
}
