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
import { PurchaseRequest, purchaseSchema } from "@/core/schema/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { usePurchaseService } from "@/core/services/purchases";
import { RiLoader2Fill } from "react-icons/ri";
import {
  DisplayErrors,
  parseServerErrors,
} from "@/core/components/elements/error-display";
import { AppError } from "@/core/lib/errors";
import { Check, Plus } from "lucide-react";
import PurchaseFormFields from "../forms/purchase-form-fields";

export default function AddPurchaseSheet() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);
  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="secondary">
            <Plus className="size-5" />
            <span>New Purchase</span>
          </Button>
        </SheetTrigger>

        <SheetTitle className="sr-only">Add Purchase</SheetTitle>

        <SheetContent className="flex flex-col bg-primary border-none h-full min-w-full md:min-w-4/5 overflow-y-auto">
          <AddPurchaseForm closeSheet={handleClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function AddPurchaseForm({ closeSheet }: { closeSheet: () => void }) {
  const [errorResponse, setErrorResponse] = useState<string | null>(null);
  const { createPurchase } = usePurchaseService();

  const today = new Date();

  const form = useForm<PurchaseRequest>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      purchaseDate: today.toISOString(),
      paymentStatus: "pending",
      purchaseStatus: "draft",
      eta: "",
      deliveryDate: "",
      shippingCost: 0,
      discountAmount: 0,
      discountPercent: 0,
      totalAmount: 0,
      items: [],
    },
  });

  const action: SubmitHandler<PurchaseRequest> = async (formData) => {
    setErrorResponse(null);

    console.log("DATA", formData);
    try {
      const response = await createPurchase(formData);
      console.log("response", response);

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
        <CardHeader className="sticky top-0 bg-primary shadow-sm">
          <div className="flex items-center justify-between p-4">
            <CardTitle className="text-xl">New Purchase</CardTitle>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting} variant="secondary">
                {isSubmitting ? (
                  <span className="flex items-center gap-1 text-sm">
                    <RiLoader2Fill className="h-4 w-4 animate-spin" />
                    <p>Creating Purchase...</p>
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

        <CardContent className="p-4 lg:p-10">
          {errorResponse && <DisplayErrors serverErrors={serverErrors} />}

          <PurchaseFormFields form={form} />
        </CardContent>
      </Card>
    </form>
  );
}
