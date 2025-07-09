"use server";

import { cookies } from "next/headers";
import { AppError, handleApiError } from "@/core/lib/errors";
import { getCSRFToken, clearCSRFToken } from "../api/csrf-service";
import { RegisterRequest, LoginRequest } from "@/core/schema/validator";
import api from "../api/axios";

export interface ActionResult {
  success: boolean;
  data?: any;
  error?: AppError;
}

export const registerUserAction = async (
  formData: RegisterRequest
): Promise<ActionResult> => {
  try {
    const response = await api.post("/auth/register", formData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    return apiError;
  }
};

export const loginUserAction = async (
  formData: LoginRequest
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

    const response = await api.post("/auth/login", formData, {
      headers: {
        "X-CSRF-Token": csrfToken,
      },
    });

    const { token, csrfToken: newCSRFToken } = response.data;
    const cookieStore = await cookies();

    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });

    if (newCSRFToken) {
      cookieStore.set("csrfToken", newCSRFToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
      });
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const logoutUserAction = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    await clearCSRFToken();
    return { message: "User logged out." };
  } catch (error) {
    console.error("Sign-out error:", error);
  }
};

export const getUserProfileAction = async (): Promise<ActionResult> => {
  try {
    const response = await api.get("/auth/profile");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    return apiError;
  }
};
