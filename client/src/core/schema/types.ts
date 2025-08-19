export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  inventories: InventoryState[];
}

export interface AuthResponse {
  userId: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  token: string;
  csrfToken: string;
  inventories: InventoryState[];
}

export interface CurrencyState {
  id: string;
  name: string;
  code: string;
  locale: string;
  inventoryId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryState {
  id: string;
  name: string;
  userId: string;
  currency: CurrencyState;
  createdAt?: string;
  updatedAt?: string;
}

export enum StorageType {
  Units = "units",
  Slots = "slots",
  Boxes = "boxes",
  Shelves = "shelves",
  Racks = "racks",
  Pallets = "pallets",
  Sections = "sections",
  Containers = "containers",
}

export interface WarehouseState {
  id: string;
  name: string;
  location: string;
  capacity: number;
  storageType: StorageType;
  isMain: boolean;
  manager: string;
  phone: string;
  email: string;
  inventoryId: string;
  stockItems: StockItemState[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StockItemState {
  product: ProductState;
  quantityInStock: number;
}

export interface ProductState {
  id: string;
  name: string;
  code: string;
  sku: string;
  brand: string;
  model: string;
  description: string;
  totalQuantity: number;
  totalStock: number;
  restockLevel: number;
  optimalLevel: number;
  costPrice: number;
  sellingPrice: number;
  inventoryId: string;
  categories: ProductCategoryState[];
  storages: StorageState[];
  images: ProductImageState[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StorageState {
  warehouse: WarehouseState;
  quantityInStock: number;
}

export interface ProductImageState {
  id: string;
  url: string;
  name: string;
  fileKey: string;
  isPrimary: boolean;
  productId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImageRequest {
  id: string;
  url: string;
  fileKey: string;
}

export interface ProductCategoryState {
  id: string;
  name: string;
  inventoryId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerState {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  customerType: "individual" | "business";
  inventoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleState {
  id: string;
  saleNumber: string;
  customerId: string | null;
  customerName: string;
  saleDate: string;
  totalAmount: number;
  balance: number;
  paymentStatus: "pending" | "partial" | "paid" | "overdue" | "cancelled";
  discountAmount: number;
  discountPercent: number;
  inventoryId: string;
  createdAt: string;
  updatedAt: string;
  items?: SaleItemState[];
}

export interface SaleItemState {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  product?: ProductState;
}
