"use client";

import { useRouter } from "next/navigation";
import { WarehouseRequest, WarehouseStockRequest } from "../schema/validator";
import useQuery from "@/core/hooks/use-query";
import useInventoryStore from "@/core/stores/inventory-store";
import { errorMessage } from "../lib/errors";
import { WarehouseState } from "../schema/types";
import {
  createWarehouseAction,
  updateWarehouseAction,
  deleteWarehouseAction,
  addProductsToWarehouseAction,
} from "@/server/actions/warehouse";

export function getAllWarehouses() {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<WarehouseState[]>(`/inventories/${inventoryId}/warehouses`);
}

export function getWarehouse(warehouseId: string) {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<WarehouseState>(
    `/inventories/${inventoryId}/warehouses/${warehouseId}`
  );
}

export function useWarehouseService() {
  const router = useRouter();
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);

  const { data, error, mutate } = getAllWarehouses();

  const createWarehouse = async (formData: WarehouseRequest) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await createWarehouseAction(formData, inventoryId);

      if (response.success) {
        await mutate(data ? [...data, response.data] : [response.data], false);
        router.refresh();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Create warehouse error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const updateWarehouse = async (id: string, formData: WarehouseRequest) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await updateWarehouseAction(id, inventoryId, formData);

      if (response.success) {
        await mutate(
          data?.map((warehouse) =>
            warehouse.id === id ? response.data : warehouse
          ),
          false
        );
        window.location.reload();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Update warehouse error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const deleteWarehouse = async (id: string) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await deleteWarehouseAction(id, inventoryId);

      if (response.success) {
        await mutate(
          data?.filter((warehouse) => warehouse.id !== id),
          false
        );
        router.push("/warehouses");
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Delete warehouse error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const addProductsToWarehouse = async (
    warehouseId: string,
    formData: WarehouseStockRequest
  ) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await addProductsToWarehouseAction(
        warehouseId,
        inventoryId,
        formData
      );

      if (response.success) {
        // Optimistically update the warehouse data
        await mutate(
          data?.map((warehouse) => {
            if (warehouse.id === warehouseId) {
              const updatedProducts = formData.stockItems.map((item) => ({
                productId: item.productId,
                stockQuantity: item.stockQuantity,
              }));
              return {
                ...warehouse,
                products: [...(warehouse.stockItems || []), ...updatedProducts],
              };
            }
            return warehouse;
          }),
          false
        );
        window.location.reload();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Add products to warehouse error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  return {
    warehouses: data,
    isLoading: !error && !data,
    error,

    createWarehouse,
    updateWarehouse,
    deleteWarehouse,

    addProductsToWarehouse,
  };
}
