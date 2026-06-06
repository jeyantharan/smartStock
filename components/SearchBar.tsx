"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/context/AppContext";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency } from "@/utils/format";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const { getLabel } = useCategories();

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update autocomplete recommendations from API
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    fetch(`/api/products?search=${encodeURIComponent(query.trim())}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setSuggestions((res.data.products as Product[]).slice(0, 5));
          setIsOpen(true);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    router.push(`/products/${productId}`);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="position-relative w-100" style={{ maxWidth: "500px" }}>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            className="form-control bg-light border-0 py-2 ps-3 pe-5"
            placeholder="Search premium products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ borderRadius: "25px", fontSize: "0.9rem" }}
          />
          <button
            type="submit"
            className="btn position-absolute end-0 top-50 translate-middle-y border-0 text-secondary pe-3"
            style={{ zIndex: 5, background: "transparent" }}
          >
            <i className="bi bi-search"></i>
          </button>
        </div>
      </form>

      {isOpen && suggestions.length > 0 && (
        <div
          className="position-absolute w-100 bg-white border shadow-lg mt-2 py-2"
          style={{
            zIndex: 1050,
            borderRadius: "12px",
            maxHeight: "350px",
            overflowY: "auto",
          }}
        >
          {suggestions.map((product) => (
            <div
              key={product.id}
              className="d-flex align-items-center gap-3 px-3 py-2 cursor-pointer transition-base hover-suggestion"
              onClick={() => handleSuggestionClick(product.id)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="object-fit-cover rounded"
                style={{ width: "40px", height: "40px" }}
              />
              <div className="flex-grow-1 min-w-0">
                <div className="text-dark fw-semibold text-truncate" style={{ fontSize: "0.875rem" }}>
                  {product.name}
                </div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                  In {getLabel(product.category)}
                </div>
              </div>
              <div className="text-primary fw-bold" style={{ fontSize: "0.875rem" }}>
                {formatCurrency(product.price)}
              </div>
            </div>
          ))}
          <div
            className="text-center py-2 border-top mt-1"
            style={{ fontSize: "0.75rem", cursor: "pointer" }}
            onClick={handleSubmit}
          >
            <span className="text-primary fw-medium">View all matches &rarr;</span>
          </div>
        </div>
      )}

      {isOpen && query.trim().length >= 2 && suggestions.length === 0 && (
        <div
          className="position-absolute w-100 bg-white border shadow-lg mt-2 p-3 text-center text-muted"
          style={{ zIndex: 1050, borderRadius: "12px", fontSize: "0.875rem" }}
        >
          No products found for &ldquo;{query}&rdquo;
        </div>
      )}

      <style jsx global>{`
        .hover-suggestion:hover {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
}
