import { LogoLight, LogoIcon } from "@/core/components/elements/logo";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export function SideHeader({ isOpen, toggle }: SidebarProps) {
  return (
    <div className="py-4 px-6 h-16 border-b border-r border-background">
      <div className="flex items-center justify-between gap-2">
        <h5>{isOpen ? <LogoLight /> : <LogoIcon />}</h5>

        <button
          type="button"
          onClick={toggle}
          className="text-focus bg-transparent rounded-full"
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}

          <span className="sr-only">Toggle menu</span>
        </button>
      </div>
    </div>
  );
}
