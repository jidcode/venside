"use server";

import api from "../api/axios";
import { handleApiError } from "@/core/lib/errors";
import { InventoryRequest } from "@/core/schema/validator";
import { getCSRFToken } from "../api/csrf-service";
import { ActionResult } from "./auth";

export const createInventoryAction = async (
  data: InventoryRequest
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

    const response = await api.post("/inventories", data, {
      headers: {
        "X-CSRF-Token": csrfToken,
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};
