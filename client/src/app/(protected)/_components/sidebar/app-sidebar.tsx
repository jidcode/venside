"use client";

import { SideHeader } from "./side-header";
import { SideContent } from "./side-content";
import { SideFooter } from "./side-footer";
import { useSidebarStore } from "@/core/stores/sidebar-store";
import { cn } from "@/core/lib/utils";

export default function AppSidebar() {
  const { isOpen, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        "hidden md:block fixed top-0 left-0 z-40 h-screen overflow-y-auto transition-all duration-300 bg-primary",
        isOpen ? "w-56" : "w-20"
      )}
      role="dialog"
      aria-labelledby="drawer-navigation-label"
      aria-hidden={!isOpen}
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          <SideHeader isOpen={isOpen} toggle={toggle} />
          <SideContent isOpen={isOpen} />
        </div>
        <SideFooter isOpen={isOpen} />
      </div>
    </aside>
  );
}
