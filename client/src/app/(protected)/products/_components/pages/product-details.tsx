"use client";

import ErrorPage from "@/app/error";
import Link from "next/link";
import Image from "next/image";
import { CustomLoader } from "@/core/components/elements/loader";
import { Button } from "@/core/components/ui/button";
import {
  ProductImageState,
  ProductState,
  StorageType,
} from "@/core/schema/types";
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
  TrendingUp,
  AlertTriangle,
  Info,
  Warehouse,
  Box,
  Container,
  Grid3X3,
  Layers,
  LayoutGrid,
  Rows,
  Square,
  PackageSearch,
  ArrowRight,
} from "lucide-react";
import DeleteProductDialog from "../forms/delete-product";
import { TbLabelImportant } from "react-icons/tb";
import { PiPackage, PiWarehouse } from "react-icons/pi";
import useCurrencyFormat from "@/core/hooks/use-currency";
import { Label } from "@/core/components/ui/label";
import { useState } from "react";
import { cn } from "@/core/lib/utils";
import {
  RiArrowRightCircleFill,
  RiArrowRightLine,
  RiExchangeDollarFill,
} from "react-icons/ri";

interface ParamProps {
  productId: string;
}

export default function ProductDetailsPage({ productId }: ParamProps) {
  const { data: product, isLoading, error } = getProduct(productId);

  console.log(product);

  if (error) return <ErrorPage />;
  if (isLoading) return <CustomLoader />;
  if (!product) return null;

  return (
    <div className="space-y-6">
      <PageHeader product={product} />

      <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
        <div className="lg:col-span-3 space-y-6 lg:sticky ">
          <ImageCard product={product} />
          <div className="hidden lg:block">
            <CategoriesCard product={product} />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <DetailsCard product={product} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PricingCard product={product} />
            <StockCard product={product} />
          </div>

          <div className="lg:hidden">
            <CategoriesCard product={product} />
          </div>

          <div>
            <StoragesCard product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ product }: { product: ProductState }) {
  return (
    <Card className="card">
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Title Section */}
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div>
              <h1 className="text-2xl lg:text-4xl font-semibold tracking-tight">
                {product.name}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="secondary" asChild>
              <Link href={`/products/${product.id}/edit`}>
                <PenSquare className="size-3.5 mt-0.5" />
                <span>Edit Product</span>
              </Link>
            </Button>
            <DeleteProductDialog product={product} />
          </div>
        </div>
      </CardContent>
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
    <Card className="card">
      <CardContent className="pt-0">
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
                  className={`flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden border transition-all hover:opacity-80 ${
                    currentImage?.id === image.id
                      ? "border-2 border-focus shadow-lg"
                      : "border-neutral hover:border-gray-300"
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

function CategoriesCard({ product }: { product: ProductState }) {
  return (
    <Card className="card">
      <CardHeader className="mb-4">
        <div className="flex items-center gap-2 text-xl">
          <span className="p-1 rounded-lg bg-gray-200 text-gray-800">
            <Layers2 className="size-5" />
          </span>
          <CardTitle>Categories</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="border border-neutral/20 p-4 rounded-lg">
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

function DetailsCard({ product }: { product: ProductState }) {
  return (
    <Card className="card">
      <CardHeader className="mb-4">
        <div className="flex items-center gap-2 text-xl">
          <span className="p-1 rounded-lg bg-gray-200 text-gray-800">
            <Info className="size-5" />
          </span>
          <CardTitle>Product Details</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="p-4 rounded-lg bg-primary border border-neutral/20 space-y-6">
          <div className="border-b border-neutral/20 pb-4">
            <Label className="text-neutral font-semibold">Description</Label>
            <p className="mt-2 leading-relaxed">
              {product.description || "No description provided"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-neutral font-semibold">Brand</Label>
              <p className="font-medium">{product.brand || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-neutral font-semibold">Model</Label>
              <p className="font-medium">{product.model || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-neutral font-semibold">Code</Label>
              <p className="font-medium">{product.code || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-neutral font-semibold">SKU</Label>
              <p className="font-medium">{product.sku || "N/A"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PricingCard({ product }: { product: ProductState }) {
  const format = useCurrencyFormat();

  const calculateMargin = () => {
    if (product.sellingPrice === 0) return "0.00";
    const margin =
      ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100;
    return margin.toFixed(2);
  };

  const stockPercentage =
    product.optimalLevel > 0
      ? (product.totalQuantity / product.optimalLevel) * 100
      : 0;

  return (
    <Card className="card">
      <CardHeader className="mb-4">
        <div className="flex items-center gap-2 text-xl">
          <span className="p-1 rounded-lg bg-gray-200 text-gray-800">
            <RiExchangeDollarFill className="size-5" />
          </span>
          <CardTitle>Price Details</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-red-600"></div>
              <span className="text-sm font-medium text-red-600">
                Cost Price
              </span>
            </div>
            <span className="font-bold text-red-600">
              {format(product.costPrice / 100)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-800"></div>
              <span className="text-sm font-medium text-green-800">
                Selling Price
              </span>
            </div>
            <span className="font-bold text-green-800">
              {format(product.sellingPrice / 100)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50 border border-sky-100">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-sky-800"></div>
              <span className="text-sm font-medium text-sky-800">
                Profit Margin
              </span>
            </div>
            <span className="font-bold text-sky-800">{calculateMargin()}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StockCard({ product }: { product: ProductState }) {
  const stockPercentage =
    product.optimalLevel > 0
      ? (product.totalQuantity / product.optimalLevel) * 100
      : 0;

  // Determine the color based on quantity level
  const quantityColor =
    product.totalQuantity === 0
      ? "red"
      : product.totalQuantity <= product.restockLevel
      ? "amber"
      : "green";

  return (
    <Card className="card">
      <CardHeader className="mb-4">
        <div className="flex items-center gap-2 text-xl">
          <span className="p-1 rounded-lg bg-gray-200 text-gray-800">
            <Package className="size-5" />
          </span>
          <CardTitle>Stock Information</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-neutral">Total Quantity</h3>
              <p className="text-3xl font-bold">{product.totalQuantity}</p>
            </div>
            <div className="text-right">
              <h3 className="font-medium text-neutral">Status</h3>
              <Badge
                variant="secondary"
                className={cn(
                  "text-white rounded-full px-3 py-1.5 mt-1",
                  quantityColor === "red"
                    ? "bg-red-600"
                    : quantityColor === "amber"
                    ? "bg-amber-500"
                    : "bg-green-600"
                )}
              >
                {quantityColor === "red"
                  ? "Out of Stock"
                  : quantityColor === "amber"
                  ? "Low Stock"
                  : "In Stock"}
              </Badge>
            </div>
          </div>

          {/*  Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-neutral/20 h-2 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  quantityColor === "red"
                    ? "bg-red-500"
                    : quantityColor === "amber"
                    ? "bg-amber-500"
                    : "bg-green-600"
                )}
                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-sm text-neutral">
            <p>
              Restock:
              <span className="font-semibold ml-1 text-secondary">
                {product.restockLevel}
              </span>
            </p>
            <p>
              Optimal:
              <span className="font-semibold ml-1 text-secondary">
                {product.optimalLevel}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StoragesCard({ product }: { product: ProductState }) {
  const storages = product.storages || []; // Fallback to empty array if null/undefined
  const totalQuantity = product.totalQuantity;

  return (
    <Card className="card">
      <CardHeader className="mb-4">
        <div className="flex items-center gap-2 text-xl">
          <span className="p-1 rounded-lg bg-gray-200 text-gray-800">
            <PiWarehouse className="size-5" />
          </span>
          <CardTitle>Storage Locations ({storages.length})</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {storages.length === 0 ? (
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <p className="text-neutral/80">Not stored in any warehouses</p>
            {storages.length > 0 && (
              <Button variant="link" asChild>
                <Link href="/warehouses">Assign to warehouse →</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {storages.map((storage, index) => {
              const percentage =
                totalQuantity > 0
                  ? Math.round((storage.stockQuantity / totalQuantity) * 100)
                  : 0;

              return (
                <div
                  key={index}
                  className="bg-muted/40 dark:bg-white/5 p-4 rounded-lg shadow-sm hover:shadow-md hover:bg-muted dark:hover:bg-white/10 border border-neutral/20 transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold text-lg">
                        {storage.warehouse.name}
                      </h3>
                      <Button variant="ghost" size="icon">
                        <Link href={`/warehouses/${storage.warehouse.id}`}>
                          <ArrowRight />
                        </Link>
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-neutral">
                      <div className="flex items-center gap-1">
                        <Warehouse className="size-3" />
                        <span>
                          Capacity:{" "}
                          {storage.warehouse.capacity.toLocaleString()}{" "}
                          {storage.warehouse.storageType.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="size-3" />
                        <span>
                          {(
                            (storage.stockQuantity /
                              storage.warehouse.capacity) *
                            100
                          ).toFixed(1)}
                          % utilized
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs uppercase font-medium tracking-wider">
                      In Stock:
                    </p>
                    <div className="flex items-baseline gap-1 text-2xl font-semibold text-foreground">
                      {storage.stockQuantity.toLocaleString()}
                      <span className="text-sm text-neutral/90 font-medium">
                        / {totalQuantity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
