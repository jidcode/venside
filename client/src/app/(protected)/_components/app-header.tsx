import Logo from "@/core/components/elements/logo";
import { ThemeToggle } from "@/core/components/theme/theme-toggle";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { Input } from "@/core/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/core/components/ui/sheet";
import { AlignLeft, Search } from "lucide-react";
import { IoMdSettings } from "react-icons/io";
import { SidebarRoutes } from "./sidebar/side-content";
import { cn } from "@/core/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 bg-primary text-secondary shadow-sm w-full">
      <div className="container flex items-center justify-between gap-4 h-16 pad">
        <div className="flex items-center gap-4 md:hidden">
          <MobileMenu />

          <Logo />
        </div>

        <div className="hidden md:block w-1/3">
          <Input
            id="search"
            leftIcon={<Search className="h-4 w-4" />}
            iconPosition="left"
            className="rounded-sm w-full"
          />
        </div>

        <div className="flex items-center gap-4">
          <IoMdSettings className="w-6 h-6" />

          <Avatar>
            <AvatarImage
              height={60}
              width={60}
              src="https://github.com/shadcn.png"
              className="rounded-full border border-primary"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function MobileMenu() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button type="button">
          <AlignLeft className="w-6 h-6 hover:text-accent" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="md:hidden border-none">
        <SheetTitle className="sr-only">Mobile Menu Routes</SheetTitle>

        <div>
          <ul className="my-20 grid w-full place-content-center">
            {SidebarRoutes.map((link) => (
              <li
                key={link.title}
                className={cn(
                  "font-medium text-neutral rounded-sm hover:text-accent/50",
                  pathname === link.url && "text-accent bg-accent/10"
                )}
              >
                <Link href={link.url}>
                  <button className=" flex items-center gap-2 px-10 py-2 my-2 font-md text-2xl transition-all duration-300">
                    <link.icon size={24} />
                    <span>{link.title}</span>
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
