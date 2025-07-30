"use server";

import api from "../api/axios";
import { handleApiError } from "@/core/lib/errors";
import {
  WarehouseRequest,
  WarehouseStockRequest,
} from "@/core/schema/validator";
import { getCSRFToken } from "../api/csrf-service";
import { ActionResult } from "./auth";

export const createWarehouseAction = async (
  formData: WarehouseRequest,
  inventoryId: string | undefined
): Promise<ActionResult> => {
  try {
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      return {
        success: false,
        error: {
          type: "CSRF_ERROR",
          message: "Failed to get CSRF token",
          code: 400,
        },
      };
    }

    const response = await api.post(
      `/inventories/${inventoryId}/warehouses`,
      formData,
      {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateWarehouseAction = async (
  id: string,
  inventoryId: string | undefined,
  formData: WarehouseRequest
): Promise<ActionResult> => {
  try {
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      return {
        success: false,
        error: {
          type: "CSRF_ERROR",
          message: "Failed to get CSRF token",
          code: 400,
        },
      };
    }

    const response = await api.put(
      `/inventories/${inventoryId}/warehouses/${id}`,
      formData,
      {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteWarehouseAction = async (
  id: string,
  inventoryId: string | undefined
): Promise<ActionResult> => {
  try {
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      return {
        success: false,
        error: {
          type: "CSRF_ERROR",
          message: "Failed to get CSRF token",
          code: 400,
        },
      };
    }

    const response = await api.delete(
      `/inventories/${inventoryId}/warehouses/${id}`,
      {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const addProductsToWarehouseAction = async (
  warehouseId: string,
  inventoryId: string | undefined,
  formData: WarehouseStockRequest
): Promise<ActionResult> => {
  try {
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      return {
        success: false,
        error: {
          type: "CSRF_ERROR",
          message: "Failed to get CSRF token",
          code: 400,
        },
      };
    }

    const response = await api.post(
      `/inventories/${inventoryId}/warehouses/${warehouseId}/products`,
      formData,
      {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};
