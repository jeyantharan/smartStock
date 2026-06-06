import type { ProductDocument } from "@/types/product";

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
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  const result: ApiResponse<T> = await response.json();
  if (!response.ok || !result.success) {
    return { error: result.message ?? "Something went wrong." };
  }
  return { data: result.data };
}

export const adminProductService = {
  list() {
    return adminFetch<{ products: ProductDocument[] }>("/api/admin/products");
  },

  get(id: string) {
    return adminFetch<{ product: ProductDocument }>(`/api/admin/products/${id}`);
  },

  create(payload: Partial<ProductDocument>) {
    return adminFetch<{ product: ProductDocument }>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: Partial<ProductDocument>) {
    return adminFetch<{ product: ProductDocument }>(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  remove(id: string) {
    return adminFetch<{ message: string }>(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
  },

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    return adminFetch<{ url: string; publicId: string }>(
      "/api/admin/products/upload-image",
      { method: "POST", body: formData }
    );
  },
};
