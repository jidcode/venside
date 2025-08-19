"use client";

import { SaleState } from "@/core/schema/types";
import { ColumnDef } from "@tanstack/react-table";
import { RiArrowRightUpLine } from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const saleColumns: ColumnDef<SaleState>[] = [
  {
    accessorKey: "saleNumber",
    header: "Sale #",
    enableSorting: true,
    cell: ({ row }) => {
      const saleNumber = row.getValue("saleNumber") as string;
      return (
        <div className="max-w-40 min-w-30">
          <p className="font-medium">{saleNumber}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    enableSorting: true,
    cell: ({ row }) => {
      const customerName = row.getValue("customerName") as string;
      return (
        <div className="max-w-60 min-w-40">
          <p className="line-clamp-1">{customerName}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "saleDate",
    header: "Date",
    enableSorting: true,
    cell: ({ row }) => {
      const date = new Date(row.getValue("saleDate"));
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
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
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
          <Link href={`/sales/${row.original.id}`}>
            <RiArrowRightUpLine className="h-5 w-5" />
          </Link>
        </button>
      );
    },
  },
];
