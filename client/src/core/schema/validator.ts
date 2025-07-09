import * as z from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers & underscores"
    ),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(100, "Email must not exceed 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email must not exceed 100 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password must not exceed 100 characters"),
});

export const inventorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  currency: z.string().min(1, "Currency is required"),
});

export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type InventoryRequest = z.infer<typeof inventorySchema>;
