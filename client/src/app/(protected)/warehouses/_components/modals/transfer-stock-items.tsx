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
import { PackageX, PackageCheck } from "lucide-react";
import { AppError } from "@/core/lib/errors";
import SelectProducts from "../forms/select-products";
import { WarehouseState } from "@/core/schema/types";
import { TbPackageExport } from "react-icons/tb";

export default function TransferProductsSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          className="bg-accent text-foreground hover:bg-cyan-200"
        >
          <TbPackageExport className="size-5" />
          <span>Transfer Stock</span>
        </Button>
      </SheetTrigger>

      <SheetTitle className="sr-only">
        Transfer Stock Between Warehouses
      </SheetTitle>

      <SheetContent className="flex flex-col bg-primary border-none h-full min-w-full md:min-w-1/2">
        {/* <TransferStockItems 
          sourceWarehouseId={sourceWarehouseId}
          warehouses={warehouses}
          closeSheet={handleClose} 
        /> */}
        <p>TRANSFER PRODUCTS</p>
      </SheetContent>
    </Sheet>
  );
}

// interface TransferStockItemsProps {
//   sourceWarehouseId: string;
//   warehouses: Warehouse[];
//   closeSheet: () => void;
// }

// function TransferStockItems({
//   sourceWarehouseId,
//   warehouses,
//   closeSheet
// }: TransferStockItemsProps) {
//   const [errorResponse, setErrorResponse] = useState<string | null>(null);
//   const { transferStockBetweenWarehouses } = useWarehouseService();

//   const form = useForm<WarehouseTransferRequest>({
//     resolver: zodResolver(warehouseTransferSchema),
//     defaultValues: {
//       stockItems: [],
//       destinationWarehouseId: "",
//     },
//   });

//   const action: SubmitHandler<WarehouseTransferRequest> = async (formData) => {
//     setErrorResponse(null);
//     console.log(formData);

//     try {
//       const response = await transferStockBetweenWarehouses(
//         sourceWarehouseId,
//         formData.destinationWarehouseId,
//         formData.stockItems
//       );
//       console.log(response);

//       if (response?.success) {
//         form.reset();
//         closeSheet();
//       } else if (response?.error) {
//         setErrorResponse(
//           (response.error as AppError).message || "Failed to transfer products"
//         );
//       }
//     } catch (error) {
//       setErrorResponse(
//         error instanceof Error ? error.message : "An unexpected error occurred"
//       );
//     }
//   };

//   const isSubmitting = form.formState.isSubmitting;
//   const serverErrors = parseServerErrors(errorResponse);
//   const selectedCount = form.watch("stockItems")?.length || 0;
//   const destinationWarehouseId = form.watch("destinationWarehouseId");

//   return (
//     <form onSubmit={form.handleSubmit(action)}>
//       <Card className="border-none shadow-none text-foreground p-0">
//         <CardHeader className="sticky top-0 bg-accent/5">
//           <div className="flex items-center justify-between p-6">
//             <CardTitle className="text-xl">Transfer Stock</CardTitle>

//             <div className="flex items-center gap-2">
//               <Button
//                 type="submit"
//                 disabled={isSubmitting || selectedCount === 0 || !destinationWarehouseId}
//                 variant="default"
//                 className="gap-2"
//               >
//                 {isSubmitting ? (
//                   <span className="flex items-center gap-1 text-sm">
//                     <RiLoader2Fill className="h-4 w-4 animate-spin" />
//                     <p>Transferring...</p>
//                   </span>
//                 ) : (
//                   <span className="flex items-center gap-2">
//                     <PackageCheck className="size-4" />
//                     {selectedCount > 0
//                       ? `Transfer ${selectedCount} Item${selectedCount !== 1 ? "s" : ""}`
//                       : "Transfer Items"}
//                   </span>
//                 )}
//               </Button>

//               <Button
//                 type="button"
//                 onClick={closeSheet}
//                 disabled={isSubmitting}
//                 className="min-w-24 px-4 h-10 bg-accent/5 border border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
//                 variant="secondary"
//               >
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="overflow-y-auto p-6 space-y-6">
//           {errorResponse && <DisplayErrors serverErrors={serverErrors} />}

//           <SelectWarehouse
//             form={form}
//             name="destinationWarehouseId"
//             label="Destination Warehouse"
//             warehouses={warehouses.filter(w => w.id !== sourceWarehouseId)}
//             placeholder="Select destination warehouse"
//           />

//           <SelectProducts
//             form={form}
//             warehouseId={sourceWarehouseId}
//             showCurrentStock={true}
//           />
//         </CardContent>
//       </Card>
//     </form>
//   );
// }
