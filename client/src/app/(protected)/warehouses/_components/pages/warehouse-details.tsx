"use client";

import ErrorPage from "@/app/error";
import { Button } from "@/core/components/ui/button";
import { MapPin, Package, PackagePlus, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { getWarehouse } from "@/core/services/warehouses";
import { CustomLoader } from "@/core/components/elements/loader";
import { StockItemState, WarehouseState } from "@/core/schema/types";
import EditWarehouseSheet from "../forms/edit-warehouse";
import { Progress } from "@/core/components/ui/progress";
import { cn } from "@/core/lib/utils";
import DeleteWarehouseDialog from "../forms/delete-warehouse";
import { Label } from "@/core/components/ui/label";
import { PiEmpty, PiWarehouseBold } from "react-icons/pi";

interface ParamProps {
  warehouseId: string;
}

export default function WarehouseDetailsPage({ warehouseId }: ParamProps) {
  const { data: warehouse, isLoading, error } = getWarehouse(warehouseId);
  const stockItems = warehouse?.stockItems;

  if (error) return <ErrorPage />;
  if (isLoading) return <CustomLoader />;
  if (!warehouse) return null;

  return (
    <div className="space-y-6">
      <PageHeader warehouse={warehouse} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OverviewCard warehouse={warehouse} />
        <StockItemsCard stockItems={stockItems} />
      </div>
    </div>
  );
}

function PageHeader({ warehouse }: { warehouse: WarehouseState }) {
  return (
    <Card className="card flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      <h1 className="text-2xl lg:text-3xl text-center md:text-left font-semibold tracking-tight">
        {warehouse.name}
      </h1>

      <div className="flex items-center gap-2">
        <EditWarehouseSheet warehouse={warehouse} />
        <DeleteWarehouseDialog warehouse={warehouse} />
      </div>
    </Card>
  );
}

function OverviewCard({ warehouse }: { warehouse: WarehouseState }) {
  const totalStock =
    warehouse.stockItems?.reduce(
      (sum, item) => sum + (item.stockQuantity || 0),
      0
    ) || 0;

  const capacityPercentage =
    warehouse.capacity > 0 ? (totalStock / warehouse.capacity) * 100 : 0;

  return (
    <Card className="h-full card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 pb-4 text-xl text-focus">
          <PiWarehouseBold className="size-5" />
          <span>Warehouse Overview</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Location Section */}
        <div className="border-t border-neutral/80 pt-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="size-4" />
            <h3 className="font-medium">Location</h3>
          </div>
          <div className="pl-6">
            <Label>ADDRESS</Label>
            <p className="mt-1">{warehouse.location || "N/A"}</p>
          </div>
        </div>

        {/* Capacity Section */}
        <div className="border-t border-neutral/80 pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Package className="size-4" />
            <h3 className="font-medium">Utilization</h3>
          </div>
          <div className="pl-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Total Capacity</Label>
                <span className="font-medium text-neutral">
                  {warehouse.capacity} {warehouse.storageType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Label>Space Occupied</Label>
                <span className="font-medium text-neutral">
                  {totalStock} {warehouse.storageType}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Utilization
                </h3>
                <Progress value={capacityPercentage} />
                <div className="flex justify-between text-sm mt-1">
                  <span>{Math.round(capacityPercentage)}% used</span>
                  <span>{warehouse.capacity - totalStock} available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t border-neutral/80 pt-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="size-4" />
            <h3 className="font-medium">Contact</h3>
          </div>
          <div className="pl-6 space-y-2">
            <div className="flex items-center justify-between">
              <Label>Manager</Label>
              <span className="font-medium text-neutral">
                {warehouse.manager || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Label>Phone</Label>
              <span className="font-medium text-neutral">
                {warehouse.contact || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StockItemsCard({ stockItems }: { stockItems?: StockItemState[] }) {
  return (
    <Card className="card lg:col-span-2 h-full min-h-[500px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 pb-6 text-xl text-focus border-b border-neutral/80">
          <Package className="size-5" />
          <span>Stock Items</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!stockItems || stockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100%-60px)] text-center py-12">
            <PiEmpty className="mb-6 text-neutral size-32" />

            <h2 className="text-2xl lg:text-3xl text-neutral font-bold mb-4">
              Warehouse Empty
            </h2>

            <p className="mb-6 max-w-md">
              You currently have no products in your warehouse. Add products to
              start managing your inventory
            </p>

            <Button variant="secondary" asChild>
              <Link href="/products/new" className="flex">
                <PackagePlus className="size-5" />
                <span>Add Product</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stockItems.map((item) => (
              <StockItemCard key={item.product.id} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StockItemCard({ item }: { item: StockItemState }) {
  return (
    <Card className="hover:shadow-md transition-shadow h-full">
      <Link href={`/products/${item.product.id}`}>
        <CardContent className="flex gap-4 p-4 h-full">
          <div className="relative h-16 w-16 flex-shrink-0">
            <Image
              src={item.product.images?.[0]?.url || "/placeholder.jpg"}
              alt={item.product.name}
              fill
              className="object-cover rounded-md"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{item.product.name}</h3>
            <div className="flex justify-between mt-2">
              <div>
                <p className="text-sm text-gray-500">In Stock</p>
                <p className="font-medium">{item.stockQuantity}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">SKU</p>
                <p className="font-medium">{item.product.sku}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
