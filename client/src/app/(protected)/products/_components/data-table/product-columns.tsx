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
    id: "image",
    header: "",
    cell: ({ row }) => {
      const product = row.original;
      const primaryImage =
        product.images?.find((img) => img.isPrimary) || product.images?.[0];

      return (
        <div className="relative w-12 h-12 rounded-md overflow-hidden border bg-muted">
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
    size: 64, // Adjust column width
  },
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <div className="max-w-60 min-w-40 h-full overflow-hidden">
          <p className="font-medium line-clamp-2 text-ellipsis break-words">
            {name}
          </p>
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
    header: "In Stock",
    enableSorting: true,
    cell: ({ row }) => {
      const quantity = row.getValue("totalQuantity") as number;

      if (quantity === 0) {
        return (
          <span className="text-destructive text-xs font-medium">
            Out of Stock
          </span>
        );
      }

      const restockLevel = row.original.restockLevel;
      const isLowStock = quantity <= restockLevel;

      return (
        <span
          className={`flex items-center gap-1 text-base font-medium ${
            isLowStock ? "text-destructive" : ""
          }`}
        >
          {quantity.toLocaleString()}
          {isLowStock && <span className="text-xs">(Low)</span>}
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
