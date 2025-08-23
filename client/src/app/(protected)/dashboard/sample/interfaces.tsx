import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
}

export interface StatsComponentProps {
  totalStockQuantity: number;
  totalInventoryValue: number;
  totalTransactions: number;
  netSales: number;
  grossSales: number;
  topProductSales: number;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
}

export interface StockData {
  month: string;
  quantity: number;
}

export interface SalesData {
  month: string;
  net: number;
  gross: number;
}

export interface Product {
  name: string;
  sales: number;
  value: number;
  color: string;
}

export interface TransactionData {
  day: string;
  count: number;
}

export interface Sale {
  customer: string;
  product: string;
  amount: number;
  status: "completed" | "pending" | "processing";
  paymentMethod: "credit_card" | "cash";
  time: string;
}

export interface ChartsComponentProps {
  stockTrend: StockData[];
  salesTrend: SalesData[];
  bestSellingProducts: Product[];
  transactionData: TransactionData[];
  recentSales: Sale[];
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
}
