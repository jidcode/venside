"use client";

import ErrorPage from "@/app/error";
import {
  AlertTriangle,
  MapPin,
  Package,
  User,
  Ellipsis,
  Eye,
  PackageX,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
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
import { PiEmpty, PiWarehouse } from "react-icons/pi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import AddStockItemSheet from "../modals/add-stock-items";
import DeleteWarehouseDialog from "../modals/delete-warehouse";
import EditWarehouseSheet from "../modals/edit-warehouse";
import RemoveStockItemSheet from "../modals/remove-stock-items";
import TransferProductsSheet from "../modals/transfer-stock-items";
import useCurrencyFormat from "@/core/hooks/use-currency";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Label } from "@/core/components/ui/label";
import { cn } from "@/core/lib/utils";
import { getAllProducts } from "@/core/services/products";
import { Input } from "@/core/components/ui/input";
import { useState, useMemo } from "react";

export default function WarehouseDetailsPage({
  warehouseId,
}: {
  warehouseId: string;
}) {
  const { data: warehouse, isLoading, error } = getWarehouse(warehouseId);
  console.log(warehouse);

  if (error) return <ErrorPage />;
  if (isLoading) return <CustomLoader />;
  if (!warehouse) return null;

  return (
    <div className="space-y-6">
      <PageHeader warehouse={warehouse} />

      <div className="grid grid-cols-1 lg:grid-cols-8 gap-6 items-stretch">
        {" "}
        {/* Added items-stretch */}
        <div className="lg:col-span-2 space-y-6">
          <OverviewCard warehouse={warehouse} />
          <StockAlertsCard warehouse={warehouse} />
          <ContactCard warehouse={warehouse} />
        </div>
        <div className="lg:col-span-6 min-h-fit">
          {" "}
          {/* Changed here */}
          <StockItemsCard warehouse={warehouse} />
        </div>
      </div>
    </div>
  );
}

