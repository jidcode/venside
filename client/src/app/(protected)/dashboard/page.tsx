"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/core/stores/auth-store";
import DashboardContent from "./_components/dashboard-content";
import NewInventoryModal from "./_components/new-inventory";
import useInventoryStore from "@/core/stores/inventory-store";
import { FullPageLoader } from "@/core/components/elements/loader";
import { InventoryState } from "@/core/schema/types";

export default function DashboardPage() {
  const { user, setUser, isAuthenticated } = useAuthStore();
  const setInventory = useInventoryStore((state) => state.setInventory);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has inventories when component mounts
    if (user) {
      setIsLoading(false);
      if (!user.inventories || user.inventories.length === 0) {
        setShowModal(true);
      }
    }
  }, [user]);

  const handleNewInventory = (newInventory: InventoryState) => {
    // Update user and inventory in store with the new inventory
    if (user) {
      const updatedUser = {
        ...user,
        inventories: [...(user.inventories || []), newInventory],
      };
      setUser(updatedUser);
      setInventory(newInventory);
    }

    setShowModal(false);
    setIsLoading(true);
  };

  if (isLoading) return <FullPageLoader />;

  return (
    <div>
      {showModal && isAuthenticated ? (
        <NewInventoryModal onSuccess={handleNewInventory} />
      ) : (
        <DashboardContent />
      )}
    </div>
  );
}
