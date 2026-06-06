"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "./SearchBar";
import Logo from "./Logo";

export default function Navbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { user, logout, authLoading } = useAuth();

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const closeMenu = () => {
    setIsExpanded(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top glass-nav py-3">
      <div className="container">
        {/* Brand Logo */}
        <Link href="/" className="navbar-brand d-flex align-items-center py-0 gap-2" onClick={closeMenu}>
          <Logo size="lg" href={null} showName priority />
        </Link>

        {/* Cart and Toggle for Mobile */}
        <div className="d-flex align-items-center gap-2 d-lg-none">
          <Link
            href="/cart"
            className="btn btn-light rounded-circle position-relative p-2 d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
          >
            <i className="bi bi-cart3 fs-5"></i>
            {cartCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
                style={{ fontSize: "0.7rem", padding: "0.25em 0.5em" }}
              >
                {cartCount}
              </span>
            )}
          </Link>
          <button
            className="navbar-toggler border-0 p-2 shadow-none"
            type="button"
            onClick={handleToggle}
            aria-expanded={isExpanded}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        {/* Collapsible Content */}
        <div className={`collapse navbar-collapse ${isExpanded ? "show mt-3 mt-lg-0" : ""}`}>
          {/* Search Bar - Center on Desktop, Stacked on Mobile */}
          <div className="mx-lg-auto my-3 my-lg-0 d-flex justify-content-center flex-grow-1 px-lg-4" style={{ maxWidth: "550px" }}>
            <SearchBar />
          </div>

          {/* Navigation Links and Action Buttons */}
          <ul className="navbar-nav align-items-lg-center gap-3 ms-auto mb-3 mb-lg-0">
            <li className="nav-item">
              <Link
                href="/products"
                className={`nav-link fw-semibold px-2 text-nowrap ${isActive("/products") ? "text-primary active" : "text-secondary"}`}
                onClick={closeMenu}
              >
                Shop All
              </Link>
            </li>

            {!authLoading && user?.role === "admin" && (
              <li className="nav-item">
                <a
                  href="/admin/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link fw-semibold px-2 text-nowrap d-flex align-items-center gap-1 text-secondary"
                  onClick={closeMenu}
                >
                  <i className="bi bi-shield-lock-fill"></i>
                  Admin Dashboard
                  <i className="bi bi-box-arrow-up-right" style={{ fontSize: "0.7rem" }}></i>
                </a>
              </li>
            )}
            
            {/* Desktop Cart Icon (Hidden on mobile header, shown on mobile expanded menu) */}
            <li className="nav-item d-none d-lg-block">
              <Link
                href="/cart"
                className="nav-link position-relative p-2 text-secondary hover-primary"
                style={{ transition: "color 0.2s" }}
              >
                <i className="bi bi-cart3 fs-4"></i>
                {cartCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
                    style={{ fontSize: "0.65rem", padding: "0.3em 0.5em" }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>

            {/* Divider line for mobile layout */}
            <li className="nav-item d-lg-none my-1 border-bottom border-light"></li>

            {user ? (
              /* Authenticated User Menu */
              <li className="nav-item dropdown d-flex align-items-center gap-2">
                <Link
                  href="/dashboard"
                  className={`btn btn-light d-flex align-items-center gap-2 w-100 text-start py-2 px-3 rounded-pill`}
                  onClick={closeMenu}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="rounded-circle object-fit-cover"
                      style={{ width: "28px", height: "28px" }}
                    />
                  ) : (
                    <i className="bi bi-person-circle fs-5 text-primary"></i>
                  )}
                  <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: "100px" }}>
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    closeMenu();
                  }}
                  className="btn btn-outline-danger btn-sm px-3 py-2 rounded-pill d-lg-none"
                >
                  Logout
                </button>
                <button
                  onClick={async () => {
                    await logout();
                  }}
                  className="btn btn-outline-danger btn-sm p-2 rounded-circle d-none d-lg-flex align-items-center justify-content-center"
                  style={{ width: "36px", height: "36px" }}
                  title="Logout"
                >
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </li>
            ) : (
              /* Login/Register actions */
              <li className="nav-item d-grid gap-2 d-lg-flex align-items-lg-center ms-lg-3 mt-3 mt-lg-0">
                <Link
                  href="/login"
                  className="btn btn-outline-primary py-2 px-4 fw-semibold rounded-pill text-center text-nowrap"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary py-2 px-4 fw-semibold rounded-pill text-center text-white text-nowrap"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
