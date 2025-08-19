"use client";

import ErrorPage from "@/app/error";
import { CustomLoader } from "@/core/components/elements/loader";
import { getAllSales } from "@/core/services/sales";
import NoSalesPage from "./_components/pages/no-sales";
import { saleColumns } from "./_components/data-table/sale-columns";
import { SaleTable } from "./_components/data-table/sale-table";
import AddSaleSheet from "./_components/modals/add-sale";
import NewSaleSheet from "./_components/modals/new-sale";

export default function SalesPage() {
  const { data: sales, isLoading, error } = getAllSales();
  const totalCount = sales?.length;

  if (error) return <ErrorPage />;
  if (isLoading) return <CustomLoader />;
  if (totalCount === 0) return <NoSalesPage />;

  return (
    <>
      <PageHeader totalCount={totalCount} />

      <div className="container mx-auto py-4">
        {sales && <SaleTable columns={saleColumns} data={sales} />}
      </div>
    </>
  );
}

function PageHeader({ totalCount }: { totalCount: number | undefined }) {
  return (
    <div className="flex items-center justify-between h-full bg-primary p-4 rounded-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-xl lg:text-2xl text-secondary font-medium">
          Sales
        </h1>
        <span className="bg-muted text-foreground min-w-8 p-1 rounded-lg grid place-content-center">
          {totalCount}
        </span>
      </div>

      <div>
        <NewSaleSheet />
      </div>
    </div>
  );
}
