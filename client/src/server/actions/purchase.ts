"use server";

import api from "../api/axios";
import { handleApiError } from "@/core/lib/errors";
import { PurchaseRequest } from "@/core/schema/validator";
import { getCSRFToken } from "../api/csrf-service";
import { ActionResult } from "./auth";

export const createPurchaseAction = async (
  formData: PurchaseRequest,
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
      `/inventories/${inventoryId}/purchases`,
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

export const deletePurchaseAction = async (
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
      `/inventories/${inventoryId}/purchases/${id}`,
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

// Additional purchase-specific actions
export const updatePurchaseStatusAction = async (
  id: string,
  inventoryId: string | undefined,
  status: string
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

    const response = await api.patch(
      `/inventories/${inventoryId}/purchases/${id}/status`,
      { purchaseStatus: status },
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

export const updatePurchasePaymentStatusAction = async (
  id: string,
  inventoryId: string | undefined,
  paymentStatus: string
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

    const response = await api.patch(
      `/inventories/${inventoryId}/purchases/${id}/payment-status`,
      { paymentStatus },
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
