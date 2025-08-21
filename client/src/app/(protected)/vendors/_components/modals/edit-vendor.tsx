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
import { VendorRequest, vendorSchema } from "@/core/schema/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { PenSquare } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { RiLoader2Fill } from "react-icons/ri";
import { VendorState } from "@/core/schema/types";
import { useVendorService } from "@/core/services/vendors";
import { AppError } from "@/core/lib/errors";
import {
  DisplayErrors,
  parseServerErrors,
} from "@/core/components/elements/error-display";
import VendorFormFields from "../forms/vendor-form-fields";

export interface VendorParamProps {
  vendor: VendorState;
}

export default function EditVendorSheet({ vendor }: VendorParamProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);
  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="secondary">
            <PenSquare className="size-3.5 mt-0.5" />
            <span>Edit Vendor</span>
          </Button>
        </SheetTrigger>
        <SheetTitle className="sr-only">Edit Vendor</SheetTitle>

        <SheetContent className="flex flex-col bg-primary border-none h-full min-w-full md:min-w-1/3">
          <EditVendorForm vendor={vendor} closeSheet={handleClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}

interface EditVendorFormProps {
  closeSheet: () => void;
  vendor: VendorState;
}

function EditVendorForm({ closeSheet, vendor }: EditVendorFormProps) {
  const [errorResponse, setErrorResponse] = useState<string | null>(null);
  const { updateVendor } = useVendorService();

  const form = useForm<VendorRequest>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      companyName: vendor.companyName,
      contactName: vendor.contactName ?? "",
      email: vendor.email ?? "",
      phone: vendor.phone ?? "",
      website: vendor.website ?? "",
      address: vendor.address ?? "",
    },
  });

  const action: SubmitHandler<VendorRequest> = async (data) => {
    setErrorResponse(null);

    try {
      const response = await updateVendor(vendor.id, data);

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
            <CardTitle className="text-xl">Edit Vendor</CardTitle>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting} variant="secondary">
                {isSubmitting ? (
                  <span className="flex items-center gap-1 text-sm">
                    <RiLoader2Fill className="h-4 w-4 animate-spin" />
                    <p>Saving changes...</p>
                  </span>
                ) : (
                  <span>Confirm</span>
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

          <VendorFormFields form={form} />
        </CardContent>
      </Card>
    </form>
  );
}
