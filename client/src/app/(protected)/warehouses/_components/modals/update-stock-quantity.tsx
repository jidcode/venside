import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/components/ui/dialog";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RiLoader2Fill } from "react-icons/ri";
import { Package } from "lucide-react";
import { useWarehouseService } from "@/core/services/warehouses";
import { useParams } from "next/navigation";
import { StockItemState } from "@/core/schema/types";
import { errorToast, successToast } from "@/core/lib/utils";
import {
  UpdateStockQuantityRequest,
  updateStockQuantitySchema,
} from "@/core/schema/validator";

export default function UpdateStockQuantityDialog({
  stockItem,
}: {
  stockItem: StockItemState;
}) {
  const params = useParams();
  const warehouseId = params.warehouseId as string;

  const [open, setOpen] = useState(false);
  const { updateStockQuantity } = useWarehouseService();

  const form = useForm<UpdateStockQuantityRequest>({
    resolver: zodResolver(updateStockQuantitySchema),
    defaultValues: {
      newQuantity: stockItem.quantityInStock,
    },
  });

  const handleUpdateStock = async (data: UpdateStockQuantityRequest) => {
    try {
      const response = await updateStockQuantity(
        warehouseId,
        stockItem.product.id,
        data
      );

      console.log("Response:", response);

      if (response?.success) {
        setOpen(false);
        form.reset({ newQuantity: data.newQuantity });
        window.location.reload();

        successToast(`Stock quantity successfully updated.`);
      } else if (response?.error) {
        errorToast("Failed to update stock quantity. Please try again.");
      }
    } catch (error) {
      console.error("Error updating stock quantity:", error);
      errorToast("Failed to update stock quantity. Please try again.");
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const newQuantity = form.watch("newQuantity");
  const currentQuantity = stockItem.quantityInStock;
  const hasChanged = newQuantity !== currentQuantity;

  // Calculate the difference for display
  const difference = newQuantity - currentQuantity;
  const getDifferenceText = () => {
    if (difference > 0) return `+${difference}`;
    if (difference < 0) return difference.toString();
    return "No change";
  };

  const getDifferenceColor = () => {
    if (difference > 0) return "text-green-600";
    if (difference < 0) return "text-red-600";
    return "text-neutral";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Package className="size-4" />
          Update Stock
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(handleUpdateStock)}>
          <DialogHeader>
            <DialogTitle>Update Stock Quantity</DialogTitle>
            <DialogDescription>
              Update the stock quantity for "{stockItem.product.name}" in this
              warehouse. This will also update that total product quantity.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-quantity">New Quantity</Label>
              <Input
                id="new-quantity"
                type="number"
                min="0"
                step="1"
                placeholder="Enter new quantity"
                onClick={(e) => e.stopPropagation()}
                {...form.register("newQuantity", { valueAsNumber: true })}
                className={
                  form.formState.errors.newQuantity ? "border-destructive" : ""
                }
              />
              {form.formState.errors.newQuantity && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.newQuantity.message}
                </p>
              )}
            </div>

            {hasChanged && (
              <div className="bg-muted/50 rounded-md p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Change:</span>
                  <span className={`font-semibold ${getDifferenceColor()}`}>
                    {getDifferenceText()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                form.reset({ newQuantity: currentQuantity });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !hasChanged}
              variant={difference < 0 ? "destructive" : "default"}
              onClick={(e) => e.stopPropagation()}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2 text-sm">
                  <RiLoader2Fill className="h-4 w-4 animate-spin" />
                  Updating quantity...
                </span>
              ) : (
                `Update Stock`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
