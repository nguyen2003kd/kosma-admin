/* eslint-disable */
/* Order Model - Generated from Backend API */

export interface Order {
  /** Unique identifier */
  id?: string;
  /** Order code */
  code?: string;
  /** Customer full name */
  customer_name?: string;
  /** Customer email */
  customer_email?: string | null;
  /** Customer phone */
  customer_phone?: string;
  /** Shipping address */
  shipping_address?: string | null;
  /** Shipping city */
  shipping_city?: string | null;
  /** Shipping state */
  shipping_state?: string | null;
  /** Shipping ZIP code */
  shipping_zip?: string | null;
  /** Order subtotal */
  subtotal?: number | null;
  /** Shipping fee */
  shipping_fee?: number | null;
  /** Tax amount */
  tax?: number | null;
  /** Order total */
  total?: number | null;
  /** Payment method */
  payment_method?: 'cod' | 'bank_transfer' | 'card' | null;
  /** Payment status */
  payment_status?: string | null;
  /** Payment ID from payment provider */
  payment_id?: string | null;
  /** Order notes */
  notes?: string | null;
  /** Order source */
  source?: string | null;
  /** Guest checkout flag */
  is_guest?: boolean | null;
  /** User ID (if logged in) */
  user_id?: string | null;
  /** Order status */
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | null;
  /** Confirmation timestamp */
  confirmed_at?: string | null;
  /** Shipped timestamp */
  shipped_at?: string | null;
  /** Delivered timestamp */
  delivered_at?: string | null;
  /** Cancelled timestamp */
  cancelled_at?: string | null;
  /** Creation timestamp */
  created_at?: string | null;
  /** Last update timestamp */
  updated_at?: string | null;
  /** Created by user ID */
  created_by?: string | null;
  /** Updated by user ID */
  updated_by?: string | null;
  /** Order items */
  order_items?: OrderItem[] | null;
}

export interface OrderItem {
  /** Unique identifier */
  id?: string;
  /** Order ID */
  order_id?: string;
  /** Product ID (optional) */
  product_id?: string | null;
  /** Product name at time of order */
  product_name?: string;
  /** Product SKU at time of order */
  product_sku?: string | null;
  /** Product image at time of order */
  product_image?: string | null;
  /** Quantity ordered */
  quantity?: number;
  /** Unit price at time of order */
  unit_price?: number;
  /** Total price (quantity * unit_price) */
  total_price?: number;
  /** Item specifications */
  specifications?: Record<string, unknown> | null;
  /** Creation timestamp */
  created_at?: string | null;
}
