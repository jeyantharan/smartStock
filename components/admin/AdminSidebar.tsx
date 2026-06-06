"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "./adminNav";
import Logo from "@/components/Logo";

interface AdminSidebarProps {
  userName: string;
  userEmail: string;
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

export default function AdminSidebar({
  userName,
  userEmail,
  mobileOpen = false,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className={`admin-sidebar bg-white border-end d-flex flex-column ${mobileOpen ? "show" : ""}`}
    >
      <div className="p-4 border-bottom">
        <Link href="/admin/dashboard" className="text-decoration-none d-block" onClick={onNavigate}>
          <Logo size="sm" href={null} showName />
          <small className="text-muted fw-semibold d-block mt-2" style={{ fontSize: "0.65rem" }}>
            ADMIN PANEL
          </small>
        </Link>
      </div>

      <div className="px-4 py-3 border-bottom">
        <p className="fw-semibold text-dark mb-0 text-truncate" style={{ fontSize: "0.9rem" }}>
          {userName}
        </p>
        <p className="text-muted mb-0 text-truncate" style={{ fontSize: "0.75rem" }}>
          {userEmail}
        </p>
      </div>

      <nav className="flex-grow-1 p-3 d-flex flex-column gap-1 overflow-auto">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`btn text-start d-flex align-items-center gap-3 py-2.5 px-3 rounded-3 border-0 text-decoration-none ${
              isActive(item.href) ? "btn-primary text-white" : "btn-light text-secondary"
            }`}
            style={{ fontSize: "0.9rem" }}
          >
            <i className={`bi ${item.icon} fs-5`}></i>
            <span className="fw-semibold">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-3 border-top mt-auto">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3"
          style={{ fontSize: "0.85rem" }}
        >
          <i className="bi bi-box-arrow-up-right"></i>
          <span className="fw-semibold">View Store</span>
        </a>
      </div>

      <style jsx>{`
        .admin-sidebar {
          width: 260px;
          min-height: 100vh;
          flex-shrink: 0;
        }
        @media (min-width: 992px) {
          .admin-sidebar {
            position: sticky;
            top: 0;
            transform: none !important;
            box-shadow: none !important;
          }
        }
        @media (max-width: 991.98px) {
          .admin-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1040;
            height: 100vh;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow: none;
          }
          .admin-sidebar.show {
            transform: translateX(0);
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
          }
        }
      `}</style>
    </aside>
  );
}
