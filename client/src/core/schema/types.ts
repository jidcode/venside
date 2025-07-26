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
  manager: string;
  contact: string;
  inventoryId: string;
  stockItems: StockItemState[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StockItemState {
  product: ProductState;
  stockQuantity: number;
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

export interface StorageState {
  warehouse: WarehouseState;
  stockQuantity: number;
}
