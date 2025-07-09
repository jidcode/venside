import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import Logo from "@/core/components/elements/logo";
import { ThemeToggle } from "@/core/components/theme/theme-toggle";

const routes = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/contact" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-primary shadow-sm">
      <div className="container flex items-center justify-between h-16 lg:h-20 pad">
        <Logo />
        <nav className="hidden md:flex space-x-4 lg:space-x-6">
          {routes.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-gray-600 text-lg hover:text-sky-400 hover:font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex gap-4">
          <Link href="/register">
            <Button variant="outline">Register</Button>
          </Link>

          <Link href="login">
            <Button>Login</Button>
          </Link>

          <ThemeToggle />
        </div>
        <div className="block md:hidden">
          <MenuIcon />
        </div>
      </div>
    </header>
  );
}
