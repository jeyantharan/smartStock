"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CategoryDocument, CategoryTreeNode } from "@/types/category";
import { buildCategoryNameMap, getCategoryLabel } from "@/lib/category-utils";

interface CategoryContextValue {
  categories: CategoryDocument[];
  tree: CategoryTreeNode[];
  nameMap: Record<string, string>;
  loading: boolean;
  getLabel: (slug: string) => string;
}

const CategoryContext = createContext<CategoryContextValue | null>(null);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<CategoryDocument[]>([]);
  const [tree, setTree] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setCategories(res.data.categories);
          setTree(res.data.tree);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const nameMap = useMemo(() => buildCategoryNameMap(categories), [categories]);

  const value = useMemo<CategoryContextValue>(
    () => ({
      categories,
      tree,
      nameMap,
      loading,
      getLabel: (slug: string) => getCategoryLabel(slug, nameMap),
    }),
    [categories, tree, nameMap, loading]
  );

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx) {
    throw new Error("useCategories must be used within CategoryProvider");
  }
  return ctx;
}

export function useCategoryLabel(slug: string): string {
  const { getLabel, loading, nameMap } = useCategories();
  if (loading && !nameMap[slug]) return slug.replace(/-/g, " ");
  return getLabel(slug);
}
