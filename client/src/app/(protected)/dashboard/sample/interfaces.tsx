import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: any;
  icon: LucideIcon;
  trend?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
}

export interface InventoryStats {
  totalStockQuantity: number;
  totalInventoryValue: number | undefined;
  grossSalesRevenue: number;
  netProfit: number;
  startDate: string;
  endDate: string;
}

interface StockData {
  month: string;
  quantity: number;
}

export interface StockTrend {
  startDate: string;
  endDate: string;
  stockData: StockData[];
}

interface SalesData {
  month: string;
  revenue: number;
  profit: number;
}

export interface SalesTrend {
  startDate: string;
  endDate: string;
  salesData: SalesData[];
}

interface BestSellingProduct {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
  imageUrl: string;
}

export interface BestSellers {
  startDate: string;
  endDate: string;
  bestSellers: BestSellingProduct[];
}

export interface RecentSale {
  saleId: string;
  saleNumber: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
  saleDate: string;
}
