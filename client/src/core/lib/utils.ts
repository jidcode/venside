import { clsx, type ClassValue } from "clsx";
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

export function formatCurrency(
  amount: number,
  locale: string = "en-GH",
  currency: string = "GHS"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatNumber(value: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale).format(value);
}
