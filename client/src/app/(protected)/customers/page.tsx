"use client";

import ErrorPage from "@/app/error";
import { CustomLoader } from "@/core/components/elements/loader";
import { getAllCustomers } from "@/core/services/customers";
import NoCustomersPage from "./_components/pages/no-customers";
import { customerColumns } from "./_components/data-table/customer-columns";
import { CustomerTable } from "./_components/data-table/customer-table";
import AddCustomerSheet from "./_components/modals/add-customer";

export default function CustomersPage() {
  const { data: customers, isLoading, error } = getAllCustomers();
  const totalCount = customers?.length;

  if (error) return <ErrorPage />;
  if (isLoading) return <CustomLoader />;
  if (totalCount == 0) return <NoCustomersPage />;

  return (
    <>
      <PageHeader totalCount={totalCount} />

      <div className="container mx-auto py-4">
        {customers && (
          <CustomerTable columns={customerColumns} data={customers} />
        )}
      </div>
    </>
  );
}

function PageHeader({ totalCount }: { totalCount: number | undefined }) {
  return (
    <div className="flex items-center justify-between h-full bg-primary p-4 rounded-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-xl lg:text-2xl text-secondary font-medium">
          Customers
        </h1>
        <span className="bg-muted text-foreground min-w-8 p-1 rounded-lg grid place-content-center">
          {totalCount}
        </span>
      </div>

      <div>
        <AddCustomerSheet />
      </div>
    </div>
  );
}
