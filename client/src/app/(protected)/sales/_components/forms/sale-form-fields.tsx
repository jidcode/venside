import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/core/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/core/components/ui/table";
import useCurrencyFormat, { formatCurrency } from "@/core/hooks/use-currency";
import { cn } from "@/core/lib/utils";
import { ProductState, SaleItemState } from "@/core/schema/types";
import { SaleRequest } from "@/core/schema/validator";
import { getAllCustomers } from "@/core/services/customers";
import { getAllProducts } from "@/core/services/products";
import {
  AlertCircle,
  Check,
  Dot,
  Minus,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { BiSolidPlusCircle } from "react-icons/bi";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdCircle } from "react-icons/md";
import {
  TbSquareMinusFilled,
  TbSquareRoundedMinusFilled,
  TbSquareRoundedPlusFilled,
} from "react-icons/tb";

interface SaleFormFieldsProps {
  form: UseFormReturn<SaleRequest>;
}

export default function SaleFormFields({ form }: SaleFormFieldsProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto space-y-4 pb-4">
        <CustomerSelector
          register={register}
          watch={watch}
          setValue={setValue}
          isSubmitting={isSubmitting}
          errors={errors}
        />

        <ProductSelector
          watch={watch}
          setValue={setValue}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="bg-focus/10 rounded-md shadow-sm mt-6">
        <div className="flex items-start justify-between gap-10 p-4 ">
          <div className="flex flex-col gap-4 w-1/2">
            <DateSelector watch={watch} setValue={setValue} />
            <PaymentStatusSelector
              watch={watch}
              register={register}
              setValue={setValue}
              isSubmitting={isSubmitting}
              errors={errors}
            />
          </div>

          <div className="w-1/2">
            <DiscountAndTotalsSummary watch={watch} setValue={setValue} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerSelector({
  register,
  watch,
  setValue,
  isSubmitting,
  errors,
}: any) {
  const { data: customers } = getAllCustomers();
  const [isOpen, setIsOpen] = useState(false);

  const selectedCustomer = customers?.find(
    (customer) => customer.id === watch("customerId")
  );
  return (
    <div>
      <Label>Customer</Label>

      <div className="flex flex-col lg:flex-row items-center gap-4 mt-2">
        <Input
          id="customerName"
          {...register("customerName")}
          maxLength={100}
          className={errors.customerName ? "border-destructive" : "text-sm"}
          placeholder="Enter customer name..."
        />
        {errors.customerName && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.customerName.message}
          </p>
        )}

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              disabled={isSubmitting}
              className="w-full flex items-center justify-between rounded-sm p-2 bg-muted/80 border border-neutral/40"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-6 w-6 bg-gradient-to-br from-blue-400 to-blue-800 text-white rounded-full">
                  <span className="p-2">
                    {selectedCustomer?.name?.[0] || (
                      <User className="h-4 w-4" />
                    )}
                  </span>
                </div>
                <span className="truncate font-semibold text-sm">
                  {selectedCustomer?.name || "Select existing customer..."}
                </span>
              </div>

              <IoMdArrowDropdown className="size-6" />
            </button>
          </PopoverTrigger>

          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-sm shadow-none">
            <Command className="rounded-lg border shadow-md">
              <CommandInput placeholder="Search customers..." className="h-9" />
              <CommandList className="max-h-[250px]">
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                  No customers found
                </CommandEmpty>
                <CommandGroup>
                  {customers?.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.name}
                      onSelect={() => {
                        setValue("customerId", customer.id);
                        setValue("customerName", customer.name);
                        setIsOpen(false);
                      }}
                      className="cursor-pointer px-3 py-2 text-sm"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCustomer?.id === customer.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex items-center justify-center h-5 w-5 p-1 bg-gradient-to-br from-gray-400 to-gray-800 text-white rounded-full">
                        <span className="text-xs">
                          {customer?.name?.[0] || <User className="h-4 w-4" />}
                        </span>
                      </div>
                      <span className="truncate">{customer.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function ProductSelector({ watch, setValue, isSubmitting }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: products } = getAllProducts();

  const saleItems = watch("items") || [];

  const selectedProducts = saleItems.map((item: SaleItemState) => ({
    id: item.productId,
    name: products?.find((p) => p.id === item.productId)?.name || "",
    price: products?.find((p) => p.id === item.productId)?.sellingPrice || "",
    quantity: item.quantity || 1,
  }));

  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      product.totalQuantity > 0
  );

  const handleProductSelect = (product: any, checked: boolean) => {
    if (checked) {
      const unitPriceCents = product.sellingPrice;
      const newItem = {
        productId: product.id,
        quantity: 1,
        unitPrice: unitPriceCents,
        subtotal: unitPriceCents,
      };
      setValue("items", [...saleItems, newItem]);
    } else {
      setValue(
        "items",
        saleItems.filter((item: SaleItemState) => item.productId !== product.id)
      );
    }
  };

  const formatCurrency = useCurrencyFormat();

  return (
    <div>
      <div className="flex items-center justify-between mt-2">
        <Label>Add Sale Items</Label>
        {selectedProducts.length > 0 && (
          <Badge className="px-3 py-1 bg-accent">
            {selectedProducts.length} selected
          </Badge>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={isSubmitting}
            className="w-full flex items-center justify-between rounded-sm p-2 bg-muted/80 border border-neutral/40 mt-2"
          >
            <span className="flex items-center gap-2 font-semibold text-sm">
              <BiSolidPlusCircle className="size-5" />
              <p>Select available products...</p>
            </span>
            <IoMdArrowDropdown className="size-6" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          style={{
            width: "var(--radix-dropdown-menu-trigger-width)",
          }}
        >
          <div className="relative w-full border border-neutral rounded-md">
            <Search className="absolute left-2 top-3 size-4 text-neutral" />
            <Input
              placeholder="Search product by name..."
              className="pl-8 py-2 border-0 text-sm focus-visible:ring-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredProducts?.length === 0 ? (
            <div className="py-6 text-center text-sm">No products found</div>
          ) : (
            <div>
              {filteredProducts?.map((product) => (
                <DropdownMenuCheckboxItem
                  key={product.id}
                  checked={saleItems.some(
                    (item: SaleItemState) => item.productId === product.id
                  )}
                  onCheckedChange={(checked) =>
                    handleProductSelect(product, checked)
                  }
                  className="gap-3 py-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="placeholder.jpg" />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-green-500 to-blue-600 text-white">
                      {product.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">{product.name}</div>
                  <span className="flex-1 font-semibold">
                    {product.totalQuantity}
                  </span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(product.sellingPrice / 100)}
                  </span>
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedProducts.length > 0 && (
        <ProductsTable
          products={selectedProducts}
          setValue={setValue}
          saleItems={saleItems}
        />
      )}
    </div>
  );
}

function ProductsTable({ products, setValue, saleItems }: any) {
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setValue(
      "items",
      saleItems.map((item: SaleItemState) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity: newQuantity,
            subtotal: (item.unitPrice || 0) * newQuantity,
          };
        }
        return item;
      })
    );
  };

  const removeProduct = (productId: string) => {
    setValue(
      "items",
      saleItems.filter((item: SaleItemState) => item.productId !== productId)
    );
  };
  return (
    <div className="mt-4 border rounded-md bg-primary shadow-sm overflow-hidden max-h-80 overflow-y-auto">
      <Table>
        <TableHeader className="bg-focus/20 sticky top-0 z-10">
          <TableRow>
            <TableHead className="font-semibold">Product</TableHead>
            <TableHead className="text-right font-semibold">
              Unit Price
            </TableHead>
            <TableHead className="text-center font-semibold">
              Quantity
            </TableHead>
            <TableHead className="text-right font-semibold">Subtotal</TableHead>
            <TableHead className="w-[40px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product: any) => (
            <TableRow key={product.id} className="hover:bg-muted">
              <TableCell className="font-medium">{product.name}</TableCell>

              <TableCell className="text-right text-green-600 dark:text-green-300 font-medium">
                {formatCurrency(product.price / 100)}
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(product.id, product.quantity - 1)
                    }
                    disabled={product.quantity <= 1}
                  >
                    <TbSquareRoundedMinusFilled className="size-6" />
                  </button>
                  <Input
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) =>
                      updateQuantity(product.id, parseInt(e.target.value) || 1)
                    }
                    className="w-14 text-center h-6 border border-neutral/40 bg-muted 
                    [appearance:textfield] 
                    [&::-webkit-inner-spin-button]:appearance-none 
                    [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(product.id, product.quantity + 1)
                    }
                  >
                    <TbSquareRoundedPlusFilled className="size-6" />
                  </button>
                </div>
              </TableCell>

              <TableCell className="text-right font-semibold">
                {formatCurrency((product.price / 100) * product.quantity)}
              </TableCell>

              <TableCell>
                <button onClick={() => removeProduct(product.id)}>
                  <X className="size-5 bg-neutral/20 p-0.5 mt-1 rounded-sm hover:bg-red-500 hover:text-white" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DateSelector({ watch, setValue }: any) {
  const saleDate = watch("saleDate");

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      const date = new Date(selectedDate + "T00:00:00");
      setValue("saleDate", date.toISOString());
    } else {
      setValue("saleDate", "");
    }
  };

  // Convert ISO string back to YYYY-MM-DD format for the input
  const getInputValue = () => {
    if (saleDate) {
      const date = new Date(saleDate);
      return date.toISOString().split("T")[0];
    }
    // Default to today's date if no date is set
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="space-y-2">
      <Label>Sale Date</Label>
      <div className="relative">
        <input
          type="date"
          value={getInputValue()}
          onChange={handleDateChange}
          className="w-full p-2 h-10 rounded-md bg-primary border text-sm"
          placeholder="Select a date"
        />
      </div>
    </div>
  );
}

