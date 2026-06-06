"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import CategoryTreeSidebar from "@/components/CategoryTreeSidebar";
import { useCategories } from "@/hooks/useCategories";
import { Product } from "@/context/AppContext";
import { getSlugsWithDescendants } from "@/lib/category-utils";
import { formatCurrency } from "@/utils/format";

function roundUpPrice(value: number): number {
  if (value <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  return Math.ceil(value / magnitude) * magnitude;
}

function ProductListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const { tree: categoryTree, categories: categoryList, loading: categoriesLoading, getLabel } = useCategories();

  useEffect(() => {
    setProductsLoading(true);
    const params = new URLSearchParams();
    if (queryParam) params.set("search", queryParam);

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setAllProducts(res.data.products);
      })
      .finally(() => setProductsLoading(false));
  }, [queryParam]);

  useEffect(() => {
    setSelectedCategory(categoryParam);
    setCurrentPage(1);
  }, [categoryParam]);

  const priceBounds = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 500 };
    const prices = allProducts.map((p) => p.price);
    const min = Math.floor(Math.min(...prices));
    const max = roundUpPrice(Math.max(...prices));
    return { min: Math.max(0, min), max: Math.max(max, 50) };
  }, [allProducts]);

  const effectiveMaxPrice = maxPrice ?? priceBounds.max;

  useEffect(() => {
    if (allProducts.length > 0 && maxPrice === null) {
      setMaxPrice(priceBounds.max);
    }
  }, [allProducts.length, priceBounds.max, maxPrice]);

  const handleCategorySelect = (nextCategory: string) => {
    setSelectedCategory(nextCategory);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams.toString());
    if (nextCategory) params.set("category", nextCategory);
    else params.delete("category");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setMaxPrice(priceBounds.max);
    setMinRating(null);
    setInStockOnly(false);
    setSortBy("featured");
    setCurrentPage(1);
    router.push(queryParam ? `/products?search=${encodeURIComponent(queryParam)}` : "/products");
  };

  const filteredProducts = useMemo(() => {
    let result = allProducts;

    if (selectedCategory) {
      const slugs = getSlugsWithDescendants(selectedCategory, categoryList);
      result = result.filter((p) => slugs.includes(p.category));
    }

    result = result.filter((p) => p.price <= effectiveMaxPrice);

    if (minRating !== null) {
      result = result.filter((p) => p.rating >= minRating);
    }

    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "latest":
          return b.id.localeCompare(a.id);
        case "featured":
        default:
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });
  }, [
    allProducts,
    selectedCategory,
    categoryList,
    effectiveMaxPrice,
    minRating,
    inStockOnly,
    sortBy,
  ]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container py-4">
      {/* Breadcrumb & Title */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/">Home</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Shop Products
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
            {queryParam
              ? `Search Results for "${queryParam}"`
              : selectedCategory
                ? getLabel(selectedCategory)
                : "Explore All Products"}
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
            Showing {totalItems > 0 ? indexOfFirstItem + 1 : 0}–{Math.min(indexOfLastItem, totalItems)} of {totalItems} items
          </p>
        </div>

        {/* Sort select */}
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="sortBySelect" className="text-muted fw-semibold text-nowrap d-none d-sm-inline" style={{ fontSize: "0.85rem" }}>
            Sort by:
          </label>
          <select
            id="sortBySelect"
            className="form-select border-light shadow-sm"
            style={{ width: "180px", fontSize: "0.875rem" }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="latest">Latest Releases</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        {/* Filters Sidebar */}
        <aside className="col-lg-3 col-md-4">
          <div className="card border-0 shadow-sm p-4 rounded-4 position-sticky" style={{ top: "100px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <h5 className="fw-bold mb-0">Filters</h5>
              <button
                className="btn btn-link text-primary p-0 fw-semibold text-decoration-none"
                style={{ fontSize: "0.85rem" }}
                onClick={handleClearFilters}
              >
                Reset All
              </button>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3">Categories</h6>
              {categoriesLoading ? (
                <div className="text-center py-2">
                  <div className="spinner-border spinner-border-sm text-primary" />
                </div>
              ) : (
                <CategoryTreeSidebar
                  tree={categoryTree}
                  selectedSlug={selectedCategory}
                  onSelect={handleCategorySelect}
                />
              )}
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0">Max Price</h6>
                <span className="text-primary fw-bold" style={{ fontSize: "0.9rem" }}>
                  {formatCurrency(effectiveMaxPrice)}
                </span>
              </div>
              <input
                type="range"
                className="form-range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={Math.max(1, Math.round(priceBounds.max / 100))}
                value={effectiveMaxPrice}
                disabled={allProducts.length === 0}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
              />
              <div className="d-flex justify-content-between text-muted" style={{ fontSize: "0.75rem" }}>
                <span>{formatCurrency(priceBounds.min)}</span>
                <span>{formatCurrency(priceBounds.max)}</span>
              </div>
            </div>

            {/* Rating Stars */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3">Minimum Rating</h6>
              <div className="d-flex flex-column gap-2">
                {[4.5, 4.0, 3.5].map((stars) => (
                  <button
                    key={stars}
                    className={`btn btn-sm text-start border-0 p-1 d-flex align-items-center gap-2 ${
                      minRating === stars ? "text-primary fw-bold" : "text-secondary"
                    }`}
                    onClick={() => {
                      setMinRating(minRating === stars ? null : stars);
                      setCurrentPage(1);
                    }}
                    style={{ fontSize: "0.9rem", background: "none" }}
                  >
                    <div className="text-warning-stars d-flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i
                          key={i}
                          className={`bi ${i < Math.floor(stars) ? "bi-star-fill" : "bi-star"} fs-7`}
                        ></i>
                      ))}
                    </div>
                    <span>{stars}+ stars</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="mb-2">
              <h6 className="fw-bold mb-3">Availability</h6>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="stockSwitch"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                />
                <label className="form-check-label text-secondary" htmlFor="stockSwitch" style={{ fontSize: "0.9rem" }}>
                  In Stock Only
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="col-lg-9 col-md-8">
          {productsLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
              <p className="text-muted small mt-3 mb-0">Loading products...</p>
            </div>
          ) : currentItems.length > 0 ? (
            <>
              <div className="row g-4">
                {currentItems.map((product) => (
                  <div key={product.id} className="col-12 col-sm-6 col-lg-4">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-5">
              <EmptyState
                title="No Products Match Your Filters"
                description="We couldn't find any products fitting your selections. Try resetting the filters or expanding your search constraints."
                icon="bi-funnel"
                actionText="Reset All Filters"
                actionHref="#" // handled by onClick
              />
              <div className="text-center mt-n4">
                <button
                  className="btn btn-outline-primary px-4 py-2 fw-semibold rounded-pill"
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="d-flex flex-column min-h-screen bg-light">
      <Navbar />
      <Suspense fallback={<div className="container py-5 text-center">Loading search options...</div>}>
        <ProductListingContent />
      </Suspense>
      <Footer />
      <style jsx>{`
        .min-h-screen {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}
