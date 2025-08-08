import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date | string): string => {
  if (date instanceof Date) {
    return date.toLocaleDateString();
  } else if (typeof date === "string") {
    return new Date(date).toLocaleDateString();
  }
  return "Invalid Date";
};

export function formatNumber(value: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale).format(value);
}

export const successToast = (message: string) =>
  toast.success(message, {
    className: "bg-green-100 text-green-800 border border-green-300",
  });

export const errorToast = (message: string) =>
  toast.error(message, {
    className: "bg-red-100 text-red-800 border border-red-300",
  });
