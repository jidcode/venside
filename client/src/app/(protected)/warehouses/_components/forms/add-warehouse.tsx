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
import { WarehouseRequest, warehouseSchema } from "@/core/schema/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useWarehouseService } from "@/core/services/warehouses";
import { RiLoader2Fill } from "react-icons/ri";
import {
  DisplayErrors,
  parseServerErrors,
} from "@/core/components/elements/error-display";
import WarehouseFormFields from "./form-fields";
import { AppError } from "@/core/lib/errors";
import { Check, HousePlus } from "lucide-react";

export default function AddWarehouseSheet() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);
  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="secondary">
            <HousePlus className="size-5" />
            <span>Add Warehouse</span>
          </Button>
        </SheetTrigger>

        <SheetTitle className="sr-only">Add Warehouse</SheetTitle>

        <SheetContent className="flex flex-col bg-primary border-none h-full min-w-full md:min-w-1/3">
          <AddWarehouseForm closeSheet={handleClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function AddWarehouseForm({ closeSheet }: { closeSheet: () => void }) {
  const [errorResponse, setErrorResponse] = useState<string | null>(null);

  const { createWarehouse } = useWarehouseService();

  const form = useForm<WarehouseRequest>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      capacity: 0,
      storageType: "units",
    },
  });

  const action: SubmitHandler<WarehouseRequest> = async (formData) => {
    setErrorResponse(null);

    try {
      const response = await createWarehouse(formData);

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
            <CardTitle className="text-xl">New Warehouse</CardTitle>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting} variant="secondary">
                {isSubmitting ? (
                  <span className="flex items-center gap-1 text-sm">
                    <RiLoader2Fill className="h-4 w-4 animate-spin" />
                    <p>Adding Warehouse...</p>
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

          <WarehouseFormFields form={form} />
        </CardContent>
      </Card>
    </form>
  );
}
