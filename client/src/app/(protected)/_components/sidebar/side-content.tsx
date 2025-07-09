"use client";

import { TbLayoutDashboardFilled } from "react-icons/tb";
import {
  RiBox1Fill,
  RiContactsBook3Fill,
  RiShoppingBasketFill,
} from "react-icons/ri";
import { usePathname } from "next/navigation";
import { PiWarehouseFill } from "react-icons/pi";
import { MdShoppingCart } from "react-icons/md";
import Link from "next/link";
import { cn } from "@/core/lib/utils";

export const SidebarRoutes = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: TbLayoutDashboardFilled,
  },
  {
    title: "Products",
    url: "/products",
    icon: RiBox1Fill,
  },
  {
    title: "Warehouses",
    url: "/warehouses",
    icon: PiWarehouseFill,
  },
  {
    title: "Sales",
    url: "/sales",
    icon: MdShoppingCart,
  },
  {
    title: "Purchases",
    url: "/purchases",
    icon: RiShoppingBasketFill,
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: RiContactsBook3Fill,
  },
];

export function SideContent({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();

  return (
    <div className="mx-4 my-8">
      <div>
        <ul>
          {SidebarRoutes.map((link) => (
            <li
              key={link.title}
              className={cn(
                "font-medium text-secondary/90 rounded-sm w-full hover:bg-muted/80 hover:text-neutral",
                pathname === link.url && "text-focus bg-focus/5"
              )}
            >
              {isOpen ? (
                <Link href={link.url}>
                  <button className=" flex items-center py-2 my-2 gap-1.5 text-base font-medium p-2 transition-all duration-400">
                    <link.icon size={20} />
                    <span>{link.title}</span>
                  </button>
                </Link>
              ) : (
                <Link href={link.url}>
                  <button className="px-2 py-3 my-1 mx-auto flex justify-center items-center hover:text-neutral/80">
                    <link.icon
                      size={22}
                      className="transition-all duration-300"
                    />
                  </button>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
