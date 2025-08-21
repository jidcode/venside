"use client";

import { useRouter } from "next/navigation";
import { SaleRequest } from "../schema/validator";
import useQuery from "@/core/hooks/use-query";
import useInventoryStore from "@/core/stores/inventory-store";
import { errorMessage } from "../lib/errors";
import { SaleState } from "../schema/types";
import { createSaleAction, deleteSaleAction } from "@/server/actions/sale";

export function getAllSales() {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<SaleState[]>(`/inventories/${inventoryId}/sales`);
}

export function getSale(saleId: string) {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<SaleState>(`/inventories/${inventoryId}/sales/${saleId}`);
}

export function useSaleService() {
  const router = useRouter();
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);

  const { data, error, mutate } = getAllSales();

  const createSale = async (formData: SaleRequest) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await createSaleAction(formData, inventoryId);

      if (response.success) {
        await mutate(data ? [...data, response.data] : [response.data], false);
        router.refresh();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Create sale error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const deleteSale = async (id: string) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await deleteSaleAction(id, inventoryId);

      if (response.success) {
        await mutate(
          data?.filter((sale) => sale.id !== id),
          false
        );
        router.push("/sales");
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Delete sale error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  return {
    sales: data,
    isLoading: !error && !data,
    error,

    createSale,
    deleteSale,
  };
}
