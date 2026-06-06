import type { CategoryDocument, CategoryTreeNode } from "@/types/category";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function adminFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const result: ApiResponse<T> = await response.json();
  if (!response.ok || !result.success) {
    return { error: result.message ?? "Something went wrong." };
  }
  return { data: result.data };
}

export const adminCategoryService = {
  list() {
    return adminFetch<{ categories: CategoryDocument[]; tree: CategoryTreeNode[] }>(
      "/api/admin/categories"
    );
  },

  create(payload: {
    name: string;
    slug?: string;
    parentId?: string | null;
    icon?: string;
    displayOrder?: number;
    isActive?: boolean;
  }) {
    return adminFetch<{ category: CategoryDocument }>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(
    id: string,
    payload: Partial<{
      name: string;
      slug: string;
      parentId: string | null;
      icon: string;
      displayOrder: number;
      isActive: boolean;
    }>
  ) {
    return adminFetch<{ category: CategoryDocument }>(`/api/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  remove(id: string) {
    return adminFetch<{ message: string }>(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
  },
};
