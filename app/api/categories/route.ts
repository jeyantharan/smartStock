import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category, { serializeCategory } from "@/models/Category";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { buildCategoryTree } from "@/lib/category-utils";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true }).sort({
      displayOrder: 1,
      name: 1,
    });

    const flat = categories.map(serializeCategory);
    const tree = buildCategoryTree(flat);

    return jsonSuccess({ categories: flat, tree });
  } catch (error) {
    console.error("Categories GET:", error);
    return jsonError("Failed to fetch categories.", 500);
  }
}
