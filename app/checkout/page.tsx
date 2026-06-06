"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/format";
import { useToast } from "@/hooks/useToast";

/** Only Cash on Delivery is enabled for now — other methods kept for future use */
const ENABLED_PAYMENT = "cod";
const LEGACY_CARD_FORM_ENABLED = false;

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  credit_card: "Credit Card",
  paypal: "PayPal",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, cartTax, shippingCost, cartTotal } = useCart();
  const { user, authLoading, addAddress, placeOrder } = useAuth();
  const { toastWarning } = useToast();

  // Address State
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    title: "Home",
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Sri Lanka",
    phone: "",
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState(ENABLED_PAYMENT);
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  // Flow control states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [latestOrderId, setLatestOrderId] = useState("");

  // Require login to checkout
  useEffect(() => {
    if (!authLoading && !user && !isOrderPlaced) {
      router.replace("/login?redirect=/checkout");
    }
  }, [authLoading, user, isOrderPlaced, router]);

  // Select first address by default
  useEffect(() => {
    if (user && user.addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(user.addresses[0].id);
    }
  }, [user, selectedAddressId]);

  if (authLoading) {
    return (
      <div className="d-flex flex-column min-h-screen bg-light">
        <Navbar />
        <div className="container py-5 my-5 text-center">
          <div className="spinner-border text-primary" />
          <p className="text-muted small mt-3 mb-0">Loading checkout...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user && !isOrderPlaced) {
    return (
      <div className="d-flex flex-column min-h-screen bg-light">
        <Navbar />
        <div className="container py-5 my-5">
          <div className="card border-0 shadow-sm rounded-4 p-5">
            <EmptyState
              title="Login Required"
              description="Please sign in to your account before checkout."
              icon="bi-person-lock"
              actionText="Log In"
              actionHref="/login?redirect=/checkout"
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0 && !isOrderPlaced) {
    return (
      <div className="d-flex flex-column min-h-screen bg-light">
        <Navbar />
        <div className="container py-5 my-5">
          <div className="card border-0 shadow-sm rounded-4 p-5">
            <EmptyState
              title="Nothing to Checkout"
              description="Your shopping cart is currently empty. Add some items to your cart before proceeding to checkout."
              icon="bi-bag-x"
              actionText="View Shop Products"
              actionHref="/products"
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddNewAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, addressLine1, city, state, zipCode, phone } = newAddressForm;
    
    if (!fullName || !addressLine1 || !city || !state || !zipCode || !phone) {
      toastWarning("Please fill in all required address fields.");
      return;
    }

    addAddress(newAddressForm);
    setIsAddingNewAddress(false);
    setNewAddressForm({
      title: "Home",
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Sri Lanka",
      phone: "",
    });
  };

  const handlePaymentSelect = (method: string) => {
    if (method !== ENABLED_PAYMENT) {
      toastWarning(
        `${PAYMENT_LABELS[method] ?? "This payment method"} is not available yet. Please use Cash on Delivery.`
      );
      return;
    }
    setPaymentMethod(method);
  };

  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId) {
      toastWarning("Please choose or add a shipping address.");
      return;
    }

    if (paymentMethod !== ENABLED_PAYMENT) {
      toastWarning("This payment method is not available yet. Please use Cash on Delivery.");
      return;
    }

    setIsProcessing(true);

    const result = await placeOrder(
      selectedAddressId,
      PAYMENT_LABELS[paymentMethod] ?? "Cash on Delivery"
    );

    setIsProcessing(false);

    if (result.success && result.orderId) {
      setLatestOrderId(result.orderId);
      setIsOrderPlaced(true);
    }
  };

  return (
    <div className="d-flex flex-column min-h-screen bg-light">
      <Navbar />

      <main className="container py-5">
        {isOrderPlaced ? (
          /* Confirmation View */
          <div className="card border-0 shadow-sm p-5 rounded-4 bg-white text-center max-w-md mx-auto" style={{ maxWidth: "600px" }}>
            <div
              className="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
              style={{ width: "80px", height: "80px" }}
            >
              <i className="bi bi-patch-check-fill fs-1 text-success"></i>
            </div>
            <h1 className="fw-extrabold text-dark mb-2">Order Confirmed!</h1>
            <p className="text-muted mb-4" style={{ fontSize: "1rem" }}>
              Thank you for shopping with Smart Stock. Your order **{latestOrderId}** is being processed and will ship shortly.
            </p>

            <div className="card bg-light border-0 p-3 mb-4 text-start" style={{ borderRadius: "10px" }}>
              <h6 className="fw-bold text-dark mb-2">Delivery updates</h6>
              <p className="text-muted mb-0" style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
                A confirmation email has been dispatched to **{user?.email || "your email"}**. You can monitor shipping status anytime on your user dashboard profile.
              </p>
            </div>

            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Link href="/dashboard" className="btn btn-primary px-4 py-2.5 rounded-pill fw-bold text-white shadow-sm">
                Go to Dashboard
              </Link>
              <Link href="/products" className="btn btn-outline-primary px-4 py-2.5 rounded-pill fw-bold">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          /* Checkout Forms */
          <div className="row g-4">
            <div className="col-lg-8">
              <h1 className="fw-bold mb-4" style={{ fontSize: "2rem" }}>
                Checkout
              </h1>

              {/* 1. SHIPPING ADDRESS */}
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0">1. Shipping Address</h4>
                  {!isAddingNewAddress && (
                    <button
                      className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold"
                      onClick={() => setIsAddingNewAddress(true)}
                    >
                      + Add New Address
                    </button>
                  )}
                </div>

                {isAddingNewAddress ? (
                  /* Form to add address */
                  <form onSubmit={handleAddNewAddressSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-medium" style={{ fontSize: "0.8rem" }}>
                          Address Title (e.g. Home, Office) *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={newAddressForm.title}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, title: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-medium" style={{ fontSize: "0.8rem" }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={newAddressForm.fullName}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, fullName: e.target.value })}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-muted fw-medium" style={{ fontSize: "0.8rem" }}>
                          Street Address Line 1 *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="House number and street name"
                          required
                          value={newAddressForm.addressLine1}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, addressLine1: e.target.value })}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-muted fw-medium" style={{ fontSize: "0.8rem" }}>
                          Apartment, Suite, Unit, etc. (optional)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Apartment, suite, unit, building, floor, etc."
                          value={newAddressForm.addressLine2}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, addressLine2: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted fw-medium" style={{ fontSize: "0.8rem" }}>
                          City *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={newAddressForm.city}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted fw-medium" style={{ fontSize: "0.8rem" }}>
                          State / Region *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={newAddressForm.state}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted fw-medium" style={{ fontSize: "0.8rem" }}>
                          Zip / Postal Code *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={newAddressForm.zipCode}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, zipCode: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-medium" style={{ fontSize: "0.8rem" }}>
                          Country *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          disabled
                          value={newAddressForm.country}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-medium" style={{ fontSize: "0.8rem" }}>
                          Phone Number *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={newAddressForm.phone}
                          onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-4">
                      <button type="submit" className="btn btn-primary px-4 py-2 rounded-pill fw-semibold btn-sm">
                        Save Address
                      </button>
                      <button
                        type="button"
                        className="btn btn-light px-4 py-2 rounded-pill fw-semibold btn-sm"
                        onClick={() => setIsAddingNewAddress(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Address selection */
                  <div>
                    {user && user.addresses.length > 0 ? (
                      <div className="row g-3">
                        {user.addresses.map((addr) => (
                          <div key={addr.id} className="col-md-6">
                            <label className="w-100 cursor-pointer h-100">
                              <input
                                type="radio"
                                name="shipping_address"
                                className="card-input-element d-none"
                                value={addr.id}
                                checked={selectedAddressId === addr.id}
                                onChange={() => setSelectedAddressId(addr.id)}
                              />
                              <div
                                className={`card border h-100 p-3 rounded-4 cursor-pointer hover-card-border transition-base ${
                                  selectedAddressId === addr.id ? "border-primary bg-primary-light" : "border-light"
                                }`}
                                style={{ border: "1.5px solid !important" }}
                              >
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="badge bg-primary text-white px-2 py-1 rounded">
                                    {addr.title}
                                  </span>
                                  {selectedAddressId === addr.id && (
                                    <i className="bi bi-check-circle-fill text-primary"></i>
                                  )}
                                </div>
                                <h6 className="fw-bold mb-1">{addr.fullName}</h6>
                                <p className="text-muted mb-1 text-truncate-2" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
                                  {addr.addressLine1} {addr.addressLine2 && `, ${addr.addressLine2}`}
                                  <br />
                                  {addr.city}, {addr.state} {addr.zipCode}
                                </p>
                                <small className="text-secondary fw-medium" style={{ fontSize: "0.75rem" }}>
                                  Phone: {addr.phone}
                                </small>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-muted">No addresses saved. Please add a shipping address.</p>
                        <button
                          className="btn btn-primary btn-sm rounded-pill px-4"
                          onClick={() => setIsAddingNewAddress(true)}
                        >
                          Add Shipping Address
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. PAYMENT METHODS */}
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
                <h4 className="fw-bold mb-4">2. Payment Method</h4>
                <div className="d-flex flex-column gap-3">
                  {/* Cash on Delivery — active */}
                  <div className="form-check p-0">
                    <label className="w-100 cursor-pointer">
                      <div
                        className={`card border p-3 rounded-4 transition-base ${
                          paymentMethod === "cod" ? "border-primary bg-primary-light" : "border-light"
                        }`}
                        onClick={() => handlePaymentSelect("cod")}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-3">
                            <input
                              className="form-check-input ms-0 mt-0"
                              type="radio"
                              name="payment_option"
                              checked={paymentMethod === "cod"}
                              readOnly
                            />
                            <div>
                              <h6 className="fw-bold mb-0 text-dark">Cash on Delivery</h6>
                              <small className="text-muted">Pay when your order arrives</small>
                            </div>
                          </div>
                          <div className="d-flex align-items-center text-success fs-3">
                            <i className="bi bi-cash-coin"></i>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Credit Card radio option — disabled for now */}
                  <div className="form-check p-0">
                    <label className="w-100" style={{ cursor: "not-allowed" }}>
                      <div
                        className="card border p-3 rounded-4 transition-base opacity-75 border-light bg-light"
                        onClick={() => handlePaymentSelect("credit_card")}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-3">
                            <input
                              className="form-check-input ms-0 mt-0"
                              type="radio"
                              name="payment_option"
                              checked={false}
                              disabled
                              readOnly
                            />
                            <div>
                              <h6 className="fw-bold mb-0 text-dark">Credit / Debit Card</h6>
                              <span className="badge bg-secondary-subtle text-secondary mt-1" style={{ fontSize: "0.65rem" }}>
                                Not available
                              </span>
                            </div>
                          </div>
                          <div className="d-flex gap-1 fs-3 text-secondary">
                            <i className="bi bi-credit-card-2-back"></i>
                          </div>
                        </div>

                        {LEGACY_CARD_FORM_ENABLED && paymentMethod === "credit_card" && (
                          <div className="mt-4 pt-3 border-top border-primary-subtle">
                            <div className="row g-3">
                              <div className="col-12">
                                <label className="form-label text-muted fw-medium" style={{ fontSize: "0.8rem" }}>
                                  Cardholder Name
                                </label>
                                <input
                                  type="text"
                                  className="form-control bg-white"
                                  placeholder="Jane Doe"
                                  value={cardForm.cardName}
                                  onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                                />
                              </div>
                              <div className="col-12">
                                <label className="form-label text-muted fw-medium" style={{ fontSize: "0.8rem" }}>
                                  Card Number
                                </label>
                                <input
                                  type="text"
                                  className="form-control bg-white"
                                  placeholder="0000 0000 0000 0000"
                                  value={cardForm.cardNumber}
                                  onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label text-muted fw-medium" style={{ fontSize: "0.8rem" }}>
                                  Expiry Date
                                </label>
                                <input
                                  type="text"
                                  className="form-control bg-white"
                                  placeholder="MM/YY"
                                  value={cardForm.expiry}
                                  onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label text-muted fw-medium" style={{ fontSize: "0.8rem" }}>
                                  CVV
                                </label>
                                <input
                                  type="text"
                                  className="form-control bg-white"
                                  placeholder="123"
                                  value={cardForm.cvv}
                                  onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* PayPal Option — disabled for now */}
                  <div className="form-check p-0">
                    <label className="w-100" style={{ cursor: "not-allowed" }}>
                      <div
                        className="card border p-3 rounded-4 transition-base opacity-75 border-light bg-light"
                        onClick={() => handlePaymentSelect("paypal")}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-3">
                            <input
                              className="form-check-input ms-0 mt-0"
                              type="radio"
                              name="payment_option"
                              checked={false}
                              disabled
                              readOnly
                            />
                            <div>
                              <h6 className="fw-bold mb-0 text-dark">PayPal Checkout</h6>
                              <span className="badge bg-secondary-subtle text-secondary mt-1" style={{ fontSize: "0.65rem" }}>
                                Not available
                              </span>
                            </div>
                          </div>
                          <div className="d-flex align-items-center text-secondary fs-3">
                            <i className="bi bi-paypal"></i>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="col-lg-4">
              {/* Order Summary Checkout */}
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-4">
                <h5 className="fw-bold mb-4">Checkout Summary</h5>
                
                {/* Product List mini */}
                <div className="d-flex flex-column gap-3 mb-4 max-h-section" style={{ maxHeight: "250px", overflowY: "auto" }}>
                  {cart.map((item, index) => (
                    <div key={index} className="d-flex align-items-center justify-content-between gap-3">
                      <div className="d-flex align-items-center gap-2 min-w-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="object-fit-cover rounded bg-light"
                          style={{ width: "40px", height: "40px" }}
                        />
                        <div className="min-w-0">
                          <h6 className="fw-bold text-dark mb-0 text-truncate" style={{ fontSize: "0.8rem" }}>
                            {item.product.name}
                          </h6>
                          <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                            Qty: {item.quantity} {item.selectedColor && `| ${item.selectedColor}`}
                          </small>
                        </div>
                      </div>
                      <span className="fw-semibold text-dark text-nowrap" style={{ fontSize: "0.85rem" }}>
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <hr className="my-3" />

                <div className="d-flex flex-column gap-2" style={{ fontSize: "0.875rem" }}>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Subtotal</span>
                    <span className="fw-semibold text-dark">{formatCurrency(cartSubtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Taxes (8%)</span>
                    <span className="fw-semibold text-dark">{formatCurrency(cartTax)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Shipping</span>
                    <span className="fw-semibold text-dark">{formatCurrency(shippingCost)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-dark">Total Amount</span>
                    <span className="fw-extrabold text-primary fs-5" style={{ fontFamily: "var(--heading-font)" }}>
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={handlePlaceOrderSubmit}
                    disabled={isProcessing}
                    className="btn btn-primary w-100 py-3 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Processing Transaction...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-bag-check-fill"></i> Place Order (Cash on Delivery)
                      </>
                    )}
                  </button>
                  <small className="text-center text-muted mt-2 d-block" style={{ fontSize: "0.75rem" }}>
                    Pay with cash when your order is delivered.
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <style jsx global>{`
        .min-h-screen {
          min-height: 100vh;
        }
        .hover-card-border:hover {
          border-color: var(--primary-color) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
