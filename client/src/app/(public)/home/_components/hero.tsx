import { Button } from "@/core/components/ui/button";
import Link from "next/link";
import React from "react";

export default function HeroPage() {
  return (
    <div className="pad text-center mx-auto mt-20 lg:mt-28 lg:w-[700px] h-screen space-y-6">
      <h2 className="text-3xl xl:text-5xl px-4 font-medium bg-gradient-to-br from-secondary to-focus/80 bg-clip-text text-transparent">
        Simplify Your Inventory, Amplify Your Business.
      </h2>

      <p className="lg:text-lg">
        Seamlessly manage your inventory and streamline warehouse workflows with
        a platform designed to save time, cut costs, and enhance decision-making
        at every step.
      </p>

      <div className="flex items-center justify-center gap-4">
        <Link href="/register">
          <Button>Home</Button>
        </Link>

        <Link href="login">
          <Button variant="outline">Home</Button>
        </Link>

        <Link href="login">
          <Button variant="secondary">Home</Button>
        </Link>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Link href="/register">
          <Button variant="ghost">Home</Button>
        </Link>

        <Link href="login">
          <Button variant="link">Home</Button>
        </Link>

        <Link href="login">
          <Button variant="destructive">Home</Button>
        </Link>
      </div>
    </div>
  );
}
