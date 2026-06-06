"use client";

import React from "react";
import Link from "next/link";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    icon: string;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/products?category=${category.id}`} className="text-decoration-none">
      <div className="card premium-card border-0 text-center p-4 h-100">
        <div className="d-flex justify-content-center mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-light text-primary transition-base icon-box"
            style={{ width: "70px", height: "70px", border: "1px solid var(--gray-border)" }}
          >
            <i className={`bi ${category.icon} fs-2`}></i>
          </div>
        </div>
        <h5 className="card-title text-dark fw-bold mb-1" style={{ fontSize: "1.05rem" }}>
          {category.name}
        </h5>
        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
          Explore Collection &rarr;
        </span>
      </div>

      <style jsx global>{`
        .premium-card:hover .icon-box {
          background-color: var(--primary-color) !important;
          color: #ffffff !important;
          transform: rotate(5deg) scale(1.05);
          border-color: var(--primary-color) !important;
        }
      `}</style>
    </Link>
  );
}
