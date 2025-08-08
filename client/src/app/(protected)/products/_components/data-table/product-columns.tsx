"use client";

import { ProductState } from "@/core/schema/types";
import { ColumnDef } from "@tanstack/react-table";
import { RiArrowRightUpLine } from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import useCurrencyFormat from "@/core/hooks/use-currency";
import Image from "next/image";

export const productColumns: ColumnDef<ProductState>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
    ),
    size: 40,
  },
  {
    id: "image",
    header: "",
    cell: ({ row }) => {
      const product = row.original;
      const primaryImage =
        product.images?.find((img) => img.isPrimary) || product.images?.[0];

      return (
        <div className="relative w-16 h-16 rounded-md overflow-hidden border bg-muted">
          <Image
            src={primaryImage?.url || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      );
    },
    enableSorting: false,
    size: 64,
  },
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const brand = row.original.brand;
      const model = row.original.model;

      return (
        <div className="max-w-60 min-w-40 h-full overflow-hidden">
          <p className="font-medium line-clamp-2 text-ellipsis break-words">
            {name}
          </p>
          {(brand || model) && (
            <p className="text-xs mt-0.5 text-neutral line-clamp-1">
              {[brand, model].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "code",
    header: "Code",
    enableSorting: true,
    cell: ({ row }) => {
      const code = row.getValue("code") as string | null;
      return code ? (
        <div className="max-w-40">
          <p className="line-clamp-1 text-ellipsis">{code}</p>
        </div>
      ) : (
        <span className="text-neutral">N/A</span>
      );
    },
  },
  {
    accessorKey: "sku",
    header: "SKU",
    enableSorting: true,
    cell: ({ row }) => {
      const sku = row.getValue("sku") as string | null;
      return sku ? (
        <div className="max-w-40">
          <p className="line-clamp-1 text-ellipsis">{sku}</p>
        </div>
      ) : (
        <span className="text-neutral">N/A</span>
      );
    },
  },
  {
    accessorKey: "totalQuantity",
    header: "Total Qty",
    enableSorting: true,
    cell: ({ row }) => {
      const quantity = row.getValue("totalQuantity") as number;

      if (quantity === 0) {
        return (
          <span className="text-red-800 text-xs font-semibold bg-red-100 px-2 py-1 rounded-full">
            Out of Stock
          </span>
        );
      }

      const restockLevel = row.original.restockLevel;
      const isLowStock = quantity <= restockLevel;

      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full gap-1 font-semibold  ${
            isLowStock
              ? "bg-red-100 text-red-800 dark:text-red-300 dark:bg-red-800/20"
              : "bg-green-100 text-green-800 dark:text-green-300 dark:bg-green-800/20"
          }`}
        >
          {quantity.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "sellingPrice",
    header: "Price",
    enableSorting: true,
    cell: ({ row }) => {
      const format = useCurrencyFormat();
      const price = row.getValue("sellingPrice") as number;
      return <span>{format(price / 100)}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    enableSorting: true,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return formatDistanceToNow(date, {
        addSuffix: true,
        includeSeconds: false,
      }).replace(/^about /, "");
    },
  },
  {
    id: "view",
    header: "",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <button className="hover:text-accent">
          <Link href={`/products/${row.original.id}`}>
            <RiArrowRightUpLine className="h-5 w-5" />
          </Link>
        </button>
      );
    },
  },
];
