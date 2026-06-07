"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/format";
import { useToast } from "@/hooks/useToast";
import CategoryLabel from "@/components/CategoryLabel";
import { resolveVariant } from "@/lib/product-utils";
import type { CartItem } from "@/context/AppContext";

export default function CartPage() {
  const {
    cart,
    cartSubtotal,
    cartTax,
    shippingCost,
    updateCartQuantity,
    removeFromCart,
  } = useCart();

  const { user } = useAuth();
  const router = useRouter();
  const { toastSuccess } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in percent

  const getItemMaxStock = (item: CartItem) => {
    const variants = item.product.variants ?? [];
    if (item.variantId) {
      const byId = variants.find((v) => v.id === item.variantId);
      if (byId) return byId.stock;
    }
    if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
      const byOptions = resolveVariant(variants, item.selectedOptions);
      if (byOptions) return byOptions.stock;
    }
    return item.product.stockCount;
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.toUpperCase().trim();
    if (code === "WELCOME10") {
      setAppliedDiscount(10);
      toastSuccess("Promo code WELCOME10 applied! You saved 10% on your items.");
    } else if (code === "SAVEMORE") {
      setAppliedDiscount(15);
      toastSuccess("Promo code SAVEMORE applied! You saved 15% on your items.");
    } else {
      toastSuccess("Invalid promo code. Try WELCOME10.");
    }
  };

  const discountAmount = cartSubtotal * (appliedDiscount / 100);
  const finalSubtotal = cartSubtotal - discountAmount;
  const finalTotal = finalSubtotal + cartTax + shippingCost;

  const handleCheckout = () => {
    if (user) {
      router.push("/checkout");
    } else {
      router.push("/login?redirect=/checkout");
    }
  };

  return (
    <div className="d-flex flex-column min-h-screen bg-light">
      <Navbar />

      <main className="container py-5">
        <h1 className="fw-bold mb-4" style={{ fontSize: "2rem" }}>
          Shopping Cart
        </h1>

        {cart.length > 0 ? (
          <div className="row g-4">
            {/* Items Column */}
            <div className="col-lg-8">
              <div className="d-flex flex-column gap-3">
                {cart.map((item, index) => (
                  <div
                    key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
                    className="card border-0 shadow-sm p-3 rounded-4 bg-white"
                  >
                    <div className="row align-items-center g-3">
                      {/* Product Thumbnail */}
                      <div className="col-3 col-sm-2 col-md-2">
                        <Link href={`/products/${item.product.id}`}>
                          <div
                            className="bg-light rounded overflow-hidden d-flex align-items-center justify-content-center"
                            style={{ height: "80px", border: "1px solid var(--gray-border)" }}
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-100 h-100 object-fit-contain p-1"
                            />
                          </div>
                        </Link>
                      </div>

                      {/* Product details */}
                      <div className="col-9 col-sm-4 col-md-5">
                        <h6 className="fw-bold text-dark mb-1 text-truncate">
                          <Link href={`/products/${item.product.id}`} className="text-dark hover-primary">
                            {item.product.name}
                          </Link>
                        </h6>
                        <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                          Category: <CategoryLabel slug={item.product.category} />
                        </p>
                        {(item.selectedColor || item.selectedSize) && (
                          <div className="d-flex gap-2 mt-1">
                            {item.selectedColor && (
                              <span className="badge bg-light text-secondary border px-2 py-1" style={{ fontSize: "0.65rem" }}>
                                Color: {item.selectedColor}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="badge bg-light text-secondary border px-2 py-1" style={{ fontSize: "0.65rem" }}>
                                Size: {item.selectedSize}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="col-5 col-sm-3 col-md-3 d-flex align-items-center">
                        <div className="d-flex align-items-center border rounded-pill px-2 py-1 bg-light">
                          <button
                            className="btn btn-link text-secondary p-0 border-0 fs-5"
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.selectedColor,
                                item.selectedSize,
                                item.selectedOptions
                              )
                            }
                            disabled={item.quantity <= 1}
                            style={{ width: "24px", height: "24px" }}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <span className="fw-bold text-dark px-2" style={{ fontSize: "0.9rem" }}>
                            {item.quantity}
                          </span>
                          <button
                            className="btn btn-link text-secondary p-0 border-0 fs-5"
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.selectedColor,
                                item.selectedSize,
                                item.selectedOptions
                              )
                            }
                            disabled={item.quantity >= getItemMaxStock(item)}
                            style={{ width: "24px", height: "24px" }}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </div>

                      {/* Pricing and delete */}
                      <div className="col-7 col-sm-3 col-md-2 text-end d-flex flex-row flex-sm-column align-items-center align-items-sm-end justify-content-between justify-content-sm-center gap-2">
                        <span className="fw-bold text-dark fs-5" style={{ fontFamily: "var(--heading-font)" }}>
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                        <button
                          className="btn btn-outline-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center border-0 text-muted hover-danger"
                          style={{ width: "32px", height: "32px" }}
                          onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize, item.selectedOptions)}
                          title="Remove item"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping button */}
              <div className="mt-4 text-start">
                <Link href="/products" className="btn btn-outline-primary px-4 py-2 rounded-pill fw-semibold btn-sm">
                  <i className="bi bi-arrow-left me-2"></i> Continue Shopping
                </Link>
              </div>
            </div>

            {/* Checkout / Summary Column */}
            <div className="col-lg-4">
              {/* Order Summary Panel */}
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
                <h5 className="fw-bold mb-4">Order Summary</h5>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Subtotal</span>
                    <span className="fw-bold text-dark">{formatCurrency(cartSubtotal)}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="d-flex justify-content-between align-items-center text-success">
                      <span>Discount ({appliedDiscount}%)</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Estimated Tax (8%)</span>
                    <span className="fw-bold text-dark">{formatCurrency(cartTax)}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Shipping Cost</span>
                    <span className="fw-bold text-dark">
                      {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
                    </span>
                  </div>

                  <hr className="my-2" />

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-dark fs-5">Estimated Total</span>
                    <span className="fw-extrabold text-primary fs-4" style={{ fontFamily: "var(--heading-font)" }}>
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="btn btn-primary w-100 py-3 rounded-pill fw-bold text-white shadow-sm"
                  >
                    Proceed to Checkout <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>

              {/* Promo Code Form */}
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                <h6 className="fw-bold text-dark mb-3">Apply Promo Code</h6>
                <form onSubmit={handleApplyPromo} className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    placeholder="e.g. WELCOME10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    style={{ fontSize: "0.85rem" }}
                  />
                  <button type="submit" className="btn btn-outline-primary px-3 rounded-pill fw-semibold btn-sm">
                    Apply
                  </button>
                </form>
                <small className="text-muted mt-2 d-block" style={{ fontSize: "0.75rem" }}>
                  Try entering **WELCOME10** for 10% off or **SAVEMORE** for 15% off!
                </small>
              </div>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4 p-5">
            <EmptyState
              title="Your Shopping Cart is Empty"
              description="It looks like you haven't added anything to your shopping cart yet. Browse our products catalog to discover top trending electronics and accessories."
              icon="bi-cart-x"
              actionText="Shop Products Now"
              actionHref="/products"
            />
          </div>
        )}
      </main>

      <Footer />
      <style jsx>{`
        .min-h-screen {
          min-height: 100vh;
        }
        .hover-danger:hover {
          background-color: #fef2f2 !important;
          color: #ef4444 !important;
          border-color: #fef2f2 !important;
        }
      `}</style>
    </div>
  );
}
