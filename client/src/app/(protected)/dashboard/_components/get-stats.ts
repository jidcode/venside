import useQuery from "@/core/hooks/use-query";
import useInventoryStore from "@/core/stores/inventory-store";
import {
  BestSellers,
  InventoryStats,
  RecentSale,
  SalesTrend,
  StockTrend,
} from "../sample/interfaces";

export function useInventoryStats(timeRange: string = "1Y") {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<InventoryStats>(
    `/inventories/${inventoryId}/statistics?timeRange=${timeRange}`
  );
}

export function useStockTrend(timeRange: string = "1Y") {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<StockTrend>(
    `/inventories/${inventoryId}/statistics/stock-trend?timeRange=${timeRange}`
  );
}

export function useSalesTrend(timeRange: string = "6M") {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<SalesTrend>(
    `/inventories/${inventoryId}/statistics/sales-trend?timeRange=${timeRange}`
  );
}

export function useBestSellers(timeRange: string = "1Y", limit: number = 10) {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<BestSellers>(
    `/inventories/${inventoryId}/statistics/best-sellers?timeRange=${timeRange}&limit=${limit}`
  );
}

export function useRecentSales(limit: number = 10) {
  const inventoryId = useInventoryStore((state) => state.currentInventory?.id);
  return useQuery<RecentSale[]>(
    `/inventories/${inventoryId}/statistics/recent-sales?limit=${limit}`
  );
}
