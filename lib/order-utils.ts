import type { IProduct, IProductVariant } from "@/models/Product";
import { getSellingPrice } from "@/lib/product-utils";
import { calculateCartTotals } from "@/lib/cart-utils";

export interface OrderItemInput {
  productId: string;
  quantity: number;
  variantId?: string;
  selectedOptions?: Record<string, string>;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ResolvedOrderLine {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  shippingCharge?: number;
  variantId?: string;
}

function mapVariantOptions(
  options: Map<string, string> | Record<string, string>
): Record<string, string> {
  if (options instanceof Map) {
    return Object.fromEntries(options.entries());
  }
  return options ?? {};
}

function buildSelectionsFromItem(
  item: OrderItemInput,
  product: IProduct
): Record<string, string> {
  if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
    return item.selectedOptions;
  }

  const sorted = [...(product.variantOptions ?? [])].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );
  const selections: Record<string, string> = {};

  if (item.selectedColor && sorted[0]) {
    selections[sorted[0].name] = item.selectedColor;
  }
  if (item.selectedSize && sorted[1]) {
    selections[sorted[1].name] = item.selectedSize;
  }

  return selections;
}

export function findVariantForOrderItem(
  product: IProduct,
  item: OrderItemInput
): IProductVariant | undefined {
  const variants = (product.variants ?? []).filter((v) => v.isActive !== false);

  if (item.variantId) {
    const byId = variants.find((v) => v._id?.toString() === item.variantId);
    if (byId) return byId;
  }

  const selections = buildSelectionsFromItem(item, product);
  if (Object.keys(selections).length > 0) {
    return variants.find((v) =>
      Object.entries(selections).every(
        ([key, val]) => mapVariantOptions(v.options)[key] === val
      )
    );
  }

  if (variants.length === 1) {
    return variants[0];
  }

  return undefined;
}

export function generateOrderId(): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

export function resolveOrderLines(
  items: OrderItemInput[],
  products: Map<string, IProduct>
): { lines: ResolvedOrderLine[]; error?: string } {
  const lines: ResolvedOrderLine[] = [];

  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity < 1) {
      return { lines: [], error: "Invalid cart item." };
    }

    const product = products.get(item.productId);
    if (!product || !product.isPublished) {
      return { lines: [], error: "One or more products are no longer available." };
    }

    const variant = findVariantForOrderItem(product, item);
    if (!variant) {
      return {
        lines: [],
        error: `Please select a valid variant for ${product.name}.`,
      };
    }

    if (variant.stock < item.quantity) {
      return {
        lines: [],
        error: `Not enough stock for ${product.name}. Only ${variant.stock} left.`,
      };
    }

    const price = getSellingPrice({
      price: variant.price,
      originalPrice: variant.originalPrice,
    });

    lines.push({
      productId: product._id.toString(),
      name: product.name,
      price,
      quantity: item.quantity,
      image: variant.image ?? product.images?.[0] ?? "",
      shippingCharge: product.shippingCharge,
      variantId: variant._id?.toString(),
    });
  }

  return { lines };
}

export function calculateOrderTotal(lines: ResolvedOrderLine[]): number {
  const cartLike = lines.map((line) => ({
    product: {
      id: line.productId,
      price: line.price,
      shippingCharge: line.shippingCharge,
    },
    quantity: line.quantity,
  }));

  const { cartTotal } = calculateCartTotals(cartLike);
  return Number(cartTotal.toFixed(2));
}

export function applyStockDeductions(
  products: Map<string, IProduct>,
  lines: ResolvedOrderLine[]
): void {
  for (const line of lines) {
    const product = products.get(line.productId);
    if (!product) continue;

    const variant = product.variants.find((v) => v._id?.toString() === line.variantId);
    if (!variant) continue;

    variant.stock = Math.max(0, variant.stock - line.quantity);
  }
}
