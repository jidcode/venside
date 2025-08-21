import { BiSolidCartAlt } from "react-icons/bi";
import AddPurchaseSheet from "../modals/add-purchase";

export default function NoPurchasesPage() {
  return (
    <div className="flex flex-col items-center justify-center bg-primary text-secondary min-h-[80vh] text-center p-6 rounded-md">
      <BiSolidCartAlt size={90} className="mb-6 text-neutral" />

      <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-neutral">
        No Purchases Record
      </h2>

      <p className="mb-6 max-w-lg">
        You currently have no purchases logged. Create your first purchase to
        start tracking your transactions and expenses.
      </p>

      <div className="flex gap-2">
        <AddPurchaseSheet />
      </div>
    </div>
  );
}
