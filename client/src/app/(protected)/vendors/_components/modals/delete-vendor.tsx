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
import { useVendorService } from "@/core/services/vendors";
import { AppError } from "@/core/lib/errors";
import { RiLoader2Fill } from "react-icons/ri";
import { VendorParamProps } from "./edit-vendor";
import { errorToast } from "@/core/lib/utils";

export default function DeleteVendorDialog({ vendor }: VendorParamProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const { deleteVendor } = useVendorService();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await deleteVendor(vendor.id);

      if (response?.success) {
        setOpen(false);
        router.push("/vendors");
      } else if (response?.error) {
        errorToast((response.error as AppError).message || "Request failed!");
      }
    } catch (error) {
      console.error("Failed to delete vendor:", error);
      errorToast("Failed to delete vendor. Please try again.");
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
          <DialogTitle>Delete Vendor</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{vendor.companyName}"? This action
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
                <p>Deleting Vendor...</p>
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
