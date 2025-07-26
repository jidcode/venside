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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TbTrashX } from "react-icons/tb";
import { WarehouseParamProps } from "./edit-warehouse";
import { useWarehouseService } from "@/core/services/warehouses";
import { AppError } from "@/core/lib/errors";
import { RiLoader2Fill } from "react-icons/ri";

export default function DeleteWarehouseDialog({
  warehouse,
}: WarehouseParamProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const { deleteWarehouse } = useWarehouseService();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await deleteWarehouse(warehouse.id);

      if (response?.success) {
        setOpen(false);
        router.push("/warehouses");
      } else if (response?.error) {
        alert((response.error as AppError).message || "Request failed!");
      }
    } catch (error) {
      console.error("Failed to delete warehouse:", error);
      alert("Failed to delete warehouse. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="bg-destructive hover:bg-red-500 hover:text-red-50"
        >
          <TbTrashX className="size-4" />
          <span>Delete</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Warehouse</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{warehouse.name}"? This action
            cannot be undone and will permanently remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-1 text-sm">
                <RiLoader2Fill className="h-4 w-4 animate-spin" />
                <p>Adding Warehouse...</p>
              </span>
            ) : (
              "Confirm Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
