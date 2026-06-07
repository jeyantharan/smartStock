"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import Logo from "@/components/Logo";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { getTopLevelCategories } from "@/lib/category-utils";
import { useToast } from "@/hooks/useToast";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const { toastSuccess, toastWarning } = useToast();
  const { products, loading: productsLoading } = useProducts();
  const { tree: categoryTree, loading: categoriesLoading } = useCategories();
  const topCategories = getTopLevelCategories(categoryTree);

  const pageLoading = productsLoading || categoriesLoading;

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const latestProducts = products.filter((p) => p.isLatest).slice(0, 4);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toastWarning("Please enter an email address.");
      return;
    }
    if (!email.includes("@")) {
      toastWarning("Please enter a valid email address.");
      return;
    }
    toastSuccess("Thank you for subscribing! Check your inbox for your 15% discount code.");
    setEmail("");
  };

  if (pageLoading) {
    return (
      <div className="home-loader d-flex flex-column align-items-center justify-content-center min-vh-100 bg-white">
        <div className="home-loader-pulse mb-4">
          <Logo size="xl" href={null} priority />
        </div>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3 mb-0 fw-semibold">Loading your experience…</p>

        <style jsx>{`
          .home-loader-pulse {
            animation: home-loader-pulse 1.4s ease-in-out infinite;
          }
          @keyframes home-loader-pulse {
            0%,
            100% {
              transform: scale(1);
              opacity: 0.85;
            }
            50% {
              transform: scale(1.06);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-light py-5 py-lg-6 mb-5 border-bottom">
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="badge bg-primary-light text-primary mb-3 px-3 py-2 badge-custom rounded-pill">
                Summer Collection 2026
              </span>
              <h1 className="display-4 fw-extrabold mb-3 lh-sm" style={{ letterSpacing: "-0.02em" }}>
                Elevate Your Lifestyle with <span className="text-primary">Smart Stock</span>
              </h1>
              <p className="lead text-muted mb-4 pb-2" style={{ fontSize: "1.1rem", lineHeight: "1.7" }}>
                Discover curated luxury and smart electronics. Experience seamless performance, modern designs, and premium-grade build quality across all products.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                <Link href="/products" className="btn btn-primary btn-lg px-4 py-3 rounded-pill fw-semibold shadow-sm">
                  Shop Collection <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                <Link
                  href={
                    topCategories[0]
                      ? `/products?category=${topCategories[0].slug}`
                      : "/products"
                  }
                  className="btn btn-outline-primary btn-lg px-4 py-3 rounded-pill fw-semibold"
                >
                  Explore {topCategories[0]?.name ?? "Products"}
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative d-flex justify-content-center">
                {/* Visual Accent behind Image */}
                <div
                  className="position-absolute top-50 start-50 translate-middle bg-primary-light rounded-circle filter-blur"
                  style={{ width: "80%", height: "80%", opacity: 0.6, zIndex: 0, filter: "blur(50px)" }}
                ></div>
                <img
                  src="/images/hero_gadgets.png"
                  alt="Premium Smart Stock Showcase"
                  className="img-fluid rounded-4 shadow-lg position-relative z-1 hover-float"
                  style={{ maxWidth: "85%", transition: "transform 0.5s ease" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mb-5 py-4">
        <div className="text-center mb-5">
          <span className="text-primary fw-bold text-uppercase tracking-wider" style={{ fontSize: "0.8rem" }}>
            Curated Categories
          </span>
          <h2 className="fw-bold mt-2">Browse by Department</h2>
          <div className="bg-primary mx-auto mt-3 rounded" style={{ width: "50px", height: "4px" }}></div>
        </div>
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-4 justify-content-center">
          {categoriesLoading ? (
            <div className="col-12 text-center py-4">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            topCategories.map((category) => (
              <div key={category.id} className="col">
                <CategoryCard category={category} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="container mb-5 py-3">
        <div
          className="p-4 p-md-5 rounded-4 shadow-sm text-white position-relative overflow-hidden border-0 bg-dark"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(13, 110, 253, 0.95), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="row align-items-center position-relative z-2 g-4">
            <div className="col-lg-7">
              <span className="badge bg-white text-primary fw-bold mb-3 px-3 py-2 rounded-pill">
                Limited Time Offer
              </span>
              <h2 className="display-6 fw-extrabold text-white mb-3">
                Get 20% Off Aura Smartwatches
              </h2>
              <p className="lead mb-0 text-white-50" style={{ fontSize: "1rem" }}>
                Upgrade your fitness tracker and notifications system today. Deal applies automatically during checkout. Valid through this weekend only.
              </p>
            </div>
            <div className="col-lg-5 text-lg-end">
              <Link href="/products/prod-2" className="btn btn-white btn-light btn-lg px-4 py-3 rounded-pill fw-bold hover-scale text-primary shadow">
                Shop Smartwatch Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mb-5 py-4">
        <div className="d-flex justify-content-between align-items-end mb-4 pb-2">
          <div>
            <span className="text-primary fw-bold text-uppercase tracking-wider" style={{ fontSize: "0.8rem" }}>
              Editor&apos;s Choices
            </span>
            <h2 className="fw-bold mt-1 mb-0">Featured Products</h2>
          </div>
          <Link href="/products" className="text-primary fw-semibold hover-link">
            See All Products <i className="bi bi-chevron-right fs-7"></i>
          </Link>
        </div>
        <div className="row g-4">
          {featuredProducts.map((product) => (
            <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-light py-5 mb-5 border-top border-bottom">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-end mb-4 pb-2">
            <div>
              <span className="text-primary fw-bold text-uppercase tracking-wider" style={{ fontSize: "0.8rem" }}>
                Top Customer Choices
              </span>
              <h2 className="fw-bold mt-1 mb-0">Best Sellers</h2>
            </div>
            <Link href="/products" className="text-primary fw-semibold hover-link">
              See All <i className="bi bi-chevron-right fs-7"></i>
            </Link>
          </div>
          <div className="row g-4">
            {bestSellers.map((product) => (
              <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="container mb-5 py-4">
        <div className="d-flex justify-content-between align-items-end mb-4 pb-2">
          <div>
            <span className="text-primary fw-bold text-uppercase tracking-wider" style={{ fontSize: "0.8rem" }}>
              New Arrivals
            </span>
            <h2 className="fw-bold mt-1 mb-0">Latest Products</h2>
          </div>
          <Link href="/products" className="text-primary fw-semibold hover-link">
            See All <i className="bi bi-chevron-right fs-7"></i>
          </Link>
        </div>
        <div className="row g-4">
          {latestProducts.map((product) => (
            <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-light py-5 mb-5 border-top border-bottom">
        <div className="container py-3">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase tracking-wider" style={{ fontSize: "0.8rem" }}>
              Customer Experience
            </span>
            <h2 className="fw-bold mt-2">What Our Customers Say</h2>
            <div className="bg-primary mx-auto mt-3 rounded" style={{ width: "50px", height: "4px" }}></div>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "45px", height: "45px" }}>
                    AM
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Alex Mercer</h6>
                    <small className="text-muted">Verified Buyer</small>
                  </div>
                </div>
                <div className="text-warning-stars mb-2" style={{ fontSize: "0.8rem" }}>
                  <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i>
                </div>
                <p className="text-muted mb-0" style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                  &ldquo;The headphones are incredible! Active noise cancellation blocks out all office distraction and the build is premium. Shipping took only 2 days!&rdquo;
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "45px", height: "45px" }}>
                    SC
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Sarah Chen</h6>
                    <small className="text-muted">Verified Buyer</small>
                  </div>
                </div>
                <div className="text-warning-stars mb-2" style={{ fontSize: "0.8rem" }}>
                  <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-half"></i>
                </div>
                <p className="text-muted mb-0" style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                  &ldquo;AeroTrack Smartwatch is exactly what I needed. Track accuracy is perfect for my runs, and the AMOLED display looks incredibly sharp even in direct sunlight.&rdquo;
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "45px", height: "45px" }}>
                    MK
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Marcus K.</h6>
                    <small className="text-muted">Verified Buyer</small>
                  </div>
                </div>
                <div className="text-warning-stars mb-2" style={{ fontSize: "0.8rem" }}>
                  <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i>
                </div>
                <p className="text-muted mb-0" style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                  &ldquo;Excellent customer support. I had to change my shipping address post-order and their live chat resolved it in minutes. Extremely responsive team!&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mb-6 py-4">
        <div
          className="p-5 rounded-4 shadow-sm text-center border-0"
          style={{
            backgroundColor: "var(--gray-light)",
            border: "1px solid var(--gray-border)",
          }}
        >
          <div className="max-w-md mx-auto" style={{ maxWidth: "550px" }}>
            <i className="bi bi-envelope-open text-primary fs-1 mb-3"></i>
            <h2 className="fw-bold mb-2">Subscribe to our Newsletter</h2>
            <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
              Get updates about new arrivals, subscriber-only promo sales, and exclusive weekly catalog drops. No spam, unsubscribe anytime.
            </p>
            <form onSubmit={handleSubscribe} className="row g-2 justify-content-center">
              <div className="col-12 col-sm-8">
                <input
                  type="email"
                  className="form-control py-3 px-4 rounded-pill border-0 shadow-sm"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="col-12 col-sm-4">
                <button type="submit" className="btn btn-primary py-3 px-4 w-100 rounded-pill fw-semibold shadow-sm">
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .hover-float:hover {
          transform: translateY(-8px);
        }
        .hover-link {
          transition: all 0.2s;
        }
        .hover-link:hover {
          color: var(--primary-hover) !important;
          transform: translateX(3px);
        }
        .max-h-section {
          max-height: 500px;
        }
        .min-h-screen {
          min-height: 100vh;
        }
        .mb-6 {
          margin-bottom: 5rem;
        }
      `}</style>
    </div>
  );
}
