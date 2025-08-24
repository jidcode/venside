import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { Clock, User, Calendar } from "lucide-react";
import { RecentSale } from "./interfaces";
import {
  useBestSellers,
  useRecentSales,
  useSalesTrend,
  useStockTrend,
} from "../_components/get-stats";
import useCurrencyFormat from "@/core/hooks/use-currency";
import { formatDistanceToNow } from "date-fns";

export default function ChartsComponent() {
  return (
    <div>
      {/* Top Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StockTrendChart />
        <SalesTrendChart />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BestSellingProducts />
        <RecentSales />
      </div>
    </div>
  );
}

function StockTrendChart() {
  const { data } = useStockTrend();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Stock Quantity Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data?.stockData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="quantity"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SalesTrendChart() {
  const { data } = useSalesTrend();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sales Performance
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data?.salesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Bar
            dataKey="revenue"
            fill="#10B981"
            name="Sales Revenue"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="profit"
            fill="#3B82F6"
            name="Net Profit"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BestSellingProducts() {
  const formatCurrency = useCurrencyFormat();
  const { data } = useBestSellers();

  const products = data?.bestSellers;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Best-Selling Products
      </h3>
      <div className="space-y-4">
        {products?.map((product, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-sm font-semibold text-gray-600">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {product.productName}
                </p>
                <p className="text-sm text-gray-500">
                  {product.totalSold} units sold
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatCurrency(product.revenue / 100)}
              </p>
              <p className="text-sm text-gray-500">Revenue</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentSales() {
  const formatCurrency = useCurrencyFormat();
  const { data: sales } = useRecentSales();

  const getStatusColor = (status: RecentSale["paymentStatus"]): string => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "partial":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {sales?.map((sale) => (
          <div
            key={sale.saleId}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{sale.saleNumber}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{sale.customerName}</span>
                  <span>•</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      sale.paymentStatus
                    )}`}
                  >
                    {sale.paymentStatus.charAt(0).toUpperCase() +
                      sale.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatCurrency(sale.totalAmount / 100)}
              </p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>
                    {formatDistanceToNow(sale.saleDate, {
                      addSuffix: true,
                      includeSeconds: false,
                    }).replace(/^about /, "")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View All Sales
        </button>
      </div>
    </div>
  );
}
