"use client";

import { VendorState } from "@/core/schema/types";
import { ColumnDef } from "@tanstack/react-table";
import { RiArrowRightUpLine } from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const vendorColumns: ColumnDef<VendorState>[] = [
  {
    accessorKey: "companyName",
    header: "Company Name",
    enableSorting: true,
    cell: ({ row }) => {
      const companyName = row.getValue("companyName") as string;
      return (
        <div className="max-w-60 min-w-40 h-full overflow-hidden">
          <p className="font-medium line-clamp-2 text-ellipsis break-words">
            {companyName}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "contactName",
    header: "Contact Name",
    enableSorting: true,
    cell: ({ row }) => {
      const contactName = row.getValue("contactName") as string | null;
      return contactName ? (
        <div className="max-w-60 min-w-40 h-full overflow-hidden">
          <p className="line-clamp-2 text-ellipsis break-words">
            {contactName}
          </p>
        </div>
      ) : (
        <span className="text-neutral">N/A</span>
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
    accessorKey: "website",
    header: "Website",
    enableSorting: true,
    cell: ({ row }) => {
      const website = row.getValue("website") as string | null;
      return website ? (
        <div className="max-w-60 min-w-40 h-full overflow-hidden">
          <p className="line-clamp-2 text-ellipsis break-words">{website}</p>
        </div>
      ) : (
        <span className="text-neutral">N/A</span>
      );
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
          <Link href={`/vendors/${row.original.id}`}>
            <RiArrowRightUpLine className="h-5 w-5" />
          </Link>
        </button>
      );
    },
  },
];
