"use client";

import { useEffect, useState, use } from "react";
import ProductForm from "@/components/admin/ProductForm";
import { adminProductService } from "@/services/adminProductService";
import type { ProductDocument } from "@/types/product";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminProductService.get(id).then(({ data, error: err }) => {
      if (data?.product) setProduct(data.product);
      else setError(err ?? "Product not found.");
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="card border-0 shadow-sm p-5 rounded-4 bg-white text-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="card border-0 shadow-sm p-5 rounded-4 bg-white text-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white">
      <h4 className="fw-bold mb-1">Edit Product</h4>
      <p className="text-muted mb-4 pb-2 border-bottom small">{product.name}</p>
      <ProductForm mode="edit" initial={product} key={product.id} />
    </div>
  );
}
