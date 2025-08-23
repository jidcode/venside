import {
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  Activity,
  Star,
} from "lucide-react";
import { StatCardProps, StatsComponentProps } from "./interfaces";

// Main Stats Component
export default function StatsComponent({
  totalStockQuantity,
  totalInventoryValue,
  totalTransactions,
  netSales,
  grossSales,
  topProductSales,
  formatCurrency,
  formatNumber,
}: StatsComponentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Stock Quantity"
        value={formatNumber(totalStockQuantity)}
        icon={Package}
        trend="+5.2%"
        color="blue"
      />
      <StatCard
        title="Total Inventory Value"
        value={formatCurrency(totalInventoryValue)}
        icon={DollarSign}
        trend="+12.3%"
        color="green"
      />
      <StatCard
        title="Total Transactions"
        value={formatNumber(totalTransactions)}
        icon={Activity}
        trend="+8.7%"
        color="purple"
      />
      <StatCard
        title="Net Sales"
        value={formatCurrency(netSales)}
        icon={TrendingUp}
        trend="+15.4%"
        color="indigo"
      />
      <StatCard
        title="Gross Sales"
        value={formatCurrency(grossSales)}
        icon={ShoppingCart}
        trend="+11.2%"
        color="orange"
      />
      <StatCard
        title="Top Product Sales"
        value={formatNumber(topProductSales)}
        icon={Star}
        trend="+22.1%"
        color="red"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
}: StatCardProps) {
  const colorClasses: Record<NonNullable<StatCardProps["color"]>, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600",
    red: "bg-red-50 border-red-200 text-red-600",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{trend}</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
