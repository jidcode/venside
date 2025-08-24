"use client";

import useInventoryStore from "../stores/inventory-store";

export default function useCurrencyFormat() {
  const currency = useInventoryStore(
    (state) => state.currentInventory?.currency
  );
  const currencyConfig = currency
    ? { locale: currency.locale, code: currency.code }
    : undefined;

  return (amount: number) => formatCurrency(amount, currencyConfig);
}

export function formatCurrency(
  amount: number,
  currencyConfig?: {
    locale?: string;
    code?: string;
  }
): string {
  const locale = currencyConfig?.locale || "en-US";
  const currency = currencyConfig?.code || "USD";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
