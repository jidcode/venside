"use client";

import { Input } from "@/core/components/ui/input";
import { Checkbox } from "@/core/components/ui/checkbox";
import { getAllProducts } from "@/core/services/products";
import { WarehouseStockRequest } from "@/core/schema/validator";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { useMemo, useState, useEffect } from "react";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import { Search, Package, Dot } from "lucide-react";

interface ParamProps {
  form: UseFormReturn<WarehouseStockRequest>;
}

export default function SelectProducts({ form }: ParamProps) {
  const { data: products = [] } = getAllProducts();
  const [search, setSearch] = useState("");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stockItems",
  });

  const watchedStockItems = form.watch("stockItems");

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  return (
    <div className="space-y-6">
      <SearchBar search={search} setSearch={setSearch} />

      <SelectionSummary fields={fields} watchedStockItems={watchedStockItems} />

      <ProductsTable
        products={filteredProducts}
        fields={fields}
        watchedStockItems={watchedStockItems}
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
  setSearch: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral h-4 w-4" />
        <Input
          id="search"
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
  fields,
  watchedStockItems,
}: {
  fields: any[];
  watchedStockItems: any[];
}) {
  if (fields.length === 0) return null;

  return (
    <div className="bg-accent/20 rounded-md p-2.5 pr-6  text-focus">
      <div className="flex items-center justify-between text-sm font-medium">
        <div className="flex items-center">
          <Dot className="size-8" />
          <span>
            {fields.length} product{fields.length !== 1 ? "s" : ""} selected
          </span>
        </div>
        <div>
          Total items:{" "}
          {watchedStockItems?.reduce(
            (sum, item) => sum + (item.stockQuantity || 0),
            0
          ) || 0}
        </div>
      </div>
    </div>
  );
}

function ProductsTable({
  products,
  fields,
  watchedStockItems,
  append,
  remove,
  form,
}: {
  products: any[];
  fields: any[];
  watchedStockItems: any[];
  append: (value: any) => void;
  remove: (index: number) => void;
  form: UseFormReturn<WarehouseStockRequest>;
}) {
  const isSelected = (productId: string) =>
    fields.some((item) => item.productId === productId);

  const handleSelect = (productId: string, isOutOfStock: boolean) => {
    if (isOutOfStock) return;

    if (isSelected(productId)) {
      const index = fields.findIndex((item) => item.productId === productId);
      remove(index);
    } else {
      append({ productId, stockQuantity: 1 });
    }
  };

  const getStockQuantity = (productId: string): number => {
    const item = watchedStockItems?.find(
      (item) => item.productId === productId
    );
    return item?.stockQuantity ?? 1;
  };

  const updateQuantity = (productId: string, value: string) => {
    const index = fields.findIndex((item) => item.productId === productId);
    if (index !== -1) {
      // Allow empty string during editing
      const quantity = value === "" ? 0 : parseInt(value) || 0;
      form.setValue(`stockItems.${index}.stockQuantity`, quantity);
    }
  };

  const finalizeQuantity = (productId: string, value: string) => {
    const index = fields.findIndex((item) => item.productId === productId);
    if (index !== -1) {
      // Ensure minimum value of 1 when editing is complete
      const quantity = value === "" ? 1 : parseInt(value) || 1;
      const finalQuantity = Math.max(1, quantity);
      form.setValue(`stockItems.${index}.stockQuantity`, finalQuantity);
    }
  };

  return (
    <div className="bg-primary rounded-lg border border-neutral/40 overflow-hidden">
      <header className="px-6 py-4 bg-foreground/80 text-primary">
        <div className="grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wide">
          <div className="col-span-1"></div>
          <div className="col-span-5">Products</div>
          <div className="col-span-3">Total Qty</div>
          <div className="col-span-3">Stock Qty</div>
        </div>
      </header>

      <ScrollArea className="max-h-[500px]">
        <div className="divide-y divide-neutral/40">
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
                stockQuantity={getStockQuantity(product.id)}
                onSelect={handleSelect}
                onQuantityChange={updateQuantity}
                onQuantityBlur={finalizeQuantity}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ProductRowProps {
  product: any;
  selected: boolean;
  stockQuantity: number;
  onSelect: (productId: string, isOutOfStock: boolean) => void;
  onQuantityChange: (productId: string, value: string) => void;
  onQuantityBlur: (productId: string, value: string) => void;
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

  // Sync with parent state when stockQuantity changes
  useEffect(() => {
    setInputValue(stockQuantity.toString());
  }, [stockQuantity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or positive numbers
    if (value === "" || /^\d*$/.test(value)) {
      setInputValue(value);
      onQuantityChange(product.id, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onQuantityBlur(product.id, value);
  };

  return (
    <div
      className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/80 transition-all duration-200 group ${
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
          <p className="text-xs text-neutral/60 font-medium">{product.code}</p>
        </div>
      </div>

      <div className="col-span-3 flex items-center">
        {product.totalQuantity === 0 ? (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Out of stock
          </div>
        ) : (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:text-green-300 dark:bg-green-800/20">
            {product.totalQuantity}
          </div>
        )}
      </div>

      <div className="col-span-3 flex items-center">
        {selected ? (
          <div className="w-full max-w-[100px]">
            <Input
              type="number"
              min={1}
              value={inputValue}
              onChange={handleChange}
              onBlur={handleBlur}
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
