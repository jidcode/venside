import { create } from "zustand";
import { persist } from "zustand/middleware";
import { InventoryState } from "../schema/types";

export interface InventoryStore {
  currentInventory: InventoryState | null;
  setInventory: (inventory: InventoryState) => void;
  deleteInventory: () => void;
}

const useInventoryStore = create<InventoryStore>()(
  persist(
    (set) => ({
      currentInventory: null,

      setInventory: (inventory: InventoryState) =>
        set({ currentInventory: inventory }),

      deleteInventory: () => {
        set({ currentInventory: null });
        localStorage.removeItem("inventory-state");
      },
    }),
    {
      name: "inventory-state",
    }
  )
);

export default useInventoryStore;
