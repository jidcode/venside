"use client";

import ErrorPage from "@/app/error";
import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { CustomLoader } from "@/core/components/elements/loader";
import { getAllProducts } from "@/core/services/products";
import { productColumns } from "./_components/data-table/product-columns";
import { ProductTable } from "./_components/data-table/product-table";
import { Button } from "@/core/components/ui/button";
import NoProductsPage from "./_components/pages/no-products";

export default function ProductsPage() {
  const { data: products, isLoading, error } = getAllProducts();
  const totalCount = products?.length;

  if (error) return <ErrorPage />;
  if (isLoading) return <CustomLoader />;
  if (totalCount == 0) return <NoProductsPage />;

  return (
    <>
      <PageHeader totalCount={totalCount} />

      <div className="container mx-auto py-4">
        {products && <ProductTable columns={productColumns} data={products} />}
      </div>
    </>
  );
}

function PageHeader({ totalCount }: { totalCount: number | undefined }) {
  return (
    <div className="flex items-center justify-between h-full bg-primary p-4 rounded-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-xl lg:text-2xl text-secondary font-medium">
          Products
        </h1>
        <span className="bg-muted text-foreground min-w-8 p-1 rounded-lg grid place-content-center">
          {totalCount}
        </span>
      </div>

      <Button variant="secondary" asChild>
        <Link href="/products/new">
          <PackagePlus className="size-5" />
          <span>Add Product</span>
        </Link>
      </Button>
    </div>
  );
}
