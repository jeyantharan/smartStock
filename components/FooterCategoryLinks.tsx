"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";
import { getTopLevelCategories } from "@/lib/category-utils";

export default function FooterCategoryLinks() {
  const { tree, loading } = useCategories();
  const topCategories = getTopLevelCategories(tree);

  if (loading) {
    return (
      <li>
        <span className="footer-text" style={{ fontSize: "0.9rem" }}>
          Loading…
        </span>
      </li>
    );
  }

  if (topCategories.length === 0) {
    return (
      <li>
        <Link href="/products" className="footer-link text-decoration-none">
          All Products
        </Link>
      </li>
    );
  }

  return (
    <>
      {topCategories.map((category) => (
        <li key={category.slug}>
          <Link
            href={`/products?category=${category.slug}`}
            className="footer-link text-decoration-none"
          >
            {category.name}
          </Link>
        </li>
      ))}
    </>
  );
}
