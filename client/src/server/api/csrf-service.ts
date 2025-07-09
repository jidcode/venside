"use server";

import api from "./axios";
import { cookies } from "next/headers";

export const getCSRFToken = async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies();

    const response = await api.get("/auth/csrf-token");
    const csrfToken = response.data.csrfToken;

    cookieStore.set("csrfToken", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });

    return csrfToken;
  } catch (error) {
    console.error("Failed to get CSRF token:", error);
    return null;
  }
};

export const clearCSRFToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("csrfToken");
};
