"use client";

import { PurchaseState } from "@/core/schema/types";
import { ColumnDef } from "@tanstack/react-table";
import { RiArrowRightUpLine } from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const purchaseColumns: ColumnDef<PurchaseState>[] = [
  {
    accessorKey: "purchaseNumber",
    header: "Purchase #",
    enableSorting: true,
    cell: ({ row }) => {
      const purchaseNumber = row.getValue("purchaseNumber") as string;
      return (
        <div className="max-w-40 min-w-30">
          <p className="font-medium">{purchaseNumber}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "vendorName",
    header: "Vendor",
    enableSorting: true,
    cell: ({ row }) => {
      const vendorName = row.getValue("vendorName") as string;
      return (
        <div className="max-w-60 min-w-40">
          <p className="line-clamp-1">{vendorName}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "purchaseDate",
    header: "Date",
    enableSorting: true,
    cell: ({ row }) => {
      const date = new Date(row.getValue("purchaseDate"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    enableSorting: true,
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return (
        <div className="max-w-40 min-w-30">
          <p>${(amount / 100).toFixed(2)}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      return <span className="capitalize">{status.toLowerCase()}</span>;
    },
  },
  {
    accessorKey: "purchaseStatus",
    header: "Purchase Status",
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue("purchaseStatus") as string;
      return <span className="capitalize">{status.toLowerCase()}</span>;
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
          <Link href={`/purchases/${row.original.id}`}>
            <RiArrowRightUpLine className="h-5 w-5" />
          </Link>
        </button>
      );
    },
  },
];
