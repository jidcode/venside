import type { Metadata } from "next";
import AppContent from "./_components/app-content";
import AppSidebar from "./_components/sidebar/app-sidebar";

export const metadata: Metadata = {
  title: "Venside Dashboard",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex items-start justify-between">
      <AppSidebar />
      <AppContent>{children}</AppContent>
    </div>
  );
}
