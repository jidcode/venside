"use client";

import React, { useState } from "react";
import ChartsComponent from "./charts";
import StatsComponent from "./stats";

// Interfaces
interface StockData {
  month: string;
  quantity: number;
}

interface SalesData {
  month: string;
  net: number;
  gross: number;
}

interface Product {
  name: string;
  sales: number;
  value: number;
  color: string;
}

interface TransactionData {
  day: string;
  count: number;
}

interface Sale {
  customer: string;
  product: string;
  amount: number;
  status: "completed" | "pending" | "processing";
  paymentMethod: "credit_card" | "cash";
  time: string;
}

interface DashboardData {
  totalStockQuantity: number;
  totalInventoryValue: number;
  totalTransactions: number;
  netSales: number;
  grossSales: number;
  stockTrend: StockData[];
  salesTrend: SalesData[];
  bestSellingProducts: Product[];
  transactionData: TransactionData[];
  recentSales: Sale[];
}

export default function SampleDashboard() {
  // Sample data - in a real app, this would come from your API
  const [dashboardData] = useState<DashboardData>({
    totalStockQuantity: 12847,
    totalInventoryValue: 485920,
    totalTransactions: 1247,
    netSales: 298750,
    grossSales: 342100,

    stockTrend: [
      { month: "Jan", quantity: 11200 },
      { month: "Feb", quantity: 11800 },
      { month: "Mar", quantity: 12100 },
      { month: "Apr", quantity: 12500 },
      { month: "May", quantity: 12300 },
      { month: "Jun", quantity: 12847 },
    ],

    salesTrend: [
      { month: "Jan", net: 245000, gross: 280000 },
      { month: "Feb", net: 267000, gross: 305000 },
      { month: "Mar", net: 289000, gross: 325000 },
      { month: "Apr", net: 278000, gross: 318000 },
      { month: "May", net: 285000, gross: 330000 },
      { month: "Jun", net: 298750, gross: 342100 },
    ],

    bestSellingProducts: [
      {
        name: "Wireless Headphones",
        sales: 1250,
        value: 156250,
        color: "#3B82F6",
      },
      { name: "Smart Watch", sales: 980, value: 147000, color: "#10B981" },
      { name: "Laptop Stand", sales: 750, value: 93750, color: "#F59E0B" },
      { name: "USB-C Cable", sales: 650, value: 32500, color: "#EF4444" },
      { name: "Bluetooth Speaker", sales: 420, value: 63000, color: "#8B5CF6" },
    ],

    transactionData: [
      { day: "Mon", count: 45 },
      { day: "Tue", count: 52 },
      { day: "Wed", count: 38 },
      { day: "Thu", count: 61 },
      { day: "Fri", count: 49 },
      { day: "Sat", count: 67 },
      { day: "Sun", count: 33 },
    ],

    recentSales: [
      {
        customer: "John Smith",
        product: "Wireless Headphones",
        amount: 125,
        status: "completed",
        paymentMethod: "credit_card",
        time: "2 min ago",
      },
      {
        customer: "Sarah Johnson",
        product: "Smart Watch",
        amount: 150,
        status: "processing",
        paymentMethod: "credit_card",
        time: "5 min ago",
      },
      {
        customer: "Mike Davis",
        product: "Laptop Stand",
        amount: 125,
        status: "completed",
        paymentMethod: "cash",
        time: "12 min ago",
      },
      {
        customer: "Emily Wilson",
        product: "USB-C Cable",
        amount: 50,
        status: "pending",
        paymentMethod: "credit_card",
        time: "18 min ago",
      },
      {
        customer: "David Brown",
        product: "Bluetooth Speaker",
        amount: 150,
        status: "completed",
        paymentMethod: "credit_card",
        time: "25 min ago",
      },
    ],
  });

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inventory Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor your inventory performance and sales metrics in real-time
          </p>
        </div>

        {/* Stats Section */}
        <StatsComponent
          totalStockQuantity={dashboardData.totalStockQuantity}
          totalInventoryValue={dashboardData.totalInventoryValue}
          totalTransactions={dashboardData.totalTransactions}
          netSales={dashboardData.netSales}
          grossSales={dashboardData.grossSales}
          topProductSales={dashboardData.bestSellingProducts[0].sales}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />

        {/* Charts Section */}
        <ChartsComponent
          stockTrend={dashboardData.stockTrend}
          salesTrend={dashboardData.salesTrend}
          bestSellingProducts={dashboardData.bestSellingProducts}
          transactionData={dashboardData.transactionData}
          recentSales={dashboardData.recentSales}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />
      </div>
    </div>
  );
}
