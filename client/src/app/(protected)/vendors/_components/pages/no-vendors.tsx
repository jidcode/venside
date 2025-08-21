import AddVendorSheet from "../modals/add-vendor";
import { BiSolidBuilding } from "react-icons/bi";

export default function NoVendorsPage() {
  return (
    <div className="flex flex-col items-center justify-center bg-primary text-secondary min-h-[80vh] text-center p-6 rounded-md">
      <BiSolidBuilding size={90} className="mb-6 text-neutral" />

      <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-neutral">
        No Vendors Found
      </h2>

      <p className="mb-6 max-w-lg">
        You currently have no vendors in your system. Add your first vendor to
        start managing your suppliers and inventory sources.
      </p>

      <div>
        <AddVendorSheet />
      </div>
    </div>
  );
}
