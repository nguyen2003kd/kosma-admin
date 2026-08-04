/* eslint-disable */
/* Product Model - Generated from Backend API */

export interface Product {
  /** Unique identifier */
  id?: string;
  /** Product SKU */
  sku?: string;
  /** Product name */
  name?: string;
  /** URL-friendly slug */
  slug?: string;
  /** Product description */
  description?: string | null;
  /** Selling price */
  price?: number | null;
  /** Original price before discount */
  original_price?: number | null;
  /** Cost price for internal use */
  cost_price?: number | null;
  /** Current stock quantity */
  stock?: number | null;
  /** Product category */
  category?: string | null;
  /** Product type: furniture or material */
  product_type?: 'furniture' | 'material' | null;
  /** Brand name */
  brand?: string | null;
  /** Thumbnail image path */
  thumbnail_path?: string | null;
  /** Compressed thumbnail info */
  thumbnail_compress_info?: Record<string, unknown> | null;
  /** Product images */
  images?: string[] | null;
  /** Product specifications */
  specifications?: Record<string, unknown> | null;
  /** Product weight */
  weight?: number | null;
  /** Product dimensions */
  dimensions?: string | null;
  /** Material type */
  material?: string | null;
  /** Featured product flag */
  is_featured?: boolean | null;
  /** Active status */
  is_active?: boolean | null;
  /** Product status */
  status?: 'active' | 'draft' | 'out_of_stock' | 'discontinued' | null;
  /** SEO meta title */
  meta_title?: string | null;
  /** SEO meta description */
  meta_description?: string | null;
  /** Display position */
  position?: number | null;
  /** Creation timestamp */
  created_at?: string | null;
  /** Last update timestamp */
  updated_at?: string | null;
  /** Created by user ID */
  created_by?: string | null;
  /** Updated by user ID */
  updated_by?: string | null;
}
