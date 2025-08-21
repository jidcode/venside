"use client";

import ErrorPage from "@/app/error";
import { CustomLoader } from "@/core/components/elements/loader";
import { getAllPurchases } from "@/core/services/purchases";
import NoPurchasesPage from "./_components/pages/no-purchases";
import { purchaseColumns } from "./_components/data-table/purchase-columns";
import { PurchaseTable } from "./_components/data-table/purchase-table";
import AddPurchaseSheet from "./_components/modals/add-purchase";

export default function PurchasesPage() {
  const { data: purchases, isLoading, error } = getAllPurchases();
  const totalCount = purchases?.length;

  if (error) return <ErrorPage />;
  if (isLoading) return <CustomLoader />;
  if (totalCount === 0) return <NoPurchasesPage />;

  return (
    <>
      <PageHeader totalCount={totalCount} />

      <div className="container mx-auto py-4">
        {purchases && (
          <PurchaseTable columns={purchaseColumns} data={purchases} />
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
          Purchases
        </h1>
        <span className="bg-muted text-foreground min-w-8 p-1 rounded-lg grid place-content-center">
          {totalCount}
        </span>
      </div>

      <div>
        <AddPurchaseSheet />
      </div>
    </div>
  );
}
