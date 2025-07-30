"use client";

import { useRouter } from "next/navigation";
import { ProductRequest } from "../schema/validator";
import useQuery from "@/core/hooks/use-query";
import useInventoryStore from "@/core/stores/inventory-store";
import { errorMessage } from "../lib/errors";
import { ProductState } from "../schema/types";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  setPrimaryImageAction,
  deleteMultipleProductsAction,
} from "@/server/actions/product";

export function getAllProducts() {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<ProductState[]>(`/inventories/${inventoryId}/products`);
}

export function getAllCategories() {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<ProductState[]>(`/inventories/${inventoryId}/categories`);
}

export function getProduct(productId: string) {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<ProductState>(
    `/inventories/${inventoryId}/products/${productId}`
  );
}

export function useProductService() {
  const router = useRouter();
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);

  const { data, error, mutate } = getAllProducts();

  const createProduct = async (formData: ProductRequest) => {
    try {
      const response = await createProductAction(formData, inventoryId);

      if (response.success) {
        await mutate(data ? [...data, response.data] : [response.data], false);
        router.push("/products");
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Create product error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const updateProduct = async (id: string, formData: ProductRequest) => {
    try {
      const response = await updateProductAction(id, inventoryId, formData);

      if (response.success) {
        await mutate(
          data?.map((product) => (product.id === id ? response.data : product)),
          false
        );
        router.back();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Update product error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await deleteProductAction(id, inventoryId);

      if (response.success) {
        await mutate(
          data?.filter((product) => product.id !== id),
          false
        );
        router.push("/products");
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Delete product error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const deleteMultipleProducts = async (productIds: string[]) => {
    try {
      const response = await deleteMultipleProductsAction(
        productIds,
        inventoryId
      );

      if (response.success) {
        await mutate(
          data?.filter((product) => !productIds.includes(product.id)),
          false
        );

        router.refresh();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Delete multiple products error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  const setPrimaryImage = async (productId: string, imageId: string) => {
    try {
      const response = await setPrimaryImageAction(imageId, inventoryId);

      if (response.success) {
        await mutate(
          data?.map((product) => {
            if (product.id === productId) {
              return {
                ...product,
                images: product.images?.map((img) => ({
                  ...img,
                  isPrimary: img.id === imageId,
                })),
              };
            }
            return product;
          }),
          false
        );

        window.location.reload();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("Set primary image error:", error);
      return {
        success: false,
        error: errorMessage(error),
      };
    }
  };

  return {
    products: data,
    isLoading: !error && !data,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteMultipleProducts,
    setPrimaryImage,
  };
}
