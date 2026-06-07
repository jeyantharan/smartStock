"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/context/AppContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useCategoryLabel } from "@/hooks/useCategories";
import { formatCurrency } from "@/utils/format";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isWishlisted } = useWishlist();

  const isFav = isWishlisted(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const categoryLabel = useCategoryLabel(product.category);

  return (
    <div className="card premium-card h-100 position-relative border-0">
      {/* Badges */}
      <div className="position-absolute top-0 start-0 p-3 d-flex flex-column gap-1" style={{ zIndex: 5 }}>
        {discount > 0 && (
          <span className="badge bg-danger badge-custom shadow-sm">
            -{discount}% OFF
          </span>
        )}
        {!product.inStock && (
          <span className="badge bg-secondary badge-custom shadow-sm">
            OUT OF STOCK
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className="btn position-absolute top-0 end-0 p-3 border-0 bg-transparent"
        style={{ zIndex: 5 }}
        aria-label="Add to Wishlist"
      >
        <div
          className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center hover-scale"
          style={{ width: "36px", height: "36px", transition: "transform 0.2s" }}
        >
          <i
            className={`bi ${isFav ? "bi-heart-fill text-danger" : "bi-heart text-secondary"} fs-5`}
          ></i>
        </div>
      </button>

      {/* Product Image Link */}
      <Link href={`/products/${product.id}`} className="position-relative overflow-hidden d-block bg-light">
        <div className="d-flex align-items-center justify-content-center overflow-hidden" style={{ height: "240px" }}>
          <img
            src={product.image}
            alt={product.name}
            className="w-100 h-100 object-fit-cover transition-base hover-zoom-img"
          />
        </div>
      </Link>

      {/* Card Body */}
      <div className="card-body d-flex flex-column p-4">
        {/* Category & Rating Row */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-muted text-uppercase tracking-wider fw-bold" style={{ fontSize: "0.65rem" }}>
            {categoryLabel}
          </span>
          <div className="d-flex align-items-center gap-1">
            <i className="bi bi-star-fill text-warning-stars" style={{ fontSize: "0.75rem" }}></i>
            <span className="text-dark fw-bold" style={{ fontSize: "0.75rem" }}>
              {product.rating}
            </span>
            <span className="text-muted" style={{ fontSize: "0.7rem" }}>
              ({product.ratingCount})
            </span>
          </div>
        </div>

        {/* Product Title */}
        <h5 className="card-title mb-2 text-truncate-2" style={{ fontSize: "0.95rem", lineHeight: "1.4", minHeight: "2.8rem" }}>
          <Link href={`/products/${product.id}`} className="text-dark hover-primary fw-semibold">
            {product.name}
          </Link>
        </h5>

        {/* Pricing & Add to Cart */}
        <div className="mt-auto pt-3 border-top border-light d-flex justify-content-between align-items-center">
          <div className="d-flex flex-column">
            {product.originalPrice && (
              <span className="text-muted text-decoration-line-through" style={{ fontSize: "0.75rem" }}>
                {formatCurrency(product.originalPrice)}
              </span>
            )}
            <span className="text-primary fw-bold fs-5" style={{ fontFamily: "var(--heading-font)" }}>
              {formatCurrency(product.price)}
            </span>
          </div>

          <Link
            href={`/products/${product.id}`}
            className="btn btn-outline-primary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center hover-bounce"
            style={{ width: "38px", height: "38px" }}
            title="View Details"
          >
            <i className="bi bi-eye fs-5"></i>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hover-scale:hover {
          transform: scale(1.1);
        }
        .hover-zoom-img {
          transition: transform 0.5s ease;
        }
        .premium-card:hover .hover-zoom-img {
          transform: scale(1.06);
        }
        .hover-bounce:hover {
          background-color: var(--primary-color) !important;
          color: white !important;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
