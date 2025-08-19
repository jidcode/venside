"use client";

import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/core/components/ui/sheet";
import { SaleRequest, saleSchema } from "@/core/schema/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSaleService } from "@/core/services/sales";
import { RiLoader2Fill } from "react-icons/ri";
import {
  DisplayErrors,
  parseServerErrors,
} from "@/core/components/elements/error-display";
import { AppError } from "@/core/lib/errors";
import { Check, Plus } from "lucide-react";
import SaleFormFields from "../forms/sale-form-fields";
import { getAllProducts } from "@/core/services/products";
import { getAllCustomers } from "@/core/services/customers";

export default function AddSaleSheet() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);
  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="secondary">
            <Plus className="size-5" />
            <span>Add Sale Order</span>
          </Button>
        </SheetTrigger>

        <SheetTitle className="sr-only">Add Sale</SheetTitle>

        <SheetContent className="flex flex-col bg-primary border-none h-full min-w-full md:min-w-1/2">
          <AddSaleForm closeSheet={handleClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function AddSaleForm({ closeSheet }: { closeSheet: () => void }) {
  const [errorResponse, setErrorResponse] = useState<string | null>(null);
  const { createSale } = useSaleService();

  const form = useForm<SaleRequest>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      saleDate: new Date(),
      paymentStatus: "pending",
      discountAmount: 0,
      discountPercent: 0,
      balance: 0,
      items: [],
    },
  });

  const action: SubmitHandler<SaleRequest> = async (formData) => {
    setErrorResponse(null);

    try {
      const response = await createSale(formData);

      if (response?.success) {
        form.reset();
        closeSheet();
      } else if (response?.error) {
        setErrorResponse(
          (response.error as AppError).message || "Request failed!"
        );
      }
    } catch (error) {
      setErrorResponse(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const serverErrors = parseServerErrors(errorResponse);

  return (
    <form onSubmit={form.handleSubmit(action)}>
      <Card className="border-none shadow-none text-foreground p-0">
        <CardHeader className="sticky top-0 bg-accent/5">
          <div className="flex items-center justify-between px-4 py-6">
            <CardTitle className="text-xl">New Sale</CardTitle>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting} variant="secondary">
                {isSubmitting ? (
                  <span className="flex items-center gap-1 text-sm">
                    <RiLoader2Fill className="h-4 w-4 animate-spin" />
                    <p>Creating Sale...</p>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Check /> Confirm
                  </span>
                )}
              </Button>

              <Button
                type="button"
                onClick={closeSheet}
                disabled={isSubmitting}
                className="min-w-24 px-4 h-10 bg-accent/5 border border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto p-8 lg:p-10">
          {errorResponse && <DisplayErrors serverErrors={serverErrors} />}

          <SaleFormFields form={form} />
        </CardContent>
      </Card>
    </form>
  );
}
