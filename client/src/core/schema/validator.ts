import { Warehouse } from "lucide-react";
import * as z from "zod";
import { id } from "zod/v4/locales";

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

export const currencySchema = z.object({
  name: z.string().min(1, "Currency name is required"),
  code: z.string().min(1, "Currency code is required"),
  locale: z.string().min(1, "Currency locale is required"),
});

export const inventorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  currency: currencySchema,
});

export const warehouseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  location: z
    .string()
    .max(200, "Location must not exceed 200 characters")
    .optional(),
  capacity: z
    .number({ invalid_type_error: "Enter a number" })
    .int()
    .min(0, "Number must be 0 or greater"),
  storageType: z.enum(
    [
      "units",
      "slots",
      "boxes",
      "shelves",
      "racks",
      "pallets",
      "sections",
      "containers",
    ],
    {
      required_error: "Storage type is required",
      invalid_type_error:
        "Storage type must be one of: units, slots, shelves, cells, sections",
    }
  ),
  manager: z
    .string()
    .max(100, "Manager name must not exceed 100 characters")
    .optional(),
  phone: z
    .string()
    .max(20, "Phone number must not exceed 20 characters")
    .optional(),
  email: z
    .string()
    .max(100, "Email must not exceed 100 characters")
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
});

export const addStockSchema = z.object({
  stockItems: z.array(
    z.object({
      productId: z.string().min(1),
      quantityInStock: z.number().int().min(0),
    })
  ),
});

export const transferStockSchema = z.object({
  fromWarehouseId: z.string().min(1, "Source warehouse is required"),
  toWarehouseId: z.string().min(1, "Destination warehouse is required"),
  transferItems: z
    .array(
      z.object({
        productId: z.string().min(1),
        transferQuantity: z
          .number()
          .int()
          .min(1, "Transfer quantity must be at least 1"),
      })
    )
    .min(1, "At least one product must be selected for transfer"),
});

export const updateStockQuantitySchema = z.object({
  newQuantity: z
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
});

export const storageSchema = z.object({
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  quantityInStock: z.number().int().min(0, "Quantity must be 0 or greater"),
});

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  code: z.string().max(20, "Code must not exceed 20 characters").optional(),
  sku: z.string().max(20, "SKU must not exceed 20 characters").optional(),
  brand: z.string().max(50, "Brand must not exceed 50 characters").optional(),
  model: z.string().max(50, "Model must not exceed 50 characters").optional(),
  description: z
    .string()
    .max(200, "Description must not exceed 200 characters")
    .optional(),
  totalQuantity: z
    .number({ invalid_type_error: "Enter a number" })
    .int()
    .min(0, "Number must be 0 or greater"),
  totalStock: z
    .number({ invalid_type_error: "Enter a number" })
    .int()
    .min(0, "Number must be 0 or greater"),
  restockLevel: z
    .number({ invalid_type_error: "Enter a number" })
    .int()
    .min(0, "Number must be 0 or greater"),
  optimalLevel: z
    .number({ invalid_type_error: "Enter a number" })
    .int()
    .min(0, "Number must be 0 or greater"),
  costPrice: z
    .number({ invalid_type_error: "Enter an amount" })
    .min(0, "Amount must be 0 or greater")
    .transform((val) => Math.round(val * 100)), //convert to cents
  sellingPrice: z
    .number({ invalid_type_error: "Enter an amount" })
    .min(0, "Amount must be 0 or greater")
    .transform((val) => Math.round(val * 100)), //convert to cents
  categories: z.array(z.string().min(1).max(50)).optional(),
  images: z.array(z.any()).optional(),
});

// Type exports
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type CurrencyRequest = z.infer<typeof currencySchema>;
export type InventoryRequest = z.infer<typeof inventorySchema>;
export type WarehouseRequest = z.infer<typeof warehouseSchema>;
export type StorageRequest = z.infer<typeof storageSchema>;
export type ProductRequest = z.infer<typeof productSchema>;
export type AddStockRequest = z.infer<typeof addStockSchema>;
export type TransferStockRequest = z.infer<typeof transferStockSchema>;
export type UpdateStockQuantityRequest = z.infer<
  typeof updateStockQuantitySchema
>;
