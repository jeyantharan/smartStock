"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { Product } from "@/context/AppContext";
import { formatCurrency, formatDate } from "@/utils/format";
import { useToast } from "@/hooks/useToast";

type TabType = "profile" | "orders" | "addresses" | "wishlist";

export default function DashboardPage() {
  const { user, authLoading, logout, addAddress, removeAddress, updateProfile, uploadAvatar, refreshUser } = useAuth();
  const { wishlist } = useWishlist();
  const { toastWarning } = useToast();
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Edit Profile States
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // New Address States
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    title: "Home",
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
  });

  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Refresh user data (orders, addresses) from database on visit
  useEffect(() => {
    if (!authLoading && user) {
      refreshUser();
    }
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load wishlist products from API
  useEffect(() => {
    if (!user || wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }

    setWishlistLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data?.products) {
          const products = result.data.products as Product[];
          setWishlistProducts(products.filter((p) => wishlist.includes(p.id)));
        }
      })
      .finally(() => setWishlistLoading(false));
  }, [user, wishlist]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="d-flex flex-column min-h-screen bg-light">
        <Navbar />
        <div className="container py-5 my-5 text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-3">Loading your profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="d-flex flex-column min-h-screen bg-light">
        <Navbar />
        <div className="container py-5 my-5">
          <div className="card border-0 shadow-sm rounded-4 p-5">
            <EmptyState
              title="Access Restricted"
              description="Please log in to view your customer profile dashboard, inspect order history, and manage addresses."
              icon="bi-lock"
              actionText="Log In Here"
              actionHref="/login"
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name) {
      toastWarning("Name is required.");
      return;
    }
    setIsSavingProfile(true);
    await updateProfile(profileForm.name, profileForm.phone);
    setIsSavingProfile(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    await uploadAvatar(file);
    setIsUploadingAvatar(false);
    e.target.value = "";
  };

  const handleAddNewAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, addressLine1, city, state, zipCode, phone } = newAddressForm;
    if (!fullName || !addressLine1 || !city || !state || !zipCode || !phone) {
      toastWarning("Please fill in all required address fields.");
      return;
    }
    const result = await addAddress(newAddressForm);
    if (!result.success) return;
    setIsAddingNewAddress(false);
    setNewAddressForm({
      title: "Home",
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      phone: "",
    });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const orderStatusClass = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-success";
      case "Shipped":
        return "bg-info";
      case "Cancelled":
        return "bg-danger";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="d-flex flex-column min-h-screen bg-light">
      <Navbar />

      <main className="container py-5">
        <div className="row g-4">
          {/* Sidebar Navigation */}
          <aside className="col-lg-3">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
              {/* Profile Card Header */}
              <div className="text-center pb-4 mb-4 border-bottom">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="rounded-circle mx-auto mb-3 object-fit-cover border border-2 border-primary"
                    style={{ width: "65px", height: "65px" }}
                  />
                ) : (
                  <div
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold"
                    style={{ width: "65px", height: "65px", fontSize: "1.5rem" }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h5 className="fw-bold mb-1">{user.name}</h5>
                <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
                  {user.email}
                </p>
              </div>

              {/* Navigation Menu */}
              <div className="d-flex flex-column gap-1">
                {[
                  { id: "profile", label: "Edit Profile", icon: "bi-person" },
                  { id: "orders", label: "Order History", icon: "bi-clock-history" },
                  { id: "addresses", label: "Saved Addresses", icon: "bi-geo-alt" },
                  { id: "wishlist", label: "My Wishlist", icon: "bi-heart" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`btn text-start d-flex align-items-center gap-3 py-2.5 px-3 rounded-pill border-0 transition-base ${
                      activeTab === tab.id
                        ? "btn-primary text-white"
                        : "btn-light text-secondary hover-bg-light"
                    }`}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      setIsAddingNewAddress(false);
                    }}
                    style={{ fontSize: "0.9rem" }}
                  >
                    <i className={`bi ${tab.icon} fs-5`}></i>
                    <span className="fw-semibold">{tab.label}</span>
                  </button>
                ))}

                <hr className="my-3 text-muted" />

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-3 py-2 px-3 rounded-pill"
                  style={{ fontSize: "0.9rem" }}
                >
                  <i className="bi bi-box-arrow-left"></i>
                  <span className="fw-bold">Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Panel */}
          <section className="col-lg-9">
            <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white h-100">
              
              {/* Tab: PROFILE */}
              {activeTab === "profile" && (
                <div>
                  <h4 className="fw-bold mb-2">Profile Details</h4>
                  <p className="text-muted mb-4 pb-2 border-bottom" style={{ fontSize: "0.85rem" }}>
                    Update your profile photo and personal information.
                  </p>

                  <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                    <div className="position-relative">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="rounded-circle object-fit-cover border"
                          style={{ width: "90px", height: "90px" }}
                        />
                      ) : (
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: "90px", height: "90px", fontSize: "2rem" }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isUploadingAvatar && (
                        <div
                          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle"
                          style={{ background: "rgba(255,255,255,0.7)" }}
                        >
                          <span className="spinner-border spinner-border-sm text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold mb-1">
                        {isUploadingAvatar ? "Uploading..." : "Change Photo"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="d-none"
                          disabled={isUploadingAvatar}
                          onChange={handleAvatarChange}
                        />
                      </label>
                      <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                        JPG, PNG, WebP or GIF. Max 5MB.
                      </p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleProfileSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control bg-light"
                          readOnly
                          value={profileForm.email}
                        />
                        <small className="text-muted">Email cannot be changed.</small>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
                          Phone Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="+1 (555) 000-0000"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="btn btn-primary px-4 py-2.5 rounded-pill fw-semibold shadow-sm mt-4 d-flex align-items-center gap-2"
                    >
                      {isSavingProfile && <span className="spinner-border spinner-border-sm" />}
                      Save Profile Updates
                    </button>
                  </form>
                </div>
              )}

              {/* Tab: ORDERS */}
              {activeTab === "orders" && (
                <div>
                  <h4 className="fw-bold mb-2">Order History</h4>
                  <p className="text-muted mb-4 pb-2 border-bottom" style={{ fontSize: "0.85rem" }}>
                    View current processing order tracking states and invoice details.
                  </p>

                  {user.orders.length > 0 ? (
                    <div className="d-flex flex-column gap-4">
                      {user.orders.map((order) => (
                        <div key={order.id} className="card border rounded-4 overflow-hidden">
                          {/* Order Header panel */}
                          <div className="bg-light p-3 border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                            <div className="d-flex flex-wrap gap-3" style={{ fontSize: "0.8rem" }}>
                              <div>
                                <span className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "0.65rem" }}>Order Placed</span>
                                <span className="fw-semibold text-dark">{formatDate(order.date)}</span>
                              </div>
                              <div>
                                <span className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "0.65rem" }}>Total Paid</span>
                                <span className="fw-semibold text-primary">{formatCurrency(order.total)}</span>
                              </div>
                              <div>
                                <span className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "0.65rem" }}>Ship to</span>
                                <span className="fw-semibold text-dark" title={order.shippingAddress.addressLine1}>
                                  {order.shippingAddress.fullName}
                                </span>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted me-2" style={{ fontSize: "0.8rem" }}>ID: **{order.id}**</span>
                              <span className={`badge ${orderStatusClass(order.status)} badge-custom`}>
                                {order.status}
                              </span>
                            </div>
                          </div>

                          {/* Order Items list */}
                          <div className="p-3">
                            <div className="d-flex flex-column gap-3">
                              {order.items.map((item, index) => (
                                <div key={index} className="d-flex align-items-center justify-content-between gap-3">
                                  <div className="d-flex align-items-center gap-3 min-w-0">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="object-fit-cover rounded bg-light"
                                      style={{ width: "50px", height: "50px" }}
                                    />
                                    <div className="min-w-0">
                                      <h6 className="fw-bold mb-1 text-dark text-truncate" style={{ fontSize: "0.875rem" }}>
                                        {item.name}
                                      </h6>
                                      <small className="text-muted">
                                        Quantity: {item.quantity} | Price: {formatCurrency(item.price)}
                                      </small>
                                    </div>
                                  </div>
                                  <Link href={`/products/${item.productId}`} className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1">
                                    Buy Again
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No Orders Placed Yet"
                      description="You haven't placed any purchases with us. Visit our shop catalog to find smart watches and dynamic electronics."
                      icon="bi-basket"
                      actionText="Start Shopping"
                      actionHref="/products"
                    />
                  )}
                </div>
              )}

              {/* Tab: ADDRESSES */}
              {activeTab === "addresses" && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h4 className="fw-bold mb-0">Saved Addresses</h4>
                    {!isAddingNewAddress && (
                      <button
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold"
                        onClick={() => setIsAddingNewAddress(true)}
                      >
                        + Add Address
                      </button>
                    )}
                  </div>
                  <p className="text-muted mb-4 pb-2 border-bottom" style={{ fontSize: "0.85rem" }}>
                    Configure multiple shipment locations for quick ordering cycles.
                  </p>

                  {isAddingNewAddress ? (
                    <form onSubmit={handleAddNewAddressSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
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
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
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
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
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
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
                            Apartment, Suite, Unit, etc.
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={newAddressForm.addressLine2}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, addressLine2: e.target.value })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
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
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
                            State *
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
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
                            Zip Code *
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
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
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
                          <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
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
                    <div>
                      {user.addresses.length > 0 ? (
                        <div className="row g-3">
                          {user.addresses.map((addr) => (
                            <div key={addr.id} className="col-md-6">
                              <div className="card border p-3 rounded-4 h-100 d-flex flex-column justify-content-between">
                                <div>
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="badge bg-primary text-white px-2 py-1 rounded">
                                      {addr.title}
                                    </span>
                                  </div>
                                  <h6 className="fw-bold mb-1">{addr.fullName}</h6>
                                  <p className="text-muted mb-1" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
                                    {addr.addressLine1} {addr.addressLine2 && `, ${addr.addressLine2}`}
                                    <br />
                                    {addr.city}, {addr.state} {addr.zipCode}
                                  </p>
                                  <small className="text-secondary fw-medium" style={{ fontSize: "0.75rem" }}>
                                    Phone: {addr.phone}
                                  </small>
                                </div>
                                <div className="text-end mt-3 border-top pt-2">
                                  <button
                                    onClick={() => removeAddress(addr.id)}
                                    className="btn btn-link text-danger p-0 border-0 fw-semibold text-decoration-none"
                                    style={{ fontSize: "0.8rem" }}
                                  >
                                    <i className="bi bi-trash me-1"></i> Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted">No shipping addresses configured. Create one below.</p>
                          <button
                            onClick={() => setIsAddingNewAddress(true)}
                            className="btn btn-primary btn-sm rounded-pill px-4"
                          >
                            + Add New Address
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: WISHLIST */}
              {activeTab === "wishlist" && (
                <div>
                  <h4 className="fw-bold mb-2">My Wishlist</h4>
                  <p className="text-muted mb-4 pb-2 border-bottom" style={{ fontSize: "0.85rem" }}>
                    Track favorite products catalog and quick add them to cart.
                  </p>

                  {wishlistLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" />
                    </div>
                  ) : wishlistProducts.length > 0 ? (
                    <div className="row g-4">
                      {wishlistProducts.map((p) => (
                        <div key={p.id} className="col-12 col-sm-6 col-md-4">
                          <div className="position-relative">
                            <ProductCard product={p} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="Your Wishlist is Empty"
                      description="You haven't liked any items yet. Browse around to find electronics, bags, and items you love."
                      icon="bi-heart"
                      actionText="Find Products"
                      actionHref="/products"
                    />
                  )}
                </div>
              )}

            </div>
          </section>
        </div>
      </main>

      <Footer />
      <style jsx>{`
        .min-h-screen {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}
