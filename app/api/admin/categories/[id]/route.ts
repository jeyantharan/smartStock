import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category, { serializeCategory } from "@/models/Category";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/admin-auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { getDescendantIds, isValidParent, makeCategorySlug } from "@/lib/category-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const category = await Category.findById(id);
    if (!category) {
      return jsonError("Category not found.", 404);
    }

    const allFlat = (await Category.find()).map(serializeCategory);

    if (body.parentId !== undefined) {
      const parentId = body.parentId || null;
      if (!isValidParent(id, parentId, allFlat)) {
        return jsonError("Invalid parent category (cannot nest under itself or a child).");
      }
      category.parent = parentId;
    }

    if (body.name !== undefined) category.name = body.name.trim();
    if (body.icon !== undefined) category.icon = body.icon.trim() || "bi-folder";
    if (body.displayOrder !== undefined) category.displayOrder = Number(body.displayOrder);
    if (body.isActive !== undefined) category.isActive = body.isActive;

    if (body.slug !== undefined && body.slug.trim()) {
      const existingSlugs = allFlat
        .filter((c) => c.id !== id)
        .map((c) => c.slug);
      category.slug = makeCategorySlug(body.slug.trim(), existingSlugs);
    }

    await category.save();
    return jsonSuccess({ category: serializeCategory(category) });
  } catch (error) {
    console.error("Admin category PUT:", error);
    if ((error as { code?: number }).code === 11000) {
      return jsonError("A category with this slug already exists.");
    }
    return jsonError("Failed to update category.", 500);
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

    const category = await Category.findById(id);
    if (!category) {
      return jsonError("Category not found.", 404);
    }

    const allFlat = (await Category.find()).map(serializeCategory);
    const descendantIds = getDescendantIds(id, allFlat);
    if (descendantIds.length > 1) {
      return jsonError("Remove or reassign child categories before deleting this one.");
    }

    const productCount = await Product.countDocuments({ category: category.slug });
    if (productCount > 0) {
      return jsonError(
        `Cannot delete: ${productCount} product(s) use this category. Reassign them first.`
      );
    }

    await Category.findByIdAndDelete(id);
    return jsonSuccess({ message: "Category deleted." });
  } catch (error) {
    console.error("Admin category DELETE:", error);
    return jsonError("Failed to delete category.", 500);
  }
}
