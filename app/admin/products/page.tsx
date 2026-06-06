"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminProductService } from "@/services/adminProductService";
import { adminCategoryService } from "@/services/adminCategoryService";
import { formatCurrency } from "@/utils/format";
import type { ProductDocument } from "@/types/product";
import { toStoreProduct } from "@/lib/product-utils";
import { buildCategoryNameMap, getCategoryLabel } from "@/lib/category-utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductDocument[]>([]);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminProductService.list(), adminCategoryService.list()]).then(
      ([productsRes, categoriesRes]) => {
        if (productsRes.data?.products) setProducts(productsRes.data.products);
        if (categoriesRes.data?.categories) {
          setCategoryNames(buildCategoryNameMap(categoriesRes.data.categories));
        }
        setLoading(false);
      }
    );
  }, []);

  const getSummary = (product: ProductDocument) => {
    const store = toStoreProduct(product);
    const variantCount = product.variants.length;
    return { ...store, variantCount };
  };

  return (
    <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white h-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-2">
        <h4 className="fw-bold mb-0">Products</h4>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold">
          + Add Product
        </Link>
      </div>
      <p className="text-muted mb-4 pb-2 border-bottom" style={{ fontSize: "0.85rem" }}>
        Manage products with multi-level variants (Model, Color, etc.) and per-SKU stock.
      </p>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-box-seam fs-1 d-block mb-3"></i>
          <p>No products yet. Create your first product with variants.</p>
          <Link href="/admin/products/new" className="btn btn-primary rounded-pill px-4">
            Add Product
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr style={{ fontSize: "0.8rem" }}>
                <th>Product</th>
                <th>Variants</th>
                <th>Price From</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const summary = getSummary(product);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {summary.image ? (
                          <img
                            src={summary.image}
                            alt=""
                            className="rounded object-fit-cover"
                            style={{ width: 40, height: 40 }}
                          />
                        ) : (
                          <div className="bg-light rounded" style={{ width: 40, height: 40 }} />
                        )}
                        <div>
                          <span className="fw-semibold d-block" style={{ fontSize: "0.875rem" }}>
                            {product.name}
                          </span>
                          <small className="text-muted">
                            {getCategoryLabel(product.category, categoryNames)}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{summary.variantCount} SKUs</td>
                    <td className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                      {formatCurrency(summary.price)}
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{summary.stockCount}</td>
                    <td>
                      <span className={`badge ${summary.inStock ? "bg-success" : "bg-secondary"}`}>
                        {summary.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                      {!product.isPublished && (
                        <span className="badge bg-warning text-dark ms-1">Draft</span>
                      )}
                    </td>
                    <td className="text-end">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 me-1"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/products/${product.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-light btn-sm rounded-pill px-3"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
