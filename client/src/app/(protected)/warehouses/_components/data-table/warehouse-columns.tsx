"use client";

import { WarehouseState } from "@/core/schema/types";
import { ColumnDef } from "@tanstack/react-table";
import { RiArrowRightUpLine } from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const warehouseColumns: ColumnDef<WarehouseState>[] = [
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
    accessorKey: "location",
    header: "Location",
    enableSorting: true,
    cell: ({ row }) => {
      const location = row.getValue("location") as string | null;
      return location ? (
        <div className="max-w-60 min-w-40 h-full overflow-hidden">
          <p className="line-clamp-2 text-ellipsis break-words">{location}</p>
        </div>
      ) : (
        <span className="text-neutral">N/A</span>
      );
    },
  },

  {
    accessorKey: "capacity",
    header: "Capacity",
    enableSorting: true,
    cell: ({ row }) => {
      const capacity = row.getValue("capacity") as number | null;
      const storage = row.original.storageType as string | null;

      return capacity === 0 ? (
        <span className="text-neutral">N/A</span>
      ) : (
        <span className="flex items-center gap-1">
          <p>{capacity?.toLocaleString()}</p>
          <p className="text-xs"> {storage}</p>
        </span>
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
          <Link href={`/warehouses/${row.original.id}`}>
            <RiArrowRightUpLine className="h-5 w-5" />
          </Link>
        </button>
      );
    },
  },
];
