"use client";

import { Input } from "@/core/components/ui/input";
import { Checkbox } from "@/core/components/ui/checkbox";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import { getAllProducts } from "@/core/services/products";
import { AddStockRequest } from "@/core/schema/validator";
import { ProductState } from "@/core/schema/types";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { useState, useEffect } from "react";
import { Search, Package, Dot } from "lucide-react";
import { getWarehouse } from "@/core/services/warehouses";

interface SelectProductsProps {
  form: UseFormReturn<AddStockRequest>;
  warehouseId: string;
}

export default function SelectProducts({
  form,
  warehouseId,
}: SelectProductsProps) {
  const { data: products = [] } = getAllProducts();
  const { data: warehouse } = getWarehouse(warehouseId);

  const [search, setSearch] = useState("");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stockItems",
  });

  const selectedItems = form.watch("stockItems");

  const stockIds = warehouse?.stockItems?.map((item) => item.product.id) || [];

  const filteredProducts = products.filter(
    (product) =>
      !stockIds.includes(product.id) &&
      product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SearchBar search={search} setSearch={setSearch} />
      {fields.length > 0 && (
        <SelectionSummary
          fieldsCount={fields.length}
          selectedItems={selectedItems}
        />
      )}
      <ProductsTable
        products={filteredProducts}
        selectedItems={selectedItems}
        fields={fields}
        append={append}
        remove={remove}
        form={form}
      />
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
          placeholder="Search by product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-muted/20 border-neutral transition-all duration-200"
        />
      </div>
    </div>
  );
}

function SelectionSummary({
  fieldsCount,
  selectedItems,
}: {
  fieldsCount: number;
  selectedItems: AddStockRequest["stockItems"];
}) {
  const totalItems = selectedItems.reduce(
    (sum, item) => sum + (item.quantityInStock || 0),
    0
  );

  return (
    <div className="bg-accent/20 rounded-md p-2.5 pr-6 text-focus">
      <div className="flex items-center justify-between text-sm font-medium">
        <div className="flex items-center">
          <Dot className="size-8" />
          <span>
            {fieldsCount} product{fieldsCount !== 1 ? "s" : ""} selected
          </span>
        </div>
        <div>Total items: {totalItems}</div>
      </div>
    </div>
  );
}

interface ProductsTableProps {
  products: ProductState[];
  selectedItems: AddStockRequest["stockItems"];
  fields: { id: string; productId: string }[];
  append: (item: AddStockRequest["stockItems"][0]) => void;
  remove: (index: number) => void;
  form: UseFormReturn<AddStockRequest>;
}

function ProductsTable({
  products,
  selectedItems,
  fields,
  append,
  remove,
  form,
}: ProductsTableProps) {
  const isSelected = (id: string) => fields.some((f) => f.productId === id);
  const findIndex = (id: string) => fields.findIndex((f) => f.productId === id);
  const getQty = (id: string) =>
    selectedItems.find((s) => s.productId === id)?.quantityInStock ?? 1;

  const handleToggle = (id: string, isOut: boolean) => {
    if (isOut) return;
    isSelected(id)
      ? remove(findIndex(id))
      : append({ productId: id, quantityInStock: 1 });
  };

  const handleQtyChange = (id: string, value: string, finalize = false) => {
    const index = findIndex(id);
    if (index === -1) return;

    let quantity = value === "" ? 0 : parseInt(value) || 0;
    if (finalize) quantity = Math.max(1, quantity);

    form.setValue(`stockItems.${index}.quantityInStock`, quantity);
  };

  return (
    <div className="bg-primary rounded-lg border border-neutral/40 overflow-hidden">
      <header className="px-6 py-4 bg-foreground/80 text-primary">
        <div className="grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wide">
          <div className="col-span-1" />
          <div className="col-span-5">Products</div>
          <div className="col-span-3">Available Stock</div>
          <div className="col-span-3">Add Qty</div>
        </div>
      </header>

      <ScrollArea className="max-h-[500px] divide-y divide-neutral/40">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral">
            <Package className="h-12 w-12 mb-3 text-neutral/50" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              selected={isSelected(product.id)}
              stockQuantity={getQty(product.id)}
              onSelect={handleToggle}
              onQuantityChange={(val) => handleQtyChange(product.id, val)}
              onQuantityBlur={(val) => handleQtyChange(product.id, val, true)}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}

interface ProductRowProps {
  product: ProductState;
  selected: boolean;
  stockQuantity: number;
  onSelect: (id: string, isOut: boolean) => void;
  onQuantityChange: (val: string) => void;
  onQuantityBlur: (val: string) => void;
}

function ProductRow({
  product,
  selected,
  stockQuantity,
  onSelect,
  onQuantityChange,
  onQuantityBlur,
}: ProductRowProps) {
  const [inputValue, setInputValue] = useState(stockQuantity.toString());
  const isOutOfStock = product.totalQuantity === 0;

  useEffect(() => {
    setInputValue(stockQuantity.toString());
  }, [stockQuantity]);

  return (
    <div
      className={`grid grid-cols-12 gap-4 px-6 py-4 group hover:bg-muted/80 transition-all duration-200 ${
        selected ? "bg-muted/25 border-l-4 border-focus/80" : ""
      } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="col-span-1 flex items-center">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onSelect(product.id, isOutOfStock)}
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
            {product.totalQuantity - product.totalStock}{" "}
            <span className="ml-1 text-sm text-neutral/50 mt-0.5">
              / {product.totalQuantity}
            </span>
          </span>
        )}
      </div>

      <div className="col-span-3 flex items-center">
        {selected ? (
          <div className="w-full max-w-[100px]">
            <Input
              type="number"
              min={1}
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d*$/.test(val)) {
                  setInputValue(val);
                  onQuantityChange(val);
                }
              }}
              onBlur={(e) => onQuantityBlur(e.target.value)}
              className="h-8 text-sm border-neutral focus:border-accent focus:ring-1 focus:ring-focus transition-all duration-200"
              placeholder="Min: 1"
            />
          </div>
        ) : (
          <span className="text-neutral text-sm font-medium">—</span>
        )}
      </div>
    </div>
  );
}
