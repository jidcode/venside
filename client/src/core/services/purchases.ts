"use client";

import { useRouter } from "next/navigation";
import { PurchaseRequest } from "../schema/validator";
import useQuery from "@/core/hooks/use-query";
import useInventoryStore from "@/core/stores/inventory-store";
import { errorMessage } from "../lib/errors";
import { PurchaseState } from "../schema/types";
import {
  createPurchaseAction,
  deletePurchaseAction,
  updatePurchaseStatusAction,
  updatePurchasePaymentStatusAction,
} from "@/server/actions/purchase";

export function getAllPurchases() {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<PurchaseState[]>(`/inventories/${inventoryId}/purchases`);
}

export function getPurchase(purchaseId: string) {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<PurchaseState>(
    `/inventories/${inventoryId}/purchases/${purchaseId}`
  );
}

export function usePurchaseService() {
  const router = useRouter();
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);

  const { data, error, mutate } = getAllPurchases();

  const createPurchase = async (formData: PurchaseRequest) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await createPurchaseAction(formData, inventoryId);

      if (response.success) {
        await mutate(data ? [...data, response.data] : [response.data], false);
        router.refresh();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Create purchase error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const deletePurchase = async (id: string) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await deletePurchaseAction(id, inventoryId);

      if (response.success) {
        await mutate(
          data?.filter((purchase) => purchase.id !== id),
          false
        );
        router.push("/purchases");
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Delete purchase error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  //   const updatePurchaseStatus = async (id: string, status: string) => {
  //     if (!inventoryId) {
  //       return { success: false, error: "No inventory selected" };
  //     }
  //     try {
  //       const response = await updatePurchaseStatusAction(
  //         id,
  //         inventoryId,
  //         status
  //       );

  //       if (response.success) {
  //         await mutate(
  //           data?.map((purchase) =>
  //             purchase.id === id
  //               ? { ...purchase, purchaseStatus: status }
  //               : purchase
  //           ),
  //           false
  //         );
  //         router.refresh();
  //         return { success: true, data: response.data };
  //       } else {
  //         return { success: false, error: response.error };
  //       }
  //     } catch (error) {
  //       console.error("Update purchase status error:", error);
  //       return {
  //         success: false,
  //         error: errorMessage(error),
  //       };
  //     }
  //   };

  //   const updatePurchasePaymentStatus = async (
  //     id: string,
  //     paymentStatus: string
  //   ) => {
  //     if (!inventoryId) {
  //       return { success: false, error: "No inventory selected" };
  //     }
  //     try {
  //       const response = await updatePurchasePaymentStatusAction(
  //         id,
  //         inventoryId,
  //         paymentStatus
  //       );

  //       if (response.success) {
  //         await mutate(
  //           data?.map((purchase) =>
  //             purchase.id === id ? { ...purchase, paymentStatus } : purchase
  //           ),
  //           false
  //         );
  //         router.refresh();
  //         return { success: true, data: response.data };
  //       } else {
  //         return { success: false, error: response.error };
  //       }
  //     } catch (error) {
  //       console.error("Update purchase payment status error:", error);
  //       return {
  //         success: false,
  //         error: errorMessage(error),
  //       };
  //     }
  //   };

  return {
    purchases: data,
    isLoading: !error && !data,
    error,

    createPurchase,
    deletePurchase,
    // updatePurchaseStatus,
    // updatePurchasePaymentStatus,
  };
}
