// Re-export all centralized types
export * from './post-approval'
export * from './quotation'
export * from './organizational-chart'
export * from './media-file'
export * from './news-form'
export * from './customers'
export * from './work-schedule'

// Contact Type
export interface Contact {
  id: string
  name: string
  email: string
  phone_number?: string
  content?: string
  created_at?: string
}

// Common Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  status?: number;
  message: string;
  data?: unknown;
}

// Order Types — matches backend Order/OrderItem shape (POST /api/v1.0/order)
export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string | null;
  product_name?: string;
  product_sku?: string | null;
  product_image?: string | null;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  specifications?: Record<string, unknown> | null;
  created_at?: string | null;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id?: string;
  code?: string;
  customer_name?: string;
  customer_email?: string | null;
  customer_phone?: string;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_zip?: string | null;
  subtotal?: number | null;
  shipping_fee?: number | null;
  tax?: number | null;
  total?: number | null;
  payment_method?: 'cod' | 'bank_transfer' | 'card' | null;
  payment_status?: string | null;
  payment_id?: string | null;
  notes?: string | null;
  source?: string | null;
  is_guest?: boolean | null;
  user_id?: string | null;
  status?: OrderStatus | null;
  confirmed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  order_items?: OrderItem[] | null;
}

// Product Types
export interface ProductImageFile {
  id: string;
  path: string;
  name?: string | null;
  mime?: string | null;
  size?: number | string | null;
  compress_info?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    preload?: string;
  } | null;
}

export interface ProductImage {
  id: string;
  position: number;
  file_id: string;
  product_id: string;
  created_at?: string | null;
  file?: ProductImageFile;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sku: string;
  category?: string | null;
  price?: number | null;
  original_price?: number | null;
  cost_price?: number | null;
  stock?: number | null;
  product_type?: 'furniture' | 'material' | null;
  brand?: string | null;
  thumbnail_path?: string | null;
  product_images?: ProductImage[] | null;
  weight?: number | null;
  dimensions?: string | null;
  material?: string | null;
  is_featured?: boolean | null;
  is_active?: boolean | null;
  status: ProductStatus;
  meta_title?: string | null;
  meta_description?: string | null;
  position?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export type ProductStatus = 'active' | 'draft' | 'out_of_stock' | 'discontinued';

export interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  slug: string;
  category: string;
  price: number;
  original_price?: number;
  stock: number;
  product_type: 'furniture' | 'material';
  brand: string;
  status: ProductStatus;
}

// Customer Types
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  status: CustomerStatus;
  address?: Address;
  createdAt: string;
  updatedAt: string;
}

export type CustomerStatus = 'active' | 'inactive' | 'blocked';

// Dashboard Analytics Types
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  averageOrderValue: number;
  averageOrderValueChange: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

// User/Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'manager' | 'staff';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Table Types
export interface TableState {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: {
    id: string;
    desc: boolean;
  }[];
  columnFilters: {
    id: string;
    value: unknown;
  }[];
  globalFilter: string;
}
