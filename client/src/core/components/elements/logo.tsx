import { Box } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Logo() {
  return (
    <Link href="/">
      <div className="flex items-center gap-1 uppercase text-xl text-neutral font-semibold tracking-tight">
        <Box className="bg-secondary text-primary rounded-full h-5.5 w-5.5 p-1 mt-0.5" />
        <span>VENSIDE</span>
      </div>
    </Link>
  );
}

export function LogoLight() {
  return (
    <Link href="/">
      <div className="flex items-center gap-1.5 uppercase text-xl font-semibold tracking-tighter text-neutral">
        <Box className="bg-neutral text-primary rounded-full h-6 w-6 p-1" />
        <span>VENSIDE</span>
      </div>
    </Link>
  );
}

export function LogoIcon() {
  return (
    <Link href="/">
      <div className="text-center">
        <Box className="bg-neutral text-primary rounded-full h-6 w-6 p-1" />
      </div>
    </Link>
  );
}
