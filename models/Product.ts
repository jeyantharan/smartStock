import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVariantOption {
  name: string;
  values: string[];
  displayOrder: number;
  valueImages?: Record<string, string>;
  valuePrices?: Record<string, number>;
}

export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  sku: string;
  options: Record<string, string>;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
  isActive: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: string;
  description: string;
  images: string[];
  specifications: Record<string, string>;
  variantOptions: IVariantOption[];
  variants: IProductVariant[];
  basePrice: number;
  baseOriginalPrice?: number;
  /** Shipping charge in LKR; uses site default when unset */
  shippingCharge?: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isLatest: boolean;
  isPublished: boolean;
  rating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const VariantOptionSchema = new Schema<IVariantOption>(
  {
    name: { type: String, required: true },
    values: { type: [String], default: [] },
    displayOrder: { type: Number, default: 0 },
    valueImages: { type: Map, of: String, default: {} },
    valuePrices: { type: Map, of: Number, default: {} },
  },
  { _id: false }
);

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    sku: { type: String, required: true },
    options: { type: Map, of: String, default: {} },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    specifications: { type: Map, of: String, default: {} },
    variantOptions: { type: [VariantOptionSchema], default: [] },
    variants: { type: [ProductVariantSchema], default: [] },
    basePrice: { type: Number, default: 0, min: 0 },
    baseOriginalPrice: { type: Number, min: 0 },
    shippingCharge: { type: Number, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isLatest: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.Product) {
  mongoose.deleteModel("Product");
}

const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

function mapOptions(options: Map<string, string> | Record<string, string>): Record<string, string> {
  if (options instanceof Map) {
    return Object.fromEntries(options.entries());
  }
  return options ?? {};
}

function mapSpecs(specs: Map<string, string> | Record<string, string>): Record<string, string> {
  if (specs instanceof Map) {
    return Object.fromEntries(specs.entries());
  }
  return specs ?? {};
}

function mapNumberRecord(
  data: Map<string, number> | Record<string, number> | undefined
): Record<string, number> {
  if (!data) return {};
  if (data instanceof Map) {
    return Object.fromEntries(data.entries());
  }
  return data;
}

export function serializeProduct(product: IProduct) {
  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    category: product.category,
    description: product.description,
    images: product.images ?? [],
    specifications: mapSpecs(product.specifications as Map<string, string>),
    variantOptions: (product.variantOptions ?? []).map((o) => ({
      name: o.name,
      values: o.values ?? [],
      displayOrder: o.displayOrder ?? 0,
      valueImages: mapSpecs(o.valueImages as Map<string, string> | Record<string, string>),
      valuePrices: mapNumberRecord(o.valuePrices as Map<string, number> | Record<string, number>),
    })),
    variants: (product.variants ?? []).map((v) => ({
      id: v._id?.toString(),
      sku: v.sku,
      options: mapOptions(v.options as Map<string, string>),
      price: v.price,
      originalPrice: v.originalPrice,
      stock: v.stock,
      image: v.image,
      isActive: v.isActive !== false,
    })),
    basePrice: product.basePrice ?? 0,
    baseOriginalPrice: product.baseOriginalPrice,
    shippingCharge: product.shippingCharge,
    isFeatured: product.isFeatured ?? false,
    isBestSeller: product.isBestSeller ?? false,
    isLatest: product.isLatest ?? false,
    isPublished: product.isPublished !== false,
    rating: product.rating ?? 0,
    ratingCount: product.ratingCount ?? 0,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
