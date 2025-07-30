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
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useWarehouseService } from "@/core/services/warehouses";
import { RiLoader2Fill } from "react-icons/ri";
import {
  DisplayErrors,
  parseServerErrors,
} from "@/core/components/elements/error-display";
import { PackageMinus } from "lucide-react";
import {
  WarehouseStockRequest,
  warehouseStockSchema,
} from "@/core/schema/validator";
import { AppError } from "@/core/lib/errors";
import SelectProducts from "../forms/select-products";

export default function RemoveStockItemSheet({
  warehouseId,
}: {
  warehouseId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          className="bg-neutral text-primary hover:bg-foreground hover:text-primary"
        >
          <PackageMinus className="size-5" />
          <span>Remove Items</span>
        </Button>
      </SheetTrigger>

      <SheetTitle className="sr-only">Remove Product from Warehouse</SheetTitle>

      <SheetContent className="flex flex-col bg-primary border-none h-full min-w-full md:min-w-1/2">
        <RemoveStockItem warehouseId={warehouseId} closeSheet={handleClose} />
      </SheetContent>
    </Sheet>
  );
}

interface RemoveStockItemProps {
  warehouseId: string;
  closeSheet: () => void;
}

function RemoveStockItem({ warehouseId, closeSheet }: RemoveStockItemProps) {
  const [errorResponse, setErrorResponse] = useState<string | null>(null);
  //   const { removeProductsFromWarehouse } = useWarehouseService();

  const form = useForm<WarehouseStockRequest>({
    resolver: zodResolver(warehouseStockSchema),
    defaultValues: {
      stockItems: [],
    },
  });

  const action: SubmitHandler<WarehouseStockRequest> = async (formData) => {
    setErrorResponse(null);
    console.log(formData);

    // try {
    //   const response = await removeProductsFromWarehouse(warehouseId, formData);
    //   console.log(response);

    //   if (response?.success) {
    //     form.reset();
    //     closeSheet();
    //   } else if (response?.error) {
    //     setErrorResponse(
    //       (response.error as AppError).message || "Failed to remove products"
    //     );
    //   }
    // } catch (error) {
    //   setErrorResponse(
    //     error instanceof Error ? error.message : "An unexpected error occurred"
    //   );
    // }
  };

  const isSubmitting = form.formState.isSubmitting;
  const serverErrors = parseServerErrors(errorResponse);
  const selectedCount = form.watch("stockItems")?.length || 0;

  return (
    <form onSubmit={form.handleSubmit(action)}>
      <Card className="border-none shadow-none text-foreground p-0">
        <CardHeader className="sticky top-0 bg-accent/5">
          <div className="flex items-center justify-between p-6">
            <CardTitle className="text-xl">Remove Stock</CardTitle>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || selectedCount === 0}
                variant="destructive"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1 text-sm">
                    <RiLoader2Fill className="h-4 w-4 animate-spin" />
                    <p>Removing Products...</p>
                  </span>
                ) : (
                  <span>
                    {selectedCount > 0
                      ? `Remove Product${selectedCount !== 1 ? "s" : ""}`
                      : "Remove Products"}
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

        <CardContent className="overflow-y-auto p-6">
          {errorResponse && <DisplayErrors serverErrors={serverErrors} />}

          <SelectProducts form={form} />
        </CardContent>
      </Card>
    </form>
  );
}