function PaymentStatusSelector({
  watch,
  register,
  setValue,
  isSubmitting,
  errors,
}: any) {
  const paymentStatus = watch("paymentStatus");
  const balance = watch("balance") || 0;

  const paymentStatusOptions = [
    { value: "pending", label: "Pending", color: "text-yellow-500" },
    { value: "paid", label: "Paid", color: "text-green-500" },
    { value: "partial", label: "Partial", color: "text-blue-500" },
    { value: "overdue", label: "Overdue", color: " text-red-500" },
    { value: "cancelled", label: "Cancelled", color: "text-gray-500" },
  ];

  return (
    <div className="space-y-2">
      <Label>Payment Status</Label>
      <Select
        value={paymentStatus}
        onValueChange={(value: any) => {
          setValue("paymentStatus", value);
          if (value !== "partial") {
            setValue("balance", 0);
          }
        }}
        disabled={isSubmitting}
      >
        <SelectTrigger className="w-full bg-primary text-sm h-10 p-2">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>

        <SelectContent>
          {paymentStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <MdCircle className={cn("size-2.5", option.color)} />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {paymentStatus === "partial" && (
        <div className="space-y-2 mt-4">
          <Label>Balance Due</Label>
          <div className="relative">
            <Input
              type="number"
              id="balance"
              {...register("balance")}
              className={
                errors.balance
                  ? "border-destructive"
                  : "pr-4 h-10 text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              }
              placeholder="Enter balance"
            />
            {errors.balance && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.balance.message}
              </p>
            )}

            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function DiscountAndTotalsSummary({ watch, setValue }: any) {
  const [discountType, setDiscountType] = useState<"amount" | "percent">(
    "amount"
  );
  const [discountValue, setDiscountValue] = useState<string>("");

  // Watch values
  const saleItems = watch("items") || [];
  const discountAmount = watch("discountAmount") || 0;
  const discountPercent = watch("discountPercent") || 0;

  // Calculate subtotal from items
  const subtotal = saleItems.reduce(
    (sum: number, item: SaleItemState) => sum + (item.subtotal || 0),
    0
  );

  // Calculate discount value in cents
  const discountInCents =
    discountType === "percent"
      ? Math.round(subtotal * (discountPercent / 100))
      : discountAmount;

  // Calculate final total
  const finalTotal = Math.max(0, subtotal - discountInCents);

  const handleDiscountChange = (value: string) => {
    setDiscountValue(value);
    const numericValue = parseFloat(value) || 0;

    if (discountType === "percent") {
      // For percentage, store as integer (5% stored as 5)
      const percentValue = Math.min(100, Math.max(0, Math.round(numericValue)));
      setValue("discountPercent", percentValue);
      setValue("discountAmount", 0); // Reset amount when using percent
    } else {
      // For amount, convert to cents and store as integer
      const amountInCents = Math.round(numericValue * 100);
      setValue("discountAmount", amountInCents);
      setValue("discountPercent", 0); // Reset percent when using amount
    }

    // Update total amount
    setValue("totalAmount", finalTotal);
  };

  const handleDiscountTypeChange = (type: "amount" | "percent") => {
    setDiscountType(type);
    setDiscountValue("");
    // Reset both discount values
    setValue("discountAmount", 0);
    setValue("discountPercent", 0);
    setValue("totalAmount", subtotal);
  };

  // Update total amount whenever subtotal or discount changes
  useEffect(() => {
    setValue("totalAmount", finalTotal);
  }, [subtotal, discountInCents, setValue, finalTotal]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Discount</Label>
          <div className="flex items-center bg-primary rounded-md p-1">
            <button
              type="button"
              onClick={() => handleDiscountTypeChange("amount")}
              className={cn(
                "px-3 py-1 text-sm rounded transition-colors",
                discountType === "amount"
                  ? "bg-muted border border-neutral/50 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Amount
            </button>
            <button
              type="button"
              onClick={() => handleDiscountTypeChange("percent")}
              className={cn(
                "px-3 py-1 text-sm rounded transition-colors",
                discountType === "percent"
                  ? "bg-muted border border-neutral/50 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Percent
            </button>
          </div>
        </div>

        <div className="relative">
          <Input
            type="number"
            min="0"
            max={discountType === "percent" ? "100" : undefined}
            step={discountType === "percent" ? "1" : "0.01"}
            placeholder={
              discountType === "percent"
                ? "Enter percentage (0-100)"
                : "Enter amount"
            }
            value={discountValue}
            onChange={(e) => handleDiscountChange(e.target.value)}
            className="pr-8 h-10 text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {discountType === "percent" ? "%" : "$"}
          </span>
        </div>
      </div>

      {/* Totals Summary */}
      <div className="space-y-3">
        <div className="border-t border-neutral pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Sum:</span>
            <span className="font-medium">
              {formatCurrency(subtotal / 100)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Discount:</span>
            <span className="font-medium text-destructive">
              -{formatCurrency(discountInCents / 100)}
              {discountType === "percent" && discountPercent > 0 && (
                <span className="text-xs ml-1">({discountPercent}%)</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral">
          <span>Total:</span>
          <span className="text-green-600 dark:text-green-300">
            {formatCurrency(finalTotal / 100)}
          </span>
        </div>
      </div>
    </div>
  );
}
