import React from "react";
import Link from "next/link";
import FooterCategoryLinks from "@/components/FooterCategoryLinks";
import Logo from "@/components/Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer bg-dark text-light pt-5 pb-4 border-top border-secondary mt-auto">
      <div className="container">
        <div className="row g-4 mb-5">
          <div className="col-lg-4 col-md-6">
            <div className="mb-4">
              <Logo size="lg" href="/" showName nameTheme="light" />
            </div>
            <p className="footer-text mb-4" style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
              Curating the world&apos;s finest premium goods. We deliver exceptional quality, modern design aesthetics, and high-performance customer service directly to your doorstep.
            </p>
            <div className="d-flex gap-2">
              <a href="#" className="btn btn-outline-light btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center opacity-75" style={{ width: "36px", height: "36px" }} aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="btn btn-outline-light btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center opacity-75" style={{ width: "36px", height: "36px" }} aria-label="X">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" className="btn btn-outline-light btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center opacity-75" style={{ width: "36px", height: "36px" }} aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="btn btn-outline-light btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center opacity-75" style={{ width: "36px", height: "36px" }} aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase tracking-wider" style={{ fontSize: "0.8rem" }}>
              Shop Departments
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0 footer-links" style={{ fontSize: "0.9rem" }}>
              <FooterCategoryLinks />
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase tracking-wider" style={{ fontSize: "0.8rem" }}>
              Customer Care
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0 footer-links" style={{ fontSize: "0.9rem" }}>
              <li>
                <Link href="/dashboard" className="footer-link text-decoration-none">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="footer-link text-decoration-none">
                  Order History
                </Link>
              </li>
              <li>
                <a href="#" className="footer-link text-decoration-none">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="footer-link text-decoration-none">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase tracking-wider" style={{ fontSize: "0.8rem" }}>
              Contact Smart Stock
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-3 mb-0" style={{ fontSize: "0.9rem" }}>
              <li className="d-flex align-items-start gap-2 footer-text">
                <i className="bi bi-geo-alt-fill text-primary mt-1 flex-shrink-0"></i>
                <span>
                  No. 45, Galle Road
                  <br />
                  Colombo 03, Sri Lanka
                </span>
              </li>
              <li className="d-flex align-items-center gap-2 footer-text">
                <i className="bi bi-telephone-fill text-primary flex-shrink-0"></i>
                <a href="tel:+94112345678" className="footer-link text-decoration-none">
                  +94 11 234 5678
                </a>
              </li>
              <li className="d-flex align-items-center gap-2 footer-text">
                <i className="bi bi-envelope-fill text-primary flex-shrink-0"></i>
                <a href="mailto:support@smartstock.com" className="footer-link text-decoration-none">
                  support@smartstock.com
                </a>
              </li>
              <li className="d-flex align-items-center gap-2 footer-text">
                <i className="bi bi-clock-fill text-primary flex-shrink-0"></i>
                <span>Mon – Sat, 9:00 AM – 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary opacity-50 my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="footer-text text-center text-md-start" style={{ fontSize: "0.8rem" }}>
            &copy; {currentYear} Smart Stock. All rights reserved.
          </div>
          <div className="d-flex flex-wrap justify-content-center gap-3 footer-links" style={{ fontSize: "0.8rem" }}>
            <a href="#" className="footer-link text-decoration-none">Privacy Policy</a>
            <a href="#" className="footer-link text-decoration-none">Terms of Service</a>
            <a href="#" className="footer-link text-decoration-none">Sitemap</a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .site-footer .footer-text,
        .site-footer .footer-text span {
          color: #e2e8f0 !important;
        }
        .site-footer .footer-link {
          color: #e2e8f0 !important;
          transition: color 0.2s ease;
        }
        .site-footer .footer-link:hover {
          color: #ffffff !important;
        }
        .site-footer .tracking-wider {
          letter-spacing: 0.08em;
        }
      `}</style>
    </footer>
  );
}
