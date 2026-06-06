"use client";

import React from "react";

interface ProductGalleryProps {
  images: string[];
  activeImage: string;
  productName: string;
  onSelect: (url: string) => void;
}

export default function ProductGallery({
  images,
  activeImage,
  productName,
  onSelect,
}: ProductGalleryProps) {
  const displayImage = activeImage || images[0] || "";

  if (!displayImage) {
    return (
      <div className="product-gallery-main d-flex align-items-center justify-content-center">
        <i className="bi bi-image text-muted display-4"></i>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      {images.length > 1 && (
        <div className="product-gallery-thumbs d-none d-md-flex flex-column gap-2">
          {images.map((url) => (
            <button
              key={url}
              type="button"
              className={`product-gallery-thumb ${activeImage === url ? "active" : ""}`}
              onClick={() => onSelect(url)}
              aria-label="View product image"
            >
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}

      <div className="product-gallery-main">
        <img src={displayImage} alt={productName} className="product-gallery-hero" />
      </div>

      {images.length > 1 && (
        <div className="product-gallery-thumbs-row d-flex d-md-none gap-2 mt-3 overflow-auto pb-1">
          {images.map((url) => (
            <button
              key={url}
              type="button"
              className={`product-gallery-thumb ${activeImage === url ? "active" : ""}`}
              onClick={() => onSelect(url)}
              aria-label="View product image"
            >
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
