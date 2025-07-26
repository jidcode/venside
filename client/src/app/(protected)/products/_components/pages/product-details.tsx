"use client";

import ErrorPage from "@/app/error";
import Link from "next/link";
import Image from "next/image";
import { CustomLoader } from "@/core/components/elements/loader";
import { Button } from "@/core/components/ui/button";
import { ProductImageState, ProductState } from "@/core/schema/types";
import { getProduct, useProductService } from "@/core/services/products";
import { Progress } from "@/core/components/ui/progress";
import { Badge } from "@/core/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import {
  Building2,
  CircleDollarSign,
  Layers2,
  Loader2,
  Package,
  PenSquare,
  Star,
} from "lucide-react";
import DeleteProductDialog from "../forms/delete-product";
import { TbLabelImportant } from "react-icons/tb";
import useCurrencyFormat from "@/core/hooks/use-currency";
import { Label } from "@/core/components/ui/label";
import { useState } from "react";
import { cn } from "@/core/lib/utils";

interface ParamProps {
  productId: string;
}

export default function ProductDetailsPage({ productId }: ParamProps) {
  const { data: product, isLoading, error } = getProduct(productId);

  console.log(product);

  if (error) return <ErrorPage />;
  if (isLoading) return <CustomLoader />;

  return (
    <div>
      {product && (
        <>
          <PageHeader product={product} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <ImageCard product={product} />
              <StockCard product={product} />
            </div>

            <div className="lg:col-span-2 space-y-6">
              <DetailsCard product={product} />
              <PricingCard product={product} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <StoragesCard product={product} />
                <CategoriesCard product={product} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PageHeader({ product }: { product: ProductState }) {
  return (
    <Card className="card flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl lg:text-3xl text-center md:text-left font-semibold tracking-tight">
          {product.name}
        </h1>
        <div className="flex items-center gap-2 mt-2.5">
          <Badge
            variant="outline"
            className="flex items-center gap-1 mx-auto md:mx-0"
          >
            <TbLabelImportant className="h-4 w-4" />
            {product.code}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" asChild>
          <Link href={`/products/${product.id}/edit`}>
            <PenSquare className="size-3.5 mt-0.5" />
            <span>Edit Product</span>
          </Link>
        </Button>
        <DeleteProductDialog product={product} />
      </div>
    </Card>
  );
}

function ImageCard({ product }: { product: ProductState }) {
  const primaryImage =
    product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const [selectedImage, setSelectedImage] = useState<
    ProductImageState | undefined
  >(primaryImage);
  const [isUpdating, setIsUpdating] = useState(false);
  const currentImage = selectedImage || primaryImage;
  const { setPrimaryImage } = useProductService();

  const handleSetPrimary = async () => {
    if (!currentImage || currentImage.isPrimary) return;

    setIsUpdating(true);
    try {
      await setPrimaryImage(product.id, currentImage.id);
    } catch (error) {
      console.error("Failed to set primary image:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="card h-fit">
      <CardContent>
        <div>
          <div className="aspect-square relative mb-2.5 group">
            <Image
              src={currentImage?.url || "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />

            {/* Star button for primary image */}
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full bg-white opacity-50 backdrop-blur-sm hover:bg-black/40 ${
                  currentImage?.isPrimary
                    ? "text-yellow-400"
                    : "text-black hover:text-yellow-400"
                }`}
                onClick={handleSetPrimary}
                disabled={isUpdating || currentImage?.isPrimary}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Star
                    className="h-4 w-4"
                    fill={currentImage?.isPrimary ? "currentColor" : "none"}
                  />
                )}
              </Button>
            </div>
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 justify-center overflow-x-auto">
              {product.images.slice(0, 5).map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className={`flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all hover:opacity-80 ${
                    currentImage?.id === image.id
                      ? "border-focus ring-2 ring-focus/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} thumbnail`}
                    fill
                    className="object-cover"
                  />
                  {image.isPrimary && (
                    <div className="absolute bottom-1 right-1">
                      <Star
                        className="h-3 w-3 text-yellow-400"
                        fill="currentColor"
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StockCard({ product }: { product: ProductState }) {
  return (
    <Card className="card h-fit">
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Total Quantity</h3>
            <p
              className={cn(
                "text-2xl font-bold",
                product.totalQuantity === 0
                  ? "text-red-500"
                  : product.totalQuantity <= product.restockLevel
                  ? "text-orange-500"
                  : "text-green-500"
              )}
            >
              {product.totalQuantity}
              <span className="text-sm font-normal"> units</span>
            </p>
          </div>
          <div className="text-right">
            <h3 className="font-medium">Status</h3>
            <Badge
              variant="secondary"
              className={cn(
                "text-white",
                product.totalQuantity === 0
                  ? "bg-red-500"
                  : product.totalQuantity <= product.restockLevel
                  ? "bg-orange-500 dark:bg-orange-600"
                  : "bg-green-500 dark:bg-green-600"
              )}
            >
              {product.totalQuantity === 0
                ? "Out of Stock"
                : product.totalQuantity <= product.restockLevel
                ? "Low Stock"
                : "In Stock"}
            </Badge>
          </div>
        </div>

        <Progress
          value={
            product.optimalLevel > 0
              ? (product.totalQuantity / product.optimalLevel) * 100
              : 0
          }
          className="mt-4 h-2"
        />

        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>Restock: {product.restockLevel}</span>
          <span>Optimal: {product.optimalLevel}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailsCard({ product }: { product: ProductState }) {
  return (
    <Card className="card">
      <CardHeader>
        <CardTitle className="flex items-center gap-1 mb-2 text-lg">
          <Package className="size-4" /> Details
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="lg:border-b border-neutral lg:pb-4">
          <Label className="text-neutral">Description</Label>
          <p className="mt-1 text-gray-800">{product.description || "N/A"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-neutral">Brand</Label>
            <p className="mt-1">{product.brand || "N/A"}</p>
          </div>
          <div>
            <Label className="text-neutral">Model</Label>
            <p className="mt-1">{product.model || "N/A"}</p>
          </div>
          <div>
            <Label className="text-neutral">Code</Label>
            <p className="mt-1">{product.code || "N/A"}</p>
          </div>
          <div>
            <Label className="text-neutral">Stock Keeping Unit</Label>
            <p className="mt-1">{product.sku || "N/A"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PricingCard({ product }: { product: ProductState }) {
  const calculateMargin = () => {
    if (product.sellingPrice === 0) return "0.00";
    const margin =
      ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100;
    return margin.toFixed(2);
  };

  const format = useCurrencyFormat();
  return (
    <Card className="card">
      <CardHeader>
        <CardTitle className="flex items-center gap-1 mb-2 text-lg">
          <CircleDollarSign className="size-4" /> Pricing
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-destructive/5 border border-destructive text-destructive rounded-lg p-4 text-center">
            <h3 className="text-sm font-medium mb-1">Cost Price</h3>
            <p className="text-xl font-bold">
              {format(product.costPrice / 100)}
            </p>
          </div>

          <div className="bg-green-800/10 border border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 rounded-lg p-4 text-center">
            <h3 className="text-sm font-medium mb-1">Selling Price</h3>
            <p className="text-xl font-bold">
              {format(product.sellingPrice / 100)}
            </p>
          </div>

          <div className="bg-focus/5 border border-focus text-focus text-lg rounded-lg p-4 text-center">
            <h3 className="text-sm font-medium mb-1">Profit Margin</h3>
            <p className="text-xl font-bold">{calculateMargin()}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoriesCard({ product }: { product: ProductState }) {
  return (
    <Card className="card space-y-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-1 mb-2 text-lg">
          <Layers2 className="size-4" /> Categories
        </CardTitle>
      </CardHeader>

      <CardContent>
        {product.categories?.length ? (
          <div className="flex flex-wrap gap-2">
            {product.categories.map((category) => (
              <Badge
                className="text-sm px-3 py-1 rounded-full"
                key={category.id}
                variant="outline"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No categories assigned</p>
        )}
      </CardContent>
    </Card>
  );
}

function StoragesCard({ product }: { product: ProductState }) {
  return (
    <Card className="card lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-1 mb-2 text-lg">
          <Building2 className="size-4" /> Storages
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* {product.storages?.length ? (
          <div className="flex flex-wrap gap-2">
            {product.warehouses.map((warehouse) => (
              <Badge key={warehouse.id} variant="outline">
                {warehouse.name}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No storage locations assigned</p>
        )} */}

        <p className="text-gray-500">No storage locations assigned</p>
      </CardContent>
    </Card>
  );
}
