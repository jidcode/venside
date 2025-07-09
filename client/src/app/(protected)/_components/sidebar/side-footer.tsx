"use client";

import { Button } from "@/core/components/ui/button";
import { useAuthStore } from "@/core/stores/auth-store";
import useInventoryStore from "@/core/stores/inventory-store";
import { useRouter } from "next/navigation";
import { BiLogOut } from "react-icons/bi";
import { FullPageLoader, LoadingDots } from "@/core/components/elements/loader";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { logoutUserAction } from "@/server/actions/auth";

export function SideFooter({ isOpen }: { isOpen: boolean }) {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const deleteInventory = useInventoryStore((state) => state.deleteInventory);

  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      await logoutUserAction();
      setSigningOut(true);

      router.push("/login");
      clearAuth();
      deleteInventory();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (signingOut) return <FullPageLoader />;

  return (
    <footer className="p-2 my-4">
      {isOpen ? (
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Signing out...</span>
            </div>
          ) : (
            <>
              <BiLogOut />
              <span>Sign out</span>
            </>
          )}
        </Button>
      ) : (
        <div className="w-full text-center">
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="min-w-fit w-10 h-10"
            disabled={loading}
          >
            {loading ? <LoadingDots /> : <BiLogOut className="size-5" />}
          </Button>
        </div>
      )}
    </footer>
  );
}
