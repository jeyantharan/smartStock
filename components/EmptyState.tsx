"use client";

import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: string; // Bootstrap icon class
  actionText?: string;
  actionHref?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionText = "Continue Shopping",
  actionHref = "/products",
}: EmptyStateProps) {
  return (
    <div className="text-center py-5 px-3 d-flex flex-column align-items-center justify-content-center">
      <div
        className="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center mb-4"
        style={{ width: "90px", height: "90px", border: "2px dashed var(--gray-border)" }}
      >
        <i className={`bi ${icon} text-primary`} style={{ fontSize: "2.5rem" }}></i>
      </div>
      <h3 className="fw-bold mb-2 text-dark" style={{ fontSize: "1.5rem" }}>
        {title}
      </h3>
      <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "450px", fontSize: "0.95rem", lineHeight: "1.6" }}>
        {description}
      </p>
      {actionText && actionHref && (
        <Link href={actionHref} className="btn btn-primary px-4 py-2 fw-semibold rounded-pill">
          {actionText}
        </Link>
      )}
    </div>
  );
}
