"use client";

import { useRouter } from "next/navigation";
import { CustomerRequest } from "../schema/validator";
import useQuery from "@/core/hooks/use-query";
import useInventoryStore from "@/core/stores/inventory-store";
import { errorMessage } from "../lib/errors";
import { CustomerState } from "../schema/types";
import {
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
} from "@/server/actions/customer";

export function getAllCustomers() {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<CustomerState[]>(`/inventories/${inventoryId}/customers`);
}

export function getCustomer(customerId: string) {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<CustomerState>(
    `/inventories/${inventoryId}/customers/${customerId}`
  );
}

export function useCustomerService() {
  const router = useRouter();
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);

  const { data, error, mutate } = getAllCustomers();

  const createCustomer = async (formData: CustomerRequest) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await createCustomerAction(formData, inventoryId);

      if (response.success) {
        await mutate(data ? [...data, response.data] : [response.data], false);
        router.refresh();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Create customer error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const updateCustomer = async (id: string, formData: CustomerRequest) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await updateCustomerAction(id, inventoryId, formData);

      if (response.success) {
        await mutate(
          data?.map((customer) =>
            customer.id === id ? response.data : customer
          ),
          false
        );
        window.location.reload();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Update customer error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!inventoryId) {
      return { success: false, error: "No inventory selected" };
    }
    try {
      const response = await deleteCustomerAction(id, inventoryId);

      if (response.success) {
        await mutate(
          data?.filter((customer) => customer.id !== id),
          false
        );
        router.push("/customers");
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Delete customer error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  return {
    customers: data,
    isLoading: !error && !data,
    error,

    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}
