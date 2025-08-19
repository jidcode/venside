"use client";

import { CustomerState } from "@/core/schema/types";
import { ColumnDef } from "@tanstack/react-table";
import { RiArrowRightUpLine } from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const customerColumns: ColumnDef<CustomerState>[] = [
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
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
    cell: ({ row }) => {
      const email = row.getValue("email") as string | null;
      return email ? (
        <div className="max-w-60 min-w-40 h-full overflow-hidden">
          <p className="line-clamp-2 text-ellipsis break-words">{email}</p>
        </div>
      ) : (
        <span className="text-neutral">N/A</span>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    enableSorting: true,
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string | null;
      return phone ? (
        <div className="max-w-40 min-w-30">
          <p>{phone}</p>
        </div>
      ) : (
        <span className="text-neutral">N/A</span>
      );
    },
  },
  {
    accessorKey: "customerType",
    header: "Type",
    enableSorting: true,
    cell: ({ row }) => {
      const type = row.getValue("customerType") as string;
      return <span className="capitalize">{type.toLowerCase()}</span>;
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
    accessorKey: "updatedAt",
    header: "Updated",
    enableSorting: true,
    cell: ({ row }) => {
      const date = new Date(row.getValue("updatedAt"));
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
          <Link href={`/customers/${row.original.id}`}>
            <RiArrowRightUpLine className="h-5 w-5" />
          </Link>
        </button>
      );
    },
  },
];
