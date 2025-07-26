"use client";

import { ProductRequest, productSchema } from "@/core/schema/validator";
import { useProductService } from "@/core/services/products";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AppError } from "@/core/lib/errors";
import { CreateProductForm } from "../_components/forms/create-product";

export default function NewProductPage() {
  const [errorResponse, setErrorResponse] = useState<string | null>(null);

  const { createProduct } = useProductService();

  const form = useForm<ProductRequest>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      totalQuantity: 0,
      restockLevel: 0,
      optimalLevel: 0,
      costPrice: 0.0,
      sellingPrice: 0.0,
      images: [],
      categories: [],
    },
  });

  const action: SubmitHandler<ProductRequest> = async (formData) => {
    setErrorResponse(null);
    console.log("formData:", formData);

    try {
      const response = await createProduct(formData);
      console.log("Response:", response);

      if (response?.success) {
        form.reset();
      } else if (response?.error) {
        setErrorResponse(
          (response.error as AppError).message || "Request failed!"
        );
      }
    } catch (error) {
      setErrorResponse(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <form onSubmit={form.handleSubmit(action)}>
      <CreateProductForm form={form} errorResponse={errorResponse} />
    </form>
  );
}
