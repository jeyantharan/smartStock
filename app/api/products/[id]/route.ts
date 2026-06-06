import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product, { serializeProduct } from "@/models/Product";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { toStoreProduct } from "@/lib/product-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const product =
      (await Product.findById(id)) ??
      (await Product.findOne({ slug: id, isPublished: true }));

    if (!product || !product.isPublished) {
      return jsonError("Product not found.", 404);
    }

    return jsonSuccess({
      product: toStoreProduct(serializeProduct(product)),
    });
  } catch (error) {
    console.error("Product GET:", error);
    return jsonError("Failed to fetch product.", 500);
  }
}
