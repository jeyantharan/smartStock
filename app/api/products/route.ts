import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product, { serializeProduct } from "@/models/Product";
import Category, { serializeCategory } from "@/models/Category";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { toStoreProduct } from "@/lib/product-utils";
import { getSlugsWithDescendants } from "@/lib/category-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");

    await connectDB();

    const filter: Record<string, unknown> = { isPublished: true };

    if (category) {
      const allCategories = (await Category.find({ isActive: true })).map(serializeCategory);
      const slugs = getSlugsWithDescendants(category, allCategories);
      filter.category = { $in: slugs };
    }
    if (featured === "true") filter.isFeatured = true;

    let products = await Product.find(filter).sort({ createdAt: -1 });

    if (search?.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return jsonSuccess({
      products: products.map((p) => toStoreProduct(serializeProduct(p))),
    });
  } catch (error) {
    console.error("Products GET:", error);
    return jsonError("Failed to fetch products.", 500);
  }
}
