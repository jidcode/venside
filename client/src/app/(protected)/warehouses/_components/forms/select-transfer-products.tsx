"use client";

import { Input } from "@/core/components/ui/input";
import { Checkbox } from "@/core/components/ui/checkbox";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { getAllWarehouses, getWarehouse } from "@/core/services/warehouses";
import { TransferStockRequest } from "@/core/schema/validator";
import { StockItemState, WarehouseState } from "@/core/schema/types";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { useState, useEffect } from "react";
import { Search, Package, Dot, ArrowRight } from "lucide-react";

interface SelectTransferProductsProps {
  form: UseFormReturn<TransferStockRequest>;
  warehouseId: string;
}

export default function SelectTransferProducts({
  form,
  warehouseId,
}: SelectTransferProductsProps) {
  const { data: warehouses = [] } = getAllWarehouses();
  const { data: fromWarehouse } = getWarehouse(warehouseId);

  const [search, setSearch] = useState("");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "transferItems",
  });

  const selectedItems = form.watch("transferItems");
  const toWarehouseId = form.watch("toWarehouseId");

  const availableWarehouses = warehouses.filter(
    (warehouse) => warehouse.id !== warehouseId
  );

  const availableProducts =
    fromWarehouse?.stockItems?.filter(
      (item) =>
        item.product.name.toLowerCase().includes(search.toLowerCase()) &&
        item.quantityInStock > 0
    ) || [];

  return (
    <div className="space-y-6">
      <WarehouseSelector
        form={form}
        warehouses={availableWarehouses}
        fromWarehouse={fromWarehouse}
      />

      <SearchBar search={search} setSearch={setSearch} />

      {fields.length > 0 && (
        <TransferSummary
          fieldsCount={fields.length}
          selectedItems={selectedItems}
        />
      )}

      <ProductsTransferTable
        products={availableProducts}
        selectedItems={selectedItems}
        fields={fields}
        append={append}
        remove={remove}
        form={form}
      />
    </div>
  );
}

