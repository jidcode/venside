"use server";

import api from "../api/axios";
import { handleApiError } from "@/core/lib/errors";
import { CustomerRequest } from "@/core/schema/validator";
import { getCSRFToken } from "../api/csrf-service";
import { ActionResult } from "./auth";

export const createCustomerAction = async (
  formData: CustomerRequest,
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
      `/inventories/${inventoryId}/customers`,
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

export const updateCustomerAction = async (
  id: string,
  inventoryId: string | undefined,
  formData: CustomerRequest
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
      `/inventories/${inventoryId}/customers/${id}`,
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

export const deleteCustomerAction = async (
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
      `/inventories/${inventoryId}/customers/${id}`,
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
