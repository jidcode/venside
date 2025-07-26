"use client";

import ErrorPage from "@/app/error";
import { CustomLoader } from "@/core/components/elements/loader";
import { getAllWarehouses } from "@/core/services/warehouses";
import NoWarehousesPage from "./_components/pages/no-warehouses";
import { warehouseColumns } from "./_components/data-table/warehouse-columns";
import { WarehouseTable } from "./_components/data-table/warehouse-table";
import AddWarehouseSheet from "./_components/forms/add-warehouse";

export default function WarehousesPage() {
  const { data: warehouses, isLoading, error } = getAllWarehouses();
  const totalCount = warehouses?.length;

  console.log(warehouses);

  if (error) return <ErrorPage />;
  if (isLoading) return <CustomLoader />;
  if (totalCount == 0) return <NoWarehousesPage />;

  return (
    <>
      <PageHeader totalCount={totalCount} />

      <div className="container mx-auto py-4">
        {warehouses && (
          <WarehouseTable columns={warehouseColumns} data={warehouses} />
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
          Warehouses
        </h1>
        <span className="bg-muted text-foreground min-w-8 p-1 rounded-lg grid place-content-center">
          {totalCount}
        </span>
      </div>

      <div>
        <AddWarehouseSheet />
      </div>
    </div>
  );
}
