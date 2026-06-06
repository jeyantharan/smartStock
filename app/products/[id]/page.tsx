"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import VariantOptionPicker from "@/components/VariantOptionPicker";
import EmptyState from "@/components/EmptyState";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/format";
import { useCategoryLabel } from "@/hooks/useCategories";
import {
  resolveVariant,
  resolveDisplayImage,
  resolveDisplayPrice,
  isOptionValueAvailable,
  variantDisplayPrices,
  resolveSelectionsAfterChange,
} from "@/lib/product-utils";
import { getProductShippingCharge } from "@/lib/shipping";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { product, loading, error } = useProduct(id);
  const { products: relatedPool } = useProducts(product?.category);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const categoryLabel = useCategoryLabel(product?.category ?? "");

  const sortedOptions = useMemo(
    () =>
      [...(product?.variantOptions ?? [])].sort(
        (a, b) => a.displayOrder - b.displayOrder
      ),
    [product?.variantOptions]
  );

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return undefined;
    if (sortedOptions.length === 0) return product.variants[0];
    const allSelected = sortedOptions.every((o) => selectedOptions[o.name]);
    if (!allSelected) return undefined;
    return resolveVariant(product.variants, selectedOptions);
  }, [product, selectedOptions, sortedOptions]);

  const displayPrice = useMemo(() => {
    if (!product) return 0;
    return resolveDisplayPrice(product, selectedOptions);
  }, [product, selectedOptions]);

  const displayOriginal = useMemo(() => {
    if (!product) return undefined;
    if (selectedVariant) return variantDisplayPrices(selectedVariant).originalPrice;
    return product.originalPrice;
  }, [product, selectedVariant]);

  const discountPercent =
    displayOriginal && displayOriginal > displayPrice
      ? Math.round(((displayOriginal - displayPrice) / displayOriginal) * 100)
      : 0;

  const maxStock = selectedVariant?.stock ?? product?.stockCount ?? 0;
  const canPurchase = selectedVariant
    ? selectedVariant.isActive && selectedVariant.stock > 0
    : product?.inStock ?? false;

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const urls = new Set<string>(product.images);
    product.variants?.forEach((v) => {
      if (v.image) urls.add(v.image);
    });
    return Array.from(urls);
  }, [product]);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      const defaults: Record<string, string> = {};
      sortedOptions.forEach((group) => {
        const firstAvailable = group.values.find((val) =>
          isOptionValueAvailable(
            product.variants ?? [],
            sortedOptions,
            group.name,
            val,
            defaults
          )
        );
        if (firstAvailable) defaults[group.name] = firstAvailable;
      });
      setSelectedOptions(defaults);
      setActiveImage(resolveDisplayImage(product, defaults));
    }
  }, [product?.id]);

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5 my-5 text-center">
          <div className="spinner-border text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5 my-5">
          <EmptyState
            title="Product Not Found"
            description="We couldn't locate this product."
            icon="bi-exclamation-triangle"
            actionText="Browse Shop"
            actionHref="/products"
          />
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = relatedPool.filter((p) => p.id !== product.id).slice(0, 4);

  const handleOptionSelect = (optionName: string, value: string) => {
    const next = resolveSelectionsAfterChange(
      product.variants ?? [],
      sortedOptions,
      optionName,
      value,
      selectedOptions
    );
    setSelectedOptions(next);
    setActiveImage(resolveDisplayImage(product, next, optionName));
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!canPurchase) return;
    const legacyColor = selectedOptions[sortedOptions[0]?.name ?? ""];
    const legacySize = selectedOptions[sortedOptions[1]?.name ?? ""];
    addToCart(
      { ...product, price: displayPrice, originalPrice: displayOriginal },
      quantity,
      legacyColor,
      legacySize,
      selectedOptions,
      selectedVariant?.id
    );
  };

  const handleBuyNow = () => {
    if (!canPurchase) return;
    handleAddToCart();
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    router.push("/checkout");
  };

  const isFav = isWishlisted(product.id);

  const stockLabel = selectedVariant
    ? selectedVariant.stock > 0
      ? `In Stock · ${selectedVariant.stock} left`
      : "Out of Stock"
    : product.inStock
      ? "Select options"
      : "Out of Stock";

  const stockClass = selectedVariant
    ? selectedVariant.stock > 0
      ? "in-stock"
      : "out-of-stock"
    : product.inStock
      ? "select-options"
      : "out-of-stock";

  return (
    <div className="d-flex flex-column min-vh-100 product-detail-page">
      <Navbar />
      <main className="container-xl py-4 py-lg-5">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/products">Products</Link></li>
            <li className="breadcrumb-item active">{product.name}</li>
          </ol>
        </nav>

        <div className="product-detail-card p-3 p-md-4 p-lg-5 mb-5">
          <div className="row g-4 g-lg-5">
            <div className="col-lg-6">
              <ProductGallery
                images={galleryImages}
                activeImage={activeImage}
                productName={product.name}
                onSelect={setActiveImage}
              />
            </div>

            <div className="col-lg-6">
              <div className="product-detail-sticky">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <span className="product-category-badge">{categoryLabel.toUpperCase()}</span>
                  <span className={`product-stock-badge ${stockClass}`}>{stockLabel}</span>
                </div>

                <h1 className="product-title">{product.name}</h1>

                {product.ratingCount > 0 && (
                  <div className="product-rating">
                    <i className="bi bi-star-fill text-warning-stars"></i>
                    <span className="fw-semibold text-dark">{product.rating}</span>
                    <span>({product.ratingCount} reviews)</span>
                  </div>
                )}

                <div className="product-price-block">
                  <span className="product-price-current">{formatCurrency(displayPrice)}</span>
                  {displayOriginal && displayOriginal > displayPrice && (
                    <>
                      <span className="product-price-original">{formatCurrency(displayOriginal)}</span>
                      {discountPercent > 0 && (
                        <span className="product-discount-badge">-{discountPercent}%</span>
                      )}
                    </>
                  )}
                </div>

                <p className="text-muted small mb-3">
                  <i className="bi bi-truck me-1"></i>
                  Shipping: {formatCurrency(getProductShippingCharge(product.shippingCharge))}
                </p>

                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}

                {sortedOptions.length > 0 && (
                  <VariantOptionPicker
                    groups={sortedOptions}
                    variants={product.variants ?? []}
                    selectedOptions={selectedOptions}
                    onSelect={handleOptionSelect}
                  />
                )}

                <div className="product-actions">
                  <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-3">
                    {canPurchase && (
                      <div className="product-qty-control">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <i className="bi bi-dash-lg"></i>
                        </button>
                        <span>{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                          disabled={quantity >= maxStock}
                          aria-label="Increase quantity"
                        >
                          <i className="bi bi-plus-lg"></i>
                        </button>
                      </div>
                    )}

                    <div className="d-flex gap-2 flex-grow-1">
                      <button
                        onClick={handleAddToCart}
                        disabled={!canPurchase}
                        className="btn btn-outline-primary product-btn-cart flex-grow-1"
                      >
                        <i className="bi bi-bag-plus me-2"></i>
                        Add to Cart
                      </button>
                      <button
                        onClick={handleBuyNow}
                        disabled={!canPurchase}
                        className="btn btn-primary product-btn-buy flex-grow-1 text-white"
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`btn product-btn-wishlist ${isFav ? "btn-danger text-white" : "btn-light border"}`}
                        aria-label="Toggle wishlist"
                      >
                        <i className={`bi fs-5 ${isFav ? "bi-heart-fill" : "bi-heart"}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {Object.keys(product.specifications).length > 0 && (
          <div className="product-specs-card p-4 p-lg-5 mb-5">
            <h2 className="fw-bold mb-4" style={{ fontSize: "1.35rem" }}>
              Specifications
            </h2>
            <div className="product-specs-grid">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="product-spec-row">
                  <div className="product-spec-key">{key}</div>
                  <div className="product-spec-value">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedProducts.length > 0 && (
          <section className="mb-4">
            <h2 className="fw-bold mb-4" style={{ fontSize: "1.35rem" }}>
              You May Also Like
            </h2>
            <div className="row g-4">
              {relatedProducts.map((p) => (
                <div key={p.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