function WarehouseSelector({
  form,
  warehouses,
  fromWarehouse,
}: {
  form: UseFormReturn<TransferStockRequest>;
  warehouses: WarehouseState[];
  fromWarehouse: WarehouseState | undefined;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold">Select Destination Warehouse</h3>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-neutral">From</label>
          <div className="bg-muted/50 text-neutral p-2 mt-1 rounded-md">
            <p className="font-medium">{fromWarehouse?.name}</p>
            <p className="text-sm text-neutral">{fromWarehouse?.location}</p>
          </div>
        </div>

        <ArrowRight className="h-5 w-5 text-neutral mt-6" />

        <div className="flex-1">
          <label className="text-sm font-medium text-neutral">To</label>
          <Select
            value={form.watch("toWarehouseId")}
            onValueChange={(value) => {
              form.setValue("toWarehouseId", value);
              //   form.setValue("transferItems", []);
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select destination warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  <div>
                    <p className="font-medium">{warehouse.name}</p>
                    <p className="text-sm text-neutral">{warehouse.location}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function SearchBar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (val: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral h-4 w-4" />
        <Input
          placeholder="Search products in warehouse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-muted/20 border-neutral transition-all duration-200"
        />
      </div>
    </div>
  );
}

function TransferSummary({
  fieldsCount,
  selectedItems,
}: {
  fieldsCount: number;
  selectedItems: TransferStockRequest["transferItems"];
}) {
  const totalItems = selectedItems.reduce(
    (sum, item) => sum + (item.transferQuantity || 0),
    0
  );

  return (
    <div className="bg-accent/20 rounded-md p-2 pr-6 text-focus">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center">
            <Dot className="size-8" />
            <span>
              {fieldsCount} product{fieldsCount !== 1 ? "s" : ""} selected for
              transfer
            </span>
          </div>
          <div>Total items: {totalItems}</div>
        </div>
      </div>
    </div>
  );
}

interface ProductsTransferTableProps {
  products: StockItemState[];
  selectedItems: TransferStockRequest["transferItems"];
  fields: { id: string; productId: string }[];
  append: (item: TransferStockRequest["transferItems"][0]) => void;
  remove: (index: number) => void;
  form: UseFormReturn<TransferStockRequest>;
}

function ProductsTransferTable({
  products,
  selectedItems,
  fields,
  append,
  remove,
  form,
}: ProductsTransferTableProps) {
  const isSelected = (id: string) => fields.some((f) => f.productId === id);
  const findIndex = (id: string) => fields.findIndex((f) => f.productId === id);
  const getQty = (id: string) =>
    selectedItems.find((s) => s.productId === id)?.transferQuantity ?? 1;

  const handleToggle = (id: string) => {
    isSelected(id)
      ? remove(findIndex(id))
      : append({ productId: id, transferQuantity: 1 });
  };

  const handleQtyChange = (id: string, value: string) => {
    const index = findIndex(id);
    if (index === -1) return;

    const quantity = value === "" ? 0 : parseInt(value) || 0;
    form.setValue(`transferItems.${index}.transferQuantity`, quantity);
  };

  return (
    <div className="bg-primary rounded-lg border border-neutral/40 overflow-hidden">
      <header className="px-6 py-4 bg-foreground/80 text-primary">
        <div className="grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wide">
          <div className="col-span-1" />
          <div className="col-span-5">Products</div>
          <div className="col-span-3">Available Stock</div>
          <div className="col-span-3">Transfer Qty</div>
        </div>
      </header>

      <ScrollArea className="max-h-[500px] divide-y divide-neutral/40">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral">
            <Package className="h-12 w-12 mb-3 text-neutral/50" />
            <p className="text-lg font-medium">No products available</p>
            <p className="text-sm mt-1">
              This warehouse has no products to transfer
            </p>
          </div>
        ) : (
          products.map((stockItem) => (
            <ProductTransferRow
              key={stockItem.product.id}
              stockItem={stockItem}
              selected={isSelected(stockItem.product.id)}
              transferQuantity={getQty(stockItem.product.id)}
              onSelect={() => handleToggle(stockItem.product.id)}
              onQuantityChange={(val) =>
                handleQtyChange(stockItem.product.id, val)
              }
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}

interface ProductTransferRowProps {
  stockItem: StockItemState;
  selected: boolean;
  transferQuantity: number;
  onSelect: () => void;
  onQuantityChange: (val: string) => void;
}

function ProductTransferRow({
  stockItem,
  selected,
  transferQuantity,
  onSelect,
  onQuantityChange,
}: ProductTransferRowProps) {
  const [inputValue, setInputValue] = useState(transferQuantity.toString());
  const { product, quantityInStock } = stockItem;
  const isOutOfStock = quantityInStock === 0;

  useEffect(() => {
    setInputValue(transferQuantity.toString());
  }, [transferQuantity]);

  return (
    <div
      className={`grid grid-cols-12 gap-4 px-6 py-4 group hover:bg-muted/80 transition-all duration-200 ${
        selected ? "bg-muted/25 border-l-4 border-focus/80" : ""
      } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="col-span-1 flex items-center">
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          className={`data-[state=checked]:ring-1 data-[state=checked]:border-focus border-neutral ${
            isOutOfStock ? "cursor-not-allowed" : ""
          }`}
          disabled={isOutOfStock}
        />
      </div>

      <div className="col-span-5 flex items-center">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{product.name}</p>
          <p className="text-xs text-neutral/50 font-medium">{product.code}</p>
        </div>
      </div>

      <div className="col-span-3 flex items-center">
        {isOutOfStock ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Out of stock
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-lg font-semibold">
            {quantityInStock}
          </span>
        )}
      </div>

      <div className="col-span-3 flex items-center">
        {selected ? (
          <div className="w-full max-w-[100px]">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d*$/.test(val)) {
                  setInputValue(val);
                  onQuantityChange(val);
                }
              }}
              className="h-8 text-sm border-neutral focus:border-accent focus:ring-1 focus:ring-focus transition-all duration-200"
              min={1}
            />
          </div>
        ) : (
          <span className="text-neutral text-sm font-medium">—</span>
        )}
      </div>
    </div>
  );
}
