"use client";

import ErrorPage from "@/app/error";
import { CustomLoader } from "@/core/components/elements/loader";
import { getAllVendors } from "@/core/services/vendors";
import NoVendorsPage from "./_components/pages/no-vendors";
import { vendorColumns } from "./_components/data-table/vendor-columns";
import { VendorTable } from "./_components/data-table/vendor-table";
import AddVendorSheet from "./_components/modals/add-vendor";

export default function VendorsPage() {
  const { data: vendors, isLoading, error } = getAllVendors();
  const totalCount = vendors?.length;

  if (error) return <ErrorPage />;
  if (isLoading) return <CustomLoader />;
  if (totalCount == 0) return <NoVendorsPage />;

  return (
    <>
      <PageHeader totalCount={totalCount} />

      <div className="container mx-auto py-4">
        {vendors && <VendorTable columns={vendorColumns} data={vendors} />}
      </div>
    </>
  );
}

function PageHeader({ totalCount }: { totalCount: number | undefined }) {
  return (
    <div className="flex items-center justify-between h-full bg-primary p-4 rounded-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-xl lg:text-2xl text-secondary font-medium">
          Vendors
        </h1>
        <span className="bg-muted text-foreground min-w-8 p-1 rounded-lg grid place-content-center">
          {totalCount}
        </span>
      </div>

      <div>
        <AddVendorSheet />
      </div>
    </div>
  );
}
