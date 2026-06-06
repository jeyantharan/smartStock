"use client";

import { useEffect, useState } from "react";
import type { StoreProduct } from "@/types/product";

export function useProducts(category?: string) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setProducts(res.data.products);
      })
      .finally(() => setLoading(false));
  }, [category]);

  return { products, loading };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setProduct(res.data.product);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}
