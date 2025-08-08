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
import { useState } from "react";
import { RiLoader2Fill } from "react-icons/ri";
import { PackageX } from "lucide-react";
import { useWarehouseService } from "@/core/services/warehouses";
import { useParams } from "next/navigation";
import { ProductState } from "@/core/schema/types";
import { errorToast, successToast } from "@/core/lib/utils";

export default function RemoveProductDialog({
  product,
}: {
  product: ProductState;
}) {
  const params = useParams();
  const warehouseId = params.warehouseId as string;

  const [isRemoving, setIsRemoving] = useState(false);
  const [open, setOpen] = useState(false);
  const { removeProductFromWarehouse } = useWarehouseService();

  const handleRemove = async () => {
    setIsRemoving(true);

    try {
      const response = await removeProductFromWarehouse(
        warehouseId,
        product.id
      );

      console.log("Response:", response);

      if (response?.success) {
        setOpen(false);
        window.location.reload();

        successToast("Product removed successfully.");
      } else if (response?.error) {
        errorToast("Failed to remove product. Please try again.");
      }
    } catch (error) {
      console.error("Error removing product:", error);
      errorToast("Failed to remove product. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* <Button
          size="icon"
          className="bg-destructive hover:bg-red-500 hover:text-red-50 h-10 w-10 rounded-md"
        >
          <TbTrashX className="size-5" />
        </Button> */}
        <button
          type="button"
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <PackageX className="size-4" />
          Remove Product
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Product From Warehouse</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove "{product.name}" from the warehouse?
            This action cannot be undone and will permanently remove the product
            stock from your inventory.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <span className="flex items-center gap-1 text-sm">
                <RiLoader2Fill className="h-4 w-4 animate-spin" />
                <p>Removing Product...</p>
              </span>
            ) : (
              "Remove"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
