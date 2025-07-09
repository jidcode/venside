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

export interface InventoryState {
  id: string;
  name: string;
  currency: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}
