import type { CategoryDocument, CategoryTreeNode, CategoryItem } from "@/types/category";
import { slugify } from "@/lib/product-utils";

export function buildCategoryTree(categories: CategoryDocument[]): CategoryTreeNode[] {
  const nodes = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  for (const cat of categories) {
    nodes.set(cat.id, { ...cat, children: [] });
  }

  for (const cat of categories) {
    const node = nodes.get(cat.id)!;
    if (cat.parentId && nodes.has(cat.parentId)) {
      nodes.get(cat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (list: CategoryTreeNode[]) => {
    list.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    list.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}

export function flattenCategoryTree(
  tree: CategoryTreeNode[],
  depth = 0
): CategoryItem[] {
  const result: CategoryItem[] = [];
  for (const node of tree) {
    result.push({
      id: node.slug,
      name: node.name,
      slug: node.slug,
      icon: node.icon,
      parentId: node.parentId,
      depth,
    });
    if (node.children.length > 0) {
      result.push(...flattenCategoryTree(node.children, depth + 1));
    }
  }
  return result;
}

export function getDescendantIds(
  categoryId: string,
  categories: CategoryDocument[]
): string[] {
  const ids = new Set<string>();
  const collect = (id: string) => {
    ids.add(id);
    categories.filter((c) => c.parentId === id).forEach((child) => collect(child.id));
  };
  collect(categoryId);
  return Array.from(ids);
}

export function getSlugsWithDescendants(
  slug: string,
  categories: CategoryDocument[]
): string[] {
  const root = categories.find((c) => c.slug === slug);
  if (!root) return [slug];

  const ids = getDescendantIds(root.id, categories);
  const slugs = categories.filter((c) => ids.includes(c.id)).map((c) => c.slug);
  return slugs.length > 0 ? slugs : [slug];
}

export function getTopLevelCategories(tree: CategoryTreeNode[]): CategoryItem[] {
  return tree
    .filter((c) => c.isActive)
    .map((c) => ({
      id: c.slug,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      parentId: c.parentId,
      depth: 0,
    }));
}

export function isValidParent(
  categoryId: string | null,
  parentId: string | null,
  categories: CategoryDocument[]
): boolean {
  if (!parentId) return true;
  if (categoryId && parentId === categoryId) return false;

  if (categoryId) {
    const invalidIds = getDescendantIds(categoryId, categories);
    if (invalidIds.includes(parentId)) return false;
  }

  return categories.some((c) => c.id === parentId);
}

export function makeCategorySlug(name: string, existingSlugs: string[]): string {
  let base = slugify(name);
  if (!base) base = "category";
  let slug = base;
  let n = 2;
  while (existingSlugs.includes(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export function buildCategoryNameMap(
  categories: Pick<CategoryDocument, "slug" | "name">[]
): Record<string, string> {
  return Object.fromEntries(categories.map((c) => [c.slug, c.name]));
}

export function getCategoryLabel(
  slug: string,
  nameMap: Record<string, string>
): string {
  return nameMap[slug] ?? slug.replace(/-/g, " ");
}
