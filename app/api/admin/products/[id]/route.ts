import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product, { serializeProduct } from "@/models/Product";
import { requireAdmin } from "@/lib/admin-auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { normalizeVariantPricing, normalizeProductBasePricing } from "@/lib/product-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return jsonError("Product not found.", 404);
    }

    return jsonSuccess({ product: serializeProduct(product) });
  } catch (error) {
    console.error("Admin product GET:", error);
    return jsonError("Failed to fetch product.", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    const body = await request.json();

    if (body.baseOriginalPrice !== undefined || body.basePrice !== undefined) {
      const regular = body.baseOriginalPrice ?? body.basePrice;
      if (!regular || regular <= 0) {
        return jsonError("Regular price is required.", 400);
      }
    }

    await connectDB();
    const product = await Product.findById(id);
    if (!product) {
      return jsonError("Product not found.", 404);
    }

    const fields = [
      "name",
      "category",
      "description",
      "images",
      "specifications",
      "variantOptions",
      "variants",
      "isFeatured",
      "isBestSeller",
      "isLatest",
      "isPublished",
      "shippingCharge",
    ] as const;

    if (body.baseOriginalPrice !== undefined || body.basePrice !== undefined) {
      const regular =
        body.baseOriginalPrice ?? body.basePrice ?? product.baseOriginalPrice ?? product.basePrice;
      const offer =
        body.baseOriginalPrice != null &&
        body.basePrice != null &&
        body.basePrice < body.baseOriginalPrice
          ? body.basePrice
          : undefined;
      const normalized = normalizeProductBasePricing(regular, offer);
      product.baseOriginalPrice = normalized.baseOriginalPrice;
      product.basePrice = normalized.basePrice;
    }

    for (const field of fields) {
      if (body[field] !== undefined) {
        if (field === "variants") {
          product.variants = body.variants.map(
            (v: { sku: string; options: Record<string, string>; price: number; originalPrice?: number; stock: number; image?: string; isActive: boolean }) =>
              normalizeVariantPricing({
                sku: v.sku,
                options: v.options ?? {},
                price: v.price,
                originalPrice: v.originalPrice,
                stock: v.stock,
                image: v.image,
                isActive: v.isActive !== false,
              })
          );
        } else {
          (product as unknown as Record<string, unknown>)[field] = body[field];
        }
      }
    }

    await product.save();
    return jsonSuccess({ product: serializeProduct(product) });
  } catch (error) {
    console.error("Admin product PUT:", error);
    return jsonError("Failed to update product.", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    await connectDB();

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return jsonError("Product not found.", 404);
    }

    return jsonSuccess({ message: "Product deleted." });
  } catch (error) {
    console.error("Admin product DELETE:", error);
    return jsonError("Failed to delete product.", 500);
  }
}
