import {
  DisplayErrors,
  parseServerErrors,
} from "@/core/components/elements/error-display";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { ProductRequest } from "@/core/schema/validator";
import { AlertCircle, Package } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

export interface ProductFormProps {
  form: UseFormReturn<ProductRequest>;
  errorResponse: string | null;
}

export default function AddProductDetails({
  form,
  errorResponse,
}: ProductFormProps) {
  const {
    register,
    formState: { errors },
  } = form;

  const serverErrors = parseServerErrors(errorResponse);

  return (
    <section className="card">
      <div className="text-lg font-medium text-focus flex items-center gap-1 mb-4">
        <Package className="h-5 w-5" /> Details
      </div>

      <DisplayErrors serverErrors={serverErrors} />

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            {...register("name")}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              {...register("brand")}
              maxLength={50}
              className={errors.brand ? "border-destructive" : ""}
            />
            {errors.brand && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.brand.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              {...register("model")}
              maxLength={50}
              className={errors.model ? "border-destructive" : ""}
            />
            {errors.model && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.model.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">Stock Keeping Unit</Label>
            <Input
              id="sku"
              {...register("sku")}
              maxLength={20}
              className={errors.sku ? "border-destructive" : ""}
            />
            {errors.sku && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.sku.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Product Code</Label>
            <Input
              id="code"
              {...register("code")}
              maxLength={20}
              className={errors.code ? "border-destructive" : ""}
            />
            {errors.code && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.code.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            maxLength={200}
            className={errors.description ? "border-destructive" : ""}
          />
          {errors.description && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Inventory Levels */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="totalQuantity">Quantity In Stock *</Label>
              <Input
                id="totalQuantity"
                type="number"
                min="0"
                {...register("totalQuantity", { valueAsNumber: true })}
                className={errors.totalQuantity ? "border-destructive" : ""}
              />
              {errors.totalQuantity && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.totalQuantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="restockLevel">Restock Level *</Label>
              <Input
                id="restockLevel"
                type="number"
                min="0"
                {...register("restockLevel", { valueAsNumber: true })}
                className={errors.restockLevel ? "border-destructive" : ""}
              />
              {errors.restockLevel && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.restockLevel.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="optimalLevel">Optimal Level *</Label>
              <Input
                id="optimalLevel"
                type="number"
                min="0"
                {...register("optimalLevel", { valueAsNumber: true })}
                className={errors.optimalLevel ? "border-destructive" : ""}
              />
              {errors.optimalLevel && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.optimalLevel.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price *</Label>
              <Input
                id="costPrice"
                type="number"
                min="0"
                step="0.01"
                {...register("costPrice", { valueAsNumber: true })}
                className={errors.costPrice ? "border-destructive" : ""}
              />
              {errors.costPrice && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.costPrice.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price *</Label>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                {...register("sellingPrice", { valueAsNumber: true })}
                className={errors.sellingPrice ? "border-destructive" : ""}
              />
              {errors.sellingPrice && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.sellingPrice.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
