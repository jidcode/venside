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
import { ProductState } from "@/core/schema/types";
import { useProductService } from "@/core/services/products";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TbTrashX } from "react-icons/tb";
import { toast } from "sonner";

export interface ProductParamProps {
  product: ProductState;
}

export default function DeleteProductDialog({ product }: ProductParamProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { deleteProduct } = useProductService();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await deleteProduct(product.id);

      if (response?.success) {
        setOpen(false);
        router.push("/products");
      } else if (response?.error) {
        setOpen(false);
        toast(response?.error.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast("Failed to delete product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="bg-destructive hover:bg-red-500 hover:text-red-50 h-10 w-10 rounded-md"
        >
          <TbTrashX className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{product.name}"? This action cannot
            be undone and will permanently remove all associated data.
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
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
