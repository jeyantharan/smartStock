"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav className="d-flex justify-content-center mt-5" aria-label="Page navigation">
      <ul className="pagination pagination-md gap-1">
        {/* Previous Button */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link border-0 rounded-circle d-flex align-items-center justify-content-center p-0 transition-base"
            style={{ width: "40px", height: "40px", fontSize: "0.9rem" }}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
        </li>

        {/* Page Numbers */}
        {getPageNumbers().map((page) => (
          <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
            <button
              className={`page-link border-0 rounded-circle d-flex align-items-center justify-content-center p-0 fw-semibold transition-base ${
                currentPage === page ? "bg-primary text-white" : "bg-transparent text-secondary hover-bg-light"
              }`}
              style={{ width: "40px", height: "40px", fontSize: "0.9rem" }}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}

        {/* Next Button */}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link border-0 rounded-circle d-flex align-items-center justify-content-center p-0 transition-base"
            style={{ width: "40px", height: "40px", fontSize: "0.9rem" }}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>

      <style jsx global>{`
        .page-link {
          color: var(--dark-color);
          background-color: transparent;
        }
        .page-link:focus {
          box-shadow: none;
        }
        .hover-bg-light:hover {
          background-color: #f1f5f9 !important;
          color: var(--primary-color) !important;
        }
      `}</style>
    </nav>
  );
}
