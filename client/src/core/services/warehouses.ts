"use client";

import { useRouter } from "next/navigation";
import {
  WarehouseRequest,
  AddStockRequest,
  TransferStockRequest,
  UpdateStockQuantityRequest,
} from "../schema/validator";
import useQuery from "@/core/hooks/use-query";
import useInventoryStore from "@/core/stores/inventory-store";
import { errorMessage } from "../lib/errors";
import { WarehouseState } from "../schema/types";
import {
  createWarehouseAction,
  updateWarehouseAction,
  deleteWarehouseAction,
  addProductsToWarehouseAction,
  removeProductFromWarehouseAction,
  transferWarehouseStockAction,
  updateStockQuantityAction,
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
    formData: AddStockRequest
  ) => {
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
                quantityInStock: item.quantityInStock,
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
        router.refresh();
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

  const removeProductFromWarehouse = async (
    warehouseId: string,
    productId: string
  ) => {
    try {
      const response = await removeProductFromWarehouseAction(
        warehouseId,
        inventoryId,
        productId
      );

      if (response.success) {
        // Optimistically update the warehouse data
        await mutate(
          data?.map((warehouse) => {
            if (warehouse.id === warehouseId) {
              return {
                ...warehouse,
                stockItems: warehouse.stockItems?.filter(
                  (item) => item.product.id !== productId
                ),
              };
            }
            return warehouse;
          }),
          false
        );
        router.refresh();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Remove product from warehouse error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  // Add this method to your warehouse service
  const transferWarehouseStock = async (formData: TransferStockRequest) => {
    try {
      const response = await transferWarehouseStockAction(
        inventoryId,
        formData
      );

      if (response.success) {
        // Optimistically update both warehouses data
        await mutate(
          data?.map((warehouse) => {
            if (warehouse.id === formData.fromWarehouseId) {
              // Update source warehouse - decrease stock
              const updatedStockItems = warehouse.stockItems
                ?.map((item) => {
                  const transferItem = formData.transferItems.find(
                    (ti) => ti.productId === item.product.id
                  );
                  if (transferItem) {
                    return {
                      ...item,
                      quantityInStock:
                        item.quantityInStock - transferItem.transferQuantity,
                    };
                  }
                  return item;
                })
                .filter((item) => item.quantityInStock > 0); // Remove items with 0 stock

              return {
                ...warehouse,
                stockItems: updatedStockItems,
              };
            } else if (warehouse.id === formData.toWarehouseId) {
              // Update destination warehouse - increase stock or add new items
              const currentStockItems = warehouse.stockItems || [];
              const updatedStockItems = [...currentStockItems];

              formData.transferItems.forEach((transferItem) => {
                const existingItemIndex = updatedStockItems.findIndex(
                  (item) => item.product.id === transferItem.productId
                );

                if (existingItemIndex >= 0) {
                  // Product already exists in destination warehouse
                  updatedStockItems[existingItemIndex] = {
                    ...updatedStockItems[existingItemIndex],
                    quantityInStock:
                      updatedStockItems[existingItemIndex].quantityInStock +
                      transferItem.transferQuantity,
                  };
                } else {
                  // Product doesn't exist in destination warehouse
                  // We need to get the product details from the source warehouse
                  const sourceWarehouse = data?.find(
                    (w) => w.id === formData.fromWarehouseId
                  );
                  const sourceProduct = sourceWarehouse?.stockItems?.find(
                    (item) => item.product.id === transferItem.productId
                  );

                  if (sourceProduct) {
                    updatedStockItems.push({
                      product: sourceProduct.product,
                      quantityInStock: transferItem.transferQuantity,
                    });
                  }
                }
              });

              return {
                ...warehouse,
                stockItems: updatedStockItems,
              };
            }
            return warehouse;
          }),
          false
        );

        router.refresh();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Transfer products between warehouses error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const updateStockQuantity = async (
    warehouseId: string,
    productId: string,
    formData: UpdateStockQuantityRequest
  ) => {
    try {
      const response = await updateStockQuantityAction(
        warehouseId,
        productId,
        inventoryId,
        formData
      );

      if (response.success) {
        // Optimistically update the warehouse data
        await mutate(
          data?.map((warehouse) => {
            if (warehouse.id === warehouseId) {
              const updatedStockItems = warehouse.stockItems
                ?.map((item) => {
                  if (item.product.id === productId) {
                    return {
                      ...item,
                      quantityInStock: formData.newQuantity,
                    };
                  }
                  return item;
                })
                .filter((item) => item.quantityInStock > 0); // Remove items with 0 stock

              return {
                ...warehouse,
                stockItems: updatedStockItems,
              };
            }
            return warehouse;
          }),
          false
        );

        // Also update products data if you have it
        // This would depend on your products service structure

        router.refresh();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Update stock quantity error:", error);
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
    removeProductFromWarehouse,
    transferWarehouseStock,
    updateStockQuantity,
  };
}
