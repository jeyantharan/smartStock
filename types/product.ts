export interface VariantOption {
  name: string;
  values: string[];
  displayOrder: number;
  /** Image URL per option value, e.g. { "Black": "https://...", "Blue": "..." } */
  valueImages?: Record<string, string>;
  /** Default price per option value, e.g. { "Black": 20, "White": 15 } */
  valuePrices?: Record<string, number>;
}

export interface ProductVariant {
  id?: string;
  sku: string;
  options: Record<string, string>;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
  isActive: boolean;
}

export interface ProductDocument {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  images: string[];
  specifications: Record<string, string>;
  variantOptions: VariantOption[];
  variants: ProductVariant[];
  basePrice: number;
  baseOriginalPrice?: number;
  shippingCharge?: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isLatest: boolean;
  isPublished: boolean;
  rating: number;
  ratingCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  image: string;
  images: string[];
  category: string;
  description: string;
  inStock: boolean;
  stockCount: number;
  specifications: Record<string, string>;
  variantOptions: VariantOption[];
  variants: ProductVariant[];
  colors?: string[];
  sizes?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isLatest?: boolean;
  /** Shipping charge in LKR; storefront uses default when unset */
  shippingCharge?: number;
}
