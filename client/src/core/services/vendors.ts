"use client";

import { useRouter } from "next/navigation";
import { VendorRequest } from "../schema/validator";
import useQuery from "@/core/hooks/use-query";
import useInventoryStore from "@/core/stores/inventory-store";
import { errorMessage } from "../lib/errors";
import { VendorState } from "../schema/types";
import {
  createVendorAction,
  updateVendorAction,
  deleteVendorAction,
} from "@/server/actions/vendor";

export function getAllVendors() {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<VendorState[]>(`/inventories/${inventoryId}/vendors`);
}

export function getVendor(vendorId: string) {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<VendorState>(
    `/inventories/${inventoryId}/vendors/${vendorId}`
  );
}

export function useVendorService() {
  const router = useRouter();
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);

  const { data, error, mutate } = getAllVendors();

  const createVendor = async (formData: VendorRequest) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await createVendorAction(formData, inventoryId);

      if (response.success) {
        await mutate(data ? [...data, response.data] : [response.data], false);
        router.refresh();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Create vendor error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const updateVendor = async (id: string, formData: VendorRequest) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await updateVendorAction(id, inventoryId, formData);

      if (response.success) {
        await mutate(
          data?.map((vendor) => (vendor.id === id ? response.data : vendor)),
          false
        );
        window.location.reload();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Update vendor error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const deleteVendor = async (id: string) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await deleteVendorAction(id, inventoryId);

      if (response.success) {
        await mutate(
          data?.filter((vendor) => vendor.id !== id),
          false
        );
        router.push("/vendors");
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Delete vendor error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  return {
    vendors: data,
    isLoading: !error && !data,
    error,

    createVendor,
    updateVendor,
    deleteVendor,
  };
}
