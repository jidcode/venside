"use server";

import axios from "axios";
import { cookies } from "next/headers";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (token) config.headers.Authorization = `Bearer ${token}`;

    console.log(
      "Making request to:",
      `${config.baseURL || ""}${config.url || ""}`
    );
    console.log("Request headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status);
    return response;
  },
  (error) => {
    console.error(
      "Response error:",
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

export default api;
