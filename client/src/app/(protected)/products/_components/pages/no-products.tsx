import { Button } from "@/core/components/ui/button";
import { PackagePlus } from "lucide-react";
import Link from "next/link";
import { PiPackageFill } from "react-icons/pi";

export default function NoProductsPage() {
  return (
    <div className="flex flex-col items-center justify-center bg-primary text-secondary min-h-[80vh] text-center p-6 rounded-md">
      <PiPackageFill size={90} className="mb-6 text-neutral" />

      <h2 className="text-2xl lg:text-3xl font-bold mb-4">No Products Found</h2>

      <p className="mb-6 max-w-md">
        You currently have no products in your inventory. Add your first product
        to start managing your stock and sales.
      </p>

      <Button variant="secondary" asChild>
        <Link href="/products/new" className="flex">
          <PackagePlus className="size-5" />
          <span>Add Product</span>
        </Link>
      </Button>
    </div>
  );
}
