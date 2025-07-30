"use server";

import api from "../api/axios";
import { handleApiError } from "@/core/lib/errors";
import { ProductRequest } from "@/core/schema/validator";
import { getCSRFToken } from "../api/csrf-service";
import { ActionResult } from "./auth";
import { ProductImageRequest } from "@/core/schema/types";

export const createProductAction = async (
  formData: ProductRequest,
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

    const { images, ...productData } = formData;

    const multipartForm = new FormData();
    multipartForm.append("productData", JSON.stringify(productData));

    if (images && images.length > 0) {
      for (const file of images) {
        if (file instanceof File) {
          multipartForm.append("newImages", file);
        }
      }
    }

    const response = await api.post(
      `/inventories/${inventoryId}/products`,
      multipartForm,
      {
        headers: {
          "X-CSRF-Token": csrfToken,
          "Content-Type": "multipart/form-data",
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

export const updateProductAction = async (
  id: string,
  inventoryId: string | undefined,
  formData: ProductRequest
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

    // Separate images from product metadata
    const { images, ...productData } = formData;

    const newImages: File[] = [];
    const existingImages: ProductImageRequest[] = [];

    if (images && images.length > 0) {
      for (const img of images) {
        if (img instanceof File) {
          newImages.push(img);
        } else {
          existingImages.push(img as ProductImageRequest);
        }
      }
    }

    //Append seperated data to multipart form
    const multipartForm = new FormData();

    multipartForm.append("productData", JSON.stringify(productData));
    multipartForm.append("existingImages", JSON.stringify(existingImages));
    for (const file of newImages) {
      multipartForm.append("newImages", file);
    }

    const response = await api.put(
      `/inventories/${inventoryId}/products/${id}`,
      multipartForm,
      {
        headers: {
          "X-CSRF-Token": csrfToken,
          "Content-Type": "multipart/form-data",
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

export const deleteProductAction = async (
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
      `/inventories/${inventoryId}/products/${id}`,
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

export const setPrimaryImageAction = async (
  imageId: string,
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

    const response = await api.put(
      `/inventories/${inventoryId}/images/${imageId}/primary`,
      {},
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

export const deleteMultipleProductsAction = async (
  productIds: string[],
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

    const response = await api.delete(`/inventories/${inventoryId}/products`, {
      data: { productIds },
      headers: {
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json",
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
