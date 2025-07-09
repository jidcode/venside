"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { InventoryRequest, inventorySchema } from "@/core/schema/validator";
import { createInventoryAction } from "@/server/actions/inventory";
import { Label } from "@/core/components/ui/label";
import { CURRENCIES } from "./currencies";
import { cn } from "@/core/lib/utils";
import { RiLoader2Fill } from "react-icons/ri";
import { PiPlusCircleBold } from "react-icons/pi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/core/components/ui/command";

import {
  DisplayErrors,
  parseServerErrors,
} from "@/core/components/elements/error-display";
import { InventoryState } from "@/core/schema/types";

interface InventoryModalProps {
  onSuccess: (inventory: InventoryState) => void;
}

export default function NewInventoryModal({ onSuccess }: InventoryModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center
       z-50 p-4 animate-in fade-in-0 duration-300"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-in zoom-in-95 
        slide-in-from-bottom-4 duration-300 border border-gray-100"
      >
        <ModalHeader />
        <AddInventoryForm onSuccess={onSuccess} />
      </div>
    </div>
  );
}

function ModalHeader() {
  return (
    <>
      <div className="relative p-8 pb-6 rounded-t-2xl bg-accent/10 border-b border-muted">
        <div className="flex items-center justify-center mb-2">
          <div className="relative bg-gradient-to-br from-focus to-accent rounded-full p-2">
            <Package className="h-6 w-6 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-secondary text-center mb-2">
          Create New Inventory
        </h2>

        <p className="text-neutral text-center text-sm leading-relaxed">
          Start organizing your stock with a new inventory space
        </p>
      </div>
    </>
  );
}

function AddInventoryForm({ onSuccess }: InventoryModalProps) {
  const [errorResponse, setErrorResponse] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InventoryRequest>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      currency: "USD:en-US:United States Dollar",
    },
  });

  const currentCurrency = watch("currency");

  const handleCurrencySelect = (value: string) => {
    setValue("currency", value, { shouldValidate: true });
    setIsPopoverOpen(false);
  };

  // Get display value for selected currency
  const getSelectedCurrency = () => {
    if (!currentCurrency) return "Select currency";

    const currency = CURRENCIES.find(
      (c) => `${c.code}:${c.locale}:${c.name}` === currentCurrency
    );

    return currency ? `${currency.code} - ${currency.name}` : "Select currency";
  };

  const action: SubmitHandler<InventoryRequest> = async (formData) => {
    setErrorResponse(null);
    console.log(formData);
    try {
      const response = await createInventoryAction(formData);
      if (response.success) {
        reset();
        onSuccess(response.data);
      } else if (response.error) {
        setErrorResponse(
          response.error.message || "Failed to create inventory"
        );
      }
    } catch (error) {
      console.error("Create inventory error:", error);
      setErrorResponse(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  const serverErrors = parseServerErrors(errorResponse);

  return (
    <>
      <div className="p-8 pt-6">
        <form onSubmit={handleSubmit(action)} className="space-y-6">
          <DisplayErrors serverErrors={serverErrors} />

          <div className="space-y-2">
            <Label htmlFor="name" className="tracking-wide">
              Inventory Name
            </Label>
            <div className="relative">
              <Input
                className="h-11 rounded-md border-secondary/80"
                type="text"
                id="name"
                {...register("name")}
                disabled={isSubmitting}
              />
              {errors.name && (
                <span className="text-destructive text-sm font-medium">
                  {errors.name.message}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="tracking-wide">
              Select Currency
            </Label>

            <div className="relative w-full">
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isPopoverOpen}
                    className="w-full h-11 rounded-md border-secondary/80 justify-between font-normal"
                    disabled={isSubmitting}
                  >
                    <span className="truncate">{getSelectedCurrency()}</span>
                    <ChevronsUpDown className="ml-2 size-5 text-neutral" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search currencies..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No currency found.</CommandEmpty>
                      <CommandGroup>
                        {CURRENCIES.map((currency) => {
                          const value = `${currency.code}:${currency.locale}:${currency.name}`;
                          const isSelected = currentCurrency === value;

                          return (
                            <CommandItem
                              key={currency.code}
                              value={`${currency.code} ${currency.name}`}
                              onSelect={() => handleCurrencySelect(value)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {currency.code}
                                </span>
                                <span className="text-muted-foreground">
                                  {currency.name}
                                </span>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {errors.currency && (
                <span className="text-destructive text-sm font-medium">
                  {errors.currency.message}
                </span>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button
              className="w-full h-11 rounded-full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2 text-xs tracking-wide">
                  <RiLoader2Fill className="animate-spin size-5" />
                  <span>Creating your inventory...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <PiPlusCircleBold className="size-4.5" />
                  <span>Create Inventory</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
