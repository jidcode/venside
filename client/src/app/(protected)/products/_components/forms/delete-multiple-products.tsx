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
import { useProductService } from "@/core/services/products";
import { useState } from "react";
import { TbTrashX } from "react-icons/tb";
import { toast } from "sonner";

interface DeleteMultipleProductsDialogProps {
  productIds: string[];
  selectedCount: number;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export default function DeleteMultipleProductsDialog({
  productIds,
  selectedCount,
  onSuccess,
  children,
}: DeleteMultipleProductsDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const { deleteMultipleProducts } = useProductService();

  console.log("productIds", productIds);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await deleteMultipleProducts(productIds);
      console.log("response", response);

      if (response?.success) {
        setOpen(false);
        onSuccess?.();
        toast("Products successfully deleted.");
      } else if (response?.error) {
        setOpen(false);
        toast(response?.error.message || "Failed to delete products");
      }
    } catch (error) {
      console.error("Failed to delete products:", error);
      toast("Failed to delete products. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-2 text-sm"
          >
            <TbTrashX className="size-4" />
            <span>
              {selectedCount === 1
                ? `Delete (${selectedCount})`
                : `Bulk Delete (${selectedCount})`}
            </span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {selectedCount} Products</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedCount} selected products?
            This action cannot be undone and will permanently remove all
            associated data.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : `Delete ${selectedCount} Products`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