function PageHeader({ warehouse }: { warehouse: WarehouseState }) {
  return (
    <Card className="card">
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Title Section */}
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div>
              <h1 className="text-2xl lg:text-4xl font-semibold tracking-tight">
                {warehouse.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-neutral/90">
                  <MapPin className="size-4" />
                  <span className="text-sm">
                    {warehouse.location || "Location not specified"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <EditWarehouseSheet warehouse={warehouse} />
            <DeleteWarehouseDialog warehouse={warehouse} />
          </div>
        </div>
      </CardContent>
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

  const getCapacityStatus = () => {
    if (capacityPercentage >= 90) return "red";
    if (capacityPercentage >= 75) return "amber";
    if (capacityPercentage >= 50) return "blue";
    return "green";
  };

  const capacityColor = getCapacityStatus();

  return (
    <Card className="card">
      <CardHeader className="lg:h-16 border-b border-muted pb-4 mb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
            <PiWarehouse className="size-8" />
          </div>
          <div>
            <span className="font-semibold">Overview</span>
            <p className="text-sm font-normal mt-0.5">Warehouse insights</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div>
          {/* Storage Capacity */}
          <div className="border-b border-neutral/20 pb-4">
            <Label className="text-neutral font-semibold">
              Storage Capacity
            </Label>
            <div className="mt-3 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Capacity</span>
                <span className="font-semibold">
                  {warehouse.capacity.toLocaleString()} {warehouse.storageType}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Current Stock</span>
                <span className="font-semibold">
                  {totalStock.toLocaleString()} {warehouse.storageType}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm">Utilization</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-white text-sm",
                      capacityColor === "red"
                        ? "bg-red-600"
                        : capacityColor === "amber"
                        ? "bg-amber-500"
                        : capacityColor === "blue"
                        ? "bg-blue-500"
                        : "bg-green-700"
                    )}
                  >
                    {Math.round(capacityPercentage)}%
                  </Badge>
                </div>

                <div className="w-full bg-neutral/20 h-2 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      capacityColor === "red"
                        ? "bg-red-600"
                        : capacityColor === "amber"
                        ? "bg-amber-600"
                        : capacityColor === "blue"
                        ? "bg-blue-600"
                        : "bg-green-600"
                    )}
                    style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm text-neutral">
                  <span>Available:</span>
                  <span className="font-semibold">
                    {(warehouse.capacity - totalStock).toLocaleString()}{" "}
                    {warehouse.storageType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Summary */}
          <div className="pt-4">
            <Label className="text-neutral font-semibold">Stock Summary</Label>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm">Products</span>
                <p className="text-2xl font-bold">
                  {warehouse.stockItems?.length || 0}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm">Total Quantity</span>
                <p className="text-2xl font-bold">
                  {totalStock.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StockAlertsCard({ warehouse }: { warehouse: WarehouseState }) {
  const lowStockItems =
    warehouse.stockItems?.filter(
      (item) =>
        item.stockQuantity <= item.product.restockLevel &&
        item.stockQuantity > 0
    ).length || 0;

  const outOfStockItems =
    warehouse.stockItems?.filter((item) => item.stockQuantity === 0).length ||
    0;

  return (
    <Card className="card">
      <CardHeader className="mb-4">
        <div className="flex items-center gap-2 text-xl">
          <span className="p-1 rounded-lg bg-gray-200 text-gray-800">
            <AlertTriangle className="size-5" />
          </span>
          <CardTitle>Stock Alerts</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-red-600"></div>
              <span className="text-sm font-medium text-red-600">
                Out of Stock
              </span>
            </div>
            <span className="font-bold text-red-600">{outOfStockItems}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-amber-500"></div>
              <span className="text-sm font-medium text-amber-700">
                Low Stock
              </span>
            </div>
            <span className="font-bold text-amber-700">{lowStockItems}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContactCard({ warehouse }: { warehouse: WarehouseState }) {
  return (
    <Card className="card">
      <CardHeader className="mb-4">
        <div className="flex items-center gap-2 text-xl">
          <span className="p-1 rounded-lg bg-gray-200 text-gray-800">
            <User className="size-5" />
          </span>
          <CardTitle>Contact Information</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-neutral font-semibold">Manager</Label>
            <p className="font-medium">{warehouse.manager || "Not assigned"}</p>
          </div>

          <div className="space-y-1">
            <Label className="text-neutral font-semibold">Phone</Label>
            <p className="font-medium">{warehouse.contact || "Not provided"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StockItemsCard({ warehouse }: { warehouse: WarehouseState }) {
  const stockItems = warehouse.stockItems;
  const { data: products } = getAllProducts();

  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!stockItems) return [];

    return stockItems.filter((item) =>
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stockItems, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <Card className="card h-full">
      <CardHeader className="lg:h-16 border-b border-muted mb-4 pb-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Package className="size-8" />
            </div>
            <div>
              <span className="font-semibold">Stock Items</span>
              <p className="text-sm font-normal mt-0.5">
                Products stored in warehouse
              </p>
            </div>
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            <AddStockItemSheet warehouseId={warehouse.id} />
            <RemoveStockItemSheet warehouseId={warehouse.id} />
            <TransferProductsSheet />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral/60 size-4" />
            <Input
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mt-2 text-sm text-neutral">
              Found {filteredItems.length} product
              {filteredItems.length !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </div>

        {!stockItems || stockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="p-6 rounded-full bg-neutral/5 mb-6">
              <PiEmpty className="text-neutral/80 size-16" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-semibold mb-2">
              Warehouse Empty
            </h2>
            <p className="mb-6 max-w-md leading-relaxed text-neutral">
              You currently have no products in your warehouse. Add products to
              start managing your inventory effectively.
            </p>
            <AddStockItemSheet warehouseId={warehouse.id} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="p-6 rounded-full bg-neutral/5 mb-6">
              <Search className="text-neutral/80 size-16" />
            </div>
            <h2 className="text-xl lg:text-2xl font-semibold mb-2">
              No products found
            </h2>
            <p className="mb-4 max-w-md leading-relaxed text-neutral">
              No products match your search criteria. Try adjusting your search
              terms.
            </p>
            <Button
              variant="outline"
              onClick={() => handleSearchChange("")}
              className="mt-2"
            >
              Clear search
            </Button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentItems.map((item) => (
                <ProductCard key={item.product.id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-neutral/20">
                {/* Page Info */}
                <div className="text-sm text-neutral">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredItems.length)} of{" "}
                  {filteredItems.length} products
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {currentPage > 3 && totalPages > 5 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(1)}
                          className="w-8 h-8 p-0"
                        >
                          1
                        </Button>
                        {currentPage > 4 && (
                          <span className="text-neutral px-2">...</span>
                        )}
                      </>
                    )}

                    {getPageNumbers().map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}

                    {currentPage < totalPages - 2 && totalPages > 5 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="text-neutral px-2">...</span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ProductCard({ item }: { item: StockItemState }) {
  const format = useCurrencyFormat();

  const getStockStatus = () => {
    const quantity = item.stockQuantity;
    const restockLevel = item.product.restockLevel;

    if (quantity === 0) {
      return {
        status: "out",
        label: "Out of Stock",
        color: "bg-red-500",
        textColor: "text-red-800",
        bgColor: "bg-red-100",
      };
    } else if (quantity <= restockLevel) {
      return {
        status: "low",
        label: "Low Stock",
        color: "bg-amber-500 dark:bg-amber-500",
        textColor: "text-amber-800 dark:text-amber-500",
        bgColor: "bg-amber-100 dark:bg-amber-800/40",
      };
    } else {
      return {
        status: "good",
        label: "Available",
        color: "bg-green-400",
        textColor: "text-green-800 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-800/40",
      };
    }
  };

  const stockStatus = getStockStatus();

  const stockPercentage = Math.min(
    (item.stockQuantity / item.product.optimalLevel) * 100,
    100
  );

  return (
    <Card className="card border-neutral/25 hover:shadow-md dark:bg-muted/20 hover:border-focus transition-shadow">
      <Link href={`/products/${item.product.id}`} className="block h-full">
        <CardContent>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div
                className={`rounded-full text-xs font-medium py-1 px-2.5 ${stockStatus.textColor} ${stockStatus.bgColor} flex items-center gap-1 shrink`}
              >
                <div
                  className={`size-2 rounded-full ${stockStatus.color}`}
                ></div>
                {stockStatus.label}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Ellipsis className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/products/${item.product.id}`}
                      className="flex items-center gap-2"
                    >
                      <Eye className="size-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button className="flex items-center gap-2">
                      <Settings2 className="size-4" />
                      Update Stock
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button className="flex items-center gap-2">
                      <PackageX className="size-4" />
                      Remove Product
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Product Name */}
            <div>
              <h3 className="font-semibold text-lg my-2">
                {item.product.name}
              </h3>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-neutral">
                  <span>Stock Level</span>
                  <span>
                    {item.stockQuantity}/{item.product.optimalLevel}
                  </span>
                </div>
                <div className="w-full bg-neutral/20 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${stockStatus.color}`}
                    style={{ width: `${Math.max(stockPercentage, 2)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center pt-6">
              <div className="text-center">
                <Label className="text-xs text-neutral font-semibold">
                  PRICE
                </Label>
                <p className="font-semibold">
                  {format(item.product.sellingPrice / 100)}
                </p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-neutral font-semibold">
                  IN STOCK
                </Label>
                <p className="font-semibold text-lg">
                  {item.stockQuantity.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
