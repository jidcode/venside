import AddCustomerSheet from "../modals/add-customer";
import { BiSolidUser } from "react-icons/bi";

export default function NoCustomersPage() {
  return (
    <div className="flex flex-col items-center justify-center bg-primary text-secondary min-h-[80vh] text-center p-6 rounded-md">
      <BiSolidUser size={90} className="mb-6 text-neutral" />

      <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-neutral">
        No Customers Found
      </h2>

      <p className="mb-6 max-w-lg">
        You currently have no customers in your system. Add your first customer
        to start managing your clients and sales.
      </p>

      <div>
        <AddCustomerSheet />
      </div>
    </div>
  );
}
