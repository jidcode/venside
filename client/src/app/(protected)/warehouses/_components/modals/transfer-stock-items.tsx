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
import { ArrowRightLeft } from "lucide-react";
import {
  TransferStockRequest,
  transferStockSchema,
} from "@/core/schema/validator";
import { AppError } from "@/core/lib/errors";
import SelectTransferProducts from "../forms/select-transfer-products";

export default function TransferStockSheet({
  warehouseId,
}: {
  warehouseId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary">
          <ArrowRightLeft className="size-5" />
          <span>Transfer Products</span>
        </Button>
      </SheetTrigger>

      <SheetTitle className="sr-only">
        Transfer Products Between Warehouses
      </SheetTitle>

      <SheetContent className="flex flex-col bg-primary border-none h-full min-w-full md:min-w-1/2">
        <TransferStock warehouseId={warehouseId} closeSheet={handleClose} />
      </SheetContent>
    </Sheet>
  );
}

interface TransferStockProps {
  warehouseId: string;
  closeSheet: () => void;
}

function TransferStock({ warehouseId, closeSheet }: TransferStockProps) {
  const [errorResponse, setErrorResponse] = useState<string | null>(null);
  const { transferWarehouseStock } = useWarehouseService();

  const form = useForm<TransferStockRequest>({
    resolver: zodResolver(transferStockSchema),
    defaultValues: {
      fromWarehouseId: warehouseId,
      toWarehouseId: "",
      transferItems: [],
    },
  });

  const action: SubmitHandler<TransferStockRequest> = async (formData) => {
    setErrorResponse(null);
    console.log(formData);

    try {
      const response = await transferWarehouseStock(formData);
      console.log(response);

      if (response?.success) {
        form.reset({
          fromWarehouseId: warehouseId,
          toWarehouseId: "",
          transferItems: [],
        });
        closeSheet();
        window.location.reload();
      } else if (response?.error) {
        setErrorResponse(
          (response.error as AppError).message || "Failed to transfer products"
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
  const selectedCount = form.watch("transferItems")?.length || 0;
  const toWarehouseId = form.watch("toWarehouseId");

  return (
    <form onSubmit={form.handleSubmit(action)}>
      <Card className="border-none shadow-none text-foreground p-0">
        <CardHeader className="sticky top-0 bg-accent/5">
          <div className="flex items-center justify-between p-6">
            <CardTitle className="text-xl">Transfer Stock</CardTitle>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || selectedCount === 0 || !toWarehouseId}
                variant="secondary"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1 text-sm">
                    <RiLoader2Fill className="h-4 w-4 animate-spin" />
                    <p>Transferring Products...</p>
                  </span>
                ) : (
                  <span>
                    {selectedCount > 0
                      ? `Transfer ${selectedCount} Product${
                          selectedCount !== 1 ? "s" : ""
                        }`
                      : "Transfer Products"}
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
          <SelectTransferProducts form={form} warehouseId={warehouseId} />
        </CardContent>
      </Card>
    </form>
  );
}
