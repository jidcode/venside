"use client";

import { ProductRequest, productSchema } from "@/core/schema/validator";
import { getProduct, useProductService } from "@/core/services/products";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AppError } from "@/core/lib/errors";
import { EditProductForm } from "../../_components/forms/edit-product";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [errorResponse, setErrorResponse] = useState<string | null>(null);
  const { data: product } = getProduct(productId);
  const { updateProduct } = useProductService();

  const form = useForm<ProductRequest>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name,
      sku: product?.sku,
      code: product?.code,
      brand: product?.brand,
      description: product?.description,
      totalQuantity: product?.totalQuantity,
      restockLevel: product?.restockLevel,
      optimalLevel: product?.optimalLevel,
      costPrice: product?.costPrice ? product.costPrice / 100 : undefined,
      sellingPrice: product?.sellingPrice
        ? product.sellingPrice / 100
        : undefined,
      images:
        product?.images?.map((img) => ({
          id: img.id,
          url: img.url,
          fileKey: img.fileKey,
        })) || [],
      categories: product?.categories?.map((ctg) => ctg.name) || [],
    },
  });

  const action: SubmitHandler<ProductRequest> = async (formData) => {
    setErrorResponse(null);
    console.log("formData:", formData);

    try {
      const response = await updateProduct(productId, formData);
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
    <form onSubmit={form.handleSubmit(action)} className="w-full  mx-auto">
      <EditProductForm form={form} errorResponse={errorResponse} />
    </form>
  );
}
