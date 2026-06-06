import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product, { serializeProduct } from "@/models/Product";
import { requireAdmin } from "@/lib/admin-auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { slugify, normalizeVariantPricing, normalizeProductBasePricing } from "@/lib/product-utils";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });

    return jsonSuccess({
      products: products.map((p) => serializeProduct(p)),
    });
  } catch (error) {
    console.error("Admin products GET:", error);
    return jsonError("Failed to fetch products.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const {
      name,
      category,
      description,
      images,
      specifications,
      variantOptions,
      variants,
      basePrice,
      baseOriginalPrice,
      isFeatured,
      isBestSeller,
      isLatest,
      isPublished,
      shippingCharge,
    } = body;

    if (!name?.trim() || !category) {
      return jsonError("Product name and category are required.", 400);
    }

    const regular = baseOriginalPrice ?? basePrice;
    if (!regular || regular <= 0) {
      return jsonError("Regular price is required.", 400);
    }

    const offer =
      baseOriginalPrice != null && basePrice != null && basePrice < baseOriginalPrice
        ? basePrice
        : undefined;
    const normalizedBase = normalizeProductBasePricing(regular, offer);

    const normalizedVariants = (variants ?? []).map(
      (v: { options: Record<string, string> } & Parameters<typeof normalizeVariantPricing>[0]) =>
        normalizeVariantPricing({ ...v, options: v.options ?? {} })
    );

    await connectDB();

    let slug = slugify(name);
    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await Product.create({
      name: name.trim(),
      slug,
      category,
      description: description ?? "",
      images: images ?? [],
      specifications: specifications ?? {},
      variantOptions: variantOptions ?? [],
      variants: normalizedVariants,
      basePrice: normalizedBase.basePrice,
      baseOriginalPrice: normalizedBase.baseOriginalPrice,
      shippingCharge: shippingCharge != null && shippingCharge >= 0 ? shippingCharge : undefined,
      isFeatured: isFeatured ?? false,
      isBestSeller: isBestSeller ?? false,
      isLatest: isLatest ?? false,
      isPublished: isPublished !== false,
    });

    return jsonSuccess({ product: serializeProduct(product) }, 201);
  } catch (error) {
    console.error("Admin products POST:", error);
    return jsonError("Failed to create product.", 500);
  }
}
