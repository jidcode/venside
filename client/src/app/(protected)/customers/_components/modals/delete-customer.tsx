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
import { useCustomerService } from "@/core/services/customers";
import { AppError } from "@/core/lib/errors";
import { RiLoader2Fill } from "react-icons/ri";
import { CustomerParamProps } from "./edit-customer";
import { errorToast } from "@/core/lib/utils";

export default function DeleteCustomerDialog({ customer }: CustomerParamProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const { deleteCustomer } = useCustomerService();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await deleteCustomer(customer.id);

      if (response?.success) {
        setOpen(false);
        router.push("/customers");
      } else if (response?.error) {
        errorToast((response.error as AppError).message || "Request failed!");
      }
    } catch (error) {
      console.error("Failed to delete customer:", error);
      errorToast("Failed to delete customer. Please try again.");
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
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{customer.name}"? This action
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
                <p>Deleting Customer...</p>
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
