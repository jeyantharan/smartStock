import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category, { serializeCategory } from "@/models/Category";
import { requireAdmin } from "@/lib/admin-auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { buildCategoryTree, isValidParent, makeCategorySlug } from "@/lib/category-utils";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    await connectDB();

    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    const flat = categories.map(serializeCategory);
    const tree = buildCategoryTree(flat);

    return jsonSuccess({ categories: flat, tree });
  } catch (error) {
    console.error("Admin categories GET:", error);
    return jsonError("Failed to fetch categories.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { name, slug, parentId, icon, displayOrder, isActive } = body;

    if (!name?.trim()) {
      return jsonError("Category name is required.");
    }

    await connectDB();

    const existing = await Category.find().select("slug");
    const existingSlugs = existing.map((c) => c.slug);
    const finalSlug = slug?.trim()
      ? makeCategorySlug(slug.trim(), existingSlugs.filter((s) => s !== slug.trim()))
      : makeCategorySlug(name.trim(), existingSlugs);

    const allFlat = (await Category.find()).map(serializeCategory);
    if (parentId && !isValidParent(null, parentId, allFlat)) {
      return jsonError("Invalid parent category.");
    }

    const category = await Category.create({
      name: name.trim(),
      slug: finalSlug,
      parent: parentId || null,
      icon: icon?.trim() || "bi-folder",
      displayOrder: displayOrder ?? 0,
      isActive: isActive !== false,
    });

    return jsonSuccess({ category: serializeCategory(category) }, 201);
  } catch (error) {
    console.error("Admin categories POST:", error);
    if ((error as { code?: number }).code === 11000) {
      return jsonError("A category with this slug already exists.");
    }
    return jsonError("Failed to create category.", 500);
  }
}
